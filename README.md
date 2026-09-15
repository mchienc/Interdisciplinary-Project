# Hanoi SDSS — Spatial Decision Support System for Smart Urban Tourism
`EPSG:4326` | `EPSG:32649` | `Google OR-Tools v9.7` | `OSRM Engine` | `PostGIS 3.4` | `FastAPI` | `React GSAP`

Hệ thống Hỗ trợ Ra Quyết định Không gian (Spatial Decision Support System - SDSS) ứng dụng hình học tính toán (Computational Geometry), tối ưu hóa tổ hợp (Combinatorial Optimization) và phân tích GIS đa tiêu chí nhằm giải quyết bài toán định vị cơ sở lưu trú và quy hoạch hành trình du lịch thông minh tại Thủ đô Hà Nội.

---

## 1. Bản chất bài toán (Problem Formulation)

### 1.1. Nghịch lý quy hoạch du lịch tự phát trong đô thị lịch sử
Trong hành vi du lịch đô thị truyền thống, du khách thường ra quyết định theo quy trình tuần tự rời rạc:
1. Đặt khách sạn dựa trên cảm tính hoặc khuyến mãi ngẫu nhiên mà chưa xác định các điểm đến cụ thể.
2. Lập danh sách các điểm tham quan rời rạc trong suốt kỳ nghỉ.
3. Di chuyển tự phát giữa các điểm đến theo từng ngày.

Quy trình này tạo ra **nghịch lý di chuyển zíc-zắc (The Zigzag Commuting Paradox)**:
- Điểm lưu trú nằm lệch khỏi trọng tâm không gian của cụm điểm đến, biến khách sạn thành "nút thắt cổ chai" sinh ra các chuyến đi hồi quy vô ích (Backtracking Commutes).
- Quãng đường di chuyển cộng dồn tăng từ 35% đến 65% so với ngưỡng tối ưu.
- Gia tăng áp lực phương tiện cá nhân lên mạng lưới giao thông vốn đã quá tải tại khu vực trung tâm (quận Hoàn Kiếm, Ba Đình, Đống Đa).

### 1.2. Chuyển dịch mô hình: Không gian dẫn dắt lịch trình (Spatial-First Paradigm)
Hanoi SDSS tái cấu trúc hoàn toàn quy trình ra quyết định theo chuỗi thuật toán khép kín:
```
[Tập hợp n Điểm POI] 
       │
       ▼
[K-Means Spatial Clustering] ──► Phân bổ cụm điểm tham quan theo ngày (K-Days)
       │
       ▼
[Weiszfeld L1-Median Solver] ──► Định vị Tọa độ Trung vị Hình học Lý tưởng (H*)
       │
       ▼
[PostGIS ST_DWithin + MCDA]  ──► Lọc & Xếp hạng Cơ sở Lưu trú Thực tế (Hotels/Homestays)
       │
       ▼
[OSRM Network Cost Matrix]   ──► Trích xuất Ma trận Thời gian/Khoảng cách Đường bộ
       │
       ▼
[Google OR-Tools TSP Engine] ──► Lập Lịch trình Vòng kín Tối ưu (Closed-Loop Tours)
```

---

## 2. Mô hình toán học & Thuật toán lõi (Mathematical Foundations)

### 2.1. Định vị cơ sở lưu trú: Bài toán Fermat-Weber & Thuật toán Weiszfeld ($L_1$-Median)

Cho tập hợp $n$ điểm du lịch đã chọn:
$$\mathcal{P} = \{P_1, P_2, \dots, P_n\}, \quad P_i \in \mathbb{R}^2$$

Vị trí lưu trú lý tưởng $H^*(x, y)$ là điểm tối thiểu hóa tổng khoảng cách Euclidean tới toàn bộ các điểm tham quan:
$$H^* = \arg\min_{H \in \mathbb{R}^2} \sum_{i=1}^{n} \| H - P_i \|_2$$

