# 🏛️ Hanoi Tourism SDSS — Spatial Decision Support System
> **Hệ thống WebGIS Hỗ trợ Ra Quyết định Không gian Tối ưu Lịch trình & Vị trí Lưu trú Du lịch Hà Nội**

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgis.net/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-3B82F6?style=for-the-badge&logo=maplibre&logoColor=white)](https://maplibre.org/)
[![Google OR-Tools](https://img.shields.io/badge/Google_OR--Tools-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/optimization)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**Một giải pháp WebGIS thông minh kết hợp Trí tuệ Không gian (Spatial Intelligence), Tối ưu hóa Tổ hợp & Ngữ cảnh Đô thị thực tế để xóa bỏ nghịch lý di chuyển lòng vòng khi du lịch Thủ đô.**

[🌟 Tính năng nổi bật](#-tính-năng-nổi-bật) • [🎯 Bản chất bài toán](#-vấn-đề--giải-pháp-problem--solution) • [🧠 Thuật toán lõi](#-mô-hình-thuật-toán-lõi-core-algorithms) • [🚀 Khởi chạy nhanh](#-hướng-dẫn-cài-đặt--khởi-chạy) • [🏗️ Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)

</div>

---

## 📌 Vấn đề & Giải pháp (Problem & Solution)

### Nghịch lý di chuyển zíc-zắc trong du lịch tự phát
Khi lên kế hoạch du lịch Hà Nội, đa số du khách thường mắc phải 3 sai lầm phổ biến:
1. **Đặt khách sạn theo cảm tính**: Chọn phòng ở quá xa hoặc lệch hướng so với các điểm muốn đến (ví dụ: ở Cầu Giấy nhưng lịch trình chủ yếu ở Hoàn Kiếm, Ba Đình).
2. **Lên lịch trình tùy tiện**: Gom các điểm tham quan ngẫu nhiên vào cùng một ngày mà không tính toán cự ly địa lý và thời gian mở cửa.
3. **Di chuyển con thoi (Zíc-zắc)**: Khách sạn biến thành "nút thắt cổ chai", phải quay đi quay lại nhiều lần xuyên qua các trục giao thông thường xuyên ùn tắc vào giờ cao điểm.

```
❌ DU LỊCH TỰ PHÁT: Di chuyển lòng vòng, lãng phí 40 - 60% thời gian vì ngược đường
[Khách sạn ngoại vi] ──► [Điểm Tây Hồ] ──► [Điểm Hoàn Kiếm] ──► [Về Khách sạn] ──► [Điểm Ba Đình]

✅ HANOI TOURISM SDSS: Tối ưu không gian & Phân cụm khép kín
[Tập hợp POI] ──► [Phân cụm ngày cân bằng] ──► [Tính vị trí khách sạn lý tưởng] ──► [Vòng cung TSP 1 chiều]
```

### Bảng đối sánh thực tế (Chuyến đi 6 điểm tham quan tiêu biểu tại Hà Nội)
*(Văn Miếu, Lăng Bác, Hồ Tây & Chùa Trấn Quốc, Hoàng Thành Thăng Long, Phố Cổ, Hồ Hoàn Kiếm)*

| Tiêu chí so sánh | Du lịch tự phát | Sử dụng Hanoi SDSS | Mức độ tối ưu |
| :--- | :---: | :---: | :---: |
| 📍 **Vị trí lưu trú** | Chọn ngẫu nhiên ở xa trung tâm | Tâm tối ưu $H^*$ tại Quận Ba Đình / Hoàn Kiếm | **Tiết kiệm 65%** cự ly tiếp cận |
| 🚗 **Tổng quãng đường di chuyển** | ~28.5 km | **14.97 km** (2 ngày) | **Giảm 47.4%** quãng đường |
| ⏱️ **Thời gian ngồi xe** | ~85 phút | **~29 phút** | **Tiết kiệm 65.8%** thời gian di chuyển |
| 🔄 **Lượt quay đầu / ngược đường** | 4 - 6 lượt | **0 lượt** (Vòng kín khép kín tối ưu) | **Triệt tiêu hoàn toàn** xung đột lộ trình |
| 📅 **Cân bằng lịch trình** | Ngày 1 đi 1 điểm, Ngày 2 dồn 5 điểm | **Ngày 1 đi 3 điểm, Ngày 2 đi 3 điểm** | **Cân đối 100%** thể lực du khách |

---

## 🔄 Luồng hoạt động hệ thống (System Pipeline)

```mermaid
flowchart TD
    A["🎯 1. Du khách chọn các điểm đến yêu thích (POIs)"] --> B["⚖️ 2. Balanced K-Means: Phân cụm số ngày đồng đều (Hungarian Algorithm)"]
    B --> C["📍 3. Weiszfeld L1-Median: Xác định tọa độ khách sạn lý tưởng H*"]
    C --> D["🏨 4. PostGIS ST_DWithin & MCDA: Tìm & xếp hạng khách sạn tốt nhất"]
    D --> E["🛣️ 5. Google OR-Tools TSP & OSRM: Tối ưu thứ tự vòng kín từng ngày"]
    E --> F["🌤️ 6. Context-Aware Engine: Tích hợp Thời tiết Open-Meteo & Giao thông cao điểm"]
    F --> G["⏰ 7. Smart Timeline: Lập thời gian biểu chi tiết, giờ vàng check-in & nghỉ trưa"]
    G --> H["📱 8. Trực quan hóa WebGIS & Xuất file Excel / QR Code Google Maps / Story 9:16"]
```

---

## ✨ Tính năng nổi bật

| Nhóm tính năng | Mô tả chi tiết | Công nghệ ứng dụng |
| :--- | :--- | :--- |
| 🎯 **Tìm khách sạn lý tưởng** | Giải bài toán Fermat-Weber tìm điểm có tổng khoảng cách tới các POI là ngắn nhất. Kháng hoàn toàn các điểm ngoại lai xa trung tâm. | **Weiszfeld Algorithm ($L_1$-Median)** trên hệ tọa độ phẳng mét `EPSG:32649` |
| ⚖️ **Phân cụm ngày cân bằng** | Tự động phân chia $N$ điểm vào $K$ ngày sao cho vừa gần nhau về địa lý, vừa đảm bảo chênh lệch giữa các ngày không quá 1 điểm. | **Balanced K-Means** kết hợp thuật toán **Hungarian (`scipy.optimize.linear_sum_assignment`)** |
| 🏨 **Đánh giá khách sạn đa tiêu chí** | Quét các khách sạn thực tế quanh tâm lý tưởng trong bán kính tùy chọn ($R$), xếp hạng dựa trên 3 tiêu chí: Cự ly, Hạng sao và Giá phòng. | **PostGIS `ST_DWithin`**, Không gian Metric, **Spatial MCDA Scoring** |
| 🏎️ **Định tuyến vòng kín ngắn nhất** | Xuất phát từ khách sạn $\rightarrow$ ghé thăm từng điểm theo thứ tự tối ưu $\rightarrow$ trở về khách sạn mà không đi trùng đường. | **Google OR-Tools (Guided Local Search)** & **OSRM Routing Engine** |
| 🌤️ **Động cơ ngữ cảnh thời gian thực** | Tự động theo dõi thời tiết Hà Nội (nắng gắt, mưa giông) và giờ cao điểm (sáng 07:30 - 09:00, chiều 16:30 - 19:00, phố đi bộ cuối tuần) để cảnh báo và tự động thích ứng lộ trình. | **Open-Meteo Weather API**, Heuristics Giao thông Đô thị Hà Nội |
| ⏰ **Lịch trình thông minh & Giờ vàng** | Chọn giờ khởi hành (`07:30`, `08:00`, `08:30`, `09:00`), tự động tính giờ đến/rời đi, lồng khung giờ nghỉ trưa ăn uống (11:45 - 13:00) và gợi ý khung giờ vàng (Hoàng hôn Hồ Tây, Viếng Lăng Bác sáng...). | **Smart Chronological Timeline Generator** |
| 🎨 **Giao diện Warm Editorial** | Phong cách thiết kế mang đậm văn hóa Hà Nội: tối giản, thanh lịch, ngôn từ thân thiện mộc mạc (không dùng thuật ngữ học thuật khó hiểu). | **React 18**, **Tailwind CSS**, **Lenis Smooth Scroll**, **GSAP Animations** |
| 📱 **Chia sẻ & Xuất dữ liệu đa kênh** | Xuất file **Excel (.xlsx)** kèm khung giờ dự kiến, quét **Mã QR** mở trực tiếp trên Google Maps điện thoại, hoặc xuất thẻ ảnh **Story 9:16** đăng mạng xã hội. | **SheetJS (xlsx)**, **html2canvas**, **QRCode SVG** |

---

## 🧠 Mô hình thuật toán lõi (Core Algorithms)

### 1. Phân cụm cân bằng số lượng (Balanced Capacity-Constrained K-Means)
Với $N$ điểm tham quan và $K$ ngày du lịch, thuật toán K-Means truyền thống thường gom theo khoảng cách thuần túy, dẫn đến tình trạng một ngày quá tải và một ngày chỉ có 1 điểm. Hệ thống áp dụng bài toán ghép cặp cực tiểu (Bipartite Matching):
- Mỗi ngày nhận dung lượng tối đa $\lceil N / K \rceil$ và tối thiểu $\lfloor N / K \rfloor$.
- Thiết lập ma trận chi phí khoảng cách giữa $N$ điểm và $N$ vị trí gán của các cụm:
$$C_{i, j} = \| P_i - C_j \|_2$$
- Sử dụng thuật toán Hungarian để tìm phép gán có tổng chi phí toàn cục là nhỏ nhất:
$$\min \sum_{i=1}^N \sum_{j=1}^N C_{i, j} \cdot X_{i, j} \quad \text{với } \sum_j X_{i, j} = 1$$

### 2. Xác định điểm lưu trú lý tưởng (Weiszfeld $L_1$-Median)
Điểm lưu trú tối ưu $H^*(x, y)$ là nghiệm của bài toán Fermat-Weber cực tiểu hóa tổng khoảng cách Euclidean đến toàn bộ các điểm tham quan:
$$H^* = \arg\min_{H \in \mathbb{R}^2} \sum_{i=1}^N \| H - P_i \|_2$$

Công thức lặp Weiszfeld kháng điểm ngoại lai:
$$H^{(t+1)} = \frac{\displaystyle\sum_{i=1}^N \frac{P_i}{\|H^{(t)} - P_i\|_2 + \epsilon}}{\displaystyle\sum_{i=1}^N \frac{1}{\|H^{(t)} - P_i\|_2 + \epsilon}}$$

> **💡 Ưu thế học thuật so với Centroid:**
> Trọng tâm số học (Centroid $L_2^2$) rất nhạy cảm với các điểm ở xa (như Làng gốm Bát Tràng hay Chùa Hương), làm kéo lệch khách sạn ra ngoại thành. **$L_1$-Median có điểm phá vỡ (Breakdown Point) lên tới 50%**, đảm bảo khách sạn luôn nằm tại khu vực nội thành thuận tiện nhất.

### 3. Tối ưu thứ tự ghé thăm (Traveling Salesperson Problem - TSP)
Với mỗi ngày gồm khách sạn $H$ và $m$ điểm tham quan, hệ thống thiết lập bài toán TSP vòng kín trên ma trận thời gian thực tế:
$$\min \sum_{u} \sum_{v} \text{Duration}(u, v) \cdot x_{u, v}$$
Google OR-Tools giải bài toán với chiến lược tìm kiếm cục bộ có định hướng (`GUIDED_LOCAL_SEARCH`), kết hợp đường vẽ tuyến chính xác theo mạng lưới giao thông từ OSRM.

### 4. Đánh giá đa tiêu chí khách sạn (Spatial MCDA)
Truy vấn các khách sạn nằm trong bán kính $R$ tính từ $H^*$ thông qua hàm PostGIS `ST_DWithin` và chấm điểm tổng hợp:
$$\text{Score}(H) = w_{\text{cự ly}} \cdot \left(1 - \frac{\text{dist}}{R}\right) + w_{\text{sao}} \cdot \left(\frac{\text{Rating}}{5.0}\right) + w_{\text{giá}} \cdot \left(1 - \frac{\text{Price} - \text{Price}_{\min}}{\text{Price}_{\max} - \text{Price}_{\min}}\right)$$

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (REACT 18 + TS)                         │
│  • MapLibre GL Canvas (OSM / Esri Tiles)    • Context-Aware Engine          │
│  • Smart Timeline & Golden Hours Generator  • GSAP Motion & Lenis Scroll    │
│  • Excel (.xlsx) / QR Code / Story Exporter • MCDA Preference Controls      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST API (JSON / GeoJSON)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND ENGINE (FASTAPI + PYTHON)                    │
│  ┌─────────────────────────┐ ┌─────────────────────────┐ ┌───────────────┐ │
│  │     Spatial Service     │ │     Routing Service     │ │  MCDA Service │ │
│  │ • UTM Zone 49N Metric   │ │ • Google OR-Tools TSP   │ │ • Score Rank  │ │
│  │ • Weiszfeld L1-Median   │ │ • OSRM Table & Route API│ │ • Star/Price  │ │
│  │ • Balanced K-Means      │ │ • GeoJSON MultiLine     │ │ • PostGIS R   │ │
│  └─────────────────────────┘ └─────────────────────────┘ └───────────────┘ │
└──────────────────┬─────────────────────────────────────┬────────────────────┘
                   │ SQLAlchemy ORM                      │ HTTP REST
                   ▼                                     ▼
┌──────────────────────────────────────┐     ┌────────────────────────────────┐
│      POSTGRESQL 16 + POSTGIS 3.4     │     │       OSRM ROUTING ENGINE      │
│  • Spatial Indexing (GiST geom)      │     │  • OpenStreetMap Hà Nội Data   │
│  • Quan hệ không gian: ST_DWithin    │     │  • Ma trận khoảng cách & time  │
│  • Điểm du lịch & Khách sạn chuẩn hóa│     │  • Lộ trình thực tế đường bộ   │
└──────────────────────────────────────┘     └────────────────────────────────┘
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Cách 1: Khởi chạy siêu tốc bằng Docker (Khuyến nghị)
Yêu cầu: Máy tính đã cài đặt [Docker](https://www.docker.com/) và Docker Compose.

```bash
# 1. Clone mã nguồn dự án
git clone https://github.com/mchienc/Interdisciplinary-Project.git
cd Interdisciplinary-Project

# 2. Khởi chạy toàn bộ cụm dịch vụ (PostGIS + Backend + Frontend)
cd docker
docker compose up -d --build
```

Sau khi khởi chạy thành công:
- 🌐 **Giao diện WebGIS (Frontend)**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Tài liệu API Swagger (Backend)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🗄️ **Quản trị cơ sở dữ liệu pgAdmin**: [http://localhost:5050](http://localhost:5050) *(Tài khoản: `admin@sdss.vn` / `admin`)*

---

### Cách 2: Khởi chạy thủ công cho phát triển (Local Development)

#### 1. Yêu cầu môi trường
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL 15+ (tích hợp PostGIS) hoặc sử dụng chế độ Mock tự động khi CSDL offline.

#### 2. Khởi chạy Backend (FastAPI)
```bash
cd backend

# Tạo và kích hoạt môi trường ảo
python -m venv venv
# Trên Windows:
.\venv\Scripts\activate
# Trên Linux/macOS:
source venv/bin/activate

# Cài đặt các thư viện cần thiết
pip install -r requirements.txt

# Khởi chạy server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Ghi chú: Backend tích hợp sẵn cơ chế Fallback tự động. Nếu chưa kết nối PostgreSQL, hệ thống sẽ tự sử dụng Mock Data phong phú và bộ nhớ SQLite để phục vụ API bình thường.*

#### 3. Khởi chạy Frontend (React + Vite)
```bash
cd frontend

# Cài đặt thư viện Node.js
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```
*Truy cập giao diện tại: [http://localhost:5173](http://localhost:5173)*

---

## ⚙️ Cấu hình biến môi trường (Environment Variables)

### Backend (`backend/.env`)
```env
# Kết nối cơ sở dữ liệu PostGIS (tùy chọn, tự động fallback nếu không có)
DATABASE_URL=postgresql://postgres:postgis_password@localhost:5432/webgis_db

# Máy chủ định tuyến OSRM (mặc định sử dụng public server)
OSRM_BASE_URL=https://router.project-osrm.org
```

### Frontend (`frontend/.env`)
```env
# Địa chỉ API Backend
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📂 Cấu trúc thư mục dự án

```text
Interdisciplinary-Project/
├── backend/                             # Máy chủ tính toán không gian & tối ưu hóa
│   ├── app/
│   │   ├── main.py                      # Cấu hình FastAPI & CORS middleware
│   │   ├── db.py                        # Quản lý kết nối SQLAlchemy & Fail-safe fallback
│   │   ├── models/                      # ORM Models (POI, Accommodation)
│   │   ├── schemas/                     # Pydantic Schemas cho API Request/Response
│   │   ├── services/
│   │   │   ├── spatial_service.py       # Thuật toán Weiszfeld L1-Median & Balanced K-Means
│   │   │   ├── routing_service.py       # Google OR-Tools TSP & Định tuyến OSRM
│   │   │   ├── recommendation_service.py # Xếp hạng MCDA & Truy vấn PostGIS
│   │   │   └── mock_data.py             # Dữ liệu chuẩn hóa POIs & Khách sạn Hà Nội
│   │   └── routers/
│   │       ├── itinerary.py             # Endpoints Lập kế hoạch & Quản lý POI
│   │       └── urban_analysis.py        # Endpoints Phân tích không gian đô thị
│   ├── Dockerfile
│   └── requirements.txt                 # Danh sách gói phụ thuộc Python
│
├── frontend/                            # Ứng dụng WebGIS Client (Clean Architecture)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                  # Modal dùng chung: Thêm POI, Chi tiết POI, QR, Story, Banner
│   │   │   ├── landing/                 # Giao diện Trang chủ: Hero, Giới thiệu, So sánh, Footer
│   │   │   ├── map/                     # Bản đồ MapLibre GL, Lớp GeoJSON, Marker chỉ dẫn
│   │   │   └── workspace/               # Bảng điều khiển: Timeline, Dự toán ngân sách, Bộ lọc
│   │   ├── constants/                   # Hằng số bản đồ, POI mẫu, cấu hình mặc định
│   │   ├── context/                     # Context-Aware State (Thời tiết, Giao thông, Giờ cao điểm)
│   │   ├── hooks/                       # GSAP Animations, Screen Detector
│   │   ├── services/                    # API Service, OSRM Routing, Traffic, Weather
│   │   ├── utils/                       # Lập lịch trình Smart Timeline, Xuất Excel, Formatters
│   │   ├── types/                       # Khai báo TypeScript Interfaces
│   │   ├── App.tsx                      # Component điều phối luồng giao diện chính
│   │   ├── main.tsx
│   │   └── index.css                    # Tùy biến Tailwind CSS & Typography Hà Nội
│   ├── vercel.json                      # Cấu hình triển khai Frontend trên Vercel
│   └── package.json
│
├── docker/                              # Cấu hình triển khai Container
│   ├── docker-compose.yml               # Điều phối PostGIS + Backend + Frontend
│   └── init.sql                         # Khởi tạo Schema PostGIS & Dữ liệu ban đầu
│
└── README.md                            # Tài liệu hướng dẫn dự án chuẩn hóa
```

---

## 👨‍💻 Tác giả & Đồ án

- **Đồ án**: Đồ án Nghiên cứu & Ứng dụng Liên ngành (Interdisciplinary Project)
- **Chủ đề**: Hệ thống WebGIS Hỗ trợ Ra Quyết định Không gian Tối ưu Lịch trình & Lưu trú Du lịch Hà Nội
- **Repository**: [https://github.com/mchienc/Interdisciplinary-Project.git](https://github.com/mchienc/Interdisciplinary-Project.git)

---

## 📄 Giấy phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Toàn bộ mã nguồn mở có thể được tự do tham khảo, học tập và phát triển tiếp nối cho các mục đích nghiên cứu học thuật và cộng đồng.
