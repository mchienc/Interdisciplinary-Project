from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..db import get_db
from ..models.spatial import POI, Accommodation
from ..schemas.itinerary import (
    PlanRequest,
    PlanResponse,
    POIRead,
    POICreate,
    AccommodationRead,
    DayItinerary,
    LegDetail,
    GeometricMedianResult
)
from ..services.spatial_service import compute_geometric_median_weiszfeld, cluster_pois_by_days
from ..services.recommendation_service import (
    query_candidate_accommodations,
    score_and_rank_accommodations,
    MOCK_ACCOMMODATIONS
)
from ..services.routing_service import (
    get_osrm_table_matrix,
    get_route_geometry_geojson,
    solve_tsp_ortools
)
from ..services.mock_data import MOCK_POIS

router = APIRouter(prefix="/api/v1", tags=["Spatial Decision Support System (SDSS)"])

@router.get("/pois", response_model=List[POIRead])
def get_all_pois(category: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Lấy danh sách toàn bộ các Điểm tham quan du lịch (POIs) trong cơ sở dữ liệu.
    Có fallback tự động sang danh sách mẫu khi CSDL chưa bật.
    """
    try:
        query = db.query(POI)
        if category:
            query = query.filter(POI.category == category)
        pois = query.all()
        if pois:
            return [POIRead(**p.to_dict()) for p in pois]
    except Exception:
        pass

    # Fallback to mock data
    results = MOCK_POIS
    if category:
        results = [p for p in results if p["category"] == category]
    return [POIRead(**p) for p in results]

@router.post("/pois", response_model=POIRead, status_code=201)
def create_poi(poi_data: POICreate, db: Session = Depends(get_db)):
    """
    Thêm một Điểm du lịch mới vào hệ thống SDSS.
    Lưu trữ không gian hình học GEOMETRY(Point, 4326) trong PostGIS
    và chia sẻ ngay lập tức cho toàn bộ du khách trên bản đồ.
    """
    new_poi_dict = None
    try:
        point_wkt = f"SRID=4326;POINT({poi_data.lon} {poi_data.lat})"
        poi_record = POI(
            name=poi_data.name,
            category=poi_data.category,
            description=poi_data.description,
            lat=poi_data.lat,
            lon=poi_data.lon,
            estimated_duration_min=poi_data.estimated_duration_min,
            opening_hours=poi_data.opening_hours,
            ticket_price=poi_data.ticket_price,
            geom=point_wkt
        )
        db.add(poi_record)
        db.commit()
        db.refresh(poi_record)
        new_poi_dict = poi_record.to_dict()
    except Exception:
        db.rollback()
        # Fallback lưu vào danh sách bộ nhớ nếu CSDL PostgreSQL offline
        next_id = max([p["id"] for p in MOCK_POIS], default=0) + 1
        new_poi_dict = {
            "id": next_id,
            "name": poi_data.name,
            "category": poi_data.category,
            "description": poi_data.description,
            "lat": poi_data.lat,
            "lon": poi_data.lon,
            "estimated_duration_min": poi_data.estimated_duration_min,
            "opening_hours": poi_data.opening_hours,
            "ticket_price": poi_data.ticket_price
        }

    if new_poi_dict and not any(p["id"] == new_poi_dict["id"] for p in MOCK_POIS):
        MOCK_POIS.append(new_poi_dict)

    return POIRead(**new_poi_dict)

@router.get("/accommodations", response_model=List[AccommodationRead])
def get_all_accommodations(
    min_stars: Optional[int] = None,
    max_price: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách các Cơ sở lưu trú (Khách sạn / Resort / Homestay).
    """
    try:
        query = db.query(Accommodation)
        if min_stars:
            query = query.filter(Accommodation.stars >= min_stars)
        if max_price:
            query = query.filter(Accommodation.price_per_night <= max_price)
        accs = query.all()
        if accs:
            return [AccommodationRead(**a.to_dict()) for a in accs]
    except Exception:
        pass

    results = MOCK_ACCOMMODATIONS
    if min_stars:
        results = [a for a in results if a["stars"] >= min_stars]
    if max_price:
        results = [a for a in results if a["price_per_night"] <= max_price]
    return [AccommodationRead(**a) for a in results]

@router.post("/itinerary/plan", response_model=PlanResponse)
async def plan_itinerary(request: PlanRequest, db: Session = Depends(get_db)):
    """
    Hệ thống Hỗ trợ ra Quyết định Không gian (SDSS) - Pipeline 4 bước:
    
    1. Gom cụm không gian theo ngày (K-Means Clustering):
       - Phân chia N điểm tham quan thành K cụm ngày du lịch liền kề nhau về mặt địa lý.
    2. Xác định tọa độ lưu trú lý tưởng (Geometric Median Weiszfeld):
       - Tìm điểm H(lat, lon) sao cho tổng khoảng cách tới toàn bộ các điểm tham quan là cực tiểu.
    3. Truy vấn & Chấm điểm đa tiêu chí Khách sạn (PostGIS ST_DWithin & Multi-criteria Scoring):
       - Quét khách sạn trong bán kính R quanh H, xếp hạng Top 5 theo Cự ly, Hạng sao và Giá phòng.
    4. Tối ưu hóa lộ trình từng ngày (Google OR-Tools TSP & OSRM Routing):
       - Giải bài toán TSP xuất phát và kết thúc tại Khách sạn đã chọn.
       - Trả về thứ tự ghé thăm, tổng quãng đường km, tổng thời gian phút và GeoJSON lộ trình.
    """
    # -------------------------------------------------------------
    # BƯỚC 0: Thu thập danh sách POIs đầu vào
    # -------------------------------------------------------------
    selected_pois: List[dict] = []
    
    # 1. Lấy từ CSDL theo poi_ids
    if request.poi_ids:
        try:
            db_pois = db.query(POI).filter(POI.id.in_(request.poi_ids)).all()
            selected_pois = [p.to_dict() for p in db_pois]
        except Exception:
            selected_pois = []
            
        # Nếu CSDL offline, tìm trong mock data
        if not selected_pois:
            poi_map = {p["id"]: p for p in MOCK_POIS}
            selected_pois = [poi_map[pid] for pid in request.poi_ids if pid in poi_map]

    # 2. Bổ sung custom POIs nếu có
    if request.custom_pois:
        for idx, cp in enumerate(request.custom_pois):
            selected_pois.append({
                "id": 1000 + idx,
                "name": cp.get("name", f"Điểm tùy chọn {idx + 1}"),
                "category": cp.get("category", "custom"),
                "description": cp.get("description", "Điểm do người dùng nhập"),
                "lat": float(cp["lat"]),
                "lon": float(cp["lon"]),
                "estimated_duration_min": int(cp.get("estimated_duration_min", 90)),
                "opening_hours": "Cả ngày",
                "ticket_price": 0
            })

    # Nếu không truyền POI nào, lấy mặc định 6 điểm tiêu biểu
    if not selected_pois:
        selected_pois = MOCK_POIS[:6]

    all_coords = [(p["lat"], p["lon"]) for p in selected_pois]

    # -------------------------------------------------------------
    # BƯỚC 1: Phân cụm không gian theo K ngày (K-Means Clustering)
    # -------------------------------------------------------------
    daily_clusters = cluster_pois_by_days(selected_pois, request.days)

    # -------------------------------------------------------------
    # BƯỚC 2: Tính Trung vị Hình học (Weiszfeld Geometric Median)
    # -------------------------------------------------------------
    geo_median_dict = compute_geometric_median_weiszfeld(all_coords)
    geometric_median = GeometricMedianResult(**geo_median_dict)

    # -------------------------------------------------------------
    # BƯỚC 3: Truy vấn & Chấm điểm đa tiêu chí Khách sạn (PostGIS)
    # -------------------------------------------------------------
    candidates = query_candidate_accommodations(
        db=db,
        median_lat=geometric_median.lat,
        median_lon=geometric_median.lon,
        radius_meters=request.radius_meters,
        max_budget=request.max_budget,
        min_stars=request.min_stars
    )

    top_hotels = score_and_rank_accommodations(
        candidates=candidates,
        weights=request.weights,
        top_k=5
    )

    if not top_hotels:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy cơ sở lưu trú nào phù hợp với bộ lọc ngân sách và hạng sao."
        )

    # Xác định khách sạn được chọn (do user chỉ định hoặc Rank 1)
    selected_hotel_data = None
    if request.selected_hotel_id:
        for h in top_hotels:
            if h["id"] == request.selected_hotel_id:
                selected_hotel_data = h
                break
        if not selected_hotel_data:
            # Tìm trong toàn bộ mock hoặc database
            for h in candidates:
                if h["id"] == request.selected_hotel_id:
                    selected_hotel_data = h
                    break

    if not selected_hotel_data:
        selected_hotel_data = top_hotels[0]

    selected_hotel = AccommodationRead(**selected_hotel_data)
    recommended_accommodations = [AccommodationRead(**h) for h in top_hotels]

    # -------------------------------------------------------------
    # BƯỚC 4: Tối ưu hóa lộ trình từng ngày (Google OR-Tools TSP & OSRM)
    # -------------------------------------------------------------
    daily_itineraries: List[DayItinerary] = []
    total_trip_dist_km = 0.0
    total_trip_dur_min = 0.0

    hotel_coord = (selected_hotel.lat, selected_hotel.lon)
    transport_mode = request.transport_mode or "driving"

    for day_idx, cluster_pois in enumerate(daily_clusters, start=1):
        if not cluster_pois:
            continue

        # Nút 0 = Khách sạn, Nút 1..M = POIs trong ngày
        nodes_coords = [hotel_coord] + [(p["lat"], p["lon"]) for p in cluster_pois]
        nodes_info = [{"name": selected_hotel.name, "type": "hotel"}] + cluster_pois
        ideal_times = ["any"] + [p.get("ideal_time", "any") for p in cluster_pois]

        # 4.1 Lấy Ma trận Thời gian / Khoảng cách từ OSRM theo phương tiện (kèm fallback Haversine)
        dist_matrix, duration_matrix = await get_osrm_table_matrix(nodes_coords, mode=transport_mode)

        # 4.2 Giải bài toán TSP bằng Google OR-Tools (Depot = 0) kết hợp định hướng khung giờ vàng
        optimal_indices = solve_tsp_ortools(duration_matrix, depot_index=0, ideal_times=ideal_times)

        # 4.3 Tái tạo chuỗi hành trình tối ưu và tính các chặng (legs)
        visit_sequence_pois: List[POIRead] = []
        legs: List[LegDetail] = []
        ordered_route_coords: List[Tuple[float, float]] = []

        day_dist_m = 0.0
        day_dur_s = 0.0

        for i in range(len(optimal_indices) - 1):
            u = optimal_indices[i]
            v = optimal_indices[i + 1]

            from_info = nodes_info[u]
            to_info = nodes_info[v]

            if v != 0: # Điểm tham quan (khác khách sạn kết thúc)
                visit_sequence_pois.append(POIRead(**to_info))

            leg_dist = dist_matrix[u][v]
            leg_dur = duration_matrix[u][v]

            day_dist_m += leg_dist
            day_dur_s += leg_dur

            legs.append(LegDetail(
                from_name=from_info["name"],
                to_name=to_info["name"],
                distance_km=round(leg_dist / 1000.0, 2),
                duration_min=round(leg_dur / 60.0, 1)
            ))

        for idx in optimal_indices:
            ordered_route_coords.append(nodes_coords[idx])

        # 4.4 Lấy GeoJSON chi tiết cung đường từ OSRM Route API theo phương tiện
        route_geojson = await get_route_geometry_geojson(ordered_route_coords, mode=transport_mode)
        route_geojson["properties"]["day"] = day_idx
        route_geojson["properties"]["color"] = (
            "#B85D3B" if day_idx == 1 else
            "#0F766E" if day_idx == 2 else
            "#2563EB" if day_idx == 3 else
            "#D97706" if day_idx == 4 else
            "#7C3AED"
        )

        day_dist_km = round(day_dist_m / 1000.0, 2)
        day_dur_min = round(day_dur_s / 60.0, 1)

        total_trip_dist_km += day_dist_km
        total_trip_dur_min += day_dur_min

        daily_itineraries.append(DayItinerary(
            day=day_idx,
            hotel=selected_hotel,
            visit_sequence=visit_sequence_pois,
            legs=legs,
            total_distance_km=day_dist_km,
            total_duration_min=day_dur_min,
            route_geojson=route_geojson
        ))

    return PlanResponse(
        success=True,
        days=len(daily_itineraries),
        total_pois=len(selected_pois),
        geometric_median=geometric_median,
        recommended_accommodations=recommended_accommodations,
        selected_hotel=selected_hotel,
        daily_itineraries=daily_itineraries,
        total_trip_distance_km=round(total_trip_dist_km, 2),
        total_trip_duration_min=round(total_trip_dur_min, 1),
        transport_mode=transport_mode
    )
