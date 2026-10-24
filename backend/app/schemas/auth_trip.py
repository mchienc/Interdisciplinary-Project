from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Auth Schemas ---
class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Trip Schemas ---
class TripCreateRequest(BaseModel):
    title: str
    days: int = 1
    selected_poi_ids: List[int] = []
    plan_data: Dict[str, Any]
    is_public: bool = True
    tags: Optional[str] = "Hà Nội"
    summary: Optional[str] = ""

class TripResponse(BaseModel):
    id: str
    user_id: int
    author_name: Optional[str] = "Thành viên cộng đồng"
    title: str
    days: int
    selected_poi_ids: List[int]
    plan_data: Dict[str, Any]
    is_public: bool
    likes_count: int = 0
    clones_count: int = 0
    tags: Optional[str] = "Hà Nội"
    summary: Optional[str] = ""
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# --- Admin Schemas ---
class AdminStatsResponse(BaseModel):
    total_pois: int
    total_trips: int
    total_users: int
    category_breakdown: Dict[str, int]
    popular_pois: List[Dict[str, Any]]

class POIUpdateRequest(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    ticket_price: Optional[int] = None
    opening_hours: Optional[str] = None
