# ĐỀ CƯƠNG CHI TIẾT CUỐN BÁO CÁO ĐỒ ÁN LIÊN NGÀNH
## ĐỀ TÀI: HỆ THỐNG WEBGIS PHÂN TÍCH KHÔNG GIAN ĐÔ THỊ
### (Urban Spatial Analysis WebGIS System)

- **Giảng viên hướng dẫn:** ThS. Nguyễn Lệ Thu
- **Chuyên ngành:** Công nghệ Thông tin (Hệ thống Thông tin & Kỹ thuật Phần mềm)
- **Định hướng liên ngành:** Hệ thống Thông tin Địa lý (GIS) & Khoa học Dữ liệu Đô thị (Urban Informatics)
- **Thời gian thực hiện:** 9 tuần (17/08/2026 – 18/10/2026)

---

## MỤC LỤC TỔNG QUAN (TABLE OF CONTENTS)

```text
LỜI CẢM ƠN
TÓM TẮT ĐỀ TÀI (TIẾNG VIỆT & TIẾNG ANH)
DANH MỤC TỪ VIẾT TẮT
DANH MỤC BẢNG BIỂU & HÌNH VẼ

CHƯƠNG 1: TỔNG QUAN VỀ HỆ THỐNG THÔNG TIN ĐỊA LÝ VÀ PHÂN TÍCH ĐÔ THỊ
CHƯƠNG 2: PHÂN TÍCH YÊU CẦU VÀ THIẾT KẾ HỆ THỐNG WEBGIS
CHƯƠNG 3: CÀI ĐẶT HỆ THỐNG VÀ THỰC NGHIỆM GIẢI THUẬT KHÔNG GIAN
CHƯƠNG 4: ĐÁNH GIÁ THỰC NGHIỆM MẠNG LƯỚI THƯƠNG MẠI HÀ NỘI VÀ HIỆU NĂNG

KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
TÀI LIỆU THAM KHẢO
PHỤ LỤC (MÃ NGUỒN & HƯỚNG DẪN TRIỂN KHAI DOCKER)
```

---

## NỘI DUNG CHI TIẾT TỪNG CHƯƠNG

### CHƯƠNG 1: TỔNG QUAN VỀ HỆ THỐNG THÔNG TIN ĐỊA LÝ VÀ PHÂN TÍCH ĐÔ THỊ
- **1.1. Tính cấp thiết của đề tài:**
  - Thực trạng phát triển đô thị nhanh tại TP. Hà Nội và bài toán mất cân đối trong phân bổ tiện ích thương mại bán lẻ (TTTM, siêu thị, dịch vụ công).
  - Nhu cầu cấp thiết về công cụ trực quan hóa hỗ trợ ra quyết định (Spatial Decision Support Systems - SDSS) cho nhà quản lý và doanh nghiệp.
- **1.2. Khảo sát các nền tảng WebGIS hiện nay:**
  - Đánh giá ưu nhược điểm của các giải pháp thương mại (ArcGIS Online, Mapbox Studio) và các giải pháp mã nguồn mở (QGIS Server, GeoServer, Leaflet, OpenLayers).
  - Lý do lựa chọn ngăn xếp FOSS4G (PostgreSQL/PostGIS + Python FastAPI + Leaflet/Turf.js + GSAP).
- **1.3. Cơ sở lý thuyết các mô hình phân tích không gian:**
  - *Mô hình Vùng đệm trắc địa (Geodesic Buffer Zone):* Khái niệm bán kính phục vụ, cự ly đi bộ (500m) và cự ly xe cơ giới (1.5km, 3km).
  - *Ước lượng mật độ hạt nhân (Kernel Density Estimation - KDE):* Công thức toán học và nguyên lý sinh bản đồ nhiệt điểm nóng (Hotspots).
  - *Đa giác Voronoi (Thiessen Polygons):* Nguyên lý phân vùng không gian ảnh hưởng cạnh tranh giữa các điểm dịch vụ lân cận.
  - *Bản đồ phân vùng chuyên đề (Choropleth Map):* Phương pháp phân loại dữ liệu theo ngưỡng (Quantile / Natural Breaks).
- **1.4. Mục tiêu, đối tượng và phạm vi nghiên cứu:**
  - Đối tượng: 392 điểm TTTM/Siêu thị và 30 quận/huyện TP. Hà Nội.

---

### CHƯƠNG 2: PHÂN TÍCH YÊU CẦU VÀ THIẾT KẾ HỆ THỐNG
- **2.1. Phân tích yêu cầu hệ thống:**
  - *Yêu cầu chức năng:* Hiển thị bản đồ đa lớp, lọc đa tiêu chí (quận, thương hiệu), phân tích Buffer đơn/đa vành đai, sinh đa giác Voronoi, đo đạc khoảng cách/diện tích, vẽ vùng truy vấn không gian, xem bảng dữ liệu thuộc tính, xuất báo cáo CSV/GeoJSON.
  - *Yêu cầu phi chức năng:* Hiệu năng phản hồi dưới 1 giây, hoạt cảnh giao diện 60 FPS (GSAP), tính mở rộng, chuẩn hóa chuẩn OGC (Open Geospatial Consortium).
- **2.2. Thiết kế Kiến trúc Hệ thống 3 lớp (3-Tier Architecture):**
  - Presentation Tier (Web Client): HTML5, Leaflet, Turf.js, Chart.js, GSAP.
  - Application & Geoprocessing Tier (Backend): Python FastAPI, Shapely, PyProj, GeoPandas.
  - Spatial Data Tier (Database): PostgreSQL 16 + PostGIS 3.4.