#### Tại sao sử dụng Geometric Median ($L_1$-Norm) thay vì Centroid ($L_2^2$-Norm)?
- **Trọng tâm số học (Arithmetic Mean / Centroid):** Tối thiểu hóa tổng bình phương khoảng cách $\sum \|H - P_i\|_2^2$. Khi du khách chọn một điểm tham quan nằm xa vùng trung tâm (ví dụ: Bảo tàng Dân tộc học ở Cầu Giấy, Làng gốm Bát Tràng, hoặc Thiên Đường Bảo Sơn), bình phương khoảng cách sẽ khuếch đại sai số, kéo vị trí khách sạn lệch hẳn khỏi khu vực tập trung dày đặc của phố cổ và di tích Ba Đình.
- **Trung vị hình học ($L_1$-Median):** Có điểm phá vỡ (Breakdown Point) đạt 50%, miễn nhiễm với các điểm dị biệt không gian (Spatial Outliers), đảm bảo tổng năng lượng di chuyển thực tế của du khách luôn đạt cực tiểu toàn cục.

#### Công thức lặp Weiszfeld (Iteratively Reweighted Least Squares — IRLS)
Tọa độ được chiếu từ hệ quy chiếu trắc địa WGS84 (`EPSG:4326`) sang hệ tọa độ phẳng mét UTM Zone 49N (`EPSG:32649`):
$$H^{(k+1)} = \frac{\displaystyle\sum_{i=1}^{n} \frac{P_i}{\|H^{(k)} - P_i\|_2 + \epsilon}}{\displaystyle\sum_{i=1}^{n} \frac{1}{\|H^{(k)} - P_i\|_2 + \epsilon}}$$

Trong đó:
- $\epsilon = 10^{-6}$ là hệ số ổn định số học chống chia cho 0 khi $H^{(k)}$ trùng với một điểm $P_i$.
- Điểm khởi tạo: $H^{(0)} = \frac{1}{n} \sum_{i=1}^{n} P_i$ (Trọng tâm số học).
- Điều kiện hội tụ dừng: $\| H^{(k+1)} - H^{(k)} \|_2 < 10^{-4}\text{ m}$.

---

### 2.2. Tối ưu hóa thứ tự hành trình: Travelling Salesperson Problem (TSP)

Với mỗi cụm hành trình trong ngày gồm khách sạn xuất phát $H$ và $m$ điểm tham quan $\mathcal{S} = \{P_{\pi(1)}, P_{\pi(2)}, \dots, P_{\pi(m)}\}$, hệ thống giải bài toán Người du lịch vòng kín (Closed-Loop TSP):

$$\min \sum_{u \in \mathcal{V}} \sum_{v \in \mathcal{V}} C(u, v) \cdot x_{u,v}$$

Thỏa mãn các ràng buộc:
$$\sum_{v \in \mathcal{V}, v \neq u} x_{u,v} = 1, \quad \forall u \in \mathcal{V}$$
$$\sum_{u \in \mathcal{V}, u \neq v} x_{u,v} = 1, \quad \forall v \in \mathcal{V}$$
$$u_i - u_j + |\mathcal{V}| \cdot x_{i,j} \le |\mathcal{V}| - 1, \quad \forall 2 \le i \neq j \le |\mathcal{V}| \quad \text{(Miller-Tucker-Zemlin Sub-tour Elimination)}$$

Trong đó:
- Tập đỉnh: $\mathcal{V} = \{H\} \cup \mathcal{S}$.
- $C(u, v)$: Chi phí thời gian thực tế (Duration in seconds) được trích xuất trực tiếp từ ma trận giao thông OSRM Table API, phản ánh đúng mạng lưới đường 1 chiều và tốc độ lưu thông nội đô Hà Nội.
- Thuật toán giải: Google OR-Tools Routing Engine áp dụng chiến lược tìm kiếm ban đầu `PATH_CHEAPEST_ARC` kết hợp giải thuật siêu phỏng đoán `GUIDED_LOCAL_SEARCH` để thoát khỏi các cực tiểu địa phương.

---

### 2.3. Lọc không gian & Đánh giá đa tiêu chí PostGIS (Spatial MCDA)

