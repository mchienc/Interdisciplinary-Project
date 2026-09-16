import math
import httpx
from typing import List, Dict, Any, Tuple, Optional
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

OSRM_BASE_URL = "http://router.project-osrm.org"
EARTH_RADIUS_M = 6371000.0 # Bán kính trái đất (mét)

MODE_SPEEDS_KMH = {
    "walking": 5.0,    # Đi bộ 5 km/h
    "bike": 28.0,      # Xe máy 28 km/h
    "driving": 35.0    # Ô tô 35 km/h
}

MODE_OSRM_PROFILE = {
    "walking": "foot",
    "bike": "bike",
    "driving": "driving"
}

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

def compute_haversine_matrix(
    coords: List[Tuple[float, float]], 
    mode: str = "driving"
) -> Tuple[List[List[float]], List[List[float]]]:
    """
    Tạo Ma trận Khoảng cách (mét) và Thời gian (giây) dự phòng (Fallback) bằng công thức Haversine
    phù hợp với từng phương tiện (walking / bike / driving).
    """
    n = len(coords)
    dist_matrix = [[0.0] * n for _ in range(n)]
    duration_matrix = [[0.0] * n for _ in range(n)]

    speed_kmh = MODE_SPEEDS_KMH.get(mode, 35.0)
    speed_mps = (speed_kmh * 1000.0) / 3600.0 # mét/giây

    # Hệ số cản giao thông thực tế: Đi bộ ít cản hơn, ô tô cản nhiều hơn
    traffic_factor = 1.05 if mode == "walking" else (1.15 if mode == "bike" else 1.25)

    for i in range(n):
        for j in range(n):
            if i != j:
                d = haversine_distance_m(coords[i], coords[j])
                dist_matrix[i][j] = d
                duration_matrix[i][j] = (d / speed_mps) * traffic_factor

    return dist_matrix, duration_matrix

async def get_osrm_table_matrix(
    coords: List[Tuple[float, float]],
    mode: str = "driving"
) -> Tuple[List[List[float]], List[List[float]]]:
    """
    Gọi OSRM Table API để lấy Ma trận Khoảng cách (mét) và Thời gian di chuyển thực tế (giây)
    theo từng phương tiện di chuyển (foot/walking, bike, driving).
    """
    n = len(coords)
    if n <= 1:
        return [[0.0]], [[0.0]]

    profile = MODE_OSRM_PROFILE.get(mode, "driving")
    coords_str = ";".join([f"{lon:.6f},{lat:.6f}" for lat, lon in coords])
    url = f"{OSRM_BASE_URL}/table/v1/{profile}/{coords_str}?annotations=distance,duration"

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok":
                    distances = data.get("distances")
                    durations = data.get("durations")
                    if distances and durations:
                        # Chuẩn hóa thời gian di chuyển phù hợp với vận tốc thực tế tại đô thị Hà Nội:
                        if mode == "walking":
                            # Đi bộ trung bình 5 km/h = 1.389 m/s
                            durations = [[round(d / 1.389, 1) for d in row] for row in distances]
                        elif mode == "bike":
                            # Xe máy nội đô ~28 km/h = 7.78 m/s (hệ số dừng đèn đỏ/ngõ 1.15)
                            durations = [[round((d / 7.78) * 1.15, 1) for d in row] for row in distances]
                        return distances, durations
    except Exception:
        pass

    # Kích hoạt cơ chế Fallback Haversine nếu OSRM không phản hồi
    return compute_haversine_matrix(coords, mode=mode)

async def get_route_geometry_geojson(
    ordered_coords: List[Tuple[float, float]],
    mode: str = "driving"
) -> Dict[str, Any]:
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

    profile = MODE_OSRM_PROFILE.get(mode, "driving")
    coords_str = ";".join([f"{lon:.6f},{lat:.6f}" for lat, lon in ordered_coords])
    url = f"{OSRM_BASE_URL}/route/v1/{profile}/{coords_str}?overview=full&geometries=geojson"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    route = data["routes"][0]
                    route_dist = route.get("distance", 0)
                    route_dur = route.get("duration", 0)
                    if mode == "walking":
                        route_dur = round(route_dist / 1.389, 1)
                    elif mode == "bike":
                        route_dur = round((route_dist / 7.78) * 1.15, 1)

                    return {
                        "type": "Feature",
                        "properties": {
                            "distance_m": route_dist,
                            "duration_s": route_dur,
                            "source": f"OSRM Routing Engine ({mode})"
                        },
                        "geometry": route.get("geometry")
                    }
    except Exception:
        pass

    # Fallback GeoJSON LineString nối trực tiếp
    return {
        "type": "Feature",
        "properties": {
            "source": f"Haversine Direct Interpolation ({mode})"
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [[c[1], c[0]] for c in ordered_coords]
        }
    }

def solve_tsp_ortools(
    distance_or_duration_matrix: List[List[float]],
    depot_index: int = 0,
    ideal_times: Optional[List[str]] = None
) -> List[int]:
    """
    Giải bài toán Người du lịch (Travelling Salesperson Problem - TSP) bằng Google OR-Tools.
    Tích hợp tối ưu hướng di chuyển theo nhịp sinh học (Sáng -> Chiều -> Tối).
    """
    num_nodes = len(distance_or_duration_matrix)
    if num_nodes <= 1:
        return [0]
    if num_nodes == 2:
        return [0, 1]

    # Khởi tạo Routing Index Manager: N nút, 1 xe, xuất phát và kết thúc tại depot
    manager = pywrapcp.RoutingIndexManager(num_nodes, 1, depot_index)
    routing = pywrapcp.RoutingModel(manager)

    # Đăng ký hàm chi phí quá cảnh (Transit Callback)
    def distance_callback(from_index: int, to_index: int) -> int:
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return int(round(distance_or_duration_matrix[from_node][to_node]))

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Thiết lập tham số tìm kiếm tối ưu (Search Parameters)
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 1

    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        return list(range(num_nodes))

    ordered_route = []
    index = routing.Start(0)
    while not routing.IsEnd(index):
        ordered_route.append(manager.IndexToNode(index))
        index = solution.Value(routing.NextVar(index))

    # Tối ưu hóa hướng di chuyển theo Nhịp sinh học Hà Nội:
    # Nếu đảo chiều lộ trình vòng kín mà giúp điểm sáng nằm ở đầu và điểm tối ở cuối, chọn chiều tối ưu!
    if ideal_times and len(ordered_route) > 3:
        # Route: [0, p1, p2, ..., pk]
        stops_forward = ordered_route[1:]
        stops_reverse = list(reversed(stops_forward))

        def score_orientation(stops: List[int]) -> int:
            score = 0
            for pos, node_idx in enumerate(stops):
                if node_idx < len(ideal_times):
                    pref = ideal_times[node_idx]
                    # Đầu ngày ưu tiên morning
                    if pos == 0 and pref == "morning":
                        score += 3
                    elif pos == len(stops) - 1 and pref == "evening":
                        score += 3
                    elif pref == "morning":
                        score += max(0, 2 - pos)
                    elif pref == "evening":
                        score += pos
            return score

        if score_orientation(stops_reverse) > score_orientation(stops_forward):
            ordered_route = [0] + stops_reverse

    return ordered_route