- **2.3. Sơ đồ Thiết kế Kỹ thuật Phần mềm (UML Diagrams):**
  - Sơ đồ Ca sử dụng (Use Case Diagram) và đặc tả kịch bản chính.
  - Sơ đồ Tuần tự (Sequence Diagram) cho luồng phân tích Buffer và Spatial Query.
  - Sơ đồ Hoạt động (Activity Diagram).
- **2.4. Thiết kế Cơ sở dữ liệu Không gian (PostGIS Schema):**
  - Bảng `districts`: Định dạng `MultiPolygon`, hệ quy chiếu EPSG:4326, thuộc tính dân số, diện tích, mật độ.
  - Bảng `commercial_centers`: Định dạng `Point`, hệ quy chiếu EPSG:4326, thuộc tính thương hiệu, địa chỉ, quận quản lý.
  - Chiến lược tối ưu hóa: Chỉ mục không gian **Spatial GiST (Generalized Search Tree)** và phân vùng dữ liệu.

---

### CHƯƠNG 3: CÀI ĐẶT HỆ THỐNG VÀ THỰC NGHIỆM GIẢI THUẬT KHÔNG GIAN
- **3.1. Quy trình Thu thập và Chuẩn hóa Dữ liệu (Spatial Data Engineering):**
  - Trích xuất dữ liệu OSM qua Overpass API (Python Overpass QL).
  - Trích xuất ranh giới 30 quận huyện từ OGC geoBoundaries.
  - Thực thi Spatial Join `ST_Contains` trong PostGIS để tự động gán TTTM vào từng quận.
- **3.2. Đóng gói Hạ tầng Triển khai bằng Docker Compose:**
  - File `docker-compose.yml` cấu hình PostGIS 16 và pgAdmin 4.
- **3.3. Cài đặt Dịch vụ API Backend (FastAPI):**
  - Cài đặt các endpoint chuẩn GeoJSON FeatureCollection.
  - Cài đặt giải thuật chuyển đổi tọa độ trắc địa:
    $$\text{EPSG:4326 (Độ)} \xrightarrow{\text{PyProj}} \text{EPSG:3857 (Mét)} \xrightarrow{\text{Buffer}} \text{Polygon} \xrightarrow{\text{PyProj}} \text{EPSG:4326}$$
- **3.4. Cài đặt Giao diện WebGIS Workstation Chuyên nghiệp:**
  - Tích hợp Leaflet Draw đo đạc chiều dài tuyến và diện tích vùng.
  - Tích hợp Turf.js cho giải thuật Voronoi và Spatial Intersect điểm trong vùng vẽ.
  - Tích hợp Bảng dữ liệu thuộc tính (Attribute Table) tương tác 2 chiều với bản đồ.
  - Áp dụng các kỹ thuật chuyển động mượt mà GSAP (`gsap.timeline`, `animateCount`, `gsap.matchMedia`).

---

### CHƯƠNG 4: ĐÁNH GIÁ THỰC NGHIỆM MẠNG LƯỚI THƯƠNG MẠI HÀ NỘI VÀ HIỆU NĂNG
- **4.1. Kết quả Phân tích Thực nghiệm tại TP. Hà Nội:**
  - Bảng xếp hạng và biểu đồ phân bổ TTTM trên 30 quận/huyện.
  - Phân tích tương quan giữa Mật độ dân cư và Mật độ tiện ích bán lẻ ($R^2$ tương quan).
  - Chỉ ra các "Vùng trũng dịch vụ (Service Deserts)" ở ngoại thành và "Vùng cạnh tranh gay gắt" tại nội thành (Hoàn Kiếm, Đống Đa, Cầu Giấy).
- **4.2. Đánh giá Hiệu năng Hệ thống:**
  - Benchmark thời gian truy vấn không gian trong PostGIS có và không có chỉ mục GiST.
  - Tốc độ render bản đồ WebGL / Canvas khi hiển thị 392 điểm và 30 đa giác.
- **4.3. Đánh giá mức độ hoàn thiện so với Mục tiêu ban đầu:**
  - So chiếu với các yêu cầu đã cam kết trong Phiếu đề xuất đề tài tuần 1.

---

### KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
- Những đóng góp chính của đề tài về mặt lý thuyết và ứng dụng thực tiễn.
- Hướng phát triển trong tương lai:
  - Tích hợp mạng lưới giao thông đường bộ (pgRouting) để tính toán vùng tiếp cận theo thời gian thực tế (**Isochrone Map - 5, 10, 15 phút lái xe**).
  - Ứng dụng mô hình Trọng lực Huff (Huff Gravity Model) dự báo doanh thu và lượng khách tiếp cận từng trung tâm thương mại.

---

### TÀI LIỆU THAM KHẢO (CHỌN LỌC HỌC THUẬT)
1. Obe, R. O., & Hsu, L. S. (2021). *PostGIS in Action (3rd Edition)*. Manning Publications.
2. Longley, P. A., Goodchild, M. F., Maguire, D. J., & Rhind, D. W. (2015). *Geographic Information Science and Systems*. Wiley.
3. Open Geospatial Consortium (OGC). *OpenGIS Web Feature Service (WFS) & Web Map Service (WMS) Implementation Specifications*.
4. Silverman, B. W. (2018). *Density Estimation for Statistics and Data Analysis*. Routledge.
5. Niên giám Thống kê TP. Hà Nội (Cục Thống kê TP. Hà Nội).
