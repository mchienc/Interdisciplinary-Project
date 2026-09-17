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
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**Một giải pháp WebGIS kết hợp Trí tuệ Không gian & Tối ưu hóa Tổ hợp để xóa bỏ nghịch lý di chuyển lòng vòng khi du lịch Thủ đô.**

[🌟 Tính năng chính](#-tính-năng-nổi-bật) • [🎯 Bản chất bài toán](#-vấn-đề--giải-pháp-problem--solution) • [🧠 Mô hình thuật toán](#-mô-hình-thuật-toán-lõi-core-algorithms) • [🚀 Khởi chạy nhanh](#-hướng-dẫn-cài-đặt--khởi-chạy) • [🏗️ Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)

</div>

---

## 📌 Vấn đề & Giải pháp (Problem & Solution)

### Nghịch lý di chuyển zíc-zắc trong du lịch truyền thống
Du khách khi đến Hà Nội thường gặp vấn đề:
1. **Đặt phòng trước theo cảm tính**: Chọn khách sạn xa các điểm tham quan hoặc không cân đối không gian.
2. **Chọn điểm đến ngẫu nhiên**: Lên danh sách điểm tham quan theo ngày mà không tính đến khoảng cách thực tế.
3. **Di chuyển zíc-zắc**: Khách sạn trở thành "nút thắt cổ chai", phải quay lại khách sạn nhiều lần hoặc di chuyển ngược chiều xuyên qua các điểm ùn tắc của thành phố.

```
❌ TRUYỀN THỐNG: Đi lại lộn xộn, tốn 40-60% thời gian vô ích vì ngược đường
[Khách sạn ngoại vi] ──► [Điểm phía Bắc] ──► [Điểm phía Nam] ──► [Khách sạn] ──► [Quay lại trung tâm]

✅ HANOI SDSS: Quy hoạch thông minh 1 chiều khép kín
[Tập hợp POI] ──► [Tự động tính Vị trí Khách sạn tối ưu] ──► [Định tuyến vòng kín TSP mượt mà]
```

### Bảng so sánh thực nghiệm (8 điểm tham quan phổ biến tại Hà Nội)
*(Hồ Hoàn Kiếm, Cà phê Giảng, Ô Quan Chưởng, Chợ Đồng Xuân, Chùa Trấn Quốc, Lăng Bác, Hoàng Thành, Văn Miếu)*

| Chỉ số đánh giá | Du lịch tự phát | Sử dụng Hanoi SDSS | Mức độ tối ưu |
| :--- | :---: | :---: | :---: |
| 📍 **Vị trí khách sạn** | Đặt ngẫu nhiên (Cầu Giấy / Mỹ Đình) | Trung tâm tối ưu $H^*$ (Quận Hoàn Kiếm) | **Giảm 68%** cự ly tiếp cận lõi |
| 🚗 **Tổng quãng đường** | 38.4 km | **21.2 km** | **Tiết kiệm 44.8%** quãng đường |
| ⏱️ **Thời gian ngồi xe** | 118 phút | **64 phút** | **Tiết kiệm 45.8%** thời gian (54 phút) |
| 🔄 **Lượt quay đầu / ngược chiều** | 5 lần | **0 lần** (Vòng kín khép kín) | **Triệt tiêu 100%** xung đột lộ trình |

---

## 🔄 Luồng hoạt động hệ thống (System Workflow)

```mermaid
flowchart TD
    A[🎯 1. Du khách chọn các điểm đến yêu thích POI] --> B[📅 2. K-Means gom cụm điểm theo số ngày du lịch]
    B --> C[📍 3. Thuật toán Weiszfeld L1-Median tính vị trí khách sạn lý tưởng H*]
    C --> D[🏨 4. PostGIS ST_DWithin & MCDA xếp hạng khách sạn phù hợp nhất]
    D --> E[🛣️ 5. Google OR-Tools TSP & OSRM Engine tối ưu hóa thứ tự tham quan]
    E --> F[🗺️ 6. Hiển thị trực quan trên bản đồ WebGIS & Xuất file Excel / QR Code]
```

---

## ✨ Tính năng nổi bật

| Biểu tượng | Tính năng | Chi tiết kỹ thuật |
| :---: | :--- | :--- |
| 🎯 | **Tìm khách sạn tối ưu không gian** | Giải bài toán Fermat-Weber bằng thuật toán **Weiszfeld ($L_1$-Median)**. Khắc phục hoàn toàn hiện tượng lệch trọng tâm của trung bình cộng ($L_2^2$-Centroid) khi có điểm tham quan ở ngoại thành. |
| ⚖️ | **Lọc khách sạn đa tiêu chí (MCDA)** | Kết hợp 3 yếu tố: **Khoảng cách tới tâm lý tưởng ($w_1$)**, **Đánh giá sao/review ($w_2$)**, và **Giá phòng/đêm ($w_3$)** theo ngân sách tùy biến của người dùng. |
| 📅 | **Phân cụm hành trình đa ngày** | Tự động phân nhóm điểm đến theo từng ngày bằng **K-Means Clustering** trên hệ tọa độ phẳng mét (`EPSG:32649`), đảm bảo mỗi ngày chỉ tham quan một khu vực tập trung. |
| 🏎️ | **Tối ưu thứ tự ghé thăm (TSP)** | Ứng dụng **Google OR-Tools** và ma trận giao thông thực tế **OSRM Engine** để tìm thứ tự đi vòng kín xuất phát từ khách sạn và quay về khách sạn với thời gian di chuyển ngắn nhất. |
| 🛍️ | **Danh mục POI đa dạng** | Tích hợp sẵn hàng chục điểm đến đặc trưng: Di tích lịch sử, Văn hóa nghệ thuật, Ẩm thực phố cổ, Cà phê truyền thống và các **Đại siêu thị / TTTM sầm uất** (Lotte Mall West Lake, Tràng Tiền Plaza, Times City, Aeon Mall Long Biên...). |
| 🎨 | **Giao diện WebGIS cao cấp** | Thiết kế phong cách **Warm Editorial** đậm chất Hà Nội, hỗ trợ cuộn mượt mà **Lenis**, hiệu ứng thẻ xếp tầng **GSAP**, và bản đồ vector **MapLibre GL**. |
| 📱 | **Xuất kế hoạch đa nền tảng** | Xuất lịch trình chi tiết ra file **Excel (.xlsx)**, tạo **Mã QR** để quét mở nhanh trên Google Maps điện thoại, hoặc chụp ảnh lưu giữ lịch trình. |

---

## 🧠 Mô hình thuật toán lõi (Core Algorithms)

### 1. Thuật toán Weiszfeld ($L_1$-Median) tìm khách sạn lý tưởng
Cho tập hợp $n$ điểm du lịch: $\mathcal{P} = \{P_1, P_2, \dots, P_n\}$. Vị trí lưu trú tối ưu $H^*$ là nghiệm của bài toán cực tiểu hóa tổng khoảng cách:
$$H^* = \arg\min_{H \in \mathbb{R}^2} \sum_{i=1}^{n} \| H - P_i \|_2$$

Công thức lặp cải biên Weiszfeld (Iteratively Reweighted Least Squares):
$$H^{(k+1)} = \frac{\displaystyle\sum_{i=1}^{n} \frac{P_i}{\|H^{(k)} - P_i\|_2 + \epsilon}}{\displaystyle\sum_{i=1}^{n} \frac{1}{\|H^{(k)} - P_i\|_2 + \epsilon}}$$

> **💡 Tại sao dùng $L_1$-Median thay vì Centroid?**
> Trọng tâm số học (Centroid) bình phương khoảng cách nên khi bạn chọn 1 điểm ở xa (ví dụ: Làng gốm Bát Tràng hoặc Thiên Đường Bảo Sơn), khách sạn sẽ bị kéo lệch hẳn ra ngoại vi. **$L_1$-Median có điểm phá vỡ (breakdown point) tới 50%**, giúp vị trí gợi ý luôn bám sát khu vực tập trung chính ở nội thành.

### 2. Tối ưu thứ tự tham quan: Traveling Salesperson Problem (TSP)
Với mỗi ngày du lịch gồm khách sạn $H$ và $m$ điểm tham quan, hệ thống giải bài toán Người du lịch vòng kín (Closed-Loop TSP) trên ma trận thời gian thực tế trích xuất từ **OSRM Table API**:
$$\min \sum_{u} \sum_{v} \text{Duration}(u, v) \cdot x_{u,v}$$
Được giải tối ưu bởi thư viện **Google OR-Tools** với chiến lược tìm kiếm cục bộ có định hướng (`GUIDED_LOCAL_SEARCH`).

### 3. Đánh giá đa tiêu chí PostGIS (Spatial MCDA)
Truy vấn các khách sạn thực tế xung quanh tâm lý tưởng $H^*$ qua hàm `ST_DWithin` của PostGIS và xếp hạng theo điểm tổng hợp:
$$\text{Score}(H) = w_{\text{dist}} \cdot \left(1 - \frac{\text{dist}}{R}\right) + w_{\text{rating}} \cdot \left(\frac{\text{Rating}}{5.0}\right) + w_{\text{price}} \cdot \left(1 - \frac{\text{Price} - \text{Price}_{\min}}{\text{Price}_{\max} - \text{Price}_{\min}}\right)$$

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       CLIENT: REACT 18 + TYPESCRIPT                     │
│  • MapLibre GL Canvas (Vector Tiles)       • GSAP 3 & Lenis Inertia     │
│  • MCDA Weight Sliders & Filter Controls   • Excel / QR Code Exporter   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ REST API (JSON / GeoJSON)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       SERVER: FASTAPI (PYTHON 3.11)                     │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌────────────────┐  │
│  │    Spatial Service    │ │   Routing Service    │ │  MCDA Service  │  │
│  │ • PyProj EPSG:32649   │ │ • Google OR-Tools    │ │ • Score Rank   │  │
│  │ • Weiszfeld L1-Median │ │ • Closed-Loop TSP    │ │ • Filter Spec  │  │
│  │ • Scikit-learn K-Means│ │ • GeoJSON LineString │ │ • Fallback R   │  │
│  └───────────────────────┘ └──────────────────────┘ └────────────────┘  │
└──────────────────┬─────────────────────────────────┬────────────────────┘
                   │ SQLAlchemy (Raw SQL / ORM)      │ HTTP REST
                   ▼                                 ▼
┌─────────────────────────────────────┐   ┌───────────────────────────────┐
│     POSTGRESQL 16 + POSTGIS 3.4     │   │      OSRM ROUTING ENGINE      │
│  • Spatial Indexing (GiST geom)     │   │  • OpenStreetMap Hà Nội       │
│  • Quan hệ không gian: ST_DWithin   │   │  • Bảng ma trận thời gian     │
│  • Tính khoảng cách: ST_Distance    │   │  • Lộ trình thực tế đường bộ  │
└─────────────────────────────────────┘   └───────────────────────────────┘
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Cách 1: Khởi chạy siêu tốc bằng Docker (Khuyến nghị)
Chỉ cần máy tính có cài đặt [Docker](https://www.docker.com/) và Docker Compose:

```bash
# 1. Clone mã nguồn
git clone https://github.com/mchienc/Interdisciplinary-Project.git
cd Interdisciplinary-Project

# 2. Khởi chạy toàn bộ hệ thống (PostGIS + Backend + Frontend)
cd docker
docker compose up -d --build
```

Sau khi hoàn tất:
- 🌐 **Frontend (Giao diện người dùng)**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🗄️ **pgAdmin (Quản trị CSDL)**: [http://localhost:5050](http://localhost:5050) *(Tài khoản: `admin@sdss.vn` / `admin`)*

---

### Cách 2: Khởi chạy thủ công (Manual Development)

#### 1. Yêu cầu môi trường
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL 15+ tích hợp extension PostGIS

#### 2. Khởi chạy Backend (FastAPI)
```bash
cd backend

# Tạo và kích hoạt môi trường ảo
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# Cài đặt thư viện phụ thuộc
pip install -r requirements.txt

# Khởi chạy Backend Server
python -m uvicorn app.main:app --port 8000 --reload
```
*Backend sẽ chạy tại: `http://localhost:8000` (Tự động chuyển đổi sang Mock Database nếu chưa kết nối PostgreSQL).*

#### 3. Khởi chạy Frontend (React + Vite)
```bash
cd frontend

# Cài đặt thư viện
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```
*Frontend sẽ chạy tại: `http://localhost:5173`.*

---

## ⚙️ Cấu hình biến môi trường (Environment Variables)

### Backend (`backend/.env`)
```env
# URL kết nối cơ sở dữ liệu PostgreSQL / PostGIS
DATABASE_URL=postgresql://postgres:postgis_password@localhost:5432/webgis_db

# Máy chủ định tuyến OSRM (mặc định sử dụng demo public server)
OSRM_BASE_URL=https://router.project-osrm.org
```

### Frontend (`frontend/.env`)
```env
# Địa chỉ gọi API backend
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📂 Cấu trúc thư mục dự án

```text
Interdisciplinary-Project/
├── backend/                        # Máy chủ tính toán không gian & tối ưu hóa
│   ├── app/
│   │   ├── main.py                 # FastAPI Application Factory & CORS
│   │   ├── db.py                   # Kết nối cơ sở dữ liệu SQLAlchemy & fallback
│   │   ├── models/                 # ORM Models (POI, Accommodation)
│   │   ├── schemas/                # Khung dữ liệu Pydantic Request/Response
│   │   ├── services/
│   │   │   ├── spatial_service.py  # Thuật toán Weiszfeld L1-Median & K-Means
│   │   │   ├── routing_service.py  # Google OR-Tools TSP & kết nối OSRM
│   │   │   └── recommendation_service.py # Xếp hạng MCDA & truy vấn PostGIS
│   │   └── routers/
│   │       ├── itinerary.py        # API Endpoints (Itinerary, POI, Hotel)
│   │       └── urban_analysis.py   # API Endpoints phân tích không gian đô thị
│   ├── Dockerfile
│   └── requirements.txt            # Danh sách thư viện Python tinh gọn
│
├── frontend/                       # Giao diện WebGIS người dùng (Clean Architecture)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # UI Modals dùng chung (AddPoi, PoiDetail, QR, Story)
│   │   │   ├── landing/            # Toàn bộ Sections trang chủ (Hero, StackingCards, Nav...)
│   │   │   ├── map/                # Quản lý Canvas bản đồ & Markers (MapView)
│   │   │   └── workspace/          # Bảng điều khiển lập kế hoạch & bộ lọc (Sidebar)
│   │   ├── constants/              # Hằng số bản đồ, danh mục, tọa độ, dữ liệu mẫu
│   │   ├── services/               # Tầng giao tiếp API Backend & OSRM (api.ts)
│   │   ├── utils/                  # Định dạng dữ liệu (formatters) & Xuất Excel
│   │   ├── types/                  # TypeScript Data Interfaces
│   │   ├── App.tsx                 # Master State Coordinator
│   │   ├── main.tsx
│   │   └── index.css               # Phong cách Tailwind CSS & Typography
│   ├── vercel.json                 # Cấu hình triển khai Vercel
│   └── package.json
│
├── docker/                         # Cấu hình container hóa
│   ├── docker-compose.yml          # Điều phối cụm container dịch vụ
│   └── init.sql                    # Kịch bản khởi tạo CSDL & kích hoạt PostGIS
│
└── README.md                       # Tài liệu hướng dẫn dự án chuẩn hóa
```

---

## 👨‍💻 Tác giả & Đóng góp

- **Họ và tên**: Đồ án Nghiên cứu & Ứng dụng Liên ngành (Interdisciplinary Project)
- **Repository**: [https://github.com/mchienc/Interdisciplinary-Project.git](https://github.com/mchienc/Interdisciplinary-Project.git)
- Mọi đóng góp, báo cáo lỗi (issues) và ý tưởng cải tiến (pull requests) đều được hoan nghênh nồng nhiệt!

---

## 📄 Giấy phép (License)

Dự án được phân phối theo giấy phép **MIT License**. Bạn được tự do tham khảo, học tập và phát triển tiếp nối cho các mục đích học thuật và cộng đồng.
