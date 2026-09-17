from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers.itinerary import router as itinerary_router
from .routers.urban_analysis import router as urban_analysis_router

app = FastAPI(
    title="Spatial Decision Support System (SDSS) WebGIS API",
    description="Hệ thống hỗ trợ ra quyết định không gian - Tự động đề xuất vị trí lưu trú tối ưu và lập lịch trình du lịch đa điểm thông minh",
    version="2.0.0"
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
        ]
    }
