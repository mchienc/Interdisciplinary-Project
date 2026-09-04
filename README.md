# Urban Spatial Analysis WebGIS System
## Đồ án Liên ngành: Hệ thống WebGIS Phân tích Không gian Đô thị

> **Giảng viên hướng dẫn:** ThS. Nguyễn Lệ Thu  
> **Chủ đề:** Phát triển hệ thống phần mềm phục vụ các ngành Khoa học khác có liên quan (GIS & Quy hoạch đô thị)  
> **Thời gian:** 9 tuần (17/08/2026 – 18/10/2026)

---

### 📌 Danh mục Tài liệu Học thuật (Project Documents)
- [Phiếu đề xuất đề tài (Song ngữ Việt - Anh)](docs/PHIEU_DE_XUAT_DE_TAI.md)
- [Thiết kế Kiến trúc Hệ thống WebGIS 3 lớp](docs/KIEN_TRUC_HE_THONG.md)
- [Biên bản họp nhóm Tuần 1](docs/BIEN_BAN_HOP_TUAN_1.md)

---

### 🗺️ Ngăn xếp Công nghệ (Technology Stack)
- **Spatial Database:** PostgreSQL 16 + PostGIS 3.4 (Chỉ mục không gian GiST)
- **Backend & Geoprocessing:** Python FastAPI + GeoPandas + Shapely + GeoServer (WMS/WFS)
- **Frontend & WebGIS:** React.js (Vite) + Mapbox GL JS / Leaflet + Turf.js + TailwindCSS + ECharts
- **Data Pipeline:** OpenStreetMap (Overpass API) + QGIS Data Preprocessing
- **DevOps:** Docker & Docker Compose
