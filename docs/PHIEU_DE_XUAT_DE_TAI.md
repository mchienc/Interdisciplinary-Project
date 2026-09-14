# PHIẾU ĐỀ XUẤT ĐỀ TÀI ĐỒ ÁN LIÊN NGÀNH
## INTERDISCIPLINARY PROJECT PROPOSAL

---

### PHẦN I: THÔNG TIN CHUNG (GENERAL INFORMATION)

- **Tên đề tài (Tiếng Việt):** Hệ thống WebGIS phân tích không gian đô thị: Đánh giá mật độ phân bố và khả năng tiếp cận các điểm dịch vụ công cộng và thương mại (Y tế, Giáo dục, Thương mại)
- **Project Title (English):** Urban Spatial Analysis WebGIS System: Evaluating Distribution Density and Accessibility of Public and Commercial Amenities (Healthcare, Education, Commerce)
- **Giảng viên hướng dẫn (Academic Advisor):** ThS. Nguyễn Lệ Thu
- **Nhóm chủ đề (Category):** Phát triển hệ thống phần mềm phục vụ các ngành Khoa học khác có liên quan (Hệ thống Thông tin Địa lý - GIS & Quy hoạch Đô thị)
- **Thời gian thực hiện (Duration):** 9 tuần (17/08/2026 – 18/10/2026)
- **Phạm vi không gian thử nghiệm (Case Study Area):** Thành phố Hà Nội (Khu vực toàn bộ 30 quận, huyện và thị xã)

---

### PHẦN II: BẢN TIẾNG VIỆT (VIETNAMESE VERSION)

#### 1. Tính cấp thiết và Bối cảnh nghiên cứu
Trong kỷ nguyên số hóa và đô thị hóa thông minh (Smart Urbanism), việc phân bổ không gian của các tiện ích dịch vụ công cộng—bao gồm **Y tế (Bệnh viện, Trạm y tế)**, **Giáo dục (Trường Đại học, Trường học các cấp)** và **Thương mại (Trung tâm thương mại - TTTM, Siêu thị)**—đóng vai trò then chốt đối với sự phát triển cân bằng dân sinh, giảm áp lực giao thông và nâng cao chất lượng sống của cư dân đô thị.
Hiện nay, dữ liệu không gian tiện ích công cộng tại các thành phố lớn như Hà Nội còn phân tán, thiếu các công cụ trực quan hóa tập trung trên nền tảng Web có khả năng tương tác nhanh và hỗ trợ phân tích đa chiều cho các nhà hoạch định, nhà đầu tư kinh doanh lẫn người dân.
Đề tài xây dựng một hệ thống **WebGIS mã nguồn mở (FOSS4G)** tích hợp năng lực quản trị CSDL không gian lớn, xử lý giải thuật phân tích không gian thời gian thực (Buffer đa vành đai, Voronoi, Kernel Density) nhằm giải quyết bài toán đánh giá toàn diện khả năng tiếp cận các dịch vụ công đô thị.

#### 2. Mục tiêu đề tài
- **Mục tiêu tổng quát:** Xây dựng hoàn chỉnh nền tảng WebGIS đa tầng phục vụ thu thập, quản lý, mô phỏng trực quan và tính toán các chỉ số phân tích không gian liên quan đến hệ thống Tiện ích Công cộng (Y tế, Giáo dục, Thương mại) tại TP. Hà Nội.
- **Mục tiêu cụ thể:**
  1. *Dữ liệu & CSDL:* Thu thập hơn 2,750 điểm tiện ích công cộng (408 cơ sở y tế, 2,036 trường học, 306 TTTM/siêu thị) và ranh giới 30 quận/huyện từ OpenStreetMap và geoBoundaries OGC; chuẩn hóa hình học và lưu trữ trên **PostgreSQL/PostGIS** với chỉ mục GiST Index.
  2. *Giải thuật không gian (Spatial Analytics):* Cài đặt các mô hình phân tích chuyên biệt:
     - **Phân tích Y tế (Healthcare):** Bán kính "Giờ vàng cấp cứu" ($3000m, 5000m$) đánh giá vùng trũng dịch vụ y tế.
     - **Phân tích Giáo dục (Education):** Bán kính "Đi bộ an toàn tới trường" ($500m, 1000m$).
     - **Phân tích Thương mại (Commerce):** Vùng bao phủ bán lẻ và đa giác cạnh tranh Voronoi.
     - Ước lượng mật độ hạt nhân (**Kernel Density Estimation - KDE**) xác định các điểm nóng (Hotspots) tiện ích.
  3. *Hệ thống phần mềm:* Phát triển kiến trúc WebGIS Workstation hiện đại, hỗ trợ bảng dữ liệu thuộc tính 2 chiều, công cụ đo đạc hình học vẽ tay, xuất báo cáo CSV/GeoJSON, phản hồi dưới 1 giây.

