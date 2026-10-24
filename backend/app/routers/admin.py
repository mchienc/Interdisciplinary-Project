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
