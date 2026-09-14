import os
import json
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pyproj
from shapely.geometry import shape, mapping, Point
from shapely.ops import transform

app = FastAPI(
    title="Urban Spatial Analysis WebGIS API",
    description="Hệ thống Backend RESTful API và Phân tích Không gian Đô thị",
    version="1.0.0"
)

# Cấu hình CORS để Frontend gọi API mượt mà
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
AMENITIES_FILE = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "data", "raw", "hanoi_public_amenities.geojson"))
COMMERCIAL_FILE = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "data", "raw", "hanoi_commercial_centers.geojson"))

def load_amenities_data():
    target = AMENITIES_FILE if os.path.exists(AMENITIES_FILE) else COMMERCIAL_FILE
    if not os.path.exists(target):
        return []
    with open(target, "r", encoding="utf-8") as f:
        return json.load(f).get("features", [])

load_geojson_data = load_amenities_data

# Chuyển đổi tọa độ trắc địa (EPSG:4326 <-> EPSG:3857)
project_to_meters = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True).transform
project_to_degrees = pyproj.Transformer.from_crs("EPSG:3857", "EPSG:4326", always_xy=True).transform

class BufferRequest(BaseModel):
    osm_id: Optional[int] = None
    lon: Optional[float] = None
    lat: Optional[float] = None
    radius_meters: float = 1000.0

def get_db_connection():
    import psycopg2
    try:
        return psycopg2.connect(
            host="localhost", port=5432, dbname="webgis_db", user="postgres", password="postgis_password"
        )
    except Exception:
        return None

DISTRICTS_FILE = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "data", "raw", "hanoi_districts.geojson"))

@app.get("/api/v1/districts")
def get_districts():
    """
    Trả về GeoJSON Ranh giới 30 Quận/Huyện Hà Nội kèm số lượng cơ sở và mật độ đô thị.
    """
    if os.path.exists(DISTRICTS_FILE):
        with open(DISTRICTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"type": "FeatureCollection", "features": []}

@app.get("/api/v1/amenities")
@app.get("/api/v1/commercial-centers")
def get_amenities(
    category: Optional[str] = Query(None, description="Lọc theo danh mục: commercial, healthcare, education"),
    brand: Optional[str] = Query(None, description="Lọc theo thương hiệu / tên cơ sở"),
    shop_type: Optional[str] = Query(None, description="Lọc theo loại hình"),
    district: Optional[str] = Query(None, description="Lọc theo quận (ví dụ: Quận Hoàn Kiếm, Quận Cầu Giấy)")
):
    """
    Trả về danh mục Tiện ích Đô thị (TTTM, Bệnh viện, Trường học) chuẩn GeoJSON FeatureCollection.
    """
    features = load_amenities_data()

    if category and category.lower() != 'all':
        features = [f for f in features if f.get("properties", {}).get("category") == category.lower()]
    if brand:
        features = [f for f in features if brand.lower() in f.get("properties", {}).get("brand", "").lower() or brand.lower() in f.get("properties", {}).get("name", "").lower()]
    if shop_type:
        features = [f for f in features if shop_type.lower() in f.get("properties", {}).get("type", "").lower()]
    if district:
        features = [f for f in features if district.lower() in f.get("properties", {}).get("district_name", "").lower()]

    return {
        "type": "FeatureCollection",
        "total": len(features),
        "features": features
    }

@app.get("/api/v1/statistics/summary")
def get_urban_statistics():
    """
    API Thống kê Đô thị: Tổng hợp số lượng TTTM, tỷ trọng các thương hiệu lớn tại Hà Nội.
    """
    features = load_geojson_data()
    brand_counts = {}
    type_counts = {}

    for f in features:
        b = f.get("properties", {}).get("brand") or "Độc lập/Khác"
        t = f.get("properties", {}).get("type") or "Khác"
        brand_counts[b] = brand_counts.get(b, 0) + 1
        type_counts[t] = type_counts.get(t, 0) + 1

    # Sắp xếp các thương hiệu phổ biến nhất
    top_brands = sorted(brand_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "total_facilities": len(features),
        "top_brands": [{"brand": k, "count": v} for k, v in top_brands],
        "facility_types": [{"type": k, "count": v} for k, v in type_counts.items()]
    }

@app.post("/api/v1/analysis/buffer")
def calculate_buffer_zone(req: BufferRequest):
    """
    Giải thuật Phân tích Không gian: Tính toán Vùng đệm bán kính phục vụ (Service Catchment Buffer)
    sử dụng phép chiếu trắc địa chính xác (EPSG:4326 -> EPSG:3857 -> Buffer mét -> EPSG:4326).
    """
    center_point = None
    target_name = "Điểm tọa độ tùy chỉnh"

    # Trường hợp 1: Chọn theo osm_id của TTTM
    if req.osm_id:
        features = load_geojson_data()
        matched = [f for f in features if f.get("properties", {}).get("osm_id") == req.osm_id]
        if not matched:
            raise HTTPException(status_code=404, detail="Không tìm thấy TTTM với ID đã cho.")
        coords = matched[0]["geometry"]["coordinates"]
        center_point = Point(coords[0], coords[1])
        target_name = matched[0]["properties"].get("name", "TTTM")
    # Trường hợp 2: Truyền trực tiếp lon/lat
    elif req.lon is not None and req.lat is not None:
        center_point = Point(req.lon, req.lat)
    else:
        raise HTTPException(status_code=400, detail="Cần cung cấp osm_id hoặc cặp tọa độ (lon, lat).")

    # 1. Chuyển đổi tọa độ WGS84 (độ) sang Web Mercator (mét)
    point_meters = transform(project_to_meters, center_point)

    # 2. Thực hiện phép toán không gian Buffer theo bán kính mét (Euclidean Buffer in Projected CRS)
    buffer_polygon_meters = point_meters.buffer(req.radius_meters)

    # 3. Chuyển đổi ngược hình đa giác về tọa độ WGS84 chuẩn GeoJSON
    buffer_polygon_wgs84 = transform(project_to_degrees, buffer_polygon_meters)

    return {
        "type": "Feature",
        "properties": {
            "target": target_name,
            "radius_meters": req.radius_meters,
            "area_km2": round(buffer_polygon_meters.area / 1_000_000, 3)
        },
        "geometry": mapping(buffer_polygon_wgs84)
    }