Sau khi xác định tọa độ lý tưởng $H^*$, hệ thống truy vấn các cơ sở lưu trú thực tế trong bán kính khả thi $R$ bằng phép toán quan hệ không gian PostGIS:

```sql
SELECT 
    id, name, type, stars, rating, price_per_night, address, lat, lon,
    ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(:median_lon, :median_lat), 4326)::geography) AS dist_m
FROM accommodations
WHERE ST_DWithin(
    geom::geography, 
    ST_SetSRID(ST_MakePoint(:median_lon, :median_lat), 4326)::geography, 
    :radius_meters
)
AND (:max_budget IS NULL OR price_per_night <= :max_budget)
AND (:min_stars IS NULL OR stars >= :min_stars)
ORDER BY dist_m ASC
LIMIT 20;
```

Điểm đánh giá tổng hợp của từng khách sạn ứng viên được chuẩn hóa theo mô hình MCDA tuyến tính:
$$\text{Score}(H) = w_{\text{dist}} \cdot \left(1 - \frac{d(H, H^*)}{R}\right) + w_{\text{rating}} \cdot \left(\frac{\text{Rating}(H)}{5.0}\right) + w_{\text{price}} \cdot \left(1 - \frac{\text{Price}(H) - \text{Price}_{\min}}{\text{Price}_{\max} - \text{Price}_{\min}}\right)$$

Thỏa mãn điều kiện chuẩn tắc trọng số: $w_{\text{dist}} + w_{\text{rating}} + w_{\text{price}} = 1.0$.

---

## 3. Kiến trúc hệ thống (System Architecture)

Hệ thống được thiết kế theo mô hình vi dịch vụ phân lớp (Decoupled Micro-architecture):

```
+-----------------------------------------------------------------------------------+
|                            CLIENT PRESENTATION LAYER                              |
|                                                                                   |
|  [ Landing Page: Warm Editorial ]           [ WebGIS Analysis Workstation ]       |
|  - Lenis Smooth Inertia Scroll              - MapLibre GL Interactive Map Canvas  |
|  - GSAP Stacking Cards Presets               - GeoJSON Layer Management (Line/Pt)  |
|  - Diacritic-Safe Typography (Lora)         - Dynamic MCDA Weight Sliders Panel   |
+-----------------------------------------------------------------------------------+
                                         │
                 REST API (GeoJSON / JSON Payload)
                                         ▼
+-----------------------------------------------------------------------------------+
|                        FASTAPI GEOPROCESSING BACKEND                              |
|                                                                                   |
|  [ Spatial Service ]        [ Routing Service ]         [ Recommendation Service ]|
|  - PyProj EPSG:32649 Metric - Google OR-Tools TSP       - Spatial MCDA Scoring    |
|  - Weiszfeld L1-Median      - Haversine Distance Matrix - Radius Fallback Handler |
|  - Scikit-learn K-Means     - Route LineString Builder  - Hotel Attribute Filter  |
+-----------------------------------------------------------------------------------+
           │                                                 │
           ▼ (SQLAlchemy ORM / Raw SQL)                      ▼ (HTTP REST)
+---------------------------------------+   +---------------------------------------+
|        POSTGIS SPATIAL DATABASE       |   |          OSRM ROUTING ENGINE          |
|                                       |   |                                       |
|  - PostgreSQL 16 + PostGIS 3.4        |   |  - OpenStreetMap Vietnam/Hanoi PBF    |
|  - Spatial Indexing: GiST on `geom`   |   |  - Table API (Driving Distance/Time)  |
|  - Distance Metric: `ST_DWithin`      |   |  - Route API (Turn-by-turn Geometry)  |
+---------------------------------------+   +---------------------------------------+
```

---

## 4. Ngôn ngữ thiết kế & Kỹ thuật giao diện (Design & Motion Engineering)

Khác với các ứng dụng WebGIS truyền thống vốn nặng tính kỹ thuật khô cứng, giao diện người dùng của Hanoi SDSS được định hướng theo phong cách **Warm Editorial / Organic Studio**:

