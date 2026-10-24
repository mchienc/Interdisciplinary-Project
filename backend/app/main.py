import os
from dotenv import load_dotenv

# Tải cấu hình biến môi trường từ .env
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .db import init_db
from .routers.itinerary import router as itinerary_router
from .routers.urban_analysis import router as urban_analysis_router
from .routers.chatbot import router as chatbot_router
from .routers.auth import router as auth_router
from .routers.trips import router as trips_router
from .routers.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo CSDL và tài khoản demo khi khởi động
    init_db()
    yield

app = FastAPI(
    title="Spatial Decision Support System (SDSS) WebGIS API",
    description="Hệ thống hỗ trợ ra quyết định không gian - Tự động đề xuất vị trí lưu trú tối ưu và lập lịch trình du lịch đa điểm thông minh",
    version="2.0.0",
    lifespan=lifespan
)

# Cấu hình CORS để Frontend (React/Vite) gọi API mượt mà
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký Router SDSS Lập lịch trình & Đề xuất Lưu trú
app.include_router(itinerary_router)

# Đăng ký Router Phân tích Đô thị (Legacy Urban Analysis)
app.include_router(urban_analysis_router)

# Đăng ký Router Hà Nội Storyteller AI Chatbot (Gemini API)
app.include_router(chatbot_router)

# Đăng ký Router Xác thực & Phân quyền (Auth & RBAC)
app.include_router(auth_router)

# Đăng ký Router Quản lý Chuyến đi cá nhân (Saved Trips)
app.include_router(trips_router)

# Đăng ký Router Quản trị viên & Thống kê DSS (Admin Panel)
app.include_router(admin_router)

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "online",
        "service": "SDSS WebGIS Engine",
        "version": "2.0.0",
        "algorithms": [
            "Weiszfeld Geometric Median (L1-norm)",
            "K-Means Spatial Clustering",
            "Google OR-Tools TSP Solver",
            "OSRM Routing Engine (Table & Route API)",
            "PostGIS ST_DWithin Multi-criteria Recommender"
        ],
        "features": [
            "JWT Authentication & RBAC",
            "Persistent Saved Trips Management",
            "Admin GIS Analytics Dashboard",
            "Gemini 3 Cultural Chatbot"
        ]
    }
