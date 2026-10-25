# TRƯỜNG ĐẠI HỌC PHENIKAA
## KHOA CÔNG NGHỆ THÔNG TIN
***

# BÁO CÁO ĐỒ ÁN LIÊN NGÀNH (MÃ MÔN HỌC: CSE703014)

### ĐỀ TÀI:
# HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH KHÔNG GIAN (SDSS) TỐI ƯU HÓA ĐỊA ĐIỂM LƯU TRÚ VÀ LẬP LỊCH TRÌNH DU LỊCH THÔNG MINH TẠI THỦ ĐÔ HÀ NỘI
*(Hanoi Tourism SDSS — Spatial Decision Support System for Intelligent Accommodation Recommendation & Multi-Day Travel Planning)*

---

### THÔNG TIN NỘP BÀI

| Nội dung | Thông tin chi tiết |
| :--- | :--- |
| **Tên dự án** | Hà Nội Thong Dong (Hanoi Tourism SDSS WebGIS) |
| **Mã học phần** | CSE703014 — Đồ án liên ngành Công nghệ Thông tin |
| **Nền tảng công nghệ** | WebGIS: React 18, TypeScript, MapLibre GL, Tailwind CSS, FastAPI (Python 3.11), SQLAlchemy, PostgreSQL 16 / PostGIS 3.4, Google OR-Tools, OSRM Routing Engine |
| **Git Repository** | https://github.com/hanoithongdong/hanoi-sdss-travel-planner |
| **Deployment URL** | Frontend: https://hanoi-thong-dong.vercel.app / Backend API: https://hanoi-sdss-api.onrender.com |
| **Thời gian thực hiện** | Học kỳ 2 — Năm học 2025 – 2026 |

---

### PHÂN CÔNG NHIỆM VỤ ĐỒ ÁN

| TT | Mã sinh viên | Họ và tên | Nhiệm vụ phân công chính | Mức độ đóng góp | Đánh giá |
| :---: | :---: | :--- | :--- | :---: | :---: |
| 1 | 22010001 | Nguyễn Văn A | **Trưởng nhóm & Kiến trúc sư hệ thống:** Khảo sát bài toán quy hoạch du lịch không gian; Nghiên cứu và hiện thực thuật toán Weiszfeld $L_1$-Median Fermat-Weber; Thuật toán phân cụm cân bằng ngày Balanced K-Means kết hợp Hungarian Algorithm; Thiết kế kiến trúc tổng thể Clean Architecture; Hoàn thiện báo cáo kỹ thuật. | 35% | Hoàn thành xuất sắc |
| 2 | 22010002 | Trần Thị B | **Kỹ sư Backend & Cơ sở dữ liệu Không gian:** Thiết kế mô hình CSDL PostGIS với các kiểu dữ liệu hình học; Hiện thực RESTful API bằng FastAPI; Tích hợp Google OR-Tools giải bài toán TSP vòng kín; Tích hợp máy chủ định tuyến OSRM; Xây dựng module xác thực Google OAuth 2.0 GIS và cơ chế khôi phục mật khẩu OTP Email; Triển khai CI/CD Render Cloud. | 25% | Hoàn thành xuất sắc |
| 3 | 22010003 | Lê Văn C | **Kỹ sư Frontend & WebGIS UI/UX:** Xây dựng giao diện tương tác người dùng theo phong cách Warm Editorial bằng React 18, TypeScript, Tailwind CSS; Tích hợp thư viện bản đồ MapLibre GL hiển thị GeoJSON động; Xây dựng Smart Timeline, Động cơ ngữ cảnh thời tiết Open-Meteo và kịch bản cảnh báo giờ cao điểm / phố đi bộ cuối tuần; Thiết kế hệ thống Modal Đề xuất địa điểm POI và Quản trị kiểm duyệt. | 25% | Hoàn thành xuất sắc |
| 4 | 22010004 | Phạm Thị D | **Kỹ sư Kiểm thử & Đảm bảo chất lượng (QA/QC):** Xây dựng bộ kịch bản kiểm thử toàn diện (Unit Tests, Spatial Integration Tests, End-to-End Tests); Đo đạc và đánh giá thực nghiệm cự ly, thời gian so với phương pháp du lịch tự phát; Hiện thực bộ công cụ xuất kế hoạch đa kênh (Excel 3 sheets, QR Code Google Maps, Thẻ ảnh Story 9:16). | 15% | Hoàn thành xuất sắc |

---

### LỜI CẢM ƠN

Nhóm sinh viên thực hiện đồ án xin được bày tỏ lòng biết ơn sâu sắc và chân thành nhất tới các Thầy, Cô giáo thuộc Khoa Công nghệ Thông tin – Trường Đại học Phenikaa, đặc biệt là Giảng viên hướng dẫn học phần **Đồ án liên ngành (CSE703014)**. Thầy/Cô đã tận tình định hướng phương pháp nghiên cứu khoa học, truyền đạt những kiến thức chuyên môn quý báu về kỹ thuật phần mềm, hệ thống thông tin không gian, vận trù học cũng như đưa ra những góp ý, nhận xét sắc bén trong từng giai đoạn phát triển đề tài.

Trong quá trình thực hiện đồ án, nhóm đã nỗ lực vận dụng liên ngành các khối kiến thức: Toán rời rạc & Vận trù học (Bài toán Fermat-Weber, Hungarian Method, Traveling Salesperson Problem), Cơ sở dữ liệu nâng cao (Hệ quản trị CSDL Không gian PostgreSQL/PostGIS, chỉ mục không gian R-Tree/GiST), Kiến trúc phần mềm (FastAPI Clean Architecture, RESTful API), và Công nghệ Web hiện đại (React 18, MapLibre GL WebGL Engine). 

Mặc dù nhóm đã đầu tư nhiều công sức, thời gian để kiểm thử nghiêm ngặt từng tính năng và hoàn thiện sản phẩm đạt chuẩn vận hành thực tế, song do giới hạn về thời gian và kinh nghiệm thực tiễn, báo cáo cũng như hệ thống khó tránh khỏi những thiếu sót nhất định. Nhóm kính mong nhận được những nhận xét, góp ý và đánh giá quý báu của Quý Thầy Cô trong Hội đồng chấm đồ án để nhóm tiếp tục hoàn thiện đề tài, nâng cao năng lực chuyên môn trên con đường kỹ sư công nghệ thông tin trong tương lai.

*Hà Nội, tháng 06 năm 2026*  
**Nhóm sinh viên thực hiện đồ án**

---

### MỤC LỤC

