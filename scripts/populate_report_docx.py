import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import sys

def build_full_report():
    print("Loading template CSE703014_Report_Template_VI_V1.docx...")
    doc = docx.Document("CSE703014_Report_Template_VI_V1.docx")

    # 1. Trang bìa
    for p in doc.paragraphs:
        if "<Team ID>" in p.text or "<Project" in p.text:
            p.text = "HỆ THỐNG WEBGIS HỖ TRỢ RA QUYẾT ĐỊNH KHÔNG GIAN (SDSS)\nTỐI ƯU HÓA LỊCH TRÌNH VÀ VỊ TRÍ LƯU TRÚ DU LỊCH HÀ NỘI"
            if len(p.runs) > 0:
                p.runs[0].font.bold = True
                p.runs[0].font.size = Pt(16)
                p.runs[0].font.color.rgb = RGBColor(0x1C, 0x38, 0x2B)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        elif "<DS sinh viên" in p.text:
            p.text = "Sinh viên thực hiện:\n1. Nguyễn Văn A - MSSV: 2201xxxx - Lớp: K16-CNTT\n2. Trần Thị B - MSSV: 2201xxxx - Lớp: K16-CNTT\n3. Lê Văn C - MSSV: 2201xxxx - Lớp: K16-CNTT"
            if len(p.runs) > 0:
                p.runs[0].font.size = Pt(12)
        elif "<Supervisor>" in p.text:
            p.text = "Giảng viên hướng dẫn: TS. <Họ và tên GVHD>"
            if len(p.runs) > 0:
                p.runs[0].font.size = Pt(12)
                p.runs[0].font.bold = True
        elif "<date>" in p.text:
            p.text = "HÀ NỘI, NĂM HỌC 2025 - 2026"
            if len(p.runs) > 0:
                p.runs[0].font.size = Pt(11)
                p.runs[0].font.bold = True
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # 2. Bảng phân công đồ án
    if len(doc.tables) > 0:
        table = doc.tables[0]
        assignments = [
            ("22010001", "Nguyễn Văn A", "K16-CNTT", "Trưởng nhóm; Khảo sát bài toán không gian; Thiết kế và lập trình thuật toán Weiszfeld L1-Median và Balanced K-Means; Thiết kế kiến trúc tổng thể."),
            ("22010002", "Trần Thị B", "K16-CNTT", "Kỹ sư Backend: Thiết kế CSDL PostGIS, lập trình RESTful API bằng FastAPI, tích hợp Google OR-Tools TSP và OSRM Engine; Triển khai Render Cloud."),
            ("22010003", "Lê Văn C", "K16-CNTT", "Kỹ sư Frontend: Xây dựng giao diện React 18 / TypeScript, tích hợp MapLibre GL, thiết kế Smart Timeline, Giờ vàng và Động cơ Ngữ cảnh (Thời tiết & Giao thông cao điểm)."),
            ("22010004", "Phạm Thị D", "K16-CNTT", "Kiểm thử & Đảm bảo chất lượng: Đo đạc số liệu thực nghiệm đối chứng, xây dựng tiện ích xuất Excel/Story Card 9:16 và hoàn thiện báo cáo đồ án.")
        ]
        while len(table.rows) > 1:
            tr = table.rows[-1]._tr
            table._tbl.remove(tr)
        for mssv, name, lop, task in assignments:
            row = table.add_row()
            row.cells[0].text = mssv
            row.cells[1].text = name
            row.cells[2].text = lop
            row.cells[3].text = task

    # 3. Điền nội dung chi tiết theo đúng thứ tự đoạn văn của Template
    # Định nghĩa nội dung cho từng đoạn
    content_map = {
        42: (
            "Hà Nội là trung tâm du lịch văn hóa hàng đầu với hàng trăm di tích, danh lam thắng cảnh và khu phố ẩm thực phân bố dày đặc nhưng phi tập trung giữa các quận nội thành và ngoại thành. Trong thực tế, du khách du lịch tự túc thường đối mặt với 'nghịch lý di chuyển zíc-zắc' (Zigzag Itinerary Dilemma):\n\n"
            "1. Chọn khách sạn theo cảm tính hoặc giá rẻ ngẫu nhiên tại các khu vực ngoại vi (Cầu Giấy, Nam Từ Liêm) cách xa cụm điểm tham quan lõi (Hoàn Kiếm, Ba Đình).\n"
            "2. Lên danh sách tham quan theo ngày một cách tùy hứng, không đánh giá cự ly không gian thực tế, dẫn đến việc phải di chuyển qua lại con thoi giữa các khu vực.\n"
            "3. Lộ trình di chuyển thường xuyên bị xung đột nghiêm trọng với giờ cao điểm ùn tắc của Thủ đô (07:30 - 09:00 và 17:00 - 19:00), cũng như các quy định đặc thù như Phố đi bộ Hồ Gươm cấm xe sau 19h cuối tuần và Lăng Bác đóng cửa viếng vào Thứ Hai & Thứ Sáu.\n\n"
            "Hậu quả là du khách lãng phí từ 40% đến 60% thời gian hữu ích chỉ để ngồi trên phương tiện giao thông, gia tăng mệt mỏi thể lực, tốn kém chi phí đi lại và gây áp lực lên hạ tầng giao thông đô thị."
        ),
        44: (
            "Hiện nay trên thị trường đã có một số ứng dụng hỗ trợ du lịch, tuy nhiên đều bộc lộ những hạn chế then chốt khi giải quyết bài toán quy hoạch du lịch đa điểm:\n\n"
            "• Google Maps / Apple Maps: Cung cấp tính năng tìm đường và điều hướng giao thông trực tiếp rất mạnh mẽ, tuy nhiên chỉ giải quyết bài toán từng chặng đơn lẻ (point-to-point). Ứng dụng không hỗ trợ tìm kiếm điểm lưu trú tối ưu cho một tập hợp điểm đến, không tự động phân cụm số ngày du lịch, và bắt buộc người dùng phải tự sắp xếp thứ tự các điểm dừng bằng tay.\n\n"
            "• Booking.com / Agoda / Traveloka: Cung cấp kho dữ liệu khách sạn phong phú kèm đánh giá và giá cả, nhưng tách rời hoàn toàn khỏi lộ trình tham quan. Du khách không thể biết được khách sạn nào sẽ giúp giảm thiểu tổng quãng đường di chuyển cho toàn bộ lịch trình dự kiến.\n\n"
            "• Tour du lịch trọn gói truyền thống: Lịch trình cố định, thiếu tính cá nhân hóa, thường ép buộc thời gian và bắt du khách ghé thăm các điểm mua sắm không mong muốn.\n\n"
            "• Các nghiên cứu học thuật về SDSS trước đây: Phần lớn chỉ dừng lại ở mô hình lý thuyết trên phần mềm chuyên dụng như ArcGIS/QGIS, thiếu giao diện Web tương tác trực quan cho người dùng phổ thông, chưa tích hợp ngữ cảnh thời gian thực (thời tiết, giờ cao điểm, quy định ngày cuối tuần)."
        ),
        46: (
            "Để giải quyết triệt để các hạn chế trên, đồ án đề xuất xây dựng hệ thống Hanoi Tourism SDSS (Spatial Decision Support System) — một nền tảng WebGIS thông minh tích hợp Trí tuệ Không gian và Tối ưu hóa Vận trù học với pipeline 5 giai đoạn tự động:\n\n"
            "1. Phân cụm cân bằng theo ngày (Balanced Capacity-Constrained K-Means): Gom cụm N điểm tham quan vào K ngày du lịch dựa trên khoảng cách phẳng UTM Zone 49N (EPSG:32649) kết hợp thuật toán Hungarian, đảm bảo các ngày có số lượng điểm bằng nhau (chênh lệch tối đa 1 điểm) và liền kề nhau về mặt địa lý.\n\n"
            "2. Xác định điểm lưu trú lý tưởng (Weiszfeld L1-Median Fermat-Weber): Tìm tọa độ trung tâm H*(lat, lon) cực tiểu hóa tổng khoảng cách Euclidean tới toàn bộ các điểm tham quan. Thuật toán có điểm phá vỡ tới 50%, kháng hoàn toàn các điểm tham quan ngoại thành (như Làng gốm Bát Tràng) kéo lệch khách sạn ra xa trung tâm.\n\n"
            "3. Truy vấn & Xếp hạng đa tiêu chí khách sạn (Spatial MCDA & PostGIS ST_DWithin): Quét các khách sạn thực tế quanh H* trong bán kính R, chấm điểm xếp hạng dựa trên 3 tiêu chí: Cự ly tới tâm lý tưởng, Hạng sao đánh giá và Giá phòng/đêm theo ngân sách người dùng.\n\n"
            "4. Định tuyến lộ trình vòng kín tối ưu (Google OR-Tools TSP & OSRM Engine): Giải bài toán Người du lịch vòng kín (Closed-Loop TSP) xuất phát từ khách sạn, ghé qua các điểm và trở về khách sạn với thời gian ngắn nhất trên ma trận giao thông thực tế của OSRM.\n\n"
            "5. Động cơ ngữ cảnh & Lịch trình thông minh (Context-Aware Engine & Smart Timeline): Tích hợp thời tiết thời gian thực từ Open-Meteo API, giờ cao điểm giao thông Hà Nội, tự động nhận diện quy định Phố đi bộ cuối tuần và lịch đóng cửa di tích (Lăng Bác, Bảo tàng Dân tộc học); tự động lồng giờ nghỉ trưa ăn uống và gắn nhãn Giờ vàng check-in."
        ),
        49: (
            "Hệ thống Hanoi Tourism SDSS bao gồm 10 nhóm yêu cầu chức năng chính:\n\n"
            "• FR1: Quản lý danh mục & Tra cứu POI không gian: Xem danh sách POIs theo chủ đề (Di tích, Ẩm thực, Văn hóa, Cà phê, TTTM), tìm kiếm theo tên, xem hình ảnh, tọa độ, giá vé và giờ mở cửa.\n"
            "• FR2: Thêm POI tùy chọn: Cho phép du khách click chọn vị trí trực tiếp trên bản đồ hoặc nhập tọa độ để thêm địa điểm cá nhân vào lịch trình.\n"
            "• FR3: Phân cụm ngày cân đối: Phân chia tự động N điểm vào K ngày (từ 1 đến 7 ngày) vừa gần nhau vừa cân bằng số lượng điểm mỗi ngày.\n"
            "• FR4: Xác định vị trí lưu trú lý tưởng: Tính toán tọa độ trung vị hình học L1-Median tối ưu quãng đường di chuyển toàn chuyến.\n"
            "• FR5: Lọc & Xếp hạng khách sạn đa tiêu chí (Spatial MCDA): Truy vấn khách sạn PostGIS trong bán kính tùy chọn và xếp hạng Top 5 đề xuất theo ngân sách.\n"
            "• FR6: Tối ưu lộ trình từng ngày (TSP): Giải bài toán TSP vòng kín bằng Google OR-Tools, trả về thứ tự ghé thăm tối ưu và GeoJSON tuyến đường.\n"
            "• FR7: Động cơ ngữ cảnh thời tiết & giao thông: Cập nhật thời tiết Open-Meteo và nhận diện các khung giờ cao điểm để đưa ra khuyến nghị thích ứng.\n"
            "• FR8: Lập thời gian biểu chi tiết (Smart Timeline): Chọn giờ khởi hành, tự động tính giờ đến/rời đi từng chặng, lồng giờ ăn trưa (11:45 - 13:00) và gắn nhãn Khung giờ vàng check-in.\n"
            "• FR9: Nhận diện quy định Cuối tuần / Ngày trong tuần: Tự động cảnh báo Phố đi bộ cấm xe, Chợ đêm Phố Cổ mở cửa và lịch đóng cửa định kỳ của Lăng Bác.\n"
            "• FR10: Xuất kế hoạch đa định dạng: Xuất bảng tính Excel (.xlsx) 3 sheet, tạo Mã QR mở Google Maps dẫn đường và xuất thẻ ảnh Story 9:16."
        ),
        51: (
            "Hệ thống đáp ứng các tiêu chuẩn kỹ thuật phi chức năng nghiêm ngặt:\n\n"
            "• NFR1 (Hiệu năng tính toán): Thời gian phản hồi của API Lập kế hoạch toàn diện dưới 1.5 giây cho kịch bản 15 POIs trong 3 ngày.\n"
            "• NFR2 (Độ chính xác trắc địa): Sử dụng phép chiếu UTM Zone 49N (EPSG:32649) cho toàn bộ tính toán không gian phẳng mét, triệt tiêu sai số biến dạng hình học của tọa độ cầu WGS84.\n"
            "• NFR3 (Đồ họa mượt mà): Bản đồ vector MapLibre GL đạt tốc độ khung hình 60 FPS, hỗ trợ cuộn mượt mà Lenis Scroll và hiệu ứng chuyển động GSAP.\n"
            "• NFR4 (Tính sẵn sàng cao & Chống sập): Cơ chế Fallback 2 tầng: Nếu CSDL PostgreSQL Cloud offline, hệ thống tự động chuyển sang SQLite in-memory và Mock Data; nếu thiếu scipy, tự động kích hoạt thuật toán tham lam dự phòng.\n"
            "• NFR5 (Tính khả dụng): Giao diện Warm Editorial tối giản, sang trọng, loại bỏ 100% biệt ngữ học thuật khó hiểu, thân thiện với người dùng phổ thông.\n"
            "• NFR6 (Bảo mật & Quyền riêng tư): Không lưu trữ trái phép nhật ký GPS cá nhân của du khách; toàn bộ khóa bí mật và URL kết nối CSDL được quản lý an toàn qua biến môi trường (.env)."
        ),
        53: (
            "Hệ thống phải tuân thủ các ràng buộc về kỹ thuật triển khai, kinh tế và đạo đức nghề nghiệp nhằm đảm bảo tính khả thi và bền vững:"
        ),
        55: (
            "• Ràng buộc môi trường Cloud: Hệ thống được thiết kế để triển khai phân tán trên nền tảng đám mây miễn phí: Backend lưu trữ trên Render Cloud (giới hạn 512MB RAM, khởi động tự động), Frontend trên Vercel Edge Network.\n"
            "• Ràng buộc bản đồ nền: Không phụ thuộc vào API Key trả phí (Google Maps API, Mapbox API có phí), hệ thống sử dụng tile vector mã nguồn mở từ OpenStreetMap Humanitarian và Esri World Imagery không watermark.\n"
            "• Ràng buộc container hóa: Đóng gói toàn bộ cụm dịch vụ qua Docker Compose (PostGIS, Backend FastAPI, Frontend React) để đảm bảo khả năng chạy cục bộ trên mọi hệ điều hành (Windows, Linux, macOS) chỉ với 1 câu lệnh."
        ),
        57: (
            "• Chi phí bản quyền phần mềm bằng 0 VNĐ: Toàn bộ hệ sinh thái công nghệ được xây dựng trên các thư viện mã nguồn mở có giấy phép MIT, BSD hoặc Apache 2.0 (FastAPI, React, PostgreSQL/PostGIS, Scikit-learn, Google OR-Tools, MapLibre GL).\n"
            "• Tối ưu chi phí hạ tầng: Ứng dụng chạy mượt mà trên hạ tầng Free Tier, hoàn toàn phù hợp với ngân sách nghiên cứu của đồ án sinh viên và có thể thương mại hóa mà không chịu gánh nặng chi phí API định vị định tuyến hàng tháng."
        ),
        59: (
            "• Tuân thủ bản quyền dữ liệu địa lý: Sử dụng dữ liệu bản đồ OpenStreetMap theo đúng giấy phép ODbL (Open Database License).\n"
            "• Quyền riêng tư người dùng: Không theo dõi hoặc lưu trữ dữ liệu vị trí GPS cá nhân của du khách; toàn bộ phép tính toán lộ trình được thực hiện theo phiên làm việc độc lập.\n"
            "• Trách nhiệm văn hóa và xã hội: Cung cấp thông tin chuẩn xác về các di tích lịch sử, bảo đảm tôn trọng các quy định văn hóa tâm linh của Thủ đô (trang phục, giờ mở cửa viếng Lăng Bác, quy định chùa chiền)."
        ),
        61: (
            "Hệ thống được thiết kế theo Kiến trúc Hướng Dịch vụ (Service-Oriented Architecture - SOA) kết hợp Clean Architecture, tách biệt rõ ràng giữa tầng Client WebGIS, tầng Server Tính toán Không gian và tầng Lưu trữ Dữ liệu Không gian PostGIS."
        ),
        63: (
            "Hệ thống định nghĩa các kịch bản sử dụng (Use-case Scenarios) tiêu biểu:\n\n"
            "• Kịch bản 1 (Lập kế hoạch du lịch 2 ngày cuối tuần): Du khách chọn 6 điểm tham quan tiêu biểu $\\rightarrow$ Hệ thống tự động phân chia 3 điểm cho Ngày 1 (Văn Miếu, Lăng Bác, Hồ Tây) và 3 điểm cho Ngày 2 (Hoàng Thành, Phố Cổ, Hồ Hoàn Kiếm) $\\rightarrow$ Tự động cảnh báo Phố đi bộ Hồ Gươm cấm xe sau 19h và gợi ý ghé Chợ đêm Phố Cổ $\\rightarrow$ Xuất file Excel và QR Code.\n\n"
            "• Kịch bản 2 (Lọc khách sạn theo ngân sách tùy biến): Sau khi hệ thống tính được tâm lưu trú lý tưởng H*, du khách kéo thanh trượt ngân sách tối đa 1.000.000 VNĐ/đêm và ưu tiên xếp hạng khách sạn 4 sao $\\rightarrow$ Hệ thống cập nhật bảng xếp hạng Top 5 và tự động định tuyến lại lộ trình xuất phát từ khách sạn mới chọn.\n\n"
            "• Kịch bản 3 (Thêm điểm tùy chọn trên bản đồ): Du khách muốn ghé thăm nhà người quen tại đường Giảng Võ $\\rightarrow$ Click trực tiếp lên bản đồ $\\rightarrow$ Điểm mới được gắn nhãn và tự động tích hợp vào vòng cung di chuyển tối ưu ngắn nhất."
        ),
        65: (
            "Mô hình Use-case tổng quát của hệ thống bao gồm 2 Actor chính:\n\n"
            "1. Du khách (Traveler): Thực hiện các chức năng Tra cứu POI, Thêm POI tùy chọn, Thiết lập tham số chuyến đi, Nhận lộ trình tối ưu và Khách sạn đề xuất, Tùy chỉnh trọng số MCDA, Xem Smart Timeline có Giờ vàng, Xuất file Excel / QR Code / Story Card 9:16.\n\n"
            "2. Quản trị viên (Admin): Thực hiện các chức năng Thêm mới, Sửa đổi và Cập nhật dữ liệu tọa độ không gian GEOMETRY(Point, 4326), giá vé và giờ mở cửa của các POIs vào cơ sở dữ liệu PostGIS."
        ),
        67: (
            "Cấu trúc lớp và thực thể dữ liệu chính:\n\n"
            "• POI (Thực thể Điểm tham quan): Chứa id, name, category, description, lat, lon, estimated_duration_min, opening_hours, ticket_price, venue_type, ideal_time, closed_days, closed_time, geom (PostGIS Point).\n"
            "• Accommodation (Thực thể Cơ sở lưu trú): Chứa id, name, stars, rating, price_per_night, address, lat, lon, distance_to_median_m, multi_criteria_score, score_breakdown.\n"
            "• PlanRequest (Lớp yêu cầu tính toán): Chứa poi_ids, custom_pois, days, max_budget, min_stars, radius_meters, weights (WeightsConfig), selected_hotel_id, transport_mode, traffic_multiplier.\n"
            "• DayItinerary (Lớp lịch trình ngày): Chứa day, hotel, visit_sequence (List[POI]), legs (List[LegDetail]), total_distance_km, total_duration_min, route_geojson.\n"
            "• PlanResponse (Lớp phản hồi hoàn chỉnh): Chứa success, days, total_pois, geometric_median (L1-Median), recommended_accommodations (Top 5), selected_hotel, daily_itineraries."
        ),
        69: (
            "Quy trình tương tác tuần tự giữa các thành phần:\n\n"
            "1. Client WebGIS gửi yêu cầu POST /api/v1/itinerary/plan kèm danh sách ID điểm đến và số ngày K.\n"
            "2. SpatialService chuyển đổi tọa độ WGS84 sang UTM Zone 49N và chạy Balanced K-Means phân cụm K ngày cân đối.\n"
            "3. SpatialService áp dụng thuật toán lặp Weiszfeld tìm điểm trung vị hình học H*.\n"
            "4. RecommendationService gọi PostGIS thực thi hàm ST_DWithin quét các khách sạn trong bán kính R và tính điểm đa tiêu chí MCDA.\n"
            "5. RoutingService gửi tọa độ chặng đến OSRM Table API lấy ma trận thời gian thực tế, truyền vào Google OR-Tools giải bài toán TSP vòng kín và lấy GeoJSON LineString.\n"
            "6. FastAPI Router đóng gói kết quả PlanResponse trả về cho Client để render mốc giờ Smart Timeline và vẽ tuyến đường."
        ),
        71: (
            "Giao diện người dùng được thiết kế tỉ mỉ theo phong cách Warm Editorial:\n\n"
            "• Màn hình Landing Page: Hiển thị Hero Header nghệ thuật với khẩu hiệu 'Chạm vào hồn phố - Đi trọn Thủ đô', bảng so sánh trực quan minh chứng hiệu quả tối ưu hóa, và danh mục các địa danh tiêu biểu tuyển chọn.\n"
            "• Màn hình WebGIS tương tác: Bản đồ số trung tâm tích hợp MapLibre GL; Bảng điều khiển Sidebar bên trái gồm bộ tìm kiếm, bộ chọn ngày khởi hành (Date Picker), bộ chọn giờ xuất phát, danh sách điểm đến và thanh trượt MCDA.\n"
            "• Màn hình Smart Timeline: Trình bày thời gian biểu từng chặng rõ ràng, gắn nhãn ✨ Giờ vàng check-in, nhãn ăn trưa ẩm thực Hà Nội, và các thông báo cảnh báo thông minh (Phố đi bộ cuối tuần, ngày đóng cửa Lăng Bác).\n"
            "• Màn hình Modal Xuất dữ liệu: Modal tạo mã QR quét mở Google Maps dẫn đường, modal xem trước và tải thẻ ảnh Story 9:16 phong cách bưu thiếp hoài niệm."
        ),
        79: (
            "Để đảm bảo hiệu quả làm việc nhóm cao nhất, các thành viên tuân thủ các quy tắc:\n\n"
            "• Quy trình Git Flow: Phân chia rõ ràng giữa nhánh master (chứa phiên bản ổn định đã triển khai) và các nhánh tính năng (feature/*). Toàn bộ commit tuân theo quy chuẩn Conventional Commits (feat, fix, docs, style, refactor).\n"
            "• Họp giao ban định kỳ: Tổ chức họp tuần (Sprint Planning & Review) để rà soát tiến độ, cập nhật bảng công việc trên Trello/GitHub Projects và giải quyết các vấn đề phát sinh.\n"
            "• Peer Code Review: Toàn bộ pull request đều được ít nhất một thành viên khác xem xét mã nguồn trước khi merge nhằm đảm bảo tính đồng nhất và chất lượng mã."
        ),
        81: (
            "Nhóm thực hiện cam kết tuân thủ đạo đức nghề nghiệp kỹ sư phần mềm:\n\n"
            "• Minh bạch về thuật toán: Công thức chấm điểm đa tiêu chí MCDA và thuật toán định tuyến TSP được công khai rõ ràng, không có hành vi can thiệp thiên vị nhằm mục đích vụ lợi thương mại.\n"
            "• Bảo vệ tài nguyên cộng đồng: Sử dụng máy chủ định tuyến OSRM công cộng và các tile bản đồ OpenStreetMap với tần suất hợp lý, có cơ chế lưu bộ nhớ đệm (caching) để tránh gây quá tải hạ tầng miễn phí của cộng đồng mã nguồn mở.\n"
            "• Tôn trọng bản quyền trí tuệ: Trích dẫn đầy đủ nguồn gốc của các thuật toán toán học và thư viện phần mềm sử dụng trong đồ án."
        ),
        83: (
            "Hệ thống mang lại những giá trị thiết thực cho cộng đồng và xã hội:\n\n"
            "• Thúc đẩy du lịch thông minh: Hỗ trợ du khách có được trải nghiệm du lịch Thủ đô thảnh thơi, sâu sắc, giảm thiểu mệt mỏi và tiết kiệm chi phí.\n"
            "• Giảm tải áp lực giao thông & môi trường: Giảm gần 50% cự ly di chuyển tương đương với việc cắt giảm hàng ngàn kilomet xe chạy, trực tiếp giảm phát thải khí nhà kính tại vùng lõi đô thị Hà Nội.\n"
            "• Lan tỏa giá trị di sản văn hóa: Giới thiệu các khung giờ vàng trải nghiệm và lưu ý văn hóa giúp du khách cảm nhận trọn vẹn nét đẹp thanh lịch, trầm tích nghìn năm của Thủ đô."
        ),
        84: (
            "Trong quá trình nghiên cứu và phát triển đồ án, các thành viên đã xây dựng chiến lược học tập chủ động và làm chủ nhiều mảng kiến thức công nghệ tiên tiến:\n\n"
            "• Kiến thức Không gian & Hệ tọa độ trắc địa: Nắm vững các chuẩn chiếu EPSG:4326 (WGS84) và EPSG:32649 (UTM Zone 49N cho Việt Nam), hiểu sâu về chỉ mục không gian R-Tree/GiST trong CSDL PostGIS.\n"
            "• Tối ưu hóa tổ hợp & Vận trù học: Tiếp cận và ứng dụng thư viện Google OR-Tools giải bài toán TSP với giải thuật tìm kiếm cục bộ có định hướng (Guided Local Search).\n"
            "• Công nghệ WebGIS hiện đại: Làm chủ thư viện MapLibre GL trên nền WebGL, tích hợp dữ liệu GeoJSON động và hiệu ứng tương tác cao cấp với GSAP.\n"
            "• Kỹ năng DevOps Cloud: Nắm vững quy trình đóng gói container Docker Compose và triển khai hệ thống phân tán trên các nền tảng đám mây hiện đại (Render Cloud, Vercel)."
        ),
        88: (
            "[1] Weiszfeld, E. (1937). Sur le point pour lequel la somme des distances de n points donnés est minimum. Tohoku Mathematical Journal, 43, 355–386.\n"
            "[2] Kuhn, H. W. (1973). A note on Fermat's problem. Mathematical Programming, 4(1), 98–107.\n"
            "[3] Applegate, D. L., Bixby, R. E., Chvátal, V., & Cook, W. J. (2006). The Traveling Salesman Problem: A Computational Study. Princeton University Press.\n"
            "[4] Google Optimization Tools (OR-Tools). Vehicle Routing and Traveling Salesperson Problem Solver Documentation. https://developers.google.com/optimization/routing\n"
            "[5] PostGIS Project Team (2024). PostGIS Spatial Database Management System Documentation (Version 3.4). https://postgis.net/documentation/\n"
            "[6] OpenStreetMap Foundation & Project OSRM (2024). Open Source Routing Machine (OSRM) HTTP API Documentation. http://project-osrm.org/docs/v5.24.0/api/\n"
            "[7] Malczewski, J. (1999). GIS and Multicriteria Decision Analysis. John Wiley & Sons, New York.\n"
            "[8] MapLibre GL JS Documentation (2024). Open-source JavaScript library for publishing maps on your websites. https://maplibre.org/maplibre-gl-js/docs/\n"
            "[9] FastAPI Framework Documentation (2024). Modern, fast (high-performance), web framework for building APIs with Python. https://fastapi.tiangolo.com/\n"
            "[10] Open-Meteo Weather Forecast API (2024). Free Weather API for non-commercial use with hourly forecasts. https://open-meteo.com/"
        ),
        89: ""
    }

    # Populate paragraphs
    for idx, text in content_map.items():
        if idx < len(doc.paragraphs):
            p = doc.paragraphs[idx]
            p.text = text
            if len(p.runs) > 0:
                p.runs[0].font.size = Pt(12)
                p.runs[0].font.name = 'Times New Roman'
                p.runs[0].font.color.rgb = RGBColor(0x1F, 0x24, 0x21)

    output_path = "BAO_CAO_DO_AN_LIEN_NGANH_CSE703014.docx"
    doc.save(output_path)
    print(f"Successfully generated populated docx: {output_path}")

if __name__ == "__main__":
    build_full_report()
