from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class POIRead(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    lat: float
    lon: float
    estimated_duration_min: int = 90
    opening_hours: Optional[str] = None
    ticket_price: int = 0
    image_url: Optional[str] = None
    tips: Optional[str] = None
    ideal_time: Optional[str] = "morning"
    closed_days: Optional[List[int]] = []
    closed_time: Optional[str] = None

class POICreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Tên địa điểm du lịch")
    category: str = Field(default="heritage", description="Danh mục: heritage, beach, nature, bridge, museum, entertainment, culinary")
    description: Optional[str] = Field(default="", description="Mô tả giới thiệu địa điểm")
    lat: float = Field(..., description="Vĩ độ (Latitude)")
    lon: float = Field(..., description="Kinh độ (Longitude)")
    estimated_duration_min: int = Field(default=90, ge=15, le=480, description="Thời gian tham quan ước tính (phút)")
    opening_hours: Optional[str] = Field(default="07:30 - 18:00", description="Giờ mở cửa")
    ticket_price: int = Field(default=0, ge=0, description="Giá vé vào cổng (VND)")
    image_url: Optional[str] = Field(default="", description="Link hình ảnh đại diện")
    tips: Optional[str] = Field(default="", description="Mẹo và lưu ý khi tham quan")
    ideal_time: Optional[str] = Field(default="morning", description="Khung giờ vàng: morning, afternoon, evening, any")
    closed_days: Optional[List[int]] = Field(default=[], description="Các ngày đóng cửa định kỳ (0: Thứ 2, 4: Thứ 6...)")
    closed_time: Optional[str] = Field(default="17:00", description="Giờ đóng cửa")

class ScoreBreakdown(BaseModel):
    distance_score: float = Field(..., description="Điểm cự ly chuẩn hóa (gần hơn = điểm cao hơn)")
    rating_score: float = Field(..., description="Điểm chất lượng dịch vụ chuẩn hóa")
    price_penalty: float = Field(..., description="Điểm phạt giá thành chuẩn hóa (đắt hơn = phạt nhiều hơn)")

class AccommodationRead(BaseModel):
    id: int
    name: str
    type: str = "hotel"
    stars: int = 3
    rating: float = 4.0
    price_per_night: int
    address: Optional[str] = None
    phone: Optional[str] = None
    lat: float
    lon: float
    distance_to_median_m: Optional[float] = None
    multi_criteria_score: Optional[float] = None
    score_breakdown: Optional[ScoreBreakdown] = None

class WeightsConfig(BaseModel):
    w_distance: float = Field(default=0.40, ge=0.0, le=1.0, description="Trọng số cự ly (càng gần càng tốt)")
    w_rating: float = Field(default=0.35, ge=0.0, le=1.0, description="Trọng số đánh giá sao & rating")
    w_price: float = Field(default=0.25, ge=0.0, le=1.0, description="Trọng số chi phí phòng (càng rẻ càng tốt)")

class PlanRequest(BaseModel):
    poi_ids: List[int] = Field(default=[], description="Danh sách ID điểm du lịch muốn tham quan")
    custom_pois: Optional[List[Dict[str, Any]]] = Field(default=None, description="Điểm tham quan tùy chỉnh nếu có {name, lat, lon}")
    days: int = Field(default=2, ge=1, le=7, description="Số ngày lưu trú du lịch (K)")
    max_budget: Optional[int] = Field(default=None, description="Ngân sách tối đa 1 đêm (VND)")
    min_stars: Optional[int] = Field(default=None, ge=1, le=5, description="Hạng sao tối thiểu")
    radius_meters: float = Field(default=3500.0, ge=500.0, le=20000.0, description="Bán kính tìm kiếm khách sạn quanh trung vị hình học (m)")
    weights: Optional[WeightsConfig] = Field(default_factory=WeightsConfig, description="Cấu hình trọng số hàm chấm điểm đa tiêu chí")
    selected_hotel_id: Optional[int] = Field(default=None, description="Khách sạn người dùng chủ động chọn từ Top 5 đề xuất")
    transport_mode: Optional[str] = Field(default="driving", description="Phương tiện di chuyển: walking, bike, driving")

class GeometricMedianResult(BaseModel):
    lat: float
    lon: float
    method: str = "Weiszfeld L1 Norm Geometric Median (Kháng ngoại lai)"
    iterations: int
    mean_distance_to_pois_km: float
    centroid_comparison_gain_km: float = Field(..., description="Quãng đường tiết kiệm được so với Trọng tâm số học Centroid đơn thuần")

class LegDetail(BaseModel):
    from_name: str
    to_name: str
    distance_km: float
    duration_min: float

class DayItinerary(BaseModel):
    day: int
    hotel: AccommodationRead
    visit_sequence: List[POIRead]
    legs: List[LegDetail]
    total_distance_km: float
    total_duration_min: float
    route_geojson: Dict[str, Any]

class PlanResponse(BaseModel):
    success: bool = True
    days: int
    total_pois: int
    geometric_median: GeometricMedianResult
    recommended_accommodations: List[AccommodationRead]
    selected_hotel: AccommodationRead
    daily_itineraries: List[DayItinerary]
    total_trip_distance_km: float
    total_trip_duration_min: float
    transport_mode: str = "driving"
    message: str = "Tối ưu hóa lịch trình và đề xuất lưu trú thành công."