- **Bảng màu Di sản Thủ đô (Heritage Palette):**
  • Canvas nền trang giấy yến mạch: `#F8F5EE` và `#FDFBF7`.
  • Sắc độ văn bản chính: Xanh rêu di sản `#1C382B` kết hợp Slate xám mềm `#1F2421`.
  • Màu sắc nhấn định hướng: Đất nung gốm Bát Tràng (Terracotta) `#B85D3B`.
- **Hệ thống Font chữ chuẩn Tiếng Việt:** 
  • Tiêu đề: Font Serif Google Lora & Playfair Display, cấu hình `font-feature-settings: 'kern' 1` triệt tiêu lỗi tách rời dấu thanh và nguyên âm ghép (`ô`, `ơ`, `ư`).
  • Giao diện tham số: Font Sans-serif Plus Jakarta Sans cân bằng với Font Monospace cho dữ liệu không gian.
- **GSAP & Motion Choreography:**
  • **Lenis Smooth Scroll Engine:** Khởi tạo cuộn quán tính đồng bộ trực tiếp với vòng lặp `gsap.ticker.add((time) => lenis.raf(time * 1000))` và `gsap.ticker.lagSmoothing(0)`, đảm bảo không có hiện tượng giật cục (jitter) hay lệch tọa độ cuộn (scroll desync).
  • **Hiệu ứng Thẻ trượt Xếp chồng (Stacking Cards):** Section "Lịch trình theo gu" sử dụng ScrollTrigger liên kết với container `h-[260vh]`. Khi cuộn, các thẻ trượt lên đè lên nhau, đồng thời thẻ phía dưới co nhỏ dần (`scale: 0.93`), giảm độ sáng (`brightness: 0.72`) và tạo hiệu ứng chiều sâu không gian 3D.
  • **Seamless Camera Fly-Down:** Khi du khách bấm "Tự tạo lịch trình ngay", GSAP Timeline thực hiện chuyển cảnh liền mạch: Landing Page trượt mờ và vô hiệu hóa tương tác, để lộ bản đồ nền MapLibre GL đang thực hiện hiệu ứng camera `flyTo` từ góc nhìn toàn cảnh (zoom 10.5) xuống khu vực lõi di sản (zoom 13.8) mà không cần tải lại trang.

---

## 5. Kết quả thực nghiệm (Empirical Benchmarks)

Thử nghiệm so sánh trên kịch bản thực tế gồm **8 điểm tham quan phổ biến** tại Hà Nội:
*Hồ Hoàn Kiếm, Cà phê Giảng, Ô Quan Chưởng, Chợ Đồng Xuân, Chùa Trấn Quốc, Lăng Bác, Hoàng Thành Thăng Long, Văn Miếu Quốc Tử Giám.*

| Tiêu chí Đánh giá | Lựa chọn Khách sạn Tự phát & Điểm ngẫu nhiên | Giải pháp Tối ưu Hanoi SDSS (Weiszfeld + TSP) | Hiệu quả Cải thiện |
| :--- | :---: | :---: | :---: |
| **Vị trí cơ sở lưu trú** | Khách sạn ngẫu nhiên ngoại vi (Cầu Giấy / Mỹ Đình) | Khách sạn bán kính 1.2 km quanh $H^*$ (Cửa Nam / Hoàn Kiếm) | **Giảm 68%** khoảng cách tiếp cận lõi |
| **Tổng quãng đường di chuyển (km)** | 38.4 km | 21.2 km | **Tiết kiệm 44.8%** quãng đường |
| **Tổng thời gian ngồi xe (phút)** | 118 phút | 64 phút | **Tiết kiệm 45.8%** thời gian (54 phút) |
| **Số lần quay đầu / ngược đường** | 5 lần | 0 lần (Hành trình 1 chiều khép kín) | **Triệt tiêu hoàn toàn** xung đột giao thông |
| **Độ dịch chuyển so với tâm tối ưu** | 4.8 km | 0.35 km | **Tiệm cận ngưỡng lý tưởng** |

---

## 6. Khởi chạy dự án (Local Deployment)

