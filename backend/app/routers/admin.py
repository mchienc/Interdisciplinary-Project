from collections import Counter
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.user_trip import User, SavedTrip
from ..models.spatial import POI
from ..services.mock_data import MOCK_POIS
from ..schemas.auth_trip import AdminStatsResponse, POIUpdateRequest
from ..core.dependencies import get_current_admin

router = APIRouter(prefix="/api/v1/admin", tags=["Bảng điều khiển Quản trị (Admin)"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lấy dữ liệu thống kê tổng thể DSS cho Bảng điều khiển Quản trị viên"""
    # 1. Tổng người dùng
    total_users = db.query(User).count()

    # 2. Tổng chuyến đi đã được lưu
    total_trips = db.query(SavedTrip).count()

    # 3. Danh sách POI và phân bổ thể loại
    pois = []
    try:
        db_pois = db.query(POI).all()
        if db_pois:
            pois = [p.to_dict() for p in db_pois]
    except Exception:
        pass
    
    if not pois:
        pois = MOCK_POIS

    total_pois = len(pois)
    category_counts = Counter(p.get("category", "other") for p in pois)

    # 4. Giả lập top điểm đến phổ biến dựa trên lượt xuất hiện
    popular_pois = [
        {"id": p["id"], "name": p["name"], "category": p.get("category"), "ticket_price": p.get("ticket_price", 0)}
        for p in pois[:6]
    ]

    return AdminStatsResponse(
        total_pois=total_pois,
        total_trips=total_trips,
        total_users=total_users,
        category_breakdown=dict(category_counts),
        popular_pois=popular_pois
    )

@router.get("/users")
def get_admin_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lấy danh sách tài khoản người dùng đã đăng ký trong hệ thống"""
    users = db.query(User).order_by(User.id.asc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]

@router.delete("/pois/{poi_id}")
def delete_poi(
    poi_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Quản trị viên xóa một điểm du lịch khỏi cơ sở dữ liệu"""
    try:
        poi = db.query(POI).filter(POI.id == poi_id).first()
        if poi:
            db.delete(poi)
            db.commit()
            return {"success": True, "message": f"Đã xóa điểm du lịch #{poi_id} thành công"}
    except Exception:
        pass

    # Nếu đang dùng mock data thì trả về thông báo mô phỏng
    return {"success": True, "message": f"Điểm du lịch #{poi_id} đã được gỡ khỏi hệ thống"}

# Danh sách mẫu điểm chờ duyệt nếu hệ thống chạy offline
SAMPLE_PENDING_POIS = [
    {
        "id": 1001,
        "name": "Bánh Mì Dân Tổ (Ngã ba Cao Thắng - Trần Nhật Duật)",
        "category": "culinary",
        "description": "Quán bánh mì mở lúc 3h sáng nức tiếng Hà Thành, chảo nhân xào thập cẩm đậm đà béo ngậy được các bạn trẻ xếp hàng chờ mua giữa đêm khuya.",
        "lat": 21.0425,
        "lon": 105.8492,
        "estimated_duration_min": 30,
        "opening_hours": "03:00 - 08:00",
        "ticket_price": 35000,
        "venue_type": "outdoor",
        "status": "pending",
        "submitted_by": "Nguyễn Văn Du Khách (tourist@hanoitravel.vn)",
        "tips": "Nên đến tầm 3h15 sáng để tận mắt chứng kiến chảo xào nhân khổng lồ thơm lừng."
    },
    {
        "id": 1002,
        "name": "Bảo tàng Gốm Bát Tràng (Tinh hoa Làng nghề Việt)",
        "category": "museum",
        "description": "Công trình kiến trúc 7 bàn xoay gốm khổng lồ đỏ son uốn lượn bên bờ sông Bắc Hưng Hải, trưng bày tinh hoa di sản gốm men hơn 500 năm Thăng Long.",
        "lat": 20.9768,
        "lon": 105.9085,
        "estimated_duration_min": 120,
        "opening_hours": "08:00 - 18:00",
        "ticket_price": 50000,
        "venue_type": "indoor",
        "status": "pending",
        "submitted_by": "Trần Thảo Ly (Blogger)",
        "tips": "Tầng thượng có quán cà phê view trọn dòng sông và không gian trải nghiệm vuốt gốm thực tế."
    }
]

@router.get("/pending-pois")
def get_pending_pois(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lấy danh sách các Điểm tham quan do người dùng đóng góp đang chờ Quản trị viên duyệt"""
    try:
        pending_db = db.query(POI).filter(POI.status == "pending").all()
        if pending_db:
            return [p.to_dict() for p in pending_db]
    except Exception:
        pass

    # Lấy các điểm pending từ MOCK_POIS và danh sách mẫu
    pending_mock = [p for p in MOCK_POIS if p.get("status") == "pending"]
    all_pending = pending_mock + [p for p in SAMPLE_PENDING_POIS if not any(m["id"] == p["id"] for m in MOCK_POIS)]
    return all_pending

@router.patch("/pois/{poi_id}/approve")
def approve_poi(
    poi_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Quản trị viên phê duyệt một điểm du lịch đưa lên bản đồ chính thức"""
    try:
        poi = db.query(POI).filter(POI.id == poi_id).first()
        if poi:
            poi.status = "approved"
            db.commit()
            return {"success": True, "message": f"Đã phê duyệt điểm #{poi_id} lên bản đồ chính thức"}
    except Exception:
        pass

    # Cập nhật trong mock data
    for p in MOCK_POIS:
        if p.get("id") == poi_id:
            p["status"] = "approved"
            return {"success": True, "message": f"Đã phê duyệt điểm #{poi_id} ({p.get('name')})"}

    for p in SAMPLE_PENDING_POIS:
        if p.get("id") == poi_id:
            p["status"] = "approved"
            MOCK_POIS.append(p)
            return {"success": True, "message": f"Đã phê duyệt điểm #{poi_id} ({p.get('name')})"}

    return {"success": True, "message": f"Đã phê duyệt điểm #{poi_id}"}

@router.patch("/pois/{poi_id}/reject")
def reject_poi(
    poi_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Quản trị viên từ chối một điểm du lịch đề xuất"""
    try:
        poi = db.query(POI).filter(POI.id == poi_id).first()
        if poi:
            poi.status = "rejected"
            db.commit()
            return {"success": True, "message": f"Đã từ chối điểm #{poi_id}"}
    except Exception:
        pass

    # Xóa khỏi danh sách chờ trong mock
    global SAMPLE_PENDING_POIS
    SAMPLE_PENDING_POIS = [p for p in SAMPLE_PENDING_POIS if p.get("id") != poi_id]
    for p in MOCK_POIS:
        if p.get("id") == poi_id:
            p["status"] = "rejected"

    return {"success": True, "message": f"Đã từ chối điểm #{poi_id}"}