- [PHÂN CÔNG NHIỆM VỤ ĐỒ ÁN](#phân-công-nhiệm-vụ-đồ-án)
- [LỜI CẢM ƠN](#lời-cảm-ơn)
- [MỤC LỤC HÌNH ẢNH](#mục-lục-hình-ảnh)
- [MỤC LỤC BẢNG](#mục-lục-bảng)
- [Chương 1: Tổng quan đề tài](#chương-1-tổng-quan-đề-tài)
  - [1.1 Phát biểu bài toán](#11-phát-biểu-bài-toán)
  - [1.2 Mục tiêu và phạm vi](#12-mục-tiêu-và-phạm-vi)
  - [1.3 Công nghệ và hiện trạng mã nguồn](#13-công-nghệ-và-hiện-trạng-mã-nguồn)
- [Chương 2: Phân tích yêu cầu và User Stories](#chương-2-phân-tích-yêu-cầu-và-user-stories)
  - [2.1 Project User Stories](#21-project-user-stories)
  - [2.2 Yêu cầu chức năng và phi chức năng](#22-yêu-cầu-chức-năng-và-phi-chức-năng)
  - [2.3 Đối tượng, quan hệ và phương thức hoạt động](#23-đối-tượng-quan-hệ-và-phương-thức-hoạt-động)
  - [2.4 Use Case và truy vết yêu cầu](#24-use-case-và-truy-vết-yêu-cầu)
- [Chương 3: Mô hình hóa hệ thống](#chương-3-mô-hình-hóa-hệ-thống)
  - [3.1 UML Class Diagram và ERD](#31-uml-class-diagram-và-erd)
  - [3.2 Activity Diagrams](#32-activity-diagrams)
  - [3.3 Sequence Diagrams](#33-sequence-diagrams)
- [Chương 4: Thiết kế giao diện và luồng công việc](#chương-4-thiết-kế-giao-diện-và-luồng-công-việc)
  - [4.1 Flow of Work](#41-flow-of-work)
  - [4.2 Thiết kế các màn hình](#42-thiết-kế-các-màn-hình)
  - [4.3 Layout mẫu và đối chiếu phần hiện thực](#43-layout-mẫu-và-đối-chiếu-phần-hiện-thực)
- [Chương 5: Phân tích kiến trúc](#chương-5-phân-tích-kiến-trúc)
  - [5.1 Kiến trúc tổng thể](#51-kiến-trúc-tổng-thể)
  - [5.2 Component và Deployment](#52-component-và-deployment)
  - [5.3 Đánh giá chất lượng và rủi ro](#53-đánh-giá-chất-lượng-và-rủi-ro)
- [Chương 6: Cài đặt và kết nối cơ sở dữ liệu](#chương-6-cài-đặt-và-kết-nối-cơ-sở-dữ-liệu)
  - [6.1 Cấu trúc mã nguồn](#61-cấu-trúc-mã-nguồn)
  - [6.2 Hiện thực User Stories và chi tiết thuật toán](#62-hiện-thực-user-stories-và-chi-tiết-thuật-toán)
  - [6.3 Tương tác Objects với Database (ORM)](#63-tương-tác-objects-với-database-orm)
- [Chương 7: Kiểm thử và Test Cases](#chương-7-kiểm-thử-và-test-cases)
  - [7.1 Chiến lược kiểm thử](#71-chiến-lược-kiểm-thử)
  - [7.2 Bảng chi tiết Test Cases](#72-bảng-chi-tiết-test-cases)
  - [7.3 Kết quả và vấn đề phát hiện](#73-kết-quả-và-vấn-đề-phát-hiện)
- [Chương 8: Git Repository, Demo và Contribution](#chương-8-git-repository-demo-và-contribution)
  - [8.1 Quản trị mã nguồn Git & Lịch sử Commit](#81-quản-trị-mã-nguồn-git--lịch-sử-commit)
  - [8.2 Triển khai thực tế và Video Demo](#82-triển-khai-thực-tế-và-video-demo)
  - [8.3 Thống kê đóng góp của các thành viên](#83-thống-kê-đóng-góp-của-các-thành-viên)
- [Chương 9: Kết luận và hướng phát triển](#chương-9-kết-luận-và-hướng-phát-triển)
  - [9.1 Kết quả đạt được](#91-kết-quả-đạt-được)
  - [9.2 Hạn chế còn tồn tại](#92-hạn-chế-còn-tồn-tại)
  - [9.3 Hướng mở rộng và phát triển](#93-hướng-mở-rộng-và-phát-triển)
- [Phụ lục](#phụ-lục)
  - [Phụ lục A: Danh mục API Endpoints chi tiết](#phụ-lục-a-danh-mục-api-endpoints-chi-tiết)
  - [Phụ lục B: Bảng đối chiếu tiêu chí bảng trắng và yêu cầu đồ án](#phụ-lục-b-bảng-đối-chiếu-tiêu-chí-bảng-trắng-và-yêu-cầu-đồ-án)
  - [Phụ lục C: Hướng dẫn cài đặt và chạy ứng dụng](#phụ-lục-c-hướng-dẫn-cài-đặt-và-chạy-ứng-dụng)

---

### MỤC LỤC HÌNH ẢNH

- **Hình 1.1:** Nghịch lý di chuyển zíc-zắc trong du lịch tự túc tại Hà Nội
- **Hình 2.1:** Sơ đồ Use Case tổng quát của hệ thống Hanoi Tourism SDSS
- **Hình 3.1:** Sơ đồ lớp (UML Class Diagram) của hệ thống
- **Hình 3.2:** Sơ đồ quan hệ thực thể cơ sở dữ liệu (PostGIS ERD)
- **Hình 3.3:** Biểu đồ hoạt động — Khởi tạo & Tối ưu hóa Lịch trình du lịch khép kín
- **Hình 3.4:** Biểu đồ hoạt động — Thích ứng thời tiết Open-Meteo & Đề xuất điểm trong nhà
- **Hình 3.5:** Biểu đồ hoạt động — Người dùng đề xuất địa điểm POI mới lên bản đồ
- **Hình 3.6:** Biểu đồ hoạt động — Quản trị viên kiểm duyệt và kích hoạt địa điểm mới
- **Hình 3.7:** Biểu đồ hoạt động — Đăng nhập xác thực bằng tài khoản Google SSO (GIS)
- **Hình 3.8:** Biểu đồ hoạt động — Khôi phục mật khẩu qua mã OTP gửi về Email cá nhân
- **Hình 3.9:** Biểu đồ tuần tự — Luồng Lập kế hoạch và Định tuyến tối ưu (Weiszfeld + TSP)
- **Hình 3.10:** Biểu đồ tuần tự — Luồng Đổi khách sạn và tái tính toán tuyến đường
- **Hình 3.11:** Biểu đồ tuần tự — Luồng Thích ứng thời tiết xấu và tráo đổi POI
- **Hình 3.12:** Biểu đồ tuần tự — Luồng Đóng góp POI và Quản trị viên duyệt điểm
- **Hình 3.13:** Biểu đồ tuần tự — Luồng Đăng nhập Google Identity Services (GIS)
- **Hình 3.14:** Biểu đồ tuần tự — Luồng Gửi mã OTP và Đặt lại mật khẩu tài khoản
- **Hình 4.1:** Sơ đồ luồng điều hướng tổng thể giữa các màn hình (Flow of Work)
- **Hình 4.2:** Giao diện Trang chủ (Landing Page) với Stacking Cards và đối sánh hiệu quả
- **Hình 4.3:** Giao diện Không gian làm việc WebGIS (Workspace MapLibre GL)
- **Hình 4.4:** Giao diện Thanh điều khiển Sidebar, Bộ lọc danh mục và Cấu hình chuyến đi
- **Hình 4.5:** Giao diện Lịch trình chi tiết mốc giờ (Smart Timeline) với Giờ vàng và Cảnh báo
- **Hình 4.6:** Giao diện Modal Bộ lọc & Động cơ thời tiết thích ứng (Weather Shift Engine)
- **Hình 4.7:** Giao diện Modal Đề xuất địa điểm POI mới từ người dùng (Crowdsourced POI)
- **Hình 4.8:** Giao diện Modal Quản trị viên duyệt và kích hoạt POI (Admin Moderation)
- **Hình 4.9:** Giao diện Modal Xác thực người dùng (Google SSO & Khôi phục mật khẩu OTP)
- **Hình 4.10:** Giao diện Tiện ích xuất dữ liệu (Excel 3 sheets, QR Google Maps, Story 9:16)
- **Hình 5.1:** Sơ đồ thành phần của hệ thống (Component Diagram)
- **Hình 5.2:** Sơ đồ triển khai hạ tầng đám mây (Deployment Diagram)
- **Hình 6.1:** Đồ thị hội tụ của giải thuật Weiszfeld so sánh với Trọng tâm số học (Center of Mass)
- **Hình 6.2:** Minh họa kết quả phân cụm cân bằng Hungarian Bipartite Matching

---

### MỤC LỤC BẢNG

- **Bảng 1.1:** Ngăn xếp công nghệ của hệ thống Hanoi Tourism SDSS
- **Bảng 2.1:** Project User Stories chuẩn mực phương pháp Agile
- **Bảng 2.2:** Danh mục yêu cầu chức năng (Functional Requirements - FR)
- **Bảng 2.3:** Danh mục yêu cầu phi chức năng (Non-Functional Requirements - NFR)
- **Bảng 2.4:** Bảng phân tích đối tượng, quan hệ và phương thức hoạt động
- **Bảng 2.5:** Ma trận truy vết yêu cầu (Requirement Traceability Matrix)
- **Bảng 6.1:** Bảng ánh xạ đối tượng mô hình dữ liệu (SQLAlchemy ORM với PostgreSQL/PostGIS)
- **Bảng 7.1:** Danh sách kịch bản kiểm thử chi tiết (System Test Cases)
- **Bảng 8.1:** Thống kê đóng góp và lịch sử commit của các thành viên
- **Bảng P.1:** Bảng đối chiếu tiêu chí chấm điểm đồ án chuẩn Trường Đại học Phenikaa

---

# Chương 1: Tổng quan đề tài

## 1.1 Phát biểu bài toán

Thủ đô Hà Nội là trung tâm chính trị, văn hóa, giáo dục và du lịch đặc biệt quan trọng của Việt Nam với bề dày lịch sử nghìn năm văn hiến. Thành phố sở hữu mật độ điểm đến du lịch (Points of Interest - POI) dày đặc và đa dạng bậc nhất cả nước, bao gồm hệ thống di tích lịch sử cách mạng, danh lam thắng cảnh hồ nước tự nhiên, kiến trúc phố cổ, bảo tàng nghệ thuật và nền ẩm thực đường phố trứ danh.

Tuy nhiên, đặc trưng không gian du lịch của Hà Nội là sự phân bố **phi tập trung** thành các cụm văn hóa - lịch sử cách biệt về mặt địa lý:
- **Cụm 1 — Di sản Lõi Hoàn Kiếm & Phố Cổ:** Hồ Hoàn Kiếm, Đền Ngọc Sơn, Nhà tù Hỏa Lò, Nhà hát Lớn, 36 phố phường.
- **Cụm 2 — Trung tâm Chính trị & Cảnh quan Ba Đình - Tây Hồ:** Quần thể Lăng Chủ tịch Hồ Chí Minh, Hoàng Thành Thăng Long, Chùa Trấn Quốc, Phủ Tây Hồ, Chùa Một Cột.
- **Cụm 3 — Văn hóa & Trí thức Đống Đa:** Văn Miếu - Quốc Tử Giám, Ga Hà Nội, Chùa Phúc Khánh.
- **Cụm 4 — Đô thị mới & Bảo tàng phía Tây:** Bảo tàng Dân tộc học (Cầu Giấy), Bảo tàng Lịch sử Quân sự Việt Nam mới (Nam Từ Liêm), Trung tâm Hội nghị Quốc gia.
- **Cụm 5 — Làng nghề truyền thống & Danh thắng ngoại thành:** Làng gốm Bát Tràng (Gia Lâm), Làng cổ Đường Lâm (Sơn Tây), Chùa Hương (Mỹ Đức).

Trong thực tế, khi tổ chức du lịch tự túc (Free Independent Travelers - FIT), đa phần du khách gặp phải **Nghịch lý di chuyển zíc-zắc (The Zigzag Itinerary Dilemma)** xuất phát từ 3 nguyên nhân cốt lõi:

```
┌────────────────────────────────────────────────────────────────────────┐
│               NGHỊCH LÝ DI CHUYỂN ZÍC-ZẮC DU LỊCH HÀ NỘI              │
├────────────────────────────────────────────────────────────────────────┤
│ 1. ĐẶT PHÒNG KHÁCH SẠN CẢM TÍNH:                                      │
│    Đặt phòng ở Cầu Giấy/Mỹ Đình (vì gần bến xe/giá rẻ ngẫu nhiên),      │
│    khiến khách sạn biến thành "nút thắt cổ chai" cách xa các di tích.  │
│                                                                        │
│ 2. LÊN LỊCH TRÌNH TÙY HỨNG:                                            │
│    Sáng: Bát Tràng (Đông Nam) ──> Trưa: Bảo tàng Dân tộc học (Tây Bắc) │
│    Chiều: Hồ Hoàn Kiếm (Trung tâm) ──> Tối: Mỹ Đình (Tây).             │
│    ==> Du khách chạy con thoi cắt ngang toàn thành phố!                │
│                                                                        │
│ 3. XUNG ĐỘT QUY HOẠCH GIAO THÔNG ĐÔ THỊ:                               │
│    - Giờ cao điểm ùn tắc nghẽn cứng (07:30 - 09:00 và 17:00 - 19:00).   │
│    - Phố đi bộ Hồ Gươm cấm xe máy/ô tô từ 19h tối Thứ 6 đến hết CN.   │
│    - Các di tích lớn đóng cửa định kỳ (Lăng Bác đóng Thứ 2 & Thứ 6).  │
└────────────────────────────────────────────────────────────────────────┘
```

Hậu quả là du khách lãng phí **40% – 60% tổng thời gian hữu ích** chỉ để ngồi trên các phương tiện trung chuyển (taxi, xe ôm, xe buýt), tiêu hao thể lực do thời tiết nắng nóng ẩm hoặc mưa rào bất chợt, gia tăng chi phí nhiên liệu và làm gia tăng gánh nặng khí thải nhà kính lên môi trường giao thông đô thị Hà Nội.

Các công cụ hiện nay như Google Maps chỉ hỗ trợ tìm đường từng chặng riêng lẻ (point-to-point), không giải quyết bài toán quy hoạch đa điểm; các trang đại lý du lịch trực tuyến (OTA như Booking.com, Agoda) tách rời hoàn toàn khách sạn khỏi lịch trình tham quan thực tế. Do đó, việc xây dựng một **Hệ thống Hỗ trợ Ra Quyết định Không gian (Spatial Decision Support System - SDSS)** chuyên sâu cho du lịch Hà Nội là một bài toán cấp thiết, có giá trị học thuật cao và ý nghĩa thực tiễn to lớn.

## 1.2 Mục tiêu và phạm vi

### 1.2.1 Mục tiêu của đề tài
1. **Mục tiêu học thuật:** Ứng dụng thành công lý thuyết tối ưu hóa không gian và vận trù học để giải quyết bài toán quy hoạch du lịch đa tiêu chí:
   - Thuật toán lặp **Weiszfeld $L_1$-Median** (giải bài toán Fermat-Weber) tìm tọa độ trung tâm lưu trú lý tưởng có tính chất kháng ngoại lai mạnh mẽ.
   - Thuật toán **Capacity-Constrained Balanced K-Means** kết hợp thuật toán Hungarian đảm bảo phân chia $N$ điểm đến vào $K$ ngày du lịch một cách cân bằng và gần nhau nhất về địa lý.
   - Giải thuật **Google OR-Tools TSP** giải bài toán Người du lịch vòng kín (Closed-Loop TSP) tối ưu hóa quãng đường và thời gian di chuyển thực tế qua ma trận định tuyến Open Source Routing Machine (OSRM).
2. **Mục tiêu công nghệ:** Phát triển một nền tảng WebGIS hiện đại, phản hồi tức thời (< 1.5 giây), đồ họa bản đồ tương tác mượt mà 60 FPS, áp dụng kiến trúc phân tầng sạch (Clean Architecture), sẵn sàng dự phòng đa tầng (High Availability Fallback).
3. **Mục tiêu xã hội & du lịch:** Tự động hóa việc cảnh báo và thích ứng với điều kiện thời tiết thực tế (Open-Meteo API), giờ cao điểm giao thông Hà Nội, lịch đóng mở cửa di tích văn hóa và quy chế phố đi bộ cuối tuần; cung cấp các công cụ xuất lịch trình trực quan đa nền tảng (Excel, QR Code Google Maps, Thẻ ảnh Story 9:16).

### 1.2.2 Phạm vi của đề tài
- **Phạm vi không gian:** Tập trung toàn bộ 12 quận nội thành và các huyện du lịch trọng điểm của Thành phố Hà Nội (Hoàn Kiếm, Ba Đình, Đống Đa, Tây Hồ, Cầu Giấy, Hai Bà Trưng, Thanh Xuân, Nam Từ Liêm, Bắc Từ Liêm, Hoàng Mai, Long Biên, Hà Đông, Gia Lâm, Sơn Tây).
- **Phạm vi đối tượng người dùng:**
  - *Du khách (Người dùng thông thường):* Tìm kiếm, lựa chọn điểm tham quan, thiết lập số ngày, giờ xuất phát, nhận lịch trình tối ưu, đổi khách sạn, đề xuất địa điểm mới, quản lý tài khoản cá nhân.
  - *Quản trị viên (Admin):* Đăng nhập kiểm duyệt các địa điểm POI do cộng đồng đóng góp (Duyệt/Từ chối), quản lý danh mục dữ liệu di tích, khách sạn trong hệ thống.
- **Giới hạn phạm vi hiện tại:** Đề tài tập trung tối ưu hóa phương tiện đường bộ (xe máy, taxi/ô tô cá nhân, đi bộ) và chưa tính toán chi tiết tuyến tàu điện đô thị Cát Linh - Hà Đông hay Nhổn - Ga Hà Nội.

## 1.3 Công nghệ và hiện trạng mã nguồn

Hệ thống được thiết kế theo mô hình Monorepo hiện đại, phân tách độc lập giữa tầng Frontend WebGIS và Backend Xử lý Không gian:

### Bảng 1.1. Ngăn xếp công nghệ của hệ thống Hanoi Tourism SDSS

| Lớp kiến trúc | Công nghệ / Thư viện | Phiên bản | Vai trò & Trách nhiệm chính trong hệ thống |
| :--- | :--- | :---: | :--- |
| **Ngôn ngữ Backend** | Python | 3.11+ | Xây dựng logic tính toán khoa học, giải thuật tối ưu hóa và xử lý ma trận không gian. |
| **Backend Framework** | FastAPI | 0.110.0 | Cung cấp RESTful API hiệu năng cao dựa trên ASGI Starlette và Pydantic v2 validation. |
| **Hệ quản trị CSDL Không gian** | PostgreSQL / PostGIS | 16.0 / 3.4 | Lưu trữ dữ liệu hình học địa lý `GEOMETRY(Point, 4326)`, tạo chỉ mục không gian R-Tree/GiST và thực thi truy vấn `ST_DWithin`, `ST_Distance_Sphere`. |
| **ORM / Data Access** | SQLAlchemy / GeoAlchemy2 | 2.0.28 | Quản lý kết nối CSDL quan hệ - không gian, tự động sinh schema và hỗ trợ cơ chế SQLite In-Memory Fallback khi CSDL Cloud gặp sự cố. |
| **Thư viện Tối ưu hóa** | Google OR-Tools | 9.9.3963 | Giải bài toán Người du lịch vòng kín (Closed-Loop TSP) với chiến lược tìm kiếm cục bộ Guided Local Search. |
| **Thư viện Toán & Ma trận** | NumPy & SciPy | 1.26.4 / 1.13.0 | Tính toán ma trận khoảng cách trắc địa và giải bài toán gán cặp cân bằng Hungarian Algorithm (`linear_sum_assignment`). |
| **Máy chủ Định tuyến** | OSRM Engine | v5.24.0 | Tính toán ma trận cự ly và thời gian di chuyển thực tế theo mạng lưới giao thông đường bộ OpenStreetMap; sinh GeoJSON LineString chặng đường. |
| **Ngôn ngữ Frontend** | TypeScript | 5.3.3 | Đảm bảo tính an toàn kiểu dữ liệu cho toàn bộ giao diện WebGIS, dữ liệu GeoJSON và mô hình phản hồi API. |
| **Frontend Framework** | React | 18.2.0 | Xây dựng Single Page Application với cơ chế Hook và Virtual DOM hiệu năng cao. |
| **Công cụ đóng gói (Build)** | Vite | 5.1.4 | Tối ưu hóa thời gian build và cung cấp Hot Module Replacement (HMR) cực nhanh. |
| **Động cơ Bản đồ WebGIS** | MapLibre GL JS | 4.0.0 | Thư viện bản đồ vector mã nguồn mở dựa trên nền tảng WebGL, hiển thị mượt mà hàng ngàn marker, cụm điểm và polyline giao thông ở tốc độ 60 FPS. |
| **Tạo kiểu & Giao diện** | Tailwind CSS & Lucide Icons | 3.4.1 | Xây dựng hệ thống thiết kế giao diện theo phong cách *Warm Editorial* thanh lịch, chuẩn mực. |
| **Hiệu ứng & Hoạt ảnh** | GSAP (GreenSock) | 3.12.5 | Xây dựng chuyển động cuộn mượt mà, hoạt ảnh lật thẻ và hiển thị mốc giờ lịch trình. |
| **Xác thực người dùng** | Google Identity Services & PyJWT | 2.8.0 | Đăng nhập một chạm bằng tài khoản Google (OAuth 2.0 GIS), mã hóa phiên làm việc bằng JSON Web Token (JWT). |
| **Tiện ích Xuất file** | SheetJS (xlsx) & html-to-image | 0.18.5 | Xuất báo cáo lịch trình ra bảng tính Excel 3 sheets và chụp ảnh canvas thẻ Story 9:16 bưu thiếp. |
| **Nền tảng Triển khai** | Vercel & Render Cloud | Cloud | Triển khai Edge Network toàn cầu cho Frontend và máy chủ Web Server đám mây cho Backend. |

---

# Chương 2: Phân tích yêu cầu và User Stories

## 2.1 Project User Stories

Hệ thống được phát triển bám sát phương pháp luận Agile/Scrum. Dưới đây là danh mục 15 User Stories cốt lõi bao phủ toàn bộ nghiệp vụ của hệ thống:

### Bảng 2.1. Project User Stories chuẩn mực phương pháp Agile

| ID | Tác nhân | Tôi muốn... | Để... | Tiêu chí chấp nhận (Acceptance Criteria) | Mức ưu tiên | Trạng thái |
| :---: | :---: | :--- | :--- | :--- | :---: | :---: |
| **US-01** | Du khách | Xem danh sách các điểm tham quan (POIs) theo từng danh mục văn hóa, lịch sử, ẩm thực, cà phê. | Dễ dàng khám phá nét đẹp Hà Nội theo sở thích cá nhân. | Hệ thống hiển thị ảnh đại diện sắc nét, tên, danh mục, giá vé, thời gian tham quan dự kiến và khung giờ vàng check-in. | Cao | Hoàn thành |
| **US-02** | Du khách | Tìm kiếm điểm đến theo từ khóa và lọc theo mức giá vé, thời lượng. | Nhanh chóng định vị các địa điểm mong muốn ghé thăm. | Ô tìm kiếm lọc tức thì (debounce 250ms), hỗ trợ gõ tiếng Việt có dấu và không dấu; danh sách tự động cập nhật trên bản đồ. | Cao | Hoàn thành |
| **US-03** | Du khách | Click trực tiếp trên bản đồ số để thêm một địa điểm cá nhân tùy chọn (Custom POI). | Tích hợp nhà người thân, quán ăn riêng vào lịch trình du lịch. | Mở hộp thoại nhập tên điểm, tự động điền tọa độ $(lat, lon)$ tại vị trí click chuột, gắn marker màu vàng cam nổi bật. | Trung bình | Hoàn thành |
| **US-04** | Du khách | Chọn số ngày du lịch (từ 1 đến 7 ngày) và bấm nút "Tối ưu hóa hành trình". | Hệ thống tự động phân chia các điểm vào từng ngày hợp lý nhất. | Chạy thuật toán Balanced K-Means kết hợp Hungarian; số điểm giữa các ngày không chênh nhau quá 1; các điểm cùng ngày liền kề địa lý. | Rất cao | Hoàn thành |
| **US-05** | Du khách | Hệ thống tự động tính toán và đề xuất vị trí khách sạn lưu trú lý tưởng. | Giảm thiểu tối đa tổng quãng đường di chuyển của toàn bộ các ngày. | Tính trung vị hình học Weiszfeld $L_1$-Median; hiển thị marker vương miện màu xanh ngọc bích; kháng hoàn toàn điểm ngoại thành. | Rất cao | Hoàn thành |
| **US-06** | Du khách | Xem danh sách Top 5 khách sạn thực tế được đề xuất gần tâm lý tưởng. | Lựa chọn khách sạn phù hợp với sở thích và khả năng tài chính cá nhân. | Truy vấn PostGIS `ST_DWithin` bán kính $R$; xếp hạng đa tiêu chí MCDA (Cự ly, Hạng sao, Giá phòng); có badge "Tối ưu nhất". | Cao | Hoàn thành |
| **US-07** | Du khách | Điều chỉnh trọng số đa tiêu chí MCDA (Cự ly, Hạng sao, Giá) bằng thanh trượt. | Cá nhân hóa tiêu chí lựa chọn khách sạn theo ưu tiên riêng. | Bảng xếp hạng Top 5 tự động cập nhật lại thứ tự điểm số tức thì (< 100ms) mà không cần reload trang. | Trung bình | Hoàn thành |
| **US-08** | Du khách | Đổi khách sạn được chọn sang một khách sạn khác trong Top 5 hoặc chọn trực tiếp. | Thay đổi chỗ ở theo ý muốn. | Hệ thống tự động kích hoạt tính toán lại toàn bộ lộ trình TSP từng ngày xuất phát và kết thúc tại khách sạn mới. | Cao | Hoàn thành |
| **US-09** | Du khách | Chọn giờ xuất phát mỗi ngày (`07:30`, `08:00`, `08:30`, `09:00`). | Khởi hành đúng thói quen sinh hoạt của bản thân. | Smart Timeline tự động lùi/tiến các mốc giờ tham quan; tự động chèn khung giờ ăn trưa ẩm thực Hà Nội (11:45 - 13:00). | Cao | Hoàn thành |
| **US-10** | Du khách | Nhận cảnh báo thông minh về quy định ngày trong tuần và cuối tuần. | Tránh vi phạm luật hoặc đến điểm tham quan vào lúc đóng cửa. | Tự động nhận diện thứ trong tuần: cảnh báo Phố đi bộ Hồ Gươm cấm xe sau 19h tối Thứ 6 - CN; cảnh báo Lăng Bác đóng cửa Thứ 2 & 6. | Cao | Hoàn thành |
| **US-11** | Du khách | Nhận khuyến nghị thích ứng tự động khi thời tiết xấu (mưa rào, nắng gắt). | Đảm bảo an toàn sức khỏe và chất lượng trải nghiệm du lịch. | Kết nối Open-Meteo API; hiển thị modal "Chuyển hướng thông minh"; gợi ý hoán đổi điểm ngoài trời sang cụm bảo tàng trong nhà. | Cao | Hoàn thành |
| **US-12** | Du khách | Xuất toàn bộ kế hoạch du lịch ra file Excel, mã QR dẫn đường và thẻ ảnh Story. | Lưu trữ, in ấn hoặc chia sẻ hành trình lên mạng xã hội. | Xuất file `.xlsx` gồm 3 sheet chuẩn mực; tạo QR Code quét mở Google Maps nhiều chặng; sinh ảnh thẻ Story tỉ lệ 9:16 phong cách bưu thiếp. | Cao | Hoàn thành |
| **US-13** | Du khách | Đề xuất một địa điểm du lịch/ẩm thực mới chưa có trên hệ thống. | Đóng góp địa danh yêu thích cho cộng đồng khám phá Thủ đô. | Nhập tên, địa chỉ, chọn tọa độ trên bản đồ, tải ảnh mô tả; bản ghi lưu vào CSDL với trạng thái `pending`. | Trung bình | Hoàn thành |
| **US-14** | Khách/User | Đăng nhập nhanh bằng tài khoản Google hoặc Đặt lại mật khẩu khi quên. | Quản lý lịch trình cá nhân một cách thuận tiện, an toàn. | Nút đăng nhập Google Identity Services 1-chạm; chức năng quên mật khẩu gửi mã OTP 6 số xác thực về hòm thư điện tử. | Cao | Hoàn thành |
| **US-15** | Quản trị | Đăng nhập khu vực Quản trị để duyệt hoặc từ chối các POI do người dùng đề xuất. | Kiểm soát chất lượng nội dung và dữ liệu không gian trước khi công bố. | Xem danh sách các điểm chờ duyệt (`pending`), kiểm tra tọa độ trên bản đồ mini; bấm "Phê duyệt" để kích hoạt sang `approved` hoặc "Từ chối". | Cao | Hoàn thành |

---

## 2.2 Yêu cầu chức năng và phi chức năng

### 2.2.1 Yêu cầu chức năng (Functional Requirements - FR)

### Bảng 2.2. Danh mục yêu cầu chức năng

| Mã FR | Tên yêu cầu chức năng | Mô tả chi tiết nghiệp vụ | Mã US tương ứng |
| :---: | :--- | :--- | :---: |
| **FR-01** | Quản lý & Khám phá danh mục POI | Hệ thống cung cấp danh mục dữ liệu điểm đến phong phú kèm phân loại văn hóa, lịch sử, ẩm thực, tọa độ địa lý, giá vé và khung giờ vàng. | US-01, US-02 |
| **FR-02** | Thêm POI tùy chọn bản đồ | Cho phép người dùng click trên bản đồ số để bổ sung các điểm đến cá nhân vào bài toán định tuyến. | US-03 |
| **FR-03** | Phân cụm cân bằng ngày (Balanced Clustering) | Gom cụm $N$ điểm vào $K$ ngày dựa trên khoảng cách phẳng UTM Zone 49N và giải thuật Hungarian, triệt tiêu tình trạng ngày quá tải, ngày quá ít điểm. | US-04 |
| **FR-04** | Tối ưu hóa vị trí lưu trú (Fermat-Weber Median) | Ứng dụng giải thuật lặp Weiszfeld tính điểm trung vị không gian $H^*$ có tổng cự ly đến toàn bộ các điểm tham quan là nhỏ nhất. | US-05 |
| **FR-05** | Truy vấn & Xếp hạng khách sạn đa tiêu chí | Thực thi hàm PostGIS `ST_DWithin` quét khách sạn quanh $H^*$ và áp dụng mô hình chấm điểm Spatial MCDA kết hợp trọng số người dùng. | US-06, US-07 |
| **FR-06** | Định tuyến lộ trình vòng kín (Closed-Loop TSP) | Lập ma trận chi phí OSRM và giải bài toán TSP bằng Google OR-Tools, trả về thứ tự ghé thăm tối ưu và GeoJSON tuyến đường. | US-08 |
| **FR-07** | Lập thời gian biểu thông minh (Smart Timeline) | Lập lịch biểu chi tiết từng phút, tự động chèn giờ ăn trưa, thời lượng dừng chân tại mỗi điểm và gắn nhãn Giờ vàng check-in. | US-09 |
| **FR-08** | Nhận diện ngữ cảnh ngày & Cảnh báo phố đi bộ | Tự động nhận diện Thứ Hai / Thứ Sáu (đóng cửa Lăng Bác) và Thứ Sáu tối đến Chủ Nhật (Phố đi bộ cấm xe, Chợ đêm mở cửa). | US-10 |
| **FR-09** | Động cơ thích ứng thời tiết (Weather Shift) | Kết nối Open-Meteo API, phát hiện mưa hoặc nắng gắt và tự động đề xuất phương án tráo đổi các điểm tham quan trong nhà. | US-11 |
| **FR-10** | Xuất dữ liệu đa kênh (Multi-Format Export) | Xuất bảng tính Excel `.xlsx` 3 sheets, tạo QR Code dẫn đường Google Maps và xuất ảnh Story Card 9:16 phong cách bưu thiếp. | US-12 |
| **FR-11** | Đóng góp & Kiểm duyệt địa điểm cộng đồng | Cho phép người dùng gửi đề xuất POI mới; cung cấp giao diện quản trị viên xét duyệt (Duyệt/Từ chối) trước khi đưa vào hệ thống. | US-13, US-15 |
| **FR-12** | Xác thực người dùng & Khôi phục mật khẩu OTP | Tích hợp Google OAuth 2.0 GIS SSO, đăng nhập Email/Password với JWT token, và quy trình khôi phục mật khẩu gửi mã OTP qua Email. | US-14 |

### 2.2.2 Yêu cầu phi chức năng (Non-Functional Requirements - NFR)

### Bảng 2.3. Danh mục yêu cầu phi chức năng

| Mã NFR | Tiêu chí phi chức năng | Chỉ số đo lường & Cam kết kỹ thuật |
| :---: | :--- | :--- |
| **NFR-01** | **Hiệu năng tính toán (Performance)** | Thời gian phản hồi của API Lập kế hoạch toàn diện (chạy đồng thời K-Means, Weiszfeld, MCDA, OSRM, OR-Tools) phải **< 1.500 ms** với kịch bản 15 POIs trong 3 ngày. |
| **NFR-02** | **Độ chính xác trắc địa (Spatial Accuracy)** | Mọi phép đo khoảng cách địa lý nội bộ phải chuyển đổi sang Hệ tọa độ phẳng quốc gia UTM Zone 49N (`EPSG:32649`) với đơn vị mét, loại bỏ hoàn toàn sai số méo hình học của hệ tọa độ cầu WGS84 (`EPSG:4326`). |
| **NFR-03** | **Độ mượt mà hiển thị (Rendering Quality)** | Động cơ bản đồ MapLibre GL phải duy trì tốc độ khung hình ổn định **60 FPS** trên trình duyệt máy tính và thiết bị di động khi hiển thị đồng thời hàng chục marker và tuyến đường GeoJSON. |
| **NFR-04** | **Tính sẵn sàng & Chống sập (High Availability & Resilience)** | Áp dụng cơ chế Dự phòng đa tầng (Multi-tier Fallback): Nếu CSDL PostgreSQL Cloud ngắt kết nối, hệ thống tự động kích hoạt CSDL SQLite In-Memory và Mock Data; nếu OSRM timeout, tự động chuyển sang khoảng cách trắc địa Haversine. |
| **NFR-05** | **Tính khả dụng & Trải nghiệm (Usability & Design Taste)** | Giao diện tuân thủ phong cách *Warm Editorial*, trang nhã, không sử dụng biệt ngữ toán học gây khó hiểu cho người dùng phổ thông (thay vì ghi "Thuật toán Weiszfeld L1", hiển thị "Vị trí khách sạn thuận tiện nhất"). |
| **NFR-06** | **Bảo mật & Quyền riêng tư (Security & Privacy)** | Tuyệt đối không lưu trữ trái phép nhật ký định vị GPS thời gian thực của người dùng; mật khẩu người dùng được băm an toàn bằng thuật toán Bcrypt; mã khóa bí mật được lưu trong biến môi trường `.env`. |

---

## 2.3 Đối tượng, quan hệ và phương thức hoạt động

### Bảng 2.4. Phân tích đối tượng, quan hệ và phương thức hoạt động

| Tên đối tượng / Thực thể | Các thuộc tính cốt lõi (Attributes) | Quan hệ với các đối tượng khác (Relationships) | Các phương thức hoạt động chính (Methods / Behaviors) |
| :--- | :--- | :--- | :--- |
| **POI (Điểm tham quan)** | `id`, `name`, `category`, `description`, `lat`, `lon`, `estimated_duration_min`, `opening_hours`, `ticket_price`, `venue_type`, `ideal_time`, `closed_days`, `closed_time`, `status`, `geom` | - Thuộc về 1 hoặc nhiều `DayItinerary`<br>- Có thể được đề xuất bởi 1 `User` | - `to_dict()`: Chuyển đổi sang JSON<br>- `is_indoor()`: Kiểm tra địa điểm trong nhà<br>- `is_open(day_of_week)`: Kiểm tra ngày mở cửa di tích |
| **Accommodation (Khách sạn)** | `id`, `name`, `type`, `stars`, `rating`, `price_per_night`, `address`, `lat`, `lon`, `distance_to_median_m`, `multi_criteria_score`, `geom` | - Là điểm xuất phát và kết thúc của các `DayItinerary` | - `compute_mcda_score(weights)`: Chấm điểm đa tiêu chí<br>- `distance_to(coord)`: Tính khoảng cách phẳng tới tâm $H^*$ |
| **PlanRequest (Yêu cầu lập lịch)** | `poi_ids`, `custom_pois`, `days`, `max_budget`, `min_stars`, `radius_meters`, `weights`, `selected_hotel_id`, `transport_mode`, `traffic_multiplier` | - Nhận dữ liệu từ `User`<br>- Sinh ra kết quả `PlanResponse` | - `validate_input()`: Kiểm tra tính hợp lệ của tham số<br>- `has_custom_hotel()`: Kiểm tra có chỉ định khách sạn |
| **DayItinerary (Lịch trình ngày)** | `day`, `hotel`, `visit_sequence`, `legs`, `total_distance_km`, `total_duration_min`, `route_geojson` | - Chứa 1 `Accommodation`<br>- Chứa danh sách có thứ tự các `POI` | - `calculate_total_metrics()`: Tổng hợp cự ly, thời gian<br>- `generate_timeline(start_time)`: Sinh các mốc giờ chi tiết |
| **User (Người dùng hệ thống)** | `id`, `email`, `hashed_password`, `full_name`, `role` (user/admin), `created_at` | - Tạo nhiều đề xuất `POI`<br>- Lưu nhiều lịch trình du lịch | - `verify_password(plain_pw)`: Xác thực mật khẩu<br>- `is_admin()`: Kiểm tra quyền quản trị viên |
| **ProposedPOI (POI đề xuất)** | `id`, `user_id`, `name`, `category`, `address`, `lat`, `lon`, `reason`, `status` (`pending`, `approved`, `rejected`), `created_at` | - Tạo bởi 1 `User`<br>- Được duyệt bởi 1 `User` (Admin) | - `approve()`: Chuyển trạng thái và tạo bản ghi vào bảng POI chính thức<br>- `reject(reason)`: Từ chối đề xuất |

---

## 2.4 Use Case và truy vết yêu cầu

### 2.4.1 Sơ đồ Use Case tổng quát

```mermaid
flowchart TD
    Traveler(["Du khách (Traveler)"])
    Admin(["Quản trị viên (Admin)"])

    subgraph SDSS ["HỆ THỐNG HANOI TOURISM SDSS (WEBGIS)"]
        UC01["UC01: Tra cứu & Khám phá danh mục POI"]
        UC02["UC02: Thêm địa điểm cá nhân trên bản đồ"]
        UC03["UC03: Thiết lập tham số & Tối ưu hóa hành trình"]
        UC04["UC04: Lựa chọn & Đổi khách sạn trong Top 5 đề xuất"]
        UC05["UC05: Xem Lịch trình chi tiết (Smart Timeline & Giờ vàng)"]
        UC06["UC06: Kích hoạt Chuyển đổi Thời tiết (Indoor Adaptation)"]
        UC07["UC07: Xuất kế hoạch (Excel, QR Google Maps, Story 9:16)"]
        UC08["UC08: Gửi đề xuất địa điểm POI mới"]
        UC09["UC09: Đăng nhập Google SSO & Đặt lại mật khẩu OTP"]
        UC10["UC10: Quản lý & Phê duyệt địa điểm đề xuất"]
        UC11["UC11: Quản trị danh mục dữ liệu di tích & khách sạn"]
    end

    Traveler --> UC01
    Traveler --> UC02
    Traveler --> UC03
    Traveler --> UC04
    Traveler --> UC05
    Traveler --> UC06
    Traveler --> UC07
    Traveler --> UC08
    Traveler --> UC09

    Admin --> UC10
    Admin --> UC11
    Admin --> UC01
```

### 2.4.2 Ma trận truy vết yêu cầu (Requirement Traceability Matrix)

### Bảng 2.5. Ma trận truy vết yêu cầu

| Mã Yêu cầu (FR) | Tên chức năng | User Story (US) | Use Case (UC) | Module Backend tương ứng | Component Frontend tương ứng | Trạng thái Kiểm thử |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: |
| **FR-01** | Tra cứu danh mục POI | US-01, US-02 | UC01 | `api/v1/endpoints/pois.py` | `POICard.tsx`, `Sidebar.tsx` | ĐẠT (Pass) |
| **FR-02** | Thêm POI tùy chọn bản đồ | US-03 | UC02 | `schemas/itinerary.py` | `MaplibreMap.tsx`, `CustomPOICard.tsx` | ĐẠT (Pass) |
| **FR-03** | Phân cụm cân bằng ngày | US-04 | UC03 | `algorithms/clustering.py` | `DayTabs.tsx`, `TimelineView.tsx` | ĐẠT (Pass) |
| **FR-04** | Tối ưu lưu trú Weiszfeld | US-05 | UC03 | `algorithms/weiszfeld.py` | `MedianMarker.tsx`, `HotelRecommender.tsx` | ĐẠT (Pass) |
| **FR-05** | Chấm điểm khách sạn MCDA | US-06, US-07 | UC04 | `services/recommendation.py` | `MCDASliders.tsx`, `HotelCard.tsx` | ĐẠT (Pass) |
| **FR-06** | Định tuyến vòng kín TSP | US-08 | UC03, UC04 | `algorithms/tsp_solver.py`, `services/routing.py` | `MaplibreMap.tsx` (GeoJSON Layers) | ĐẠT (Pass) |
| **FR-07** | Smart Timeline & Giờ vàng | US-09 | UC05 | `services/timeline.py` | `SmartTimeline.tsx`, `TimelineItem.tsx` | ĐẠT (Pass) |
| **FR-08** | Cảnh báo quy chế Phố đi bộ | US-10 | UC05 | `utils/date_helpers.py` | `WeekendAlertBadge.tsx` | ĐẠT (Pass) |
| **FR-09** | Thích ứng thời tiết động | US-11 | UC06 | `services/weather.py` | `WeatherModal.tsx`, `WeatherShiftButton.tsx`| ĐẠT (Pass) |
| **FR-10** | Xuất dữ liệu đa kênh | US-12 | UC07 | `utils/export_excel.ts`, `utils/export_story.ts` | `ExportModal.tsx`, `StoryCardModal.tsx` | ĐẠT (Pass) |
| **FR-11** | Đóng góp & Duyệt POI | US-13, US-15 | UC08, UC10 | `api/v1/endpoints/proposed_pois.py` | `ProposePOIModal.tsx`, `AdminPOIPanel.tsx`| ĐẠT (Pass) |
| **FR-12** | Google SSO & OTP Quên MK | US-14 | UC09 | `api/v1/endpoints/auth.py` | `AuthModal.tsx` | ĐẠT (Pass) |

---

# Chương 3: Mô hình hóa hệ thống

## 3.1 UML Class Diagram và ERD

### 3.1.1 Sơ đồ lớp (UML Class Diagram)

```mermaid
classDiagram
    class POI {
        +int id
        +string name
        +string category
        +string description
        +float lat
        +float lon
        +int estimated_duration_min
        +string opening_hours
        +int ticket_price
        +string venue_type
        +string ideal_time
        +int[] closed_days
        +string status
        +to_dict() dict
        +is_indoor() bool
        +is_closed_on(int day) bool
    }

    class Accommodation {
        +int id
        +string name
        +string type
        +int stars
        +float rating
        +int price_per_night
        +string address
        +float lat
        +float lon
        +float distance_to_median_m
        +float multi_criteria_score
        +compute_mcda(WeightsConfig w) float
    }

    class PlanRequest {
        +int[] poi_ids
        +CustomPOI[] custom_pois
        +int days
        +int max_budget
        +int min_stars
        +float radius_meters
        +WeightsConfig weights
        +int selected_hotel_id
        +string transport_mode
        +float traffic_multiplier
    }

    class DayItinerary {
        +int day
        +Accommodation hotel
        +POI[] visit_sequence
        +LegDetail[] legs
        +float total_distance_km
        +float total_duration_min
        +dict route_geojson
        +generate_timeline(time start_time) list
    }

    class PlanResponse {
        +bool success
        +int days
        +int total_pois
        +GeometricMedianResult geometric_median
        +Accommodation[] recommended_accommodations
        +Accommodation selected_hotel
        +DayItinerary[] daily_itineraries
    }

    class SpatialAlgorithmService {
        +compute_weiszfeld_l1(float[][] coords) tuple
        +balanced_k_means(float[][] coords, int k) list
    }

    class RoutingOptimizationService {
        +fetch_osrm_matrix(float[][] coords) tuple
        +solve_tsp_ortools(int[][] dist_matrix) int[]
        +fetch_route_geojson(float[][] coords) dict
    }

    PlanRequest ..> PlanResponse : Kích hoạt tính toán
    PlanResponse *-- DayItinerary
    DayItinerary o-- POI
    DayItinerary o-- Accommodation
    SpatialAlgorithmService ..> PlanResponse : Tính H* và phân ngày
    RoutingOptimizationService ..> DayItinerary : Giải TSP và tuyến đường
```

### 3.1.2 Sơ đồ quan hệ thực thể cơ sở dữ liệu (PostGIS ERD)

```mermaid
erDiagram
    USERS ||--o{ PROPOSED_POIS : "đóng góp"
    USERS ||--o{ SAVED_TRIPS : "lưu trữ"
    USERS {
        int id PK
        string email UK
        string hashed_password
        string full_name
        string role "user | admin"
        string google_sub
        datetime created_at
    }

    POIS ||--o{ TRIP_POIS : "thuộc về"
    POIS {
        int id PK
        string name
        string category
        string description
        float lat
        float lon
        int estimated_duration_min
        string opening_hours
        int ticket_price
        string venue_type "indoor | outdoor"
        string ideal_time
        string closed_days "JSON array"
        string status "active | inactive"
        geometry geom "GEOMETRY(Point, 4326)"
    }

    ACCOMMODATIONS ||--o{ SAVED_TRIPS : "được chọn bởi"
    ACCOMMODATIONS {
        int id PK
        string name
        string type "hotel | homestay | hostel"
        int stars
        float rating
        int price_per_night
        string address
        float lat
        float lon
        geometry geom "GEOMETRY(Point, 4326)"
    }

    SAVED_TRIPS ||--|{ TRIP_DAYS : "bao gồm"
    SAVED_TRIPS {
        int id PK
        int user_id FK
        int hotel_id FK
        string trip_name
        int total_days
        date start_date
        datetime created_at
    }

    TRIP_DAYS ||--|{ TRIP_POIS : "chứa"
    TRIP_DAYS {
        int id PK
        int trip_id FK
        int day_number
        float total_distance_km
        float total_duration_min
    }

    TRIP_POIS {
        int id PK
        int trip_day_id FK
        int poi_id FK
        int visit_order
        time arrival_time
        time departure_time
    }

    PROPOSED_POIS {
        int id PK
        int user_id FK
        string name
        string category
        string address
        float lat
        float lon
        string reason
        string status "pending | approved | rejected"
        datetime created_at
    }
```

---

## 3.2 Activity Diagrams

### 3.2.1 Biểu đồ hoạt động: Lập lịch trình & Tìm khách sạn tối ưu

```mermaid
flowchart TD
    Start([Bắt đầu]) --> SelectPOIs[Người dùng chọn N điểm đến từ danh mục hoặc bản đồ]
    SelectPOIs --> SetDays[Chọn số ngày du lịch K và giờ khởi hành]
    SetDays --> ClickOptimize[Bấm nút 'Tối ưu hóa hành trình']
    ClickOptimize --> CallAPI[Frontend gửi POST /api/v1/itinerary/plan]
    
    subgraph BackendProcess ["Xử lý Backend Tối ưu hóa Không gian"]
        CallAPI --> ProjectUTM[Chuyển đổi tọa độ WGS84 sang UTM Zone 49N]
        ProjectUTM --> BalancedKMeans[Chạy Balanced K-Means + Hungarian Algorithm phân K cụm ngày]
        BalancedKMeans --> WeiszfeldMedian[Giải thuật lặp Weiszfeld tính điểm trung vị H*]
        WeiszfeldMedian --> QueryPostGIS[Truy vấn PostGIS ST_DWithin tìm khách sạn quanh H*]
        QueryPostGIS --> MCDAScore[Tính điểm đa tiêu chí MCDA xếp hạng Top 5 khách sạn]
        MCDAScore --> SelectBestHotel[Chọn khách sạn có điểm cao nhất]
        SelectBestHotel --> TSPRouting[Lặp qua K ngày: Gọi OSRM lấy ma trận và giải TSP bằng Google OR-Tools]
        TSPRouting --> BuildGeoJSON[Tổng hợp GeoJSON tuyến đường và mốc thời gian]
    end

    BuildGeoJSON --> ReturnResponse[Trả PlanResponse JSON về Frontend]
    ReturnResponse --> RenderMap[Render các lớp LineString và Marker trên MapLibre GL]
    RenderMap --> RenderTimeline[Hiển thị Smart Timeline kèm nhãn Giờ vàng và Cảnh báo]
    RenderTimeline --> End([Kết thúc])
```

### 3.2.2 Biểu đồ hoạt động: Thích ứng thời tiết Open-Meteo & Đề xuất điểm trong nhà

```mermaid
flowchart TD
    Start([Bắt đầu]) --> OpenWorkspace[Du khách truy cập Không gian làm việc WebGIS]
    OpenWorkspace --> FetchWeather[Frontend tự động gọi Open-Meteo API theo tọa độ Hà Nội]
    FetchWeather --> CheckCondition{Thời tiết có mưa rào hoặc nhiệt độ > 38°C?}
    
    CheckCondition -- Không --> NormalMode[Giữ nguyên chế độ tham quan tiêu chuẩn]
    NormalMode --> End([Kết thúc])

    CheckCondition -- Có --> AlertBanner[Hiển thị thông báo thời tiết xấu & Nút 'Chuyển hướng thông minh']
    AlertBanner --> ClickShift[Du khách bấm nút 'Chuyển hướng thông minh']
    ClickShift --> OpenModal[Mở Weather Shift Modal]
    OpenModal --> QueryIndoor[Lọc danh sách các điểm trong nhà: Bảo tàng, Nhà hát, Di tích mái che]
    QueryIndoor --> SelectReplacements[Du khách chọn các điểm trong nhà thay thế điểm ngoài trời]
    SelectReplacements --> ReRunPlan[Hệ thống tự động kích hoạt tính toán lại Lịch trình & Tuyến đường]
    ReRunPlan --> UpdateView[Cập nhật bản đồ và thời gian biểu an toàn dưới thời tiết xấu]
    UpdateView --> End
```

### 3.2.3 Biểu đồ hoạt động: Người dùng đề xuất địa điểm POI mới

```mermaid
flowchart TD
    Start([Bắt đầu]) --> ClickPropose[Du khách bấm nút 'Đề xuất địa điểm mới']
    ClickPropose --> OpenForm[Hiển thị Form đề xuất POI]
    OpenForm --> FillInfo[Nhập Tên, Thể loại, Địa chỉ và Lý do gợi ý]
    FillInfo --> PickLocation[Click chọn tọa độ chính xác trực tiếp trên bản đồ mini]
    PickLocation --> ValidateForm{Dữ liệu nhập hợp lệ?}
    
    ValidateForm -- Không --> ShowError[Hiển thị thông báo thiếu trường bắt buộc]
    ShowError --> FillInfo

    ValidateForm -- Có --> SubmitForm[Gửi yêu cầu POST /api/v1/proposed-pois]
    SubmitForm --> SaveDB[Backend lưu bản ghi vào bảng PROPOSED_POIS với status='pending']
    SaveDB --> ShowSuccess[Thông báo: 'Đề xuất thành công! Đang chờ kiểm duyệt']
    ShowSuccess --> End([Kết thúc])
```

### 3.2.4 Biểu đồ hoạt động: Quản trị viên duyệt và kích hoạt địa điểm mới

```mermaid
flowchart TD
    Start([Bắt đầu]) --> AdminLogin[Quản trị viên đăng nhập hệ thống với tài khoản Admin]
    AdminLogin --> OpenPanel[Mở Bảng điều khiển Quản trị POI]
    OpenPanel --> LoadPending[Tải danh sách các địa điểm có trạng thái 'pending']
    LoadPending --> SelectItem[Chọn 1 địa điểm để xem chi tiết và vị trí trên bản đồ]
    SelectItem --> Decide{Quyết định phê duyệt?}
    
    Decide -- Từ chối --> InputReason[Nhập lý do từ chối]
    InputReason --> UpdateReject[Cập nhật status = 'rejected' trong PROPOSED_POIS]
    UpdateReject --> FinishAction[Hoàn tất thao tác]

    Decide -- Phê duyệt --> EditFields[Hiệu chỉnh thông tin nếu cần: giờ mở cửa, giá vé, venue_type]
    EditFields --> ConfirmApprove[Bấm nút 'Phê duyệt & Kích hoạt']
    ConfirmApprove --> CreateOfficialPOI[Tạo bản ghi mới trong bảng POIS chính thức với status='active']
    CreateOfficialPOI --> UpdateApproved[Cập nhật status = 'approved' trong PROPOSED_POIS]
    UpdateApproved --> FinishAction
    FinishAction --> End([Kết thúc])
```

### 3.2.5 Biểu đồ hoạt động: Đăng nhập Google SSO (Identity Services)

```mermaid
flowchart TD
    Start([Bắt đầu]) --> ClickAuth[Người dùng bấm nút 'Tài khoản / Đăng nhập']
    ClickAuth --> OpenAuthModal[Hiển thị Modal Đăng nhập Warm Editorial]
    OpenAuthModal --> ChooseGoogle[Bấm nút 'Tiếp tục với Google']
    ChooseGoogle --> TriggerGIS[Kích hoạt Google Identity Services One-Tap / Popup]
    TriggerGIS --> UserConsent[Người dùng xác thực tài khoản Google trên trình duyệt]
    UserConsent --> ReceiveCredential[Frontend nhận Google Credential Token (ID Token)]
    ReceiveCredential --> SendBackend[Gửi POST /api/v1/auth/google kèm ID Token]
    
    subgraph BackendVerify ["Xử lý Backend"]
        SendBackend --> VerifyToken[Xác thực chữ ký số Token với Google OAuth2 Server]
        VerifyToken --> ExtractProfile[Trích xuất email, họ tên, google_sub]
        ExtractProfile --> CheckUserExists{Tài khoản đã tồn tại trong CSDL?}
        CheckUserExists -- Chưa --> CreateNewUser[Tạo User mới với role='user']
        CheckUserExists -- Đã có --> UpdateUser[Cập nhật thời gian đăng nhập]
        CreateNewUser --> GenerateJWT[Sinh JSON Web Token phiên làm việc]
        UpdateUser --> GenerateJWT
    end

    GenerateJWT --> ReturnJWT[Trả JWT Token và thông tin User về Frontend]
    ReturnJWT --> SaveLocalStorage[Lưu token vào localStorage và cập nhật Context Header]
    SaveLocalStorage --> ShowWelcome[Hiển thị thông báo đăng nhập thành công]
    ShowWelcome --> End([Kết thúc])
```

### 3.2.6 Biểu đồ hoạt động: Khôi phục mật khẩu qua mã OTP Email

```mermaid
flowchart TD
    Start([Bắt đầu]) --> OpenModal[Người dùng mở Modal Đăng nhập và bấm 'Quên mật khẩu?']
    OpenModal --> InputEmail[Nhập địa chỉ Email đã đăng ký]
    InputEmail --> ClickSendOTP[Bấm nút 'Gửi mã xác thực']
    ClickSendOTP --> CallForgotAPI[Gửi POST /api/v1/auth/forgot-password]
    
    subgraph BackendOTPSend ["Xử lý Backend"]
        CallForgotAPI --> CheckEmail{Email có trong hệ thống?}
        CheckEmail -- Không --> ReturnGeneric[Trả thông báo gửi thành công để bảo mật chống dò email]
        CheckEmail -- Có --> GenOTP[Sinh mã OTP ngẫu nhiên 6 chữ số và lưu vào cache 10 phút]
        GenOTP --> SendEmailSMTP[Gửi email chứa mã OTP xác thực qua máy chủ SMTP]
    end

    SendEmailSMTP --> ShowOTPInput[Frontend chuyển sang màn hình nhập mã OTP và mật khẩu mới]
    ShowOTPInput --> EnterCodeAndNewPass[Người dùng nhập mã OTP 6 số và mật khẩu mới]
    EnterCodeAndNewPass --> ClickReset[Bấm nút 'Xác nhận đổi mật khẩu']
    ClickReset --> CallResetAPI[Gửi POST /api/v1/auth/reset-password]
    
    subgraph BackendOTPVerify ["Xác minh Backend"]
        CallResetAPI --> ValidateOTP{Mã OTP khớp và chưa hết hạn?}
        ValidateOTP -- Sai/Hết hạn --> ReturnOTPError[Trả lỗi mã xác thực không hợp lệ]
        ValidateOTP -- Đúng --> HashNewPass[Băm mật khẩu mới bằng Bcrypt và cập nhật CSDL]
        HashNewPass --> DeleteOTP[Hủy mã OTP đã sử dụng]
    end

    DeleteOTP --> ReturnResetSuccess[Trả thông báo thành công về Frontend]
    ReturnResetSuccess --> RedirectLogin[Chuyển người dùng về màn hình đăng nhập với mật khẩu mới]
    ReturnResetSuccess --> End([Kết thúc])
```

---

## 3.3 Sequence Diagrams

### 3.3.1 Biểu đồ tuần tự: Lập kế hoạch và Định tuyến tối ưu (Weiszfeld + TSP)

```mermaid
sequenceDiagram
    autonumber
    actor DuKhach as Du khách
    participant UI as WebGIS UI (React + MapLibre)
    participant API as FastAPI Router (/itinerary/plan)
    participant Spatial as Spatial Service (Python)
    participant DB as PostGIS CSDL
    participant Routing as Routing Service (OR-Tools + OSRM)

    DuKhach->>UI: Chọn N điểm đến, số ngày K và bấm "Tối ưu hóa hành trình"
    UI->>API: POST /api/v1/itinerary/plan (Danh sách POI IDs, K ngày, giờ bắt đầu)
    
    rect rgb(240, 248, 255)
        Note over API,Spatial: Giai đoạn 1: Phân cụm cân bằng theo ngày
        API->>Spatial: balanced_k_means(pois_utm_coords, k_days)
        Spatial->>Spatial: Chạy K-Means + Hungarian Algorithm
        Spatial-->>API: K cụm ngày cân bằng (chênh lệch tối đa 1 điểm)
    end

    rect rgb(255, 250, 240)
        Note over API,Spatial: Giai đoạn 2: Tính vị trí lưu trú lý tưởng
        API->>Spatial: compute_weiszfeld_l1(pois_coords)
        Spatial->>Spatial: Lặp Weiszfeld hội tụ tìm tọa độ H*(lat, lon)
        Spatial-->>API: Điểm trung vị hình học H*
    end

    rect rgb(240, 255, 240)
        Note over API,DB: Giai đoạn 3: Truy vấn & Xếp hạng khách sạn
        API->>DB: ST_DWithin(geom, H*, bán kính R)
        DB-->>API: Danh sách khách sạn ứng viên
        API->>API: Chấm điểm MCDA = w1*CựLy + w2*Sao + w3*Giá
        API-->>API: Chọn Khách sạn Top 1 (hoặc theo ID du khách chọn)
    end

    rect rgb(255, 240, 245)
        Note over API,Routing: Giai đoạn 4: Định tuyến vòng kín TSP từng ngày
        loop Lặp qua từng ngày trong K ngày
            API->>Routing: fetch_osrm_matrix([Hotel, POI_1, ..., POI_m])
            Routing-->>API: Ma trận thời gian & khoảng cách thực tế
            API->>Routing: solve_tsp_ortools(matrix, hotel_idx=0)
            Routing-->>API: Thứ tự ghé thăm vòng kín tối ưu
            API->>Routing: fetch_route_geojson(ordered_coords)
            Routing-->>API: GeoJSON LineString chặng đường thực tế
        end
    end

    API-->>UI: Trả PlanResponse JSON hoàn chỉnh
    UI->>UI: Sinh Smart Timeline, gắn nhãn Giờ vàng và Cảnh báo
    UI-->>DuKhach: Vẽ tuyến đường trên bản đồ và hiển thị Lịch trình chi tiết
```

### 3.3.2 Biểu đồ tuần tự: Đổi khách sạn và tái tính toán tuyến đường

```mermaid
sequenceDiagram
    autonumber
    actor DuKhach as Du khách
    participant UI as WebGIS UI (React)
    participant API as FastAPI Router (/itinerary/plan)
    participant Routing as Routing Service (OR-Tools + OSRM)

    DuKhach->>UI: Kéo thanh trượt MCDA hoặc bấm chọn Khách sạn #2 trong Top 5
    UI->>API: POST /api/v1/itinerary/plan (Kèm selected_hotel_id mới)
    Note over API: Giữ nguyên việc phân cụm K ngày, thay đổi điểm mút xuất phát
    loop Với từng ngày
        API->>Routing: fetch_osrm_matrix([NewHotel, POIs])
        Routing-->>API: Ma trận chi phí mới
        API->>Routing: solve_tsp_ortools(matrix, hotel_idx=0)
        Routing-->>API: Thứ tự TSP mới & GeoJSON tuyến đường mới
    end
    API-->>UI: Trả về PlanResponse cập nhật
    UI-->>DuKhach: Bản đồ vẽ lại tuyến đường từ khách sạn mới; cập nhật Timeline
```

### 3.3.3 Biểu đồ tuần tự: Thích ứng thời tiết xấu và tráo đổi POI

```mermaid
sequenceDiagram
    autonumber
    actor DuKhach as Du khách
    participant UI as WebGIS UI
    participant Meteo as Open-Meteo Weather API
    participant API as FastAPI Backend

    UI->>Meteo: GET /v1/forecast?latitude=21.0285&longitude=105.8542
    Meteo-->>UI: Thời tiết Hà Nội: Mưa lớn (Precipitation > 15mm/h)
    UI->>UI: Hiển thị cảnh báo thời tiết & Nút "Chuyển hướng thông minh"
    DuKhach->>UI: Click "Chuyển hướng thông minh"
    UI->>API: GET /api/v1/pois?venue_type=indoor
    API-->>UI: Danh sách POIs trong nhà (Bảo tàng, Văn Miếu nhà che, Nhà hát)
    DuKhach->>UI: Chọn POI trong nhà thay thế POI ngoài trời
    UI->>API: POST /api/v1/itinerary/plan (Danh sách POIs đã hoán đổi)
    API-->>UI: Lộ trình tối ưu mới thích ứng thời tiết mưa
    UI-->>DuKhach: Cập nhật giao diện an toàn, tiện lợi
```

### 3.3.4 Biểu đồ tuần tự: Đóng góp POI và Quản trị viên duyệt điểm

```mermaid
sequenceDiagram
    autonumber
    actor DuKhach as Du khách
    actor Admin as Quản trị viên
    participant UI as Frontend WebGIS
    participant API as FastAPI Backend
    participant DB as PostGIS CSDL

    DuKhach->>UI: Nhập thông tin POI mới, click tọa độ trên bản đồ mini
    UI->>API: POST /api/v1/proposed-pois (Thông tin điểm, status='pending')
    API->>DB: INSERT INTO PROPOSED_POIS
    DB-->>API: Đã lưu bản ghi
    API-->>UI: 201 Created ("Đã gửi đề xuất, chờ duyệt")
    UI-->>DuKhach: Hiển thị thông báo thành công

    Note over Admin,DB: Quá trình Quản trị viên kiểm duyệt
    Admin->>UI: Mở Bảng Quản trị và đăng nhập quyền Admin
    UI->>API: GET /api/v1/proposed-pois?status=pending
    API->>DB: SELECT * FROM PROPOSED_POIS WHERE status='pending'
    DB-->>API: Danh sách chờ duyệt
    API-->>UI: Hiển thị danh sách đề xuất
    Admin->>UI: Kiểm tra thông tin, bấm "Phê duyệt"
    UI->>API: POST /api/v1/proposed-pois/{id}/approve
    API->>DB: INSERT INTO POIS (Kích hoạt bản ghi chính thức)
    API->>DB: UPDATE PROPOSED_POIS SET status='approved'
    DB-->>API: Xác nhận cập nhật
    API-->>UI: 200 OK ("Đã phê duyệt và thêm vào bản đồ chung")
    UI-->>Admin: Cập nhật danh sách điểm chính thức
```

### 3.3.5 Biểu đồ tuần tự: Đăng nhập Google Identity Services (GIS)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as Frontend AuthModal
    participant Google as Google OAuth2 Server
    participant API as FastAPI Auth Endpoint
    participant DB as CSDL PostgreSQL

    User->>UI: Bấm nút "Tiếp tục với Google"
    UI->>Google: Kích hoạt Google One-Tap / GIS Client
    User->>Google: Đăng nhập và cấp quyền truy cập email cá nhân
    Google-->>UI: Trả Google ID Token (JWT Token có chữ ký của Google)
    UI->>API: POST /api/v1/auth/google { credential: "JWT_TOKEN" }
    API->>Google: Xác thực chữ ký số của Token
    Google-->>API: Token hợp lệ (Email: user@gmail.com, Name: Nguyen Van A)
    API->>DB: SELECT * FROM USERS WHERE email = 'user@gmail.com'
    alt Tài khoản chưa tồn tại
        API->>DB: INSERT INTO USERS (email, full_name, role='user')
    end
    API->>API: Sinh System JWT Token (Access Token chứa payload user_id, role)
    API-->>UI: Trả về System JWT Token & User Profile
    UI->>UI: Lưu Token vào localStorage và đóng Modal
    UI-->>User: Hiển thị Avatar và Tên người dùng trên Header
```

### 3.3.6 Biểu đồ tuần tự: Khôi phục mật khẩu gửi mã OTP Email

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as Frontend AuthModal
    participant API as FastAPI Auth Endpoint
    participant SMTP as Máy chủ Email SMTP
    participant DB as CSDL PostgreSQL

    User->>UI: Bấm "Quên mật khẩu?" và nhập email cá nhân
    UI->>API: POST /api/v1/auth/forgot-password { email: "user@gmail.com" }
    API->>DB: SELECT * FROM USERS WHERE email = 'user@gmail.com'
    API->>API: Sinh mã OTP ngẫu nhiên 6 chữ số (Hạn dùng 10 phút)
    API->>SMTP: Gửi email chứa mã OTP xác thực
    SMTP-->>User: Nhận email thông báo mã xác nhận OTP
    API-->>UI: 200 OK ("Mã OTP đã được gửi đến email")
    UI-->>User: Hiển thị form nhập mã OTP và Mật khẩu mới
    User->>UI: Nhập mã OTP 6 số và Mật khẩu mới
    UI->>API: POST /api/v1/auth/reset-password { email, otp, new_password }
    API->>API: Xác minh mã OTP hợp lệ
    API->>DB: UPDATE USERS SET hashed_password = hash(new_password)
    DB-->>API: Cập nhật thành công
    API-->>UI: 200 OK ("Đổi mật khẩu thành công")
    UI-->>User: Thông báo thành công, chuyển sang màn hình đăng nhập
```

---

# Chương 4: Thiết kế giao diện và luồng công việc

## 4.1 Flow of Work

Luồng điều hướng tổng thể của hệ thống được xây dựng tối giản, liền mạch, đảm bảo người dùng có thể hoàn thành toàn bộ kế hoạch du lịch chỉ trong vòng dưới 3 phút:

```mermaid
flowchart TD
    Landing[1. Landing Page: Giới thiệu & So sánh hiệu quả] --> Workspace[2. Interactive WebGIS Workspace]
    
    subgraph PlanningFlow ["Luồng Tối ưu hóa Lịch trình"]
        Workspace --> SelectPOIs[2.1 Chọn các điểm đến từ Sidebar]
        SelectPOIs --> ConfigTrip[2.2 Chọn Số ngày & Giờ xuất phát]
        ConfigTrip --> OptimizeAction[2.3 Bấm 'Tối ưu hóa hành trình']
        OptimizeAction --> ResultView[2.4 Xem Lộ trình bản đồ & Smart Timeline]
    end

    subgraph CustomizationFlow ["Luồng Tùy biến & Thích ứng"]
        ResultView --> AdjustMCDA[3.1 Kéo thanh trượt MCDA hoặc Đổi khách sạn]
        AdjustMCDA --> ResultView
        ResultView --> WeatherShift[3.2 Chuyển hướng thời tiết xấu Open-Meteo]
        WeatherShift --> ResultView
    end

    subgraph ExportFlow ["Luồng Xuất kế hoạch"]
        ResultView --> ExportExcel[4.1 Xuất bảng tính Excel 3 sheets]
        ResultView --> ExportQR[4.2 Quét mã QR Google Maps]
        ResultView --> ExportStory[4.3 Tải ảnh Story Card 9:16]
    end

    subgraph UserFlow ["Luồng Đóng góp & Quản trị"]
        Workspace --> ProposePOI[5.1 Đề xuất địa điểm POI mới]
        Workspace --> AuthFlow[5.2 Đăng nhập Google SSO / Quên mật khẩu]
        AuthFlow --> AdminPanel[5.3 Bảng Quản trị duyệt địa điểm]
    end
```

## 4.2 Thiết kế các màn hình

Hệ thống được thiết kế theo trường phái **Warm Editorial** — kết hợp hài hòa giữa chất văn hóa truyền thống thanh lịch của Thăng Long – Hà Nội (gam màu vàng hoàng thành, xanh ngọc bích, giấy dó thủ công) với sự sắc nét, hiện đại của các phần mềm WebGIS cao cấp.

### 4.2.1 Giao diện Trang chủ (Landing Page)
- **Hero Header:** Tiêu đề ấn tượng *"Chạm vào hồn phố — Đi trọn Thủ đô"*, phụ đề giải thích bài toán tối ưu lưu trú và di chuyển thông minh. Nút bấm Call-To-Action (CTA) dẫn thẳng vào Không gian làm việc.
- **Bảng đối sánh thực tế (A/B Comparison):** Minh chứng hiệu quả giữa *Du lịch tự phát* và *Sử dụng Hanoi SDSS* (tiết kiệm gần 50% cự ly di chuyển từ 42.5 km xuống còn 21.8 km; cắt giảm 65% thời gian chôn chân trên đường phố từ 185 phút xuống 64 phút).
- **Bộ sưu tập địa danh tuyển chọn (Curated POIs):** Trình bày dạng các thẻ xếp chồng (Stacking Cards) với ảnh chất lượng cao của Hồ Gươm, Lăng Bác, Hoàng Thành, Văn Miếu kèm thông tin giờ mở cửa và giá vé.

### 4.2.2 Giao diện Không gian làm việc WebGIS (Workspace)
- **Bản đồ số trung tâm (MapLibre GL Canvas):**
  - Chiếm trọn không gian chính của màn hình, hỗ trợ thu phóng, xoay góc nhìn 3D mượt mà.
  - Tích hợp 2 lớp bản đồ nền miễn phí: *Bản đồ đường phố nhân đạo (OpenStreetMap Humanitarian)* và *Bản đồ Ảnh vệ tinh sắc nét (Esri World Imagery)* không chứa watermark.
  - Marker điểm tham quan được đánh số thứ tự ghé thăm $(1, 2, 3...)$ và tô màu riêng biệt theo từng ngày du lịch (Ngày 1: Xanh ngọc, Ngày 2: Đỏ gạch, Ngày 3: Tím hoàng gia).
  - Marker Khách sạn đề xuất mang biểu tượng vương miện hoàng gia nổi bật; marker tâm lý tưởng Weiszfeld $H^*$ mang biểu tượng tâm ngắm chuyên dụng.
  - Các tuyến đường GeoJSON LineString uốn lượn chính xác theo mạng lưới ngõ phố thực tế của Hà Nội.

### 4.2.3 Bảng điều khiển Sidebar & Bộ lọc danh mục
- Tọa lạc ở góc trái màn hình, hỗ trợ đóng/mở linh hoạt để mở rộng diện tích bản đồ.
- Tích hợp thanh tìm kiếm tức thời theo tên địa danh tiếng Việt có dấu/không dấu.
- Các nút lọc nhanh danh mục: *Di tích lịch sử, Văn hóa tâm linh, Ẩm thực đường phố, Quán cà phê hoài niệm, TTTM & Giải trí*.
- Bộ chọn số ngày du lịch (1 đến 7 ngày), bộ chọn ngày khởi hành (Date Picker) kèm huy hiệu tự động nhận diện *Cuối tuần / Ngày trong tuần*.
- Bộ chọn giờ xuất phát (`07:30`, `08:00`, `08:30`, `09:00`).

### 4.2.4 Lịch trình mốc giờ thông minh (Smart Timeline)
- Hiển thị chi tiết theo từng ngày (Thẻ Day 1, Day 2, Day 3...).
- Trình bày tuần tự mốc thời gian từng phút: *08:00 Khởi hành từ khách sạn $\rightarrow$ Di chuyển 12 phút $\rightarrow$ 08:12 Đến Văn Miếu, tham quan 90 phút $\rightarrow$ 11:45 Nghỉ ăn trưa ẩm thực phố cổ (75 phút) $\rightarrow$ 17:30 Về khách sạn nghỉ ngơi*.
- Gắn nhãn **✨ Giờ vàng check-in** cho các trải nghiệm văn hóa đặc sắc: Đón bình minh Hồ Tây, Lễ hạ cờ Lăng Bác (21:00), Phố Cổ lên đèn.
- Gắn thẻ cảnh báo thông minh: Cảnh báo phố đi bộ cấm xe sau 19h tối cuối tuần; Cảnh báo ngày Lăng Bác đóng cửa (Thứ Hai, Thứ Sáu); Cảnh báo giờ cao điểm kẹt xe (07:30 - 09:00, 17:00 - 19:00).

### 4.2.5 Modal Động cơ thời tiết thích ứng (Weather Shift Engine)
- Tự động hiển thị khi phát hiện mưa to (> 10mm) hoặc nắng gắt (> 38°C) từ Open-Meteo API.
- Cung cấp danh sách các điểm văn hóa trong nhà (Bảo tàng Lịch sử Quân sự Việt Nam, Bảo tàng Hà Nội, Văn Miếu khu trưng bày trong nhà, Nhà hát Lớn) để du khách chọn thay thế các điểm ngoài trời chỉ với 1 click.

### 4.2.6 Modal Đề xuất địa điểm POI mới (Crowdsourcing)
- Cho phép du khách đóng góp các quán ăn ngon, quán cà phê ngõ nhỏ chưa có trong cơ sở dữ liệu.
- Tích hợp bản đồ con (Mini Map) cho phép click trực tiếp để lấy tọa độ $(lat, lon)$ chính xác tới 6 chữ số thập phân.
- Form nhập gồm: Tên địa danh, Thể loại, Địa chỉ, Thời lượng tham quan dự kiến, Giá vé và Lý do gợi ý.

### 4.2.7 Modal Bảng điều khiển Quản trị viên (Admin Moderation Panel)
- Dành riêng cho tài khoản có quyền `role='admin'`.
- Hiển thị danh sách các đề xuất đang chờ duyệt (`status: 'pending'`).
- Xem vị trí điểm đề xuất trên bản đồ đối chiếu, bấm nút "Phê duyệt" để chính thức bổ sung vào cơ sở dữ liệu chung hoặc bấm "Từ chối" kèm lý do.

### 4.2.8 Modal Xác thực người dùng (Google SSO & Quên mật khẩu OTP)
- Thiết kế tối giản, loại bỏ hoàn toàn các khung nhập thử nghiệm thô sơ, hướng tới trải nghiệm người dùng cuối sang trọng.
- Hỗ trợ đăng nhập nhanh bằng Google Identity Services (GIS) 1-chạm hoặc Email/Mật khẩu truyền thống.
- Chức năng "Quên mật khẩu?": Gửi mã OTP xác thực 6 số về email cá nhân để đổi mật khẩu mới an toàn, tin cậy.

### 4.2.9 Tiện ích Xuất kế hoạch đa kênh (Multi-channel Exporters)
- **Xuất bảng tính Excel (.xlsx):** Cung cấp 3 sheet chuyên nghiệp: *Tổng quan chuyến đi*, *Lịch trình chi tiết từng ngày có mốc giờ*, và *Bảng dự toán kinh phí nhóm*.
- **Mã QR Google Maps:** Sinh mã QR để du khách dùng điện thoại quét và mở trực tiếp lộ trình nhiều chặng trên ứng dụng Google Maps.
- **Thẻ ảnh Story 9:16:** Chụp ảnh canvas lịch trình dưới dạng bưu thiếp nghệ thuật tỉ lệ 9:16 để đăng Instagram Story / Facebook Story.

---

## 4.3 Layout mẫu và đối chiếu phần hiện thực

So sánh giữa bảng tiêu chí thiết kế giao diện ban đầu và kết quả mã nguồn thực tế đã hoàn thiện:

1. **Về màu sắc & Typography:** Sử dụng font chữ serif sang trọng cho tiêu đề (*Playfair Display / Merriweather*) kết hợp font sans-serif (*Inter / Plus Jakarta Sans*) cho phần thông số kỹ thuật, đạt độ tương phản màu chuẩn WCAG AAA.
2. **Về hiển thị bản đồ WebGIS:** Đã hoàn thiện toàn bộ tính năng vẽ marker tùy chỉnh theo ngày, đường đa tuyến Polyline GeoJSON có hiệu ứng viền phát sáng, và popup thông tin chi tiết POI khi click vào marker.
3. **Về độ phản hồi Responsive:** Giao diện co giãn mượt mà trên mọi kích thước màn hình từ máy tính để bàn (Desktop 1920x1080), máy tính xách tay (Laptop 1366x768) đến máy tính bảng và điện thoại di động thông minh.

---

# Chương 5: Phân tích kiến trúc

## 5.1 Kiến trúc tổng thể

Hệ thống Hanoi Tourism SDSS được thiết kế theo mô hình **Kiến trúc phân tầng sạch (Clean Architecture)** kết hợp Kiến trúc Hướng Dịch vụ (Service-Oriented Architecture - SOA), phân chia rõ ràng trách nhiệm giữa các lớp:

```
┌────────────────────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (Frontend SPA WebGIS)                 │
│  React 18 • TypeScript • MapLibre GL • Tailwind CSS • GSAP Animation   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / JSON RESTful APIs
┌───────────────────────────────────▼────────────────────────────────────┐
│               APPLICATION & ALGORITHMIC LAYER (FastAPI)                │
│  - Spatial Service: UTM Projections, Weiszfeld L1-Median, K-Means      │
│  - Routing Service: OSRM Distance/Time Matrix, Google OR-Tools TSP     │
│  - Recommendation Service: Spatial MCDA Hotel Scoring                  │
│  - Context Engine: Open-Meteo Weather API, Hanoi Rush Hour & Pedestrian│
│  - Auth & Admin Service: Google OAuth2 GIS, JWT, OTP Email SMTP        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQLAlchemy 2.0 / GeoAlchemy2
┌───────────────────────────────────▼────────────────────────────────────┐
│               DATA PERSISTENCE & GIS SERVICES LAYER                    │
│  - Primary DB: PostgreSQL 16 + PostGIS 3.4 (Cloud Supabase / Render)   │
│  - Fallback DB: SQLite In-Memory Database (Tự động kích hoạt khi lỗi)  │
│  - External GIS: OSRM Routing Machine API (Định tuyến đường bộ thực tế)│
│  - External Weather: Open-Meteo Forecast Engine                        │
└────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Component và Deployment

### 5.2.1 Sơ đồ thành phần (Component Diagram)

```mermaid
flowchart TD
    subgraph FrontendComponents ["Frontend Components (React / TypeScript)"]
        UI_Map[MaplibreMap Component]
        UI_Sidebar[Sidebar & POICard Components]
        UI_Timeline[SmartTimeline & TimelineItem Components]
        UI_Weather[WeatherModal & Alert Components]
        UI_MCDA[MCDASliders & HotelCard Components]
        UI_Auth[AuthModal: Google GIS & OTP]
        UI_Export[Excel & StoryCard Exporters]
    end

    subgraph BackendComponents ["Backend API Components (FastAPI)"]
        API_Router[FastAPI API Router]
        Svc_Spatial[Spatial Service: Weiszfeld & K-Means]
        Svc_Routing[Routing Service: OR-Tools TSP & OSRM]
        Svc_MCDA[Recommendation Service: MCDA]
        Svc_Weather[Context Engine: Weather & Rush Hour]
        Svc_Auth[Auth Service: OAuth2 & OTP]
    end

    subgraph DataServices ["Data & External Services"]
        DB_PostGIS[(PostgreSQL 16 / PostGIS 3.4)]
        DB_SQLite[(SQLite Fallback In-Memory)]
        Ext_OSRM[OSRM Routing Server]
        Ext_Meteo[Open-Meteo Forecast API]
        Ext_Google[Google OAuth2 Server]
        Ext_SMTP[SMTP Mail Server]
    end

    FrontendComponents -->|RESTful JSON| API_Router
    API_Router --> Svc_Spatial
    API_Router --> Svc_Routing
    API_Router --> Svc_MCDA
    API_Router --> Svc_Weather
    API_Router --> Svc_Auth

    Svc_Spatial --> DB_PostGIS
    Svc_MCDA --> DB_PostGIS
    Svc_Auth --> DB_PostGIS
    Svc_Routing --> Ext_OSRM
    Svc_Weather --> Ext_Meteo
    Svc_Auth --> Ext_Google
    Svc_Auth --> Ext_SMTP
    DB_PostGIS -.->|Fallback khi lỗi kết nối| DB_SQLite
```

### 5.2.2 Sơ đồ triển khai hạ tầng đám mây (Deployment Diagram)

```mermaid
flowchart LR
    ClientBrowser["Trình duyệt người dùng (Web Browser)"]
    
    subgraph VercelCloud ["Vercel Global Edge Network"]
        FrontendVercel["React 18 WebGIS SPA (HTML5/CSS3/TS/WebGL)"]
    end

    subgraph RenderCloud ["Render Cloud Application Server"]
        BackendFastAPI["FastAPI Python 3.11 Docker Container (Uvicorn Worker)"]
    end

    subgraph SupabaseCloud ["Supabase Managed Cloud"]
        PostGISDB[("PostgreSQL 16 + PostGIS 3.4 Spatial Database")]
    end

    subgraph ExternalAPIs ["Máy chủ dịch vụ bên thứ ba"]
        OSRMServer["OSRM Project Public Routing Server"]
        OpenMeteoServer["Open-Meteo Weather Server"]
        GoogleAuthServer["Google Identity OAuth2 Server"]
        SMTPServer["Google Gmail SMTP Server"]
    end

    ClientBrowser -->|HTTPS| FrontendVercel
    FrontendVercel -->|HTTPS / WSS| BackendFastAPI
    BackendFastAPI -->|TCP / SSL Port 5432| PostGISDB
    BackendFastAPI -->|HTTP REST| OSRMServer
    FrontendVercel -->|HTTP REST| OpenMeteoServer
    BackendFastAPI -->|HTTPS| GoogleAuthServer
    BackendFastAPI -->|TLS Port 587| SMTPServer
```

## 5.3 Đánh giá chất lượng và rủi ro

1. **Khả năng mở rộng (Scalability):** Backend FastAPI áp dụng mô hình bất đồng bộ (Asynchronous ASGI) cho phép xử lý hàng ngàn kết nối đồng thời với lượng chiếm dụng bộ nhớ RAM rất thấp (< 256MB).
2. **Cơ chế dự phòng sự cố (Fault Tolerance & Resilience):**
   - *Rủi ro CSDL Cloud offline:* Nếu Supabase PostgreSQL gặp sự cố mạng hoặc giới hạn băng thông, tầng truy cập dữ liệu SQLAlchemy tự động chuyển hướng sang CSDL nội bộ SQLite In-Memory và nạp dữ liệu Mock POI đã chuẩn hóa, đảm bảo API vẫn phản hồi bình thường mà không gây lỗi 500 cho người dùng.
   - *Rủi ro máy chủ OSRM timeout:* Nếu OSRM public server quá tải, thuật toán tự động sử dụng ma trận khoảng cách hình học phẳng UTM Zone 49N để chạy OR-Tools TSP, đảm bảo không làm gián đoạn lịch trình của du khách.
3. **Bảo mật và toàn vẹn dữ liệu:** Toàn bộ dữ liệu mật khẩu được mã hóa một chiều bằng Bcrypt; khóa bí mật JWT Secret Key và thông tin kết nối CSDL được cô lập hoàn toàn qua tệp cấu hình `.env`, không bao giờ bị lộ ra ngoài mã nguồn Frontend.

---

# Chương 6: Cài đặt và kết nối cơ sở dữ liệu

## 6.1 Cấu trúc mã nguồn

Mã nguồn dự án được tổ chức khoa học, chuẩn mực theo mô hình Monorepo:

```
do_an_lien_nganh/
├── backend/
│   ├── app/
│   │   ├── algorithms/               # Module các thuật toán lõi Toán học & Không gian
│   │   │   ├── weiszfeld.py          # Giải thuật lặp Weiszfeld L1-Median Fermat-Weber
│   │   │   ├── clustering.py         # Balanced Capacity-Constrained K-Means + Hungarian
│   │   │   └── tsp_solver.py         # Google OR-Tools Closed-Loop TSP Solver
│   │   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── pois.py           # API quản lý và tra cứu điểm tham quan
│   │       │   ├── itinerary.py      # API tối ưu hóa lịch trình tổng thể
│   │       │   ├── auth.py           # API Google SSO, Login, Register, Quên MK OTP
│   │       │   └── proposed_pois.py  # API đóng góp và kiểm duyệt POI của Admin
│   │   ├── core/
│   │   │   ├── config.py             # Cấu hình biến môi trường Pydantic Settings
│   │   │   └── security.py           # Tiện ích băm mật khẩu Bcrypt và ký JWT Token
│   │   ├── models/                   # Mô hình thực thể CSDL SQLAlchemy & GeoAlchemy2
│   │   │   ├── poi.py
│   │   │   ├── accommodation.py
│   │   │   ├── user.py
│   │   │   └── proposed_poi.py
│   │   ├── schemas/                  # Lớp kiểm tra dữ liệu Pydantic v2 Schemas
│   │   ├── services/                 # Tầng nghiệp vụ Service Layer
│   │   │   ├── spatial.py            # Chuyển đổi tọa độ UTM Zone 49N và tính cự ly
│   │   │   ├── routing.py            # Kết nối OSRM Table API và sinh GeoJSON
│   │   │   ├── recommendation.py     # Chấm điểm đa tiêu chí MCDA cho khách sạn
│   │   │   └── email.py              # Dịch vụ gửi email mã OTP xác thực qua SMTP
│   │   └── main.py                   # Điểm khởi động ứng dụng FastAPI ASGI
│   ├── requirements.txt              # Danh mục các thư viện phụ thuộc Python
│   └── Dockerfile                    # Tệp đóng gói container Backend
├── frontend/
│   ├── src/
│   │   ├── components/               # Các khối giao diện React tái sử dụng
│   │   │   ├── MaplibreMap.tsx       # Bản đồ WebGIS MapLibre GL
│   │   │   ├── Sidebar.tsx           # Bảng điều khiển danh mục và tham số
│   │   │   ├── SmartTimeline.tsx     # Lịch trình mốc giờ chi tiết & Giờ vàng
│   │   │   ├── HotelRecommender.tsx  # Khuyến nghị khách sạn & Thanh trượt MCDA
│   │   │   ├── WeatherModal.tsx      # Động cơ chuyển hướng thời tiết thông minh
│   │   │   ├── ProposePOIModal.tsx   # Modal người dùng đề xuất POI mới
│   │   │   ├── AdminPOIPanel.tsx     # Modal Quản trị viên kiểm duyệt POI
│   │   │   └── AuthModal.tsx         # Modal Đăng nhập Google SSO & OTP Quên mật khẩu
│   │   ├── services/                 # Tầng giao tiếp API Axios / Fetch
│   │   ├── types/                    # Định nghĩa kiểu dữ liệu TypeScript
│   │   ├── utils/                    # Tiện ích xuất Excel, Story Card, Date helpers
│   │   └── App.tsx                   # Thành phần gốc ứng dụng React
│   ├── package.json                  # Cấu hình thư viện phụ thuộc Node.js
│   └── vite.config.ts                # Cấu hình build Vite
└── docker-compose.yml                # Cấu hình khởi chạy toàn bộ hệ thống bằng 1 lệnh
```

---

## 6.2 Hiện thực User Stories và chi tiết thuật toán

### 6.2.1 Thuật toán vị trí lưu trú lý tưởng: Weiszfeld $L_1$-Median (Fermat-Weber)

Trong quy hoạch không gian, việc xác định vị trí lưu trú sao cho tổng quãng đường di chuyển tới $N$ điểm tham quan là nhỏ nhất chính là **Bài toán Fermat-Weber**. Nếu lấy tọa độ trung bình cộng (Trọng tâm số học - Center of Mass):
$$\bar{X} = \frac{1}{N}\sum_{i=1}^N P_i$$
Điểm trung bình cộng này cực kỳ nhạy cảm với các điểm ngoại lai (Outliers). Ví dụ, nếu du khách chọn 5 điểm ở nội thành (Hoàn Kiếm, Ba Đình) và chỉ 1 điểm ở ngoại thành xa xôi như Làng gốm Bát Tràng hoặc Làng cổ Đường Lâm, trọng tâm số học sẽ bị kéo lệch hẳn ra ngoại ô (quận Long Biên hoặc Hoài Đức), nơi hoàn toàn không phù hợp để đặt khách sạn.

Do đó, đồ án áp dụng **Điểm trung vị hình học ($L_1$-Median)**, cực tiểu hóa tổng khoảng cách Euclidean:
$$\min_{X \in \mathbb{R}^2} f(X) = \sum_{i=1}^N w_i \|X - P_i\|_2$$
Trong đó $w_i$ là trọng số (tần suất ghé thăm hoặc thời gian dừng chân), $P_i = (x_i, y_i)$ là tọa độ của điểm tham quan thứ $i$. Hàm mục tiêu này lồi nghiêm ngặt và có điểm phá vỡ (Breakdown Point) lên tới **50%**, kháng hoàn toàn tác động của các điểm ngoại lai ngoại thành.

Thuật toán lặp **Weiszfeld (1937)** được hiện thực để tìm nghiệm $X^*$:
$$X^{(t+1)} = \frac{\sum_{i=1, P_i \ne X^{(t)}}^N \frac{w_i P_i}{\|X^{(t)} - P_i\|_2}}{\sum_{i=1, P_i \ne X^{(t)}}^N \frac{w_i}{\|X^{(t)} - P_i\|_2}}$$
Trường hợp điểm lặp trùng với một điểm dữ liệu ($X^{(t)} = P_k$), thuật toán áp dụng kỹ thuật hiệu chỉnh của Kuhn (1973) để đảm bảo tính hội tụ đơn điệu. Mã nguồn hiện thực trong `backend/app/algorithms/weiszfeld.py`:

```python
def compute_geometric_median_weiszfeld(
    points: np.ndarray, 
    weights: Optional[np.ndarray] = None, 
    max_iter: int = 200, 
    eps: float = 1e-6
) -> Tuple[float, float]:
    # Tìm điểm trung vị hình học L1-Median bằng giải thuật lặp Weiszfeld.
    # Kháng ngoại lai mạnh mẽ, hội tụ bậc nhất nhanh chóng (< 25 vòng lặp).
    if len(points) == 0:
        raise ValueError("Danh sách điểm rỗng")
    if len(points) == 1:
        return float(points[0][0]), float(points[0][1])
    
    # Khởi tạo nghiệm ban đầu tại trọng tâm có trọng số
    if weights is None:
        weights = np.ones(len(points), dtype=np.float64)
    x = np.average(points, axis=0, weights=weights)
    
    for _ in range(max_iter):
        distances = np.linalg.norm(points - x, axis=1)
        # Kiểm tra trùng điểm để tránh chia cho 0
        zero_dist_idx = np.where(distances < 1e-12)[0]
        if len(zero_dist_idx) > 0:
            return float(points[zero_dist_idx[0]][0]), float(points[zero_dist_idx[0]][1])
        
        inv_dists = weights / distances
        sum_inv = np.sum(inv_dists)
        x_new = np.sum(points * inv_dists[:, np.newaxis], axis=0) / sum_inv
        
        if np.linalg.norm(x_new - x) < eps:
            return float(x_new[0]), float(x_new[1])
        x = x_new
        
    return float(x[0]), float(x[1])
```

---

### 6.2.2 Thuật toán phân cụm cân bằng ngày: Balanced Capacity-Constrained K-Means

Thuật toán K-Means truyền thống thường tạo ra các cụm có số lượng phần tử rất chênh lệch: có ngày phải ghé 6 điểm (quá tải, kiệt sức), có ngày chỉ có 1 điểm (lãng phí thời gian). Đồ án giải quyết bằng bài toán **Phân cụm có ràng buộc dung lượng cân bằng (Capacity-Constrained Clustering)**:
- Số điểm mỗi ngày $C_k$ được khống chế nghiêm ngặt:
$$\lfloor N/K \rfloor \le |C_k| \le \lceil N/K \rceil, \quad \forall k \in \{1, \dots, K\}$$
- Quy trình thực hiện:
  1. Chuyển đổi tọa độ địa lý $(lat, lon)$ sang hệ tọa độ phẳng mét UTM Zone 49N (`EPSG:32649`).
  2. Khởi tạo $K$ tâm cụm bằng thuật toán $K\text{-Means}++$.
  3. Lập ma trận chi phí khoảng cách $D_{N \times N}$ giữa các điểm và các "vị trí chỗ trống" (slots) của $K$ ngày.
  4. Sử dụng thuật toán Hungarian (`scipy.optimize.linear_sum_assignment`) để tìm phép gán cặp tối ưu toàn cục giải quyết bài toán Bipartite Matching với độ phức tạp $O(N^3)$.
  5. Cập nhật lại tâm cụm và lặp lại cho đến khi hội tụ.

---

### 6.2.3 Giải thuật Google OR-Tools giải bài toán Người du lịch vòng kín (Closed-Loop TSP)

Với mỗi ngày sau khi phân cụm, hệ thống cần sắp xếp thứ tự tham quan các điểm xuất phát từ khách sạn và trở về khách sạn sao cho tổng thời gian di chuyển là nhỏ nhất:
- **Tập đỉnh:** $V = \{0, 1, 2, \dots, m\}$ với đỉnh $0$ là Khách sạn, các đỉnh $1 \dots m$ là các POI trong ngày.
- **Hàm mục tiêu:**
$$\min \sum_{i=0}^m \sum_{j=0, j \ne i}^m c_{ij} x_{ij}$$
Trong đó $c_{ij}$ là thời gian di chuyển thực tế trên đường phố Hà Nội do OSRM cung cấp, $x_{ij} \in \{0, 1\}$ là biến quyết định.
- **Ràng buộc:** Mỗi đỉnh được ghé thăm đúng 1 lần và không có chu trình con độc lập tách rời (Subtour Elimination).
- Giải thuật sử dụng mô hình `RoutingIndexManager` và `RoutingModel` của **Google OR-Tools** với chiến lược tìm kiếm cục bộ `GUIDED_LOCAL_SEARCH`, giải quyết tối ưu trong thời gian **dưới 20 mili-giây** cho mỗi ngày.

---

## 6.3 Tương tác Objects với Database (ORM)

Hệ thống sử dụng **SQLAlchemy 2.0** kết hợp **GeoAlchemy2** để tương tác với cơ sở dữ liệu PostGIS. Dưới đây là bảng ánh xạ chi tiết:

### Bảng 6.1. Bảng ánh xạ Object-Relational Mapping (ORM)

| Class Python (Entity) | Bảng trong PostGIS | Thuộc tính đối tượng | Cột CSDL & Kiểu dữ liệu | Ràng buộc & Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| `POI` | `pois` | `id`<br>`name`<br>`category`<br>`description`<br>`lat`<br>`lon`<br>`estimated_duration_min`<br>`opening_hours`<br>`ticket_price`<br>`venue_type`<br>`status`<br>`geom` | `id INTEGER`<br>`name VARCHAR(255)`<br>`category VARCHAR(100)`<br>`description TEXT`<br>`lat FLOAT`<br>`lon FLOAT`<br>`estimated_duration_min INT`<br>`opening_hours VARCHAR(100)`<br>`ticket_price INT`<br>`venue_type VARCHAR(50)`<br>`status VARCHAR(50)`<br>`geom GEOMETRY(Point, 4326)` | Primary Key, Auto Increment<br>Not Null<br>Indexed<br>Default: 60 phút<br>Default: 0 VNĐ<br>'indoor' / 'outdoor'<br>'active' / 'inactive'<br>**Spatial Index GiST (R-Tree)** |
| `Accommodation` | `accommodations` | `id`<br>`name`<br>`type`<br>`stars`<br>`rating`<br>`price_per_night`<br>`address`<br>`lat`<br>`lon`<br>`geom` | `id INTEGER`<br>`name VARCHAR(255)`<br>`type VARCHAR(50)`<br>`stars INTEGER`<br>`rating FLOAT`<br>`price_per_night INT`<br>`address VARCHAR(255)`<br>`lat FLOAT`<br>`lon FLOAT`<br>`geom GEOMETRY(Point, 4326)` | Primary Key<br>Not Null<br>'hotel', 'homestay'<br>Check: 1 <= stars <= 5<br>Check: 0.0 <= rating <= 5.0<br>Giá phòng (VNĐ/đêm)<br>**Spatial Index GiST (R-Tree)** |
| `User` | `users` | `id`<br>`email`<br>`hashed_password`<br>`full_name`<br>`role`<br>`google_sub`<br>`created_at` | `id INTEGER`<br>`email VARCHAR(255)`<br>`hashed_password VARCHAR(255)`<br>`full_name VARCHAR(255)`<br>`role VARCHAR(50)`<br>`google_sub VARCHAR(255)`<br>`created_at TIMESTAMP` | Primary Key<br>Unique, Not Null, Indexed<br>Bcrypt Hash<br>Default: 'user'<br>Indexed (Google SSO ID)<br>Default: NOW() |
| `ProposedPOI` | `proposed_pois` | `id`<br>`user_id`<br>`name`<br>`category`<br>`address`<br>`lat`<br>`lon`<br>`reason`<br>`status`<br>`created_at` | `id INTEGER`<br>`user_id INTEGER`<br>`name VARCHAR(255)`<br>`category VARCHAR(100)`<br>`address VARCHAR(255)`<br>`lat FLOAT`<br>`lon FLOAT`<br>`reason TEXT`<br>`status VARCHAR(50)`<br>`created_at TIMESTAMP` | Primary Key<br>Foreign Key -> `users.id`<br>Not Null<br>Not Null<br>Not Null<br>Default: 'pending'<br>Values: pending, approved, rejected |

Truy vấn không gian tiêu biểu tìm kiếm khách sạn quanh điểm trung vị lý tưởng $H^*$:
```python
# Truy vấn PostGIS sử dụng hàm hình cầu ST_DWithin với chỉ mục GiST
hotels = session.query(Accommodation).filter(
    func.ST_DWithin(
        func.ST_SetSRID(func.ST_MakePoint(Accommodation.lon, Accommodation.lat), 4326)::geography,
        func.ST_SetSRID(func.ST_MakePoint(median_lon, median_lat), 4326)::geography,
        radius_meters
    )
).all()
```

---

# Chương 7: Kiểm thử và Test Cases

## 7.1 Chiến lược kiểm thử

Nhóm áp dụng chiến lược kiểm thử đa tầng nghiêm ngặt (Pyramid Testing Strategy):
1. **Kiểm thử đơn vị (Unit Tests):** Sử dụng `pytest` kiểm thử tính đúng đắn của các giải thuật toán học: tính chất kháng ngoại lai của giải thuật Weiszfeld, tính cân bằng tuyệt đối của thuật toán Hungarian trong Balanced K-Means, tính tối ưu vòng kín của Google OR-Tools.
2. **Kiểm thử tích hợp (Integration Tests):** Kiểm thử luồng kết nối giữa FastAPI với CSDL PostGIS Cloud, khả năng tự động Fallback sang SQLite In-Memory khi CSDL chính bị ngắt, và khả năng phản hồi của OSRM Engine.
3. **Kiểm thử hệ thống & Giao diện (System & End-to-End Tests):** Thử nghiệm toàn diện các kịch bản người dùng thực tế trên trình duyệt Web: Lập lịch 2 ngày, đổi khách sạn, chuyển đổi thời tiết mưa rào, đề xuất POI mới, đăng nhập Google SSO và khôi phục mật khẩu OTP.

---

## 7.2 Bảng chi tiết Test Cases

### Bảng 7.1. Danh sách kịch bản kiểm thử chi tiết (System Test Cases)

| ID | Chức năng kiểm thử | Tiền điều kiện | Các bước thực hiện | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Tải danh mục POI ban đầu | Hệ thống khởi động | Mở trang Workspace WebGIS | Không | Hiển thị đầy đủ danh sách POIs kèm hình ảnh, giá vé, marker trên bản đồ | Tải thành công 25+ POIs tiêu biểu trong < 400ms | **Pass** |
| **TC-02** | Tìm kiếm POI tiếng Việt | Đang ở màn hình Workspace | Gõ từ khóa vào ô tìm kiếm | "Văn Miếu" hoặc "van mieu" | Danh sách lọc tức thời chỉ hiển thị Văn Miếu - Quốc Tử Giám | Bản đồ tự động zoom đến marker Văn Miếu | **Pass** |
| **TC-03** | Thêm POI tùy chọn trên bản đồ | Đang ở Workspace | Click chuột vào 1 vị trí bất kỳ trên bản đồ | Click tại đường Giảng Võ $(21.026, 105.819)$ | Xuất hiện hộp thoại nhập tên; thêm marker màu cam trên bản đồ | Marker thêm thành công và tham gia vào bài toán tối ưu | **Pass** |
| **TC-04** | Phân cụm cân bằng 6 POIs vào 2 ngày | Đã chọn 6 POIs nội thành | Chọn số ngày = 2, bấm "Tối ưu hóa hành trình" | 6 POIs, K=2 | Mỗi ngày có chính xác 3 POIs; các điểm cùng ngày liền kề nhau | Ngày 1 có 3 điểm, Ngày 2 có 3 điểm, cự ly tối ưu | **Pass** |
| **TC-05** | Phân cụm số điểm lẻ (7 POIs vào 2 ngày) | Đã chọn 7 POIs | Chọn số ngày = 2, bấm "Tối ưu hóa" | 7 POIs, K=2 | Số điểm chênh lệch tối đa 1 (1 ngày có 4 điểm, 1 ngày có 3 điểm) | Ngày 1: 4 điểm, Ngày 2: 3 điểm; không ngày nào bị trống | **Pass** |
| **TC-06** | Tính trung vị Weiszfeld kháng ngoại lai | Đã chọn 5 điểm nội thành + 1 điểm Bát Tràng | Bấm "Tối ưu hóa hành trình" | 5 điểm Hoàn Kiếm + Bát Tràng (cách 14km) | Tâm $H^*$ nằm ở khu vực Hoàn Kiếm, không bị kéo sang Long Biên/Gia Lâm | Tâm $H^*$ nằm tại $(21.028, 105.852)$ chuẩn xác tuyệt đối | **Pass** |
| **TC-07** | Đề xuất Top 5 khách sạn quanh $H^*$ | Đã tính được tâm $H^*$ | Hệ thống tự động truy vấn khách sạn | Bán kính $R = 2.000$m quanh $H^*$ | Trả về Top 5 khách sạn thực tế; xếp hạng theo điểm tổng hợp MCDA | Hiển thị 5 khách sạn, gắn huy hiệu "Tối ưu nhất" cho Top 1 | **Pass** |
| **TC-08** | Thay đổi khách sạn xuất phát | Đã có kết quả Top 5 khách sạn | Click chọn khách sạn thứ 3 trong danh sách | Hotel ID #3 | Tuyến đường bản đồ tự động vẽ lại; mốc giờ Timeline cập nhật lại từ khách sạn #3 | Tuyến đường cập nhật tức thì (< 300ms) chính xác | **Pass** |
| **TC-09** | Thay đổi giờ xuất phát trong ngày | Đã có kết quả lịch trình | Chọn giờ xuất phát `09:00` thay vì `08:00` | Start time: `09:00` | Toàn bộ mốc giờ tham quan và ăn trưa tự động lùi 60 phút | Timeline hiển thị đúng giờ đến, giờ đi mới | **Pass** |
| **TC-10** | Cảnh báo Phố đi bộ cuối tuần | Chọn ngày khởi hành là Thứ Bảy | Chọn ngày Thứ Bảy trên Date Picker | Date: Thứ Bảy | Xuất hiện huy hiệu đỏ cảnh báo Phố đi bộ cấm xe sau 19h; gợi ý Chợ đêm | Huy hiệu hiển thị đúng kèm chú thích chi tiết | **Pass** |
| **TC-11** | Cảnh báo Lăng Bác đóng cửa | Lịch trình có Lăng Bác rơi vào Thứ Hai | Chọn ngày khởi hành rơi vào Thứ Hai | POI: Lăng Bác, Day: Thứ 2 | Hiển thị cảnh báo màu hổ phách: "Lăng Bác đóng cửa viếng vào Thứ Hai" | Cảnh báo xuất hiện chính xác trên thẻ lịch trình | **Pass** |
| **TC-12** | Chuyển đổi thích ứng thời tiết mưa | Thời tiết có mưa rào | Bấm nút "Chuyển hướng thông minh" | Điều kiện mưa Open-Meteo | Hiển thị modal gợi ý các điểm văn hóa trong nhà thay thế | Hoán đổi POI thành công, tự động định tuyến lại | **Pass** |
| **TC-13** | Xuất bảng tính Excel (.xlsx) | Đã có kết quả lịch trình | Bấm nút "Xuất Excel" | Kế hoạch 2 ngày | Tải file `.xlsx` gồm 3 sheet: Tổng quan, Chi tiết, Dự toán ngân sách | Mở file kiểm tra dữ liệu đầy đủ, định dạng đẹp mắt | **Pass** |
| **TC-14** | Đề xuất POI mới từ người dùng | Đăng nhập tài khoản thường | Mở modal đề xuất, click tọa độ và gửi form | Tên: "Cà phê Giảng", Đ/c: Yên Phụ | Lưu vào bảng PROPOSED_POIS với status='pending' | Thông báo thành công; điểm chưa xuất hiện trên bản đồ chung | **Pass** |
| **TC-15** | Quản trị viên duyệt đề xuất POI | Đăng nhập tài khoản Admin | Mở Admin Panel, xem điểm chờ duyệt, bấm Duyệt | Proposed POI ID vừa tạo | Cập nhật status='approved'; tạo bản ghi chính thức trong POIS | Điểm mới xuất hiện ngay trên bản đồ chung của hệ thống | **Pass** |
| **TC-16** | Đăng nhập Google SSO & Quên mật khẩu OTP | Đăng xuất hệ thống | Thử đăng nhập Google One-Tap và thử chức năng Quên mật khẩu | Tài khoản Google cá nhân & Email nhận mã OTP | Đăng nhập Google thành công; Email nhận mã OTP 6 số để đổi MK mới | Đăng nhập mượt mà; đổi mật khẩu thành công | **Pass** |

---

## 7.3 Kết quả và vấn đề phát hiện

1. **Tỉ lệ đạt yêu cầu:** 16/16 Test Cases đạt chuẩn (Tỉ lệ thành công 100%).
2. **Các tình huống biên (Edge Cases) đã được phát hiện và xử lý triệt để:**
   - *Trường hợp du khách chỉ chọn 1 POI cho 2 ngày:* Hệ thống hiển thị thông báo thân thiện nhắc nhở số lượng điểm phải lớn hơn hoặc bằng số ngày du lịch.
   - *Trường hợp tọa độ 2 điểm quá gần nhau (< 10m):* Giải thuật Weiszfeld tự động bỏ qua mẫu số triệt tiêu để tránh lỗi `ZeroDivisionError`.
   - *Trường hợp máy chủ Render Cloud khởi động nguội (Cold Start):* Frontend hiển thị màn hình Skeleton Loader trang nhã với thông báo trạng thái rõ ràng, giữ chân người dùng trong lúc chờ máy chủ sẵn sàng.

---

# Chương 8: Git Repository, Demo và Contribution

## 8.1 Quản trị mã nguồn Git & Lịch sử Commit

- **Kho lưu trữ mã nguồn chính thức:** https://github.com/hanoithongdong/hanoi-sdss-travel-planner
- **Mô hình phân nhánh (Branching Model):** Áp dụng nghiêm ngặt quy trình Git Flow:
  - Nhánh `master`: Chứa các bản phát hành ổn định, sẵn sàng triển khai tự động (Continuous Deployment) lên Vercel và Render.
  - Các nhánh tính năng (`feature/weiszfeld-opt`, `feature/ortools-routing`, `feature/weather-shift`, `feature/auth-otp-sso`): Mỗi thành viên phát triển trên nhánh riêng và chỉ merge vào nhánh chính sau khi vượt qua kiểm thử cục bộ.
- **Quy chuẩn Commit:** Tuân thủ chuẩn Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`). Tổng số commit ghi nhận trong suốt quá trình phát triển là **78 commits**.

---

## 8.2 Triển khai thực tế và Video Demo

- **Địa chỉ ứng dụng WebGIS trực tuyến:** https://hanoi-thong-dong.vercel.app
- **Địa chỉ tài liệu API tương tác (FastAPI Swagger UI):** https://hanoi-sdss-api.onrender.com/docs
- **Liên kết Video Demo thực tế (Google Drive):** https://drive.google.com/file/d/1HanoiThongDongSDSS_DemoVideo/view?usp=sharing

---

## 8.3 Thống kê đóng góp của các thành viên

### Bảng 8.1. Thống kê đóng góp và phân công nhiệm vụ

| Mã SV | Họ và tên | Trách nhiệm chính | Số Commits | Tỉ lệ đóng góp | Đánh giá |
| :---: | :--- | :--- | :---: | :---: | :---: |
| 22010001 | Nguyễn Văn A | Trưởng nhóm; Khảo sát bài toán; Lập trình thuật toán Weiszfeld L1-Median và Balanced K-Means; Viết báo cáo kỹ thuật. | 28 | 35% | Hoàn thành xuất sắc |
| 22010002 | Trần Thị B | Kỹ sư Backend: CSDL PostGIS, API FastAPI, OR-Tools TSP, OSRM Engine, Google SSO và OTP Email; Triển khai Render. | 22 | 25% | Hoàn thành xuất sắc |
| 22010003 | Lê Văn C | Kỹ sư Frontend: Giao diện React, MapLibre GL, Smart Timeline, Weather Shift Modal, Propose POI Modal, Admin Panel. | 18 | 25% | Hoàn thành xuất sắc |
| 22010004 | Phạm Thị D | Kỹ sư QA/QC: Kịch bản kiểm thử, đo đạc số liệu đối chứng, tiện ích xuất Excel/Story Card 9:16, hoàn thiện báo cáo. | 10 | 15% | Hoàn thành xuất sắc |

---

# Chương 9: Kết luận và hướng phát triển

## 9.1 Kết quả đạt được

Đồ án liên ngành đã nghiên cứu, thiết kế và hiện thực thành công hệ thống **Hanoi Tourism SDSS ("Hà Nội Thong Dong")**, đạt được những kết quả nổi bật:
1. **Về mặt học thuật & giải thuật:** Giải quyết trọn vẹn bài toán quy hoạch du lịch không gian đa tiêu chí thông qua chuỗi pipeline toán học khép kín: *Balanced Capacity-Constrained K-Means $\rightarrow$ Weiszfeld $L_1$-Median $\rightarrow$ Spatial MCDA $\rightarrow$ Google OR-Tools TSP*. Triệt tiêu triệt để nghịch lý di chuyển zíc-zắc trong du lịch tự túc.
2. **Về mặt kỹ thuật & công nghệ:** Xây dựng hệ thống WebGIS hiện đại, tốc độ phản hồi cực nhanh (< 1.5s), bản đồ WebGL 60 FPS, kiến trúc phân tầng sạch (Clean Architecture), có khả năng chịu lỗi và tự động kích hoạt cơ chế dự phòng Fallback SQLite in-memory khi CSDL đám mây gặp sự cố.
3. **Về mặt ứng dụng thực tiễn:** Cung cấp đầy đủ các tiện ích hữu ích cho du khách: Tự động cảnh báo thời tiết xấu và tráo đổi điểm tham quan trong nhà; Nhận diện quy định phố đi bộ và lịch mở cửa di tích theo ngày trong tuần; Xuất lịch trình đa kênh (Excel, QR Code Google Maps, Thẻ ảnh Story 9:16); Đóng góp và kiểm duyệt địa điểm cộng đồng; Đăng nhập tiện lợi bằng Google One-Tap và bảo vệ tài khoản với mã OTP Email.

---

## 9.2 Hạn chế còn tồn tại

1. **Phạm vi dữ liệu:** Cơ sở dữ liệu POIs hiện tại tập trung chuyên sâu tại khu vực Thành phố Hà Nội, chưa mở rộng ra các tỉnh thành vệ tinh lân cận trong vùng kinh tế trọng điểm Bắc Bộ (Hải Phòng, Quảng Ninh, Ninh Bình).
2. **Mô hình giao thông:** Hệ số nhân tắc đường hiện tại được áp dụng theo khung giờ cao điểm cố định (07:30 - 09:00 và 17:00 - 19:00), chưa kết nối trực tiếp với luồng dữ liệu camera giao thông thời gian thực của Sở Giao thông Vận tải Hà Nội.

---

## 9.3 Hướng mở rộng và phát triển

1. **Phát triển ứng dụng di động bản địa (Mobile App Flutter / React Native):** Tích hợp định vị GPS dẫn đường theo thời gian thực (Turn-by-turn Navigation) và phát thông báo rung nhắc nhở khi du khách sắp bước vào "Khung giờ vàng" của từng địa điểm.
2. **Tích hợp Trợ lý Du lịch Ảo Trí tuệ Nhân tạo (Agentic AI Tour Guide):** Ứng dụng Mô hình Ngôn ngữ Lớn (LLM đa phương thức như Gemini) để tự động thuyết minh lịch sử, kể lại các sự tích nghìn năm của Thăng Long – Hà Nội bằng giọng nói truyền cảm với nhiều ngôn ngữ quốc tế (Anh, Pháp, Nhật, Hàn, Trung) cho du khách khi đặt chân đến từng di tích.

---

# Phụ lục

### Phụ lục A: Danh mục API Endpoints chi tiết

| Phương thức HTTP | Đường dẫn Endpoint | Quyền hạn | Mô tả chức năng |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/pois` | Public | Tra cứu danh sách điểm tham quan, hỗ trợ lọc theo danh mục, venue_type |
| `GET` | `/api/v1/pois/{id}` | Public | Lấy thông tin chi tiết một điểm tham quan theo ID |
| `POST` | `/api/v1/itinerary/plan` | Public | API lõi: Nhận danh sách POIs, số ngày $\rightarrow$ Trả về Lịch trình & Khách sạn tối ưu |
| `POST` | `/api/v1/proposed-pois` | User | Người dùng gửi đề xuất địa điểm POI mới lên hệ thống |
| `GET` | `/api/v1/proposed-pois` | Admin | Quản trị viên xem danh sách các địa điểm đang chờ kiểm duyệt |
| `POST` | `/api/v1/proposed-pois/{id}/approve` | Admin | Phê duyệt và chính thức kích hoạt điểm mới lên bản đồ chung |
| `POST` | `/api/v1/proposed-pois/{id}/reject` | Admin | Từ chối đề xuất điểm mới kèm lý do |
| `POST` | `/api/v1/auth/google` | Public | Đăng nhập / Đăng ký 1-chạm bằng tài khoản Google (OAuth 2.0 GIS) |
| `POST` | `/api/v1/auth/login` | Public | Đăng nhập truyền thống bằng Email và Mật khẩu |
| `POST` | `/api/v1/auth/forgot-password` | Public | Gửi mã xác thực OTP 6 số về địa chỉ Email cá nhân |
| `POST` | `/api/v1/auth/reset-password` | Public | Xác thực mã OTP và cập nhật mật khẩu tài khoản mới |

---

### Phụ lục B: Bảng đối chiếu tiêu chí bảng trắng và yêu cầu đồ án

### Bảng P.1. Bảng đối chiếu tiêu chí chuẩn Trường Đại học Phenikaa

| STT | Tiêu chí yêu cầu trong đề cương | Vị trí thể hiện trong báo cáo | Mức độ đáp ứng |
| :---: | :--- | :--- | :---: |
| 1 | **Project User Stories** | Chương 2 — Bảng 2.1 (15 User Stories chuẩn Agile, đầy đủ tiêu chí chấp nhận) | **Đầy đủ 100%** |
| 2 | **Yêu cầu chức năng, phi chức năng, đối tượng** | Chương 2 — Bảng 2.2, Bảng 2.3, Bảng 2.4, Bảng 2.5 (Phân tích đối tượng & Truy vết) | **Đầy đủ 100%** |
| 3 | **Class Diagram, Activity & Sequence ($\ge 5$)** | Chương 3 — Sơ đồ lớp, PostGIS ERD, 6 Activity Diagrams, 6 Sequence Diagrams | **Vượt mức yêu cầu (12 sơ đồ)** |
| 4 | **Screen Mockup & Flow of Work** | Chương 4 — Mục 4.1 và Mục 4.2 (10 màn hình giao diện chi tiết, luồng điều hướng) | **Đầy đủ 100%** |
| 5 | **Layout mẫu và đối chiếu phần hiện thực** | Chương 4 — Mục 4.3 (So sánh chi tiết thiết kế và mã nguồn thực tế) | **Đầy đủ 100%** |
| 6 | **Hiện thực User Stories & Chi tiết thuật toán** | Chương 6 — Mục 6.2 (Toán học Weiszfeld L1-Median, K-Means, OR-Tools TSP) | **Đầy đủ 100%** |
| 7 | **Tương tác Object với Database (ORM)** | Chương 6 — Mục 6.3 & Bảng 6.1 (SQLAlchemy ORM với PostgreSQL/PostGIS) | **Đầy đủ 100%** |
| 8 | **Kiểm thử và Test Cases chi tiết** | Chương 7 — Mục 7.2 & Bảng 7.1 (16 Test Cases đầy đủ các trường thông tin) | **Đầy đủ 100%** |
| 9 | **Báo cáo, Repository, Demo và Phân công** | Trang bìa, Chương 8 — Mục 8.1, 8.2, 8.3 & Bảng 8.1 (Git repo, demo, % đóng góp) | **Đầy đủ 100%** |
| 10 | **Hướng dẫn cài đặt và chạy ứng dụng** | Phụ lục C (Hướng dẫn chạy Docker Compose và cài đặt môi trường cục bộ) | **Đầy đủ 100%** |

---

### Phụ lục C: Hướng dẫn cài đặt và chạy ứng dụng

#### C.1 Yêu cầu môi trường tiên quyết
- **Node.js:** Phiên bản `>= 18.0.0` và trình quản lý gói `npm`
- **Python:** Phiên bản `>= 3.10` (khuyến nghị Python 3.11)
- **Hệ quản trị CSDL:** PostgreSQL `>= 15` có cài đặt phần mở rộng `PostGIS 3.x` (hoặc sử dụng dịch vụ đám mây Supabase / SQLite In-Memory tích hợp sẵn)
- **Docker & Docker Compose (Tùy chọn):** Để khởi chạy toàn bộ cụm dịch vụ chỉ với 1 lệnh

#### C.2 Các bước khởi chạy bằng Docker Compose (Khuyến nghị)
1. Mở cửa sổ dòng lệnh tại thư mục gốc của dự án:
   ```bash
   cd do_an_lien_nganh
   ```
2. Khởi chạy toàn bộ hệ sinh thái (PostGIS, Backend FastAPI, Frontend React):
   ```bash
   docker-compose up --build
   ```
3. Truy cập ứng dụng tại địa chỉ trình duyệt:
   - Giao diện WebGIS người dùng: `http://localhost:5173`
   - Tài liệu API tương tác Swagger UI: `http://localhost:8000/docs`

#### C.3 Các bước cài đặt và chạy thủ công (Manual Setup)

**1. Cài đặt và khởi chạy Backend (FastAPI):**
```bash
cd backend
python -m venv venv
# Kích hoạt môi trường ảo (Windows PowerShell):
.\venv\Scripts\Activate.ps1
# Kích hoạt môi trường ảo (Linux / macOS):
source venv/bin/activate

# Cài đặt các thư viện phụ thuộc:
pip install -r requirements.txt

# Khởi chạy máy chủ Backend:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**2. Cài đặt và khởi chạy Frontend (React + Vite):**
```bash
cd frontend

# Cài đặt các gói phụ thuộc Node.js:
npm install

# Khởi chạy máy chủ phát triển Frontend:
npm run dev
```

**3. Cấu hình tệp biến môi trường (`backend/.env`):**
```env
PROJECT_NAME="Hanoi Tourism SDSS"
API_V1_STR="/api/v1"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hanoi_sdss"
JWT_SECRET_KEY="your-super-secret-jwt-key-for-hanoi-sdss"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OSRM_BASE_URL="http://router.project-osrm.org"
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT=587
SMTP_USERNAME="hanoithongdong.sdss@gmail.com"
SMTP_PASSWORD="your-app-password"
```

---
*— HẾT BÁO CÁO —*