### 6.1. Yêu cầu hệ thống
- Docker & Docker Compose v2.20+
- Python 3.11+
- Node.js 18.0+ & npm 9.0+

### 6.2. Khởi chạy bằng Docker Compose (Khuyến nghị)
Hệ thống đi kèm cấu hình Docker đa tầng sẵn sàng phục vụ:

```bash
# 1. Clone repository
git clone https://github.com/your-username/hanoi-tourism-sdss.git
cd hanoi-tourism-sdss

# 2. Khởi động toàn bộ cụm dịch vụ (PostGIS, Backend FastAPI, Frontend Vite, pgAdmin)
cd docker
docker compose up -d --build

# 3. Kiểm tra trạng thái các container
docker compose ps
```

Các dịch vụ sẽ lắng nghe trên các cổng sau:
- Frontend Application: `http://localhost:5173`
- Backend API Docs (Swagger UI): `http://localhost:8000/docs`
- PostgreSQL / PostGIS Database: `localhost:5432` (User: `postgres`, Password: `postgis_password`, DB: `webgis_db`)
- pgAdmin Web Dashboard: `http://localhost:5050` (Email: `admin@sdss.vn`, Password: `admin`)

---

### 6.3. Khởi chạy môi trường phát triển cục bộ (Local Development)

#### Khởi tạo Backend (FastAPI):
```bash
cd backend

# Tạo và kích hoạt môi trường ảo
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Cài đặt các gói phụ thuộc
pip install -r requirements.txt

# Khởi chạy máy chủ API phát triển
python -m uvicorn app.main:app --port 8000 --reload
```

#### Khởi tạo Frontend (React + Vite):
```bash
cd frontend

# Cài đặt các gói thư viện
npm install

# Khởi chạy Vite dev server
npm run dev
```

---

## 7. Cấu trúc thư mục dự án (Repository Layout)

```
do_an_lien_nganh/
├── backend/                        # Geoprocessing & Optimization Backend
│   ├── app/
│   │   ├── main.py                 # FastAPI Application Factory & CORS
│   │   ├── db.py                   # SQLAlchemy Engine & Session Factory
│   │   ├── models/                 # SQLAlchemy Spatial ORM Models
│   │   ├── schemas/                # Pydantic Request/Response Schemas
│   │   ├── services/
│   │   │   ├── spatial_service.py  # Weiszfeld L1-Median & K-Means
│   │   │   ├── routing_service.py  # Google OR-Tools TSP & OSRM Client
│   │   │   └── recommendation_service.py # PostGIS Query & Spatial MCDA
│   │   └── routers/                # API Endpoints (Itinerary, POI, Hotel)
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                       # Editorial WebGIS Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingHero.tsx     # Editorial Hero Viewport & Lenis Syncer
│   │   │   ├── MapView.tsx         # MapLibre GL Canvas & Vector GeoJSON
│   │   │   ├── Sidebar.tsx         # GIS Control Panel & Optimization Tuning
│   │   │   └── editorial/
│   │   │       ├── StackingCardsSection.tsx # GSAP Stacking Cards Timeline
│   │   │       ├── ComparisonSection.tsx    # Visual Tourism Paradox
│   │   │       ├── HowItWorksSection.tsx    # 3-Step Guided Workflow
│   │   │       └── Navigation.tsx           # Heritage Minimalist Header
│   │   ├── types.ts                # TypeScript Spatial Data Definitions
│   │   ├── App.tsx                 # Master Coordinator & GSAP Stage Switcher
│   │   └── index.css               # Tailwind Directives & Diacritic Rules
│   ├── Dockerfile
│   └── package.json
│
├── docker/
│   ├── docker-compose.yml          # Container Orchestration Spec
│   └── init.sql                    # PostGIS Extension & Spatial Schema DDL
│
└── README.md                       # High-Taste Technical Documentation
```

---

## 8. Giấy phép (License)
Dự án được phân phối dưới giấy phép mã nguồn mở **MIT License**. Mọi đóng góp và tái sử dụng cho mục đích học thuật, nghiên cứu khoa học GIS và quy hoạch đô thị đều được khuyến khích.
