import uuid
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..db import get_db
from ..models.user_trip import User, SavedTrip
from ..schemas.auth_trip import TripCreateRequest, TripResponse
from ..core.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/trips", tags=["Quản lý Lịch trình (Trips)"])

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def save_trip(
    req: TripCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lưu kế hoạch du lịch đã tối ưu vào danh sách chuyến đi của người dùng"""
    trip_id = str(uuid.uuid4())
    new_trip = SavedTrip(
        id=trip_id,
        user_id=current_user.id,
        title=req.title.strip() or f"Hành trình {req.days} Ngày Hà Nội",
        days=req.days,
        selected_poi_ids=json.dumps(req.selected_poi_ids),
        plan_data=json.dumps(req.plan_data),
        is_public=req.is_public,
        tags=req.tags or "Hà Nội",
        summary=req.summary or f"Lịch trình {req.days} ngày khám phá Thủ đô."
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return TripResponse(**new_trip.to_dict())

@router.get("", response_model=List[TripResponse])
def get_my_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách toàn bộ các chuyến đi của du khách đang đăng nhập"""
    trips = db.query(SavedTrip).filter(SavedTrip.user_id == current_user.id).order_by(SavedTrip.created_at.desc()).all()
    return [TripResponse(**t.to_dict()) for t in trips]

@router.get("/feed", response_model=List[TripResponse])
def get_community_feed(
    q: Optional[str] = Query(None, description="Từ khóa tìm kiếm tiêu đề hoặc thẻ"),
    days: Optional[int] = Query(None, description="Lọc theo số ngày (1, 2, 3...)"),
    sort_by: Optional[str] = Query("popular", description="Sắp xếp: popular, newest, clones"),
    limit: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lấy bảng tin các chuyến đi công khai của cộng đồng du lịch"""
    query = db.query(SavedTrip).filter(SavedTrip.is_public == True)

    if q:
        search_filter = f"%{q.strip()}%"
        query = query.filter(or_(SavedTrip.title.ilike(search_filter), SavedTrip.tags.ilike(search_filter)))

    if days:
        query = query.filter(SavedTrip.days == days)

    if sort_by == "newest":
        query = query.order_by(SavedTrip.created_at.desc())
    elif sort_by == "clones":
        query = query.order_by(SavedTrip.clones_count.desc(), SavedTrip.created_at.desc())
    else: # popular (mặc định theo lượt thích)
        query = query.order_by(SavedTrip.likes_count.desc(), SavedTrip.created_at.desc())

    trips = query.limit(limit).all()

    # Nếu cơ sở dữ liệu chưa có đủ lịch trình công khai mẫu, tự động tạo bổ sung các chuyến đi chất lượng
    if len(trips) < 3 and not q and not days:
        seed_community_itineraries(db)
        trips = query.limit(limit).all()

    return [TripResponse(**t.to_dict()) for t in trips]

@router.post("/{trip_id}/like")
def like_trip(
    trip_id: str,
    db: Session = Depends(get_db)
):
    """Thả tim / Yêu thích một chuyến đi công khai trong cộng đồng"""
    trip = db.query(SavedTrip).filter(SavedTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi này."
        )
    trip.likes_count = (trip.likes_count or 0) + 1
    db.commit()
    db.refresh(trip)
    return {"success": True, "likes_count": trip.likes_count}

@router.post("/{trip_id}/clone", response_model=TripResponse)
def clone_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sao chép lịch trình của cộng đồng về danh sách Chuyến đi cá nhân của mình để chỉnh sửa"""
    source_trip = db.query(SavedTrip).filter(SavedTrip.id == trip_id).first()
    if not source_trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi nguồn để sao chép."
        )

    # Tăng lượt clone của chuyến đi gốc
    source_trip.clones_count = (source_trip.clones_count or 0) + 1

    # Tạo bản sao mới cho người dùng
    new_trip_id = str(uuid.uuid4())
    author_name = source_trip.user.full_name if source_trip.user else "Cộng đồng"
    cloned_trip = SavedTrip(
        id=new_trip_id,
        user_id=current_user.id,
        title=f"{source_trip.title} (Bản sao)",
        days=source_trip.days,
        selected_poi_ids=source_trip.selected_poi_ids,
        plan_data=source_trip.plan_data,
        is_public=False, # Mặc định riêng tư khi mới clone
        tags=source_trip.tags,
        summary=f"Được sao chép từ lịch trình của {author_name}."
    )
    db.add(cloned_trip)
    db.commit()
    db.refresh(cloned_trip)
    return TripResponse(**cloned_trip.to_dict())

@router.patch("/{trip_id}/visibility")
def toggle_trip_visibility(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chuyển đổi trạng thái Công khai (Public) hoặc Riêng tư (Private) của chuyến đi"""
    trip = db.query(SavedTrip).filter(SavedTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi."
        )
    if trip.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền thay đổi trạng thái chuyến đi này."
        )
    trip.is_public = not trip.is_public
    db.commit()
    db.refresh(trip)
    return {"success": True, "is_public": trip.is_public}

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip_detail(
    trip_id: str,
    db: Session = Depends(get_db)
):
    """Lấy chi tiết một chuyến đi (hỗ trợ liên kết chia sẻ công khai)"""
    trip = db.query(SavedTrip).filter(SavedTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chuyến đi này hoặc liên kết đã bị xóa."
        )
    return TripResponse(**trip.to_dict())

@router.delete("/{trip_id}")
def delete_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xóa một chuyến đi khỏi danh sách cá nhân"""
    trip = db.query(SavedTrip).filter(SavedTrip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chuyến đi không tồn tại."
        )
    
    # Chỉ chủ sở hữu hoặc admin mới có quyền xóa
    if trip.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa chuyến đi này."
        )

    db.delete(trip)
    db.commit()
    return {"success": True, "message": "Đã xóa chuyến đi thành công."}

def seed_community_itineraries(db: Session):
    """Tự động nạp 4 chuyến đi cộng đồng mẫu đặc sắc nếu CSDL còn ít dữ liệu công khai"""
    try:
        admin_user = db.query(User).filter(User.role == "admin").first()
        if not admin_user:
            return

        # Lấy một kế hoạch mẫu từ chuyến đi đã có
        existing_sample = db.query(SavedTrip).first()
        base_plan_data = existing_sample.plan_data if existing_sample else "{}"

        curated = [
            {
                "title": "Hà Nội Hoài Cổ & Cà Phê Trứng (2 Ngày)",
                "days": 2,
                "poi_ids": [1, 2, 3, 4, 7, 8],
                "likes": 48,
                "clones": 29,
                "tags": "Hoài cổ, Ẩm thực, Di sản, Check-in",
                "summary": "Hành trình lắng đọng qua 36 phố phường, Văn Miếu, Hoàng thành và thưởng thức cà phê trứng trứ danh."
            },
            {
                "title": "Foodtour 36 Phố Phường Trọn Vị (1 Ngày)",
                "days": 1,
                "poi_ids": [1, 4, 11, 14, 15],
                "likes": 64,
                "clones": 42,
                "tags": "Foodtour, Ẩm thực đường phố, Phố Cổ",
                "summary": "Khám phá trọn vẹn ẩm thực Hà thành từ phở bò gia truyền, bún chả Hàng Quạt đến kem Tràng Tiền."
            },
            {
                "title": "Hành Trình Di Sản Thăng Long & Hồ Tây (3 Ngày)",
                "days": 3,
                "poi_ids": [1, 2, 3, 5, 6, 9, 10],
                "likes": 39,
                "clones": 18,
                "tags": "Di sản, Hồ Tây, Kiến trúc Pháp, Thư giãn",
                "summary": "3 ngày trọn vẹn chiêm ngưỡng nghìn năm văn hiến, chiều hoàng hôn Hồ Tây và các công trình Pháp cổ kính."
            },
            {
                "title": "Góc Sống Ảo Vintage & Nghệ Thuật Đương Đại (2 Ngày)",
                "days": 2,
                "poi_ids": [3, 7, 8, 12, 13],
                "likes": 56,
                "clones": 34,
                "tags": "Check-in, Bảo tàng, Cầu Long Biên, Vintage",
                "summary": "Tuyển chọn những góc chụp ảnh giàu cảm xúc nhất Thủ đô: Cầu Long Biên, Bảo tàng Mỹ thuật, Nhà thờ Lớn."
            }
        ]

        for item in curated:
            # Kiểm tra xem đã có tiêu đề này chưa
            exists = db.query(SavedTrip).filter(SavedTrip.title == item["title"]).first()
            if not exists:
                trip = SavedTrip(
                    id=str(uuid.uuid4()),
                    user_id=admin_user.id,
                    title=item["title"],
                    days=item["days"],
                    selected_poi_ids=json.dumps(item["poi_ids"]),
                    plan_data=base_plan_data,
                    is_public=True,
                    likes_count=item["likes"],
                    clones_count=item["clones"],
                    tags=item["tags"],
                    summary=item["summary"]
                )
                db.add(trip)
        db.commit()
    except Exception as e:
        db.rollback()