#### 3. Đối tượng và Phạm vi nghiên cứu
- **Đối tượng nghiên cứu:** 
  - Điểm không gian (Point of Interest - POI): Vị trí, quy mô, thương hiệu của các TTTM, siêu thị phức hợp.
  - Hạ tầng liên quan (Polygon/LineString): Ranh giới quận/huyện/phường, mạng lưới giao thông đường bộ trục chính, mật độ dân số theo đơn vị hành chính.
- **Phạm vi kỹ thuật:** Hệ thống Web ứng dụng kiến trúc Client-Server, công nghệ mã nguồn mở (Open-source Geo-stack: PostGIS + Python FastAPI / GeoServer + React/Mapbox GL JS).

#### 4. Phương pháp nghiên cứu & Giải pháp công nghệ
- **Phương pháp thu thập & Tiền xử lý dữ liệu:**
  - Dùng **Overpass API** thu thập POI thương mại, đường bộ từ OSM.
  - Sử dụng **QGIS** để kiểm tra tính toàn vẹn hình học, chuyển đổi hệ toạ độ (CRS Transformation) và làm sạch dữ liệu thuộc tính.
- **Phương pháp phân tích không gian định lượng:**
  - Áp dụng các toán tử không gian PostGIS (`ST_Buffer`, `ST_Contains`, `ST_Distance`, `ST_Union`, `ST_ClusterKMeans`).
  - Áp dụng giải thuật ước lượng mật độ phi tham số Kernel Density:
    $$\hat{f}(x) = \frac{1}{n h^2} \sum_{i=1}^{n} K\left(\frac{x - x_i}{h}\right)$$
- **Kiến trúc công nghệ đề xuất:**
  - *Data Tier:* PostgreSQL 16 + PostGIS 3.4 (tối ưu hóa không gian qua Spatial GiST Index).
  - *Service / Backend Tier:* Python (FastAPI + GeoPandas + Shapely) kết hợp GeoServer phục vụ chuẩn OGC WMS/WFS.
  - *Client / Presentation Tier:* React.js (Vite), Mapbox GL JS / Leaflet, Turf.js (xử lý client-side), TailwindCSS, Chart.js.

