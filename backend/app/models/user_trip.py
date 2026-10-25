import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="traveler", nullable=False) # 'traveler' hoặc 'admin'
    avatar_url = Column(String(500), nullable=True) # Ảnh đại diện (Google profile photo)
    auth_provider = Column(String(50), default="local", nullable=False) # 'local' hoặc 'google'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Quan hệ 1-N với chuyến đi đã lưu
    trips = relationship("SavedTrip", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "avatar_url": self.avatar_url,
            "auth_provider": self.auth_provider,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class SavedTrip(Base):
    __tablename__ = "saved_trips"

    id = Column(String(36), primary_key=True, index=True) # UUID string
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    days = Column(Integer, default=1)
    selected_poi_ids = Column(Text, nullable=True) # JSON list string [1, 2, 5]
    plan_data = Column(Text, nullable=False) # JSON string serialized PlanResponse
    is_public = Column(Boolean, default=True)
    likes_count = Column(Integer, default=0)
    clones_count = Column(Integer, default=0)
    tags = Column(String(255), default="Khám phá Hà Nội, 36 Phố Phường")
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="trips")

    def to_dict(self):
        poi_ids = []
        if self.selected_poi_ids:
            try:
                poi_ids = json.loads(self.selected_poi_ids)
            except Exception:
                poi_ids = []

        parsed_plan = None
        if self.plan_data:
            try:
                parsed_plan = json.loads(self.plan_data)
            except Exception:
                parsed_plan = None

        return {
            "id": self.id,
            "user_id": self.user_id,
            "author_name": self.user.full_name if self.user else "Thành viên cộng đồng",
            "title": self.title,
            "days": self.days,
            "selected_poi_ids": poi_ids,
            "plan_data": parsed_plan,
            "is_public": self.is_public,
            "likes_count": self.likes_count or 0,
            "clones_count": self.clones_count or 0,
            "tags": self.tags or "Hà Nội",
            "summary": self.summary or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
