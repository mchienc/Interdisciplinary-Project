import math
import httpx
from typing import List, Dict, Any, Tuple
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

OSRM_BASE_URL = "http://router.project-osrm.org"
EARTH_RADIUS_M = 6371000.0 # Bán kính trái đất (mét)
AVG_URBAN_SPEED_KMH = 35.0  # Vận tốc trung bình trong đô thị (km/h)

def haversine_distance_m(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """
    Tính khoảng cách mặt cầu Haversine (Great-circle distance) giữa 2 tọa độ (lat, lon).
    Đơn vị trả về: Mét.
    """
    lat1, lon1 = math.radians(coord1[0]), math.radians(coord1[1])
    lat2, lon2 = math.radians(coord2[0]), math.radians(coord2[1])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2.0)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_M * c

def compute_haversine_matrix(coords: List[Tuple[float, float]]) -> Tuple[List[List[float]], List[List[float]]]:
    """
    Tạo Ma trận Khoảng cách (mét) và Thời gian (giây) dự phòng (Fallback) bằng công thức Haversine.
    Vận tốc di chuyển giả định: 35 km/h kèm hệ số giao thông 1.2x.
    """
    n = len(coords)
    dist_matrix = [[0.0] * n for _ in range(n)]
    duration_matrix = [[0.0] * n for _ in range(n)]

    speed_mps = (AVG_URBAN_SPEED_KMH * 1000.0) / 3600.0 # mét/giây

    for i in range(n):
        for j in range(n):
            if i != j:
                d = haversine_distance_m(coords[i], coords[j])
                dist_matrix[i][j] = d
                # Thời gian ước tính = Quãng đường / vận tốc * 1.2 (chờ đèn đỏ, cua rẽ)
                duration_matrix[i][j] = (d / speed_mps) * 1.2

    return dist_matrix, duration_matrix

async def get_osrm_table_matrix(coords: List[Tuple[float, float]]) -> Tuple[List[List[float]], List[List[float]]]:
    """
    Gọi OSRM Table API để lấy Ma trận Khoảng cách (mét) và Thời gian di chuyển thực tế (giây)
    dựa trên đồ thị mạng lưới giao thông đường bộ OpenStreetMap.
    
    Có cơ chế Fallback tự động sang Haversine nếu OSRM public API gặp lỗi hoặc timeout.
    """
    n = len(coords)
    if n <= 1:
        return [[0.0]], [[0.0]]

    # Định dạng tọa độ cho OSRM: lon,lat;lon,lat;...
    coords_str = ";".join([f"{lon:.6f},{lat:.6f}" for lat, lon in coords])
    url = f"{OSRM_BASE_URL}/table/v1/driving/{coords_str}?annotations=distance,duration"

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok":
                    distances = data.get("distances")
                    durations = data.get("durations")
                    if distances and durations:
                        return distances, durations
    except Exception as exc:
        pass

    # Kích hoạt cơ chế Fallback Haversine nếu OSRM không phản hồi
    return compute_haversine_matrix(coords)

async def get_route_geometry_geojson(ordered_coords: List[Tuple[float, float]]) -> Dict[str, Any]:
    """
    Lấy tọa độ hình học tuyến đường chi tiết (GeoJSON LineString) từ OSRM Route API.
    Có fallback trả về LineString nối thẳng các điểm nếu OSRM gặp sự cố.
    """
    if len(ordered_coords) < 2:
        return {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": [[c[1], c[0]] for c in ordered_coords]
            }
        }

    coords_str = ";".join([f"{lon:.6f},{lat:.6f}" for lat, lon in ordered_coords])
    url = f"{OSRM_BASE_URL}/route/v1/driving/{coords_str}?overview=full&geometries=geojson"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    route = data["routes"][0]
                    return {
                        "type": "Feature",
                        "properties": {
                            "distance_m": route.get("distance", 0),
                            "duration_s": route.get("duration", 0),
                            "source": "OSRM Routing Engine"
                        },
                        "geometry": route.get("geometry")
                    }
    except Exception:
        pass

    # Fallback GeoJSON LineString nối trực tiếp
    return {
        "type": "Feature",
        "properties": {
            "source": "Haversine Direct Interpolation"
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [[c[1], c[0]] for c in ordered_coords]
        }
    }

def solve_tsp_ortools(
    distance_or_duration_matrix: List[List[float]],
    depot_index: int = 0
) -> List[int]:
    """
    Giải bài toán Người du lịch (Travelling Salesperson Problem - TSP) bằng Google OR-Tools.
    
    Yêu cầu:
      - Bắt đầu từ Khách sạn (depot_index = 0).
      - Ghé thăm tất cả các điểm du lịch đúng 1 lần.
      - Trở về lại Khách sạn với tổng chi phí thời gian/khoảng cách là nhỏ nhất.
    """
    num_nodes = len(distance_or_duration_matrix)
    if num_nodes <= 1:
        return [0]
    if num_nodes == 2:
        return [0, 1, 0]

    # Khởi tạo Routing Index Manager: N nút, 1 xe du lịch, xuất phát và kết thúc tại depot
    manager = pywrapcp.RoutingIndexManager(num_nodes, 1, depot_index)
    routing = pywrapcp.RoutingModel(manager)

    # Đăng ký hàm đánh giá chi phí cạnh (Transit Callback)
    # Nhân ma trận lên số nguyên để OR-Tools xử lý nhanh và chính xác
    int_matrix = [
        [int(round(val * 100)) for val in row]
        for row in distance_or_duration_matrix
    ]

    def distance_callback(from_index: int, to_index: int) -> int:
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Cấu hình tìm kiếm: Heuristic PATH_CHEAPEST_ARC kết hợp GUIDED_LOCAL_SEARCH
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 2 # Giới hạn tối đa 2 giây

    solution = routing.SolveWithParameters(search_parameters)

    # Tái tạo thứ tự ghé thăm tối ưu từ lời giải
    ordered_indices = []
    if solution:
        index = routing.Start(0)
        while not routing.IsEnd(index):
            ordered_indices.append(manager.IndexToNode(index))
            index = solution.Value(routing.NextVar(index))
        ordered_indices.append(manager.IndexToNode(index)) # Quay về depot
    else:
        # Nếu solver không tìm được nghiệm trong time limit, trả về thứ tự ban đầu khép kín
        ordered_indices = list(range(num_nodes)) + [0]

    return ordered_indices