#### 5. Kế hoạch thực hiện theo khung 9 tuần
| Tuần | Mốc thời gian | Nội dung công việc chính | Sản phẩm bàn giao (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Tuần 1** | 17/08 - 23/08 | Thành lập nhóm, khảo sát yêu cầu, thống nhất kiến trúc, lập Phiếu đề xuất đề tài | Phiếu đề xuất đề tài (VN/EN), Biên bản họp tuần 1 |
| **Tuần 2** | 24/08 - 30/08 | Thu thập dữ liệu OSM (Hà Nội), làm sạch bằng QGIS, thiết kế Schema CSDL PostGIS | Bộ dữ liệu GeoJSON/Shapefile chuẩn, Script tạo DB PostGIS |
| **Tuần 3** | 31/08 - 06/09 | Xây dựng REST API backend kết nối PostGIS, cài đặt API truy vấn không gian cơ bản | RESTful APIs (CRUD POI, filter theo bán kính, quận huyện) |
| **Tuần 4** | 07/09 - 13/09 | Cài đặt các thuật toán không gian nâng cao (Buffer, Voronoi, KDE, Spatial Aggregation) | Service giải thuật không gian, GeoServer WMS/WFS (nếu tích hợp) |
| **Tuần 5** | 14/09 - 20/09 | Xây dựng giao diện Frontend WebGIS: Base map, lớp dữ liệu chuyên đề, công cụ đo đạc | Giao diện bản đồ tương tác React + Mapbox GL JS/Leaflet |
| **Tuần 6** | 21/09 - 27/09 | Tích hợp công cụ phân tích không gian lên UI (Heatmap, Buffer slider, Voronoi toggle, Chart) | Module phân tích hoàn chỉnh trên giao diện web |
| **Tuần 7** | 28/09 - 04/10 | Kiểm thử hiệu năng truy vấn, đánh giá kết quả phân tích đô thị, viết báo cáo thử nghiệm | Biên bản kiểm thử (Test report), dự thảo Báo cáo chương 1-4 |
| **Tuần 8** | 05/10 - 11/10 | Đóng gói hệ thống (Docker Compose), hoàn thiện cuốn Báo cáo đồ án, thiết kế Slide | Docker image/compose, Cuốn Báo cáo hoàn thiện, Slide PPT |
| **Tuần 9** | 12/10 - 18/10 | Luyện tập thuyết trình, vấn đáp thử nghiệm, hoàn tất hồ sơ kiểm định và số hóa | Video demo, Slide sẵn sàng, Hồ sơ bảo vệ nghiệm thu |

#### 6. Kết quả dự kiến đạt được
1. Hệ thống WebGIS chạy hoàn chỉnh trên môi trường Web/Docker với đầy đủ tính năng tra cứu, hiển thị lớp bản đồ chuyên đề và phân tích không gian trực quan.
2. Bản phân tích thực chứng về mạng lưới phân bố TTTM tại Hà Nội, chỉ ra các vùng thiếu hụt dịch vụ (Service deserts) và vùng tập trung cạnh tranh cao.
3. Cuốn Báo cáo đồ án liên ngành hoàn chỉnh chuẩn học thuật, mã nguồn sạch có tài liệu hướng dẫn triển khai chi tiết.

---

### PHẦN III: BẢN TIẾNG ANH (ENGLISH VERSION)

#### 1. Background and Research Significance
In the era of smart urbanization and data-driven governance, the spatial allocation of public amenities and commercial infrastructures—specifically Shopping Malls, Commercial Centers, and modern retail clusters—is instrumental in shaping urban dynamics, socio-economic vitality, and transportation efficiency.
In expanding metropolises such as Hanoi, urban spatial data has grown exponentially; however, it remains fragmented and lacks unified, accessible web platforms for multidimensional spatial inquiry. Traditional Desktop GIS applications (e.g., ArcGIS, QGIS) demand steep computational resources and specialized user training, limiting broader accessibility for urban planners and enterprise stakeholders.
To overcome these limitations, building an open-source **WebGIS platform (FOSS4G)** that integrates scalable spatial database management, high-performance spatial algorithms, and dynamic web visualization represents a vital interdisciplinary intersection between **Computer Science (Software Engineering)** and **Geographic Information Science (Urban Planning)**.

#### 2. Project Objectives
- **General Objective:** Design and implement a 3-tier WebGIS platform tailored for ingesting, managing, visualizing, and executing advanced spatial analytics on commercial centers and public facilities in metropolitan areas.
- **Specific Objectives:**
  1. *Data Engineering & Spatial Modeling:* Collect and standardize urban spatial geometries from OpenStreetMap and open data portals; construct an indexed spatial database on **PostgreSQL/PostGIS** with standard CRS projections (EPSG:4326 / EPSG:3857 / VN-2000).
  2. *Spatial Analytical Algorithms:* Formulate and implement key geospatial processing methods:
     - **Kernel Density Estimation (KDE):** Identify commercial agglomeration hotspots.
     - **Buffer Zone Analysis:** Evaluate service catchments across defined radii (pedestrian: $500m, 1000m$; vehicular: $3000m, 5000m$).
     - **Voronoi / Thiessen Tessellation:** Delineate influence zones and service boundary competition.
     - **Network Accessibility:** Preliminary travel-time and service reach assessment.
  3. *Software Engineering & Performance:* Construct a scalable 3-tier architecture conforming to OGC web standards, providing sub-second spatial query response times and intuitive cartographic interactions on modern web browsers.

#### 3. Scope and Research Domain
- **Research Objects:**
  - Points of Interest (POIs): Geospatial positions, capacity, brand hierarchy of shopping malls and commercial complexes.
  - Urban Basemap Geometries: Administrative boundaries (districts/wards), road transportation networks, and population distribution layers across central Hanoi.
- **Technical Scope:** Full-stack WebGIS application utilizing open-source geospatial software (FOSS4G stack).

#### 4. Methodology and Technology Stack
- **Data Acquisition & Preprocessing:** OSM Overpass API, QGIS for topological validation and CRS projection alignment.
- **Spatial Processing:** PostGIS spatial queries (`ST_Buffer`, `ST_DWithin`, `ST_Contains`, `ST_ClusterKMeans`), Python GeoPandas, Shapely, and Turf.js.
- **Technology Architecture:**
  - *Data Layer:* PostgreSQL 16 + PostGIS 3.4.
  - *Backend & Geoprocessing Layer:* Python FastAPI / GeoPandas (or Spring Boot / GeoServer WMS/WFS).
  - *Presentation Layer:* React.js, Mapbox GL JS / Leaflet, Turf.js, TailwindCSS, Chart.js.

#### 5. Expected Deliverables
1. An operational WebGIS application packaged with Docker Compose for single-command deployment.
2. An empirical urban study report analyzing commercial service coverage, identifying underserved urban pockets and competitive clusters.
3. A comprehensive academic project thesis, clean source code repository with documentation, and professional presentation slides.
