from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from ..models.spatial import Accommodation
from ..schemas.itinerary import WeightsConfig
from .routing_service import haversine_distance_m

# Dữ liệu dự phòng (Fallback) khi CSDL PostgreSQL/PostGIS chưa khởi động
MOCK_ACCOMMODATIONS = [
    {"id": 1, "name": "Sofitel Legend Metropole Hanoi", "type": "hotel", "stars": 5, "rating": 4.90, "price_per_night": 6500000, "address": "15 Ngô Quyền, Tràng Tiền, Hoàn Kiếm, Hà Nội", "phone": "024 3826 6919", "lat": 21.0252, "lon": 105.8560},
    {"id": 2, "name": "Melia Hanoi Hotel", "type": "hotel", "stars": 5, "rating": 4.70, "price_per_night": 3200000, "address": "44 Lý Thường Kiệt, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội", "phone": "024 3934 3343", "lat": 21.0248, "lon": 105.8475},
    {"id": 3, "name": "Lotte Hotel Hanoi", "type": "hotel", "stars": 5, "rating": 4.85, "price_per_night": 3900000, "address": "54 Liễu Giai, Cống Vị, Ba Đình, Hà Nội", "phone": "024 3333 1000", "lat": 21.0327, "lon": 105.8128},
    {"id": 4, "name": "Pan Pacific Hanoi", "type": "hotel", "stars": 5, "rating": 4.65, "price_per_night": 2800000, "address": "01 Thanh Niên, Ba Đình, Hà Nội", "phone": "024 3823 8888", "lat": 21.0474, "lon": 105.8390},
    {"id": 5, "name": "Apricot Hotel (Hồ Gươm)", "type": "hotel", "stars": 5, "rating": 4.75, "price_per_night": 3500000, "address": "136 Hàng Trống, Hoàn Kiếm, Hà Nội", "phone": "024 3828 9595", "lat": 21.0278, "lon": 105.8516},
    {"id": 6, "name": "The Oriental Jade Hotel", "type": "boutique", "stars": 4, "rating": 4.70, "price_per_night": 2200000, "address": "92 - 94 Hàng Trống, Hoàn Kiếm, Hà Nội", "phone": "024 3936 7777", "lat": 21.0305, "lon": 105.8505},
    {"id": 7, "name": "Hanoi La Siesta Trendy Hotel", "type": "boutique", "stars": 4, "rating": 4.65, "price_per_night": 1800000, "address": "12 Nguyễn Quang Bích, Cửa Đông, Hoàn Kiếm, Hà Nội", "phone": "024 3923 4026", "lat": 21.0329, "lon": 105.8449},
    {"id": 8, "name": "InterContinental Hanoi Westlake", "type": "resort", "stars": 5, "rating": 4.80, "price_per_night": 3600000, "address": "05 Từ Hoa, Quảng An, Tây Hồ, Hà Nội", "phone": "024 6270 8888", "lat": 21.0583, "lon": 105.8292},
    {"id": 9, "name": "Acoustic Hotel & Spa Hanoi", "type": "hotel", "stars": 4, "rating": 4.55, "price_per_night": 1300000, "address": "39 Thợ Nhuộm, Cửa Nam, Hoàn Kiếm, Hà Nội", "phone": "024 3682 2333", "lat": 21.0267, "lon": 105.8442},
    {"id": 10, "name": "San Grand Hotel Hanoi", "type": "hotel", "stars": 4, "rating": 4.50, "price_per_night": 1100000, "address": "02 Cầu Gỗ, Hàng Bạc, Hoàn Kiếm, Hà Nội", "phone": "024 3824 4999", "lat": 21.0309, "lon": 105.8528},
    {"id": 11, "name": "Church Boutique Hotel Hang Gai", "type": "boutique", "stars": 3, "rating": 4.45, "price_per_night": 950000, "address": "95 Hàng Gai, Hàng Gai, Hoàn Kiếm, Hà Nội", "phone": "024 3938 2233", "lat": 21.0312, "lon": 105.8492},
    {"id": 12, "name": "Hanoi Golden Moment Hotel", "type": "hotel", "stars": 3, "rating": 4.30, "price_per_night": 750000, "address": "15 Hàng Quạt, Hàng Gai, Hoàn Kiếm, Hà Nội", "phone": "024 3928 7755", "lat": 21.0335, "lon": 105.8499},
    {"id": 13, "name": "Golden Sun Suites Hotel", "type": "hotel", "stars": 3, "rating": 4.40, "price_per_night": 850000, "address": "35 Hàng Quạt, Hoàn Kiếm, Hà Nội", "phone": "024 3928 9776", "lat": 21.0332, "lon": 105.8488},
    {"id": 14, "name": "Old Quarter View Hanoi Hostel", "type": "homestay", "stars": 3, "rating": 4.60, "price_per_night": 420000, "address": "42 Hàng Dầu, Hàng Bạc, Hoàn Kiếm, Hà Nội", "phone": "024 3926 2266", "lat": 21.0318, "lon": 105.8532},
    {"id": 15, "name": "Hanoi Sweet Family Homestay", "type": "homestay", "stars": 3, "rating": 4.50, "price_per_night": 350000, "address": "16 Chân Cầm, Hàng Trống, Hoàn Kiếm, Hà Nội", "phone": "0982 123 789", "lat": 21.0298, "lon": 105.8478}
]

