# BIÊN BẢN HỌP NHÓM - TUẦN 1
## ĐỒ ÁN LIÊN NGÀNH: HỆ THỐNG WEBGIS PHÂN TÍCH KHÔNG GIAN ĐÔ THỊ

---

- **Thời gian:** 09:00 - 11:30, Ngày 22/08/2026
- **Địa điểm:** Phòng Lab CNTT / Họp trực tuyến Google Meet
- **Chủ trì cuộc họp:** Trưởng nhóm đồ án
- **Thư ký cuộc họp:** Thành viên nhóm
- **Tham vấn học thuật:** ThS. Nguyễn Lệ Thu (Giảng viên hướng dẫn)

---

### I. MỤC ĐÍCH CUỘC HỌP
1. Thống nhất cơ cấu tổ chức nhóm, phân công vai trò nhiệm vụ cho từng thành viên.
2. Thảo luận chi tiết phạm vi đề tài sau khi đã được GVHD phê duyệt trên cổng đào tạo (21/08/2026).
3. Hoàn thiện nội dung "Phiếu đề xuất đề tài" (bản song ngữ Việt - Anh).
4. Thống nhất ngăn xếp công nghệ (Tech Stack) và kiến trúc hệ thống 3 lớp cho nền tảng WebGIS.
5. Lập kế hoạch chi tiết cho Tuần 2 (Thu thập và tiền xử lý dữ liệu không gian).

---

### II. NỘI DUNG VÀ KẾT QUẢ THẢO LUẬN

#### 1. Phân công vai trò trong nhóm
- **Thành viên phụ trách GIS & CSDL không gian (Spatial Data Engineer):**
  - Nhiệm vụ: Thu thập dữ liệu OpenStreetMap (Overpass API), làm sạch dữ liệu trong QGIS, thiết kế Schema PostGIS, tối ưu hóa chỉ mục GiST, viết stored procedures tính toán không gian.
- **Thành viên phụ trách Backend & Map Server (Backend Engineer):**
  - Nhiệm vụ: Xây dựng RESTful API bằng Python FastAPI, tích hợp thư viện GeoPandas/Shapely, cấu hình GeoServer (nếu triển khai WMS/WFS), Docker hóa hệ thống.
- **Thành viên phụ trách Frontend WebGIS (Frontend Engineer):**
  - Nhiệm vụ: Xây dựng giao diện Web bằng React.js, tích hợp Mapbox GL JS / Leaflet, thư viện Turf.js, thiết kế Dashboard biểu đồ thống kê trực quan.

#### 2. Thống nhất phạm vi nghiên cứu thực nghiệm
- **Khu vực nghiên cứu (Study Area):** Địa bàn Thành phố Hà Nội, trọng tâm là 8 quận nội thành có mật độ thương mại cao: Ba Đình, Hoàn Kiếm, Đống Đa, Hai Bà Trưng, Cầu Giấy, Thanh Xuân, Nam Từ Liêm, Hà Đông.
- **Tập dữ liệu trọng tâm:**
  - Khoảng 40 – 60 Trung tâm thương mại, đại siêu thị phức hợp (Vincom, Lotte, Aeon Mall, Big C/GO!, MM Mega Market...).
  - Bản đồ ranh giới hành chính các quận/huyện và phường.
  - Bản đồ mạng lưới giao thông đường bộ cấp 1 và cấp 2.
  - Thống kê dân số và mật độ dân cư cấp quận.

#### 3. Thống nhất kiến trúc công nghệ
- **Data Tier:** PostgreSQL 16 + PostGIS 3.4.
- **Backend Tier:** Python FastAPI + GeoPandas + OGC GeoServer.
- **Frontend Tier:** React.js (Vite) + Mapbox GL JS + Turf.js + TailwindCSS.
- **DevOps:** Docker & Docker Compose để đóng gói triển khai nhất quán.

---

### III. KẾT LUẬN & PHÂN CÔNG TUẦN 2 (24/08 – 30/08/2026)

| Nhiệm vụ | Người phụ trách | Hạn hoàn thành | Sản phẩm bàn giao |
| :--- | :--- | :--- | :--- |
| Trích xuất dữ liệu OSM qua Overpass Turbo & làm sạch bằng QGIS | GIS Engineer | 27/08/2026 | File `hanoi_commercial_centers.geojson`, `hanoi_districts.geojson` |
| Cài đặt môi trường Docker (PostgreSQL 16 + PostGIS 3.4) | Backend Engineer | 26/08/2026 | `docker-compose.yml`, kết nối pgAdmin thành công |
| Viết migration script tạo bảng & import dữ liệu vào PostGIS | GIS & Backend | 29/08/2026 | Script `init_db.sql`, dữ liệu truy vấn thành công |
| Khởi tạo dự án Frontend React + Vite + Mapbox GL JS cơ bản | Frontend Engineer | 28/08/2026 | Khung source code Frontend, hiển thị được bản đồ Hà Nội |
| Soạn thảo Đề cương Báo cáo Đồ án & Tổng hợp tài liệu tham khảo | Toàn nhóm | 30/08/2026 | File `docs/outline_report.md` |

---

*Biên bản kết thúc vào lúc 11:30 cùng ngày. Các thành viên đã đọc, thống nhất 100% nội dung và cam kết thực hiện đúng tiến độ.*
