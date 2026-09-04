-- Khởi tạo Extension PostGIS cho CSDL Không gian
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 1. Bảng lưu trữ Ranh giới hành chính Quận/Huyện Hà Nội
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    district_code VARCHAR(20) UNIQUE,
    name VARCHAR(100) NOT NULL,
    population INT DEFAULT 0,
    area_km2 NUMERIC(10, 2) DEFAULT 0,
    density_per_km2 NUMERIC(10, 2) DEFAULT 0,
    geom GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_districts_geom ON districts USING GIST (geom);

-- 2. Bảng lưu trữ Trung tâm thương mại & Siêu thị lớn (POIs)
CREATE TABLE IF NOT EXISTS commercial_centers (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT UNIQUE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    type VARCHAR(50) DEFAULT 'shopping_mall', -- shopping_mall, department_store, supermarket
    address TEXT,
    phone VARCHAR(50),
    website TEXT,
    opening_hours VARCHAR(100),
    floor_area NUMERIC(10, 2), -- Diện tích sàn (m2) nếu có
    levels INT,                -- Số tầng
    district_name VARCHAR(100),
    geom GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_commercial_centers_geom ON commercial_centers USING GIST (geom);

-- 3. Hàm tiện ích: Lấy toàn bộ TTTM dưới dạng GeoJSON FeatureCollection
CREATE OR REPLACE FUNCTION get_commercial_centers_geojson()
RETURNS json AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', coalesce(json_agg(ST_AsGeoJSON(t.*)::json), '[]'::json)
        )
        FROM (
            SELECT 
                id, 
                osm_id, 
                name, 
                brand, 
                type, 
                address, 
                opening_hours,
                district_name,
                geom
            FROM commercial_centers
        ) AS t
    );
END;
$$ LANGUAGE plpgsql;
