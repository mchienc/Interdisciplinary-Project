-- ====================================================================
-- HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH KHÔNG GIAN (SDSS)
-- Cơ sở dữ liệu Không gian PostGIS: Điểm du lịch (POIs) & Cơ sở lưu trú
-- ====================================================================

-- 1. Kích hoạt Extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 2. Bảng lưu trữ Điểm tham quan du lịch (POIs)
CREATE TABLE IF NOT EXISTS pois (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- heritage, beach, nature, museum, bridge, entertainment, culinary
    description TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    estimated_duration_min INT DEFAULT 90, -- Thời gian tham quan ước tính (phút)
    opening_hours VARCHAR(100) DEFAULT '07:30 - 18:00',
    ticket_price INT DEFAULT 0,            -- Giá vé vào cổng (VND)
    geom GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pois_geom ON pois USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_pois_category ON pois (category);

-- 3. Bảng lưu trữ Cơ sở lưu trú (Accommodations: Khách sạn, Resort, Homestay)
CREATE TABLE IF NOT EXISTS accommodations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'hotel', -- resort, hotel, homestay, boutique
    stars INT DEFAULT 3 CHECK (stars BETWEEN 1 AND 5),
    rating NUMERIC(3, 2) DEFAULT 4.0 CHECK (rating BETWEEN 0.0 AND 5.0),
    price_per_night INT NOT NULL,     -- Giá phòng tham khảo 1 đêm (VND)
    address TEXT,
    phone VARCHAR(50),
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accommodations_geom ON accommodations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_accommodations_price ON accommodations (price_per_night);
CREATE INDEX IF NOT EXISTS idx_accommodations_rating ON accommodations (rating);

-- ====================================================================
-- SEED DATA: DỮ LIỆU MẪU THỰC TẾ TẠI HÀ NỘI
-- ====================================================================

-- Xóa dữ liệu cũ nếu có
TRUNCATE TABLE pois RESTART IDENTITY CASCADE;
TRUNCATE TABLE accommodations RESTART IDENTITY CASCADE;

-- Chèn 15 Điểm du lịch nổi tiếng tại Hà Nội
INSERT INTO pois (name, category, description, lat, lon, estimated_duration_min, opening_hours, ticket_price, geom) VALUES
('Hồ Hoàn Kiếm & Đền Ngọc Sơn', 'heritage', 'Trái tim của Thủ đô ngàn năm văn hiến, cầu Thê Húc đỏ son, Tháp Rùa cổ kính giữa lòng hồ xanh ngọc.', 21.0287, 105.8523, 60, 'Cả ngày', 30000, ST_SetSRID(ST_MakePoint(105.8523, 21.0287), 4326)),
('Lăng Chủ tịch Hồ Chí Minh & Quảng trường Ba Đình', 'heritage', 'Nơi an nghỉ của Chủ tịch Hồ Chí Minh vĩ đại, Quảng trường Ba Đình lịch sử, Nhà sàn và Ao cá Bác Hồ.', 21.0368, 105.8346, 120, '07:30 - 11:00', 0, ST_SetSRID(ST_MakePoint(105.8346, 21.0368), 4326)),
('Văn Miếu - Quốc Tử Giám', 'heritage', 'Trường đại học đầu tiên của Việt Nam với 82 tấm bia Tiến sĩ vinh danh truyền thống hiếu học ngàn năm.', 21.0293, 105.8359, 90, '08:00 - 17:00', 30000, ST_SetSRID(ST_MakePoint(105.8359, 21.0293), 4326)),
('Khu Phố Cổ Hà Nội (36 Phố Phường)', 'culinary', 'Không gian phố cổ rêu phong với nghề thủ công truyền thống và thiên đường ẩm thực: Phở Bát Đàn, bún chả, chả cá.', 21.0366, 105.8500, 90, 'Cả ngày', 0, ST_SetSRID(ST_MakePoint(105.8500, 21.0366), 4326)),
('Hồ Tây & Bãi Đá Sông Hồng', 'nature', 'Hồ tự nhiên lớn nhất Thủ đô với chùa Trấn Quốc cổ kính hơn 1500 năm tuổi và không gian dã ngoại sông Hồng thơ mộng.', 21.0545, 105.8285, 90, 'Cả ngày', 50000, ST_SetSRID(ST_MakePoint(105.8285, 21.0545), 4326)),
('Hoàng thành Thăng Long', 'heritage', 'Di sản Văn hóa Thế giới UNESCO, trung tâm quyền lực chính trị qua 13 thế kỷ liên tục của các triều đại Đại Việt.', 21.0353, 105.8402, 120, '08:00 - 17:00', 30000, ST_SetSRID(ST_MakePoint(105.8402, 21.0353), 4326)),
('Bảo tàng Dân tộc học Việt Nam', 'museum', 'Bảo tàng hàng đầu trưng bày sống động về bản sắc văn hóa, kiến trúc nhà truyền thống của 54 dân tộc anh em.', 21.0406, 105.7984, 120, '08:30 - 17:30', 40000, ST_SetSRID(ST_MakePoint(105.7984, 21.0406), 4326)),
('Cầu Long Biên Lịch Sử', 'bridge', 'Cây cầu thép lịch sử hơn 120 năm bắc qua sông Hồng do kiến trúc sư Gustave Eiffel thiết kế, chứng nhân lịch sử hào hùng.', 21.0435, 105.8557, 45, 'Cả ngày', 0, ST_SetSRID(ST_MakePoint(105.8557, 21.0435), 4326)),
('Nhà thờ Lớn Hà Nội (St. Joseph)', 'heritage', 'Kiệt tác kiến trúc Gothic phục hưng tuyệt đẹp thế kỷ 19, điểm check-in và thưởng thức trà chanh vỉa hè nổi tiếng.', 21.0288, 105.8495, 45, '08:00 - 20:00', 0, ST_SetSRID(ST_MakePoint(105.8495, 21.0288), 4326)),
('Di tích Lịch sử Nhà tù Hỏa Lò', 'museum', 'Di tích lịch sử cách mạng hào hùng với các tour trải nghiệm đêm xúc động, thu hút đông đảo du khách trong nước và quốc tế.', 21.0253, 105.8465, 90, '08:00 - 17:00', 30000, ST_SetSRID(ST_MakePoint(105.8465, 21.0253), 4326)),
('Nhà hát Lớn Hà Nội & Phố Tràng Tiền', 'heritage', 'Kiệt tác kiến trúc Tân cổ điển Pháp tại Quảng trường Cách Mạng Tháng Tám và trải nghiệm kem Tràng Tiền truyền thống.', 21.0242, 105.8576, 45, 'Cả ngày', 0, ST_SetSRID(ST_MakePoint(105.8576, 21.0242), 4326)),
('Chợ Đồng Xuân & Chợ Đêm Phố Cổ', 'culinary', 'Khu chợ đầu mối sầm uất bậc nhất Bắc Bộ với chợ đêm cuối tuần rực rỡ sắc màu quà lưu niệm và đặc sản ẩm thực Hà thành.', 21.0382, 105.8498, 75, '07:00 - 23:00', 0, ST_SetSRID(ST_MakePoint(105.8498, 21.0382), 4326)),
('Bảo tàng Lịch sử Quân sự Việt Nam (Mới)', 'museum', 'Bảo tàng quân sự hiện đại bậc nhất quy mô 38.6ha lưu giữ 4 Bảo vật Quốc gia gồm máy bay MiG-21 và xe tăng T-54B.', 21.0118, 105.7483, 150, '08:00 - 16:30', 0, ST_SetSRID(ST_MakePoint(105.7483, 21.0118), 4326)),
('Công viên Nước Hồ Tây & Phố Trịnh Công Sơn', 'entertainment', 'Tổ hợp giải trí công viên nước sôi động cùng không gian phố đi bộ nghệ thuật ven hồ Tây lộng gió.', 21.0743, 105.8206, 150, '08:30 - 19:00', 180000, ST_SetSRID(ST_MakePoint(105.8206, 21.0743), 4326)),
('Làng Gốm Cổ Bát Tràng', 'entertainment', 'Làng nghề gốm sứ truyền thống hơn 700 năm bên bờ sông Hồng, trải nghiệm tự tay nặn gốm tại Trung tâm Tinh hoa Làng nghề.', 20.9782, 105.9142, 180, '08:00 - 18:00', 50000, ST_SetSRID(ST_MakePoint(105.9142, 20.9782), 4326));

-- Chèn 15 Khách sạn & Resort phân khúc đa dạng tại Hà Nội
INSERT INTO accommodations (name, type, stars, rating, price_per_night, address, phone, lat, lon, geom) VALUES
('Sofitel Legend Metropole Hanoi', 'hotel', 5, 4.90, 6500000, '15 Ngô Quyền, Tràng Tiền, Hoàn Kiếm, Hà Nội', '024 3826 6919', 21.0252, 105.8560, ST_SetSRID(ST_MakePoint(105.8560, 21.0252), 4326)),
('Melia Hanoi Hotel', 'hotel', 5, 4.70, 3200000, '44 Lý Thường Kiệt, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', '024 3934 3343', 21.0248, 105.8475, ST_SetSRID(ST_MakePoint(105.8475, 21.0248), 4326)),
('Lotte Hotel Hanoi', 'hotel', 5, 4.85, 3900000, '54 Liễu Giai, Cống Vị, Ba Đình, Hà Nội', '024 3333 1000', 21.0327, 105.8128, ST_SetSRID(ST_MakePoint(105.8128, 21.0327), 4326)),
('Pan Pacific Hanoi', 'hotel', 5, 4.65, 2800000, '01 Thanh Niên, Ba Đình, Hà Nội', '024 3823 8888', 21.0474, 105.8390, ST_SetSRID(ST_MakePoint(105.8390, 21.0474), 4326)),
('Apricot Hotel (Hồ Gươm)', 'hotel', 5, 4.75, 3500000, '136 Hàng Trống, Hoàn Kiếm, Hà Nội', '024 3828 9595', 21.0278, 105.8516, ST_SetSRID(ST_MakePoint(105.8516, 21.0278), 4326)),
('The Oriental Jade Hotel', 'boutique', 4, 4.70, 2200000, '92 - 94 Hàng Trống, Hoàn Kiếm, Hà Nội', '024 3936 7777', 21.0305, 105.8505, ST_SetSRID(ST_MakePoint(105.8505, 21.0305), 4326)),
('Hanoi La Siesta Trendy Hotel', 'boutique', 4, 4.65, 1800000, '12 Nguyễn Quang Bích, Cửa Đông, Hoàn Kiếm, Hà Nội', '024 3923 4026', 21.0329, 105.8449, ST_SetSRID(ST_MakePoint(105.8449, 21.0329), 4326)),
('InterContinental Hanoi Westlake', 'resort', 5, 4.80, 3600000, '05 Từ Hoa, Quảng An, Tây Hồ, Hà Nội', '024 6270 8888', 21.0583, 105.8292, ST_SetSRID(ST_MakePoint(105.8292, 21.0583), 4326)),
('Acoustic Hotel & Spa Hanoi', 'hotel', 4, 4.55, 1300000, '39 Thợ Nhuộm, Cửa Nam, Hoàn Kiếm, Hà Nội', '024 3682 2333', 21.0267, 105.8442, ST_SetSRID(ST_MakePoint(105.8442, 21.0267), 4326)),
('San Grand Hotel Hanoi', 'hotel', 4, 4.50, 1100000, '02 Cầu Gỗ, Hàng Bạc, Hoàn Kiếm, Hà Nội', '024 3824 4999', 21.0309, 105.8528, ST_SetSRID(ST_MakePoint(105.8528, 21.0309), 4326)),
('Church Boutique Hotel Hang Gai', 'boutique', 3, 4.45, 950000, '95 Hàng Gai, Hàng Gai, Hoàn Kiếm, Hà Nội', '024 3938 2233', 21.0312, 105.8492, ST_SetSRID(ST_MakePoint(105.8492, 21.0312), 4326)),
('Hanoi Golden Moment Hotel', 'hotel', 3, 4.30, 750000, '15 Hàng Quạt, Hàng Gai, Hoàn Kiếm, Hà Nội', '024 3928 7755', 21.0335, 105.8499, ST_SetSRID(ST_MakePoint(105.8499, 21.0335), 4326)),
('Golden Sun Suites Hotel', 'hotel', 3, 4.40, 850000, '35 Hàng Quạt, Hoàn Kiếm, Hà Nội', '024 3928 9776', 21.0332, 105.8488, ST_SetSRID(ST_MakePoint(105.8488, 21.0332), 4326)),
('Old Quarter View Hanoi Hostel', 'homestay', 3, 4.60, 420000, '42 Hàng Dầu, Hàng Bạc, Hoàn Kiếm, Hà Nội', '024 3926 2266', 21.0318, 105.8532, ST_SetSRID(ST_MakePoint(105.8532, 21.0318), 4326)),
('Hanoi Sweet Family Homestay', 'homestay', 3, 4.50, 350000, '16 Chân Cầm, Hàng Trống, Hoàn Kiếm, Hà Nội', '0982 123 789', 21.0298, 105.8478, ST_SetSRID(ST_MakePoint(105.8478, 21.0298), 4326));

-- Hàm tiện ích lấy dữ liệu dạng GeoJSON
CREATE OR REPLACE FUNCTION get_pois_geojson()
RETURNS json AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', coalesce(json_agg(ST_AsGeoJSON(t.*)::json), '[]'::json)
        )
        FROM (
            SELECT id, name, category, description, lat, lon, estimated_duration_min, ticket_price, geom
            FROM pois
        ) AS t
    );
END;
$$ LANGUAGE plpgsql;