def query_candidate_accommodations(
    db: Optional[Session],
    median_lat: float,
    median_lon: float,
    radius_meters: float = 3500.0,
    max_budget: Optional[int] = None,
    min_stars: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Truy vấn các cơ sở lưu trú xung quanh tọa độ trung vị hình học bằng hàm ST_DWithin của PostGIS.
    Nếu CSDL chưa kết nối, tự động chuyển sang tập dữ liệu dự phòng.
    """
    candidates = []

    if db is not None:
        try:
            # Truy vấn không gian PostGIS sử dụng ST_DWithin với kiểu GEOGRAPHY để tính khoảng cách mét chính xác
            point_geom = f"ST_SetSRID(ST_MakePoint({median_lon}, {median_lat}), 4326)::geography"
            sql = f"""
                SELECT 
                    id, name, type, stars, rating, price_per_night, address, phone, lat, lon,
                    ST_Distance(geom::geography, {point_geom}) AS dist_m
                FROM accommodations
                WHERE ST_DWithin(geom::geography, {point_geom}, :radius)
            """
            params = {"radius": radius_meters}
            if max_budget:
                sql += " AND price_per_night <= :max_budget"
                params["max_budget"] = max_budget
            if min_stars:
                sql += " AND stars >= :min_stars"
                params["min_stars"] = min_stars

            sql += " ORDER BY dist_m ASC LIMIT 20;"

            res = db.execute(text(sql), params).fetchall()
            for r in res:
                candidates.append({
                    "id": r[0],
                    "name": r[1],
                    "type": r[2],
                    "stars": r[3],
                    "rating": float(r[4]),
                    "price_per_night": r[5],
                    "address": r[6],
                    "phone": r[7],
                    "lat": r[8],
                    "lon": r[9],
                    "distance_to_median_m": round(float(r[10]), 1)
                })

            # Nếu không tìm thấy đủ khách sạn trong bán kính, nới rộng bằng KNN <->
            if len(candidates) < 5:
                knn_sql = f"""
                    SELECT 
                        id, name, type, stars, rating, price_per_night, address, phone, lat, lon,
                        ST_Distance(geom::geography, {point_geom}) AS dist_m
                    FROM accommodations
                    ORDER BY geom <-> ST_SetSRID(ST_MakePoint({median_lon}, {median_lat}), 4326)
                    LIMIT 10;
                """
                knn_res = db.execute(text(knn_sql)).fetchall()
                candidates = []
                for r in knn_res:
                    candidates.append({
                        "id": r[0],
                        "name": r[1],
                        "type": r[2],
                        "stars": r[3],
                        "rating": float(r[4]),
                        "price_per_night": r[5],
                        "address": r[6],
                        "phone": r[7],
                        "lat": r[8],
                        "lon": r[9],
                        "distance_to_median_m": round(float(r[10]), 1)
                    })
        except Exception:
            candidates = []

    # Fallback tính toán nội bộ khi CSDL offline
    if not candidates:
        for acc in MOCK_ACCOMMODATIONS:
            if max_budget and acc["price_per_night"] > max_budget:
                continue
            if min_stars and acc["stars"] < min_stars:
                continue
            dist = haversine_distance_m((median_lat, median_lon), (acc["lat"], acc["lon"]))
            item = dict(acc)
            item["distance_to_median_m"] = round(dist, 1)
            candidates.append(item)
            
        candidates.sort(key=lambda x: x["distance_to_median_m"])

    return candidates

def score_and_rank_accommodations(
    candidates: List[Dict[str, Any]],
    weights: Optional[WeightsConfig] = None,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Xếp hạng các cơ sở lưu trú theo Hàm Đánh giá Đa tiêu chí (Multi-criteria Scoring):
    
      Score = (w1 * Norm_Distance) + (w2 * Norm_Rating) - (w3 * Norm_Price)
      
    Chuẩn hóa Min-Max:
      - Norm_Distance = 1 - (dist - dist_min) / (dist_max - dist_min + eps) [Càng gần trung vị, điểm càng cao]
      - Norm_Rating = (rating - 3.0) / (5.0 - 3.0) [Thang điểm 0 - 1]
      - Norm_Price = (price - price_min) / (price_max - price_min + 1) [Càng đắt, điểm phạt càng lớn]
    """
    if not candidates:
        return []

    w = weights or WeightsConfig()
    w1 = w.w_distance
    w2 = w.w_rating
    w3 = w.w_price

    distances = [c["distance_to_median_m"] for c in candidates]
    ratings = [float(c["rating"]) for c in candidates]
    prices = [c["price_per_night"] for c in candidates]

    min_dist, max_dist = min(distances), max(distances)
    dist_range = max(1.0, max_dist - min_dist)

    min_price, max_price = min(prices), max(prices)
    price_range = max(1.0, float(max_price - min_price))

    scored_candidates = []
    for c in candidates:
        # Chuẩn hóa cự ly: Khoảng cách ngắn nhất đạt 1.0, xa nhất đạt 0.0
        norm_dist = 1.0 - ((c["distance_to_median_m"] - min_dist) / dist_range)
        
        # Chuẩn hóa rating: Từ thang 3.0 - 5.0 về 0.0 - 1.0
        norm_rating = max(0.0, min(1.0, (float(c["rating"]) - 3.0) / 2.0))
        
        # Chuẩn hóa giá: Giá rẻ nhất phạt 0.0, đắt nhất phạt 1.0
        norm_price = (float(c["price_per_night"]) - min_price) / price_range

        # Tính tổng điểm đa tiêu chí (chuẩn hóa về thang 100 điểm cho trực quan)
        raw_score = (w1 * norm_dist) + (w2 * norm_rating) - (w3 * norm_price)
        final_score = round(max(0.0, min(100.0, (raw_score + w3) / (w1 + w2 + w3) * 100.0)), 1)

        item = dict(c)
        item["multi_criteria_score"] = final_score
        item["score_breakdown"] = {
            "distance_score": round(norm_dist * 100.0, 1),
            "rating_score": round(norm_rating * 100.0, 1),
            "price_penalty": round(norm_price * 100.0, 1)
        }
        scored_candidates.append(item)

    # Sắp xếp điểm giảm dần
    scored_candidates.sort(key=lambda x: x["multi_criteria_score"], reverse=True)
    return scored_candidates[:top_k]
