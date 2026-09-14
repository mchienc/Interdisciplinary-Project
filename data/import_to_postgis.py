"""
Script nạp toàn bộ 2,750 Tiện ích Đô thị (Y tế, Giáo dục, Thương mại) vào PostgreSQL / PostGIS.
Tự động tạo bảng 'public_amenities' và đánh chỉ mục không gian Spatial GiST Index.
"""

import json
import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def import_all_amenities(db_host="localhost", db_port="5432", db_name="webgis_db", db_user="postgres", db_pass="postgis_password"):
    try:
        import psycopg2
    except ImportError:
        print("[-] Cần cài đặt psycopg2-binary: pip install psycopg2-binary")
        return

    current_dir = os.path.dirname(os.path.abspath(__file__))
    geojson_path = os.path.join(current_dir, "raw", "hanoi_public_amenities.geojson")
    
    if not os.path.exists(geojson_path):
        print(f"[-] Không tìm thấy tệp {geojson_path}. Hãy chạy python data/fetch_all_amenities.py trước.")
        return

    with open(geojson_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        features = data.get("features", [])

    print(f"[1/3] Đang kết nối tới CSDL PostGIS tại {db_host}:{db_port}/{db_name}...")
    try:
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            dbname=db_name,
            user=db_user,
            password=db_pass
        )
        cur = conn.cursor()
        print("[+] Kết nối CSDL thành công!")
    except Exception as e:
        print(f"[-] Không thể kết nối tới PostgreSQL/PostGIS: {e}")
        print("[*] Gợi ý: Hãy đảm bảo Docker Desktop đang chạy và container webgis_postgis đang bật.")
        return

    # Tạo bảng public_amenities
    cur.execute("""
        CREATE TABLE IF NOT EXISTS public_amenities (
            id SERIAL PRIMARY KEY,
            osm_id BIGINT UNIQUE,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL, -- commercial, healthcare, education
            category_vn VARCHAR(100),
            type VARCHAR(100),
            brand VARCHAR(100),
            address TEXT,
            district_name VARCHAR(100),
            phone VARCHAR(100),
            website TEXT,
            geom GEOMETRY(Point, 4326) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_public_amenities_geom ON public_amenities USING GIST (geom);
        CREATE INDEX IF NOT EXISTS idx_public_amenities_cat ON public_amenities (category);
    """)
    conn.commit()

    print(f"[2/3] Bắt đầu nạp {len(features)} tiện ích công cộng (Y tế, Giáo dục, Thương mại)...")
    insert_sql = """
        INSERT INTO public_amenities (osm_id, name, category, category_vn, type, brand, address, district_name, phone, website, geom)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_Point(%s, %s), 4326))
        ON CONFLICT (osm_id) DO UPDATE 
        SET name = EXCLUDED.name,
            category = EXCLUDED.category,
            category_vn = EXCLUDED.category_vn,
            type = EXCLUDED.type,
            brand = EXCLUDED.brand,
            address = EXCLUDED.address,
            district_name = EXCLUDED.district_name,
            geom = EXCLUDED.geom;
    """
    
    count = 0
    for feat in features:
        props = feat.get("properties", {})
        coords = feat.get("geometry", {}).get("coordinates", [])
        if len(coords) < 2:
            continue
        lon, lat = coords[0], coords[1]
        
        cur.execute(insert_sql, (
            props.get("osm_id"),
            props.get("name"),
            props.get("category", "commercial"),
            props.get("category_vn", "Thương mại"),
            props.get("type", ""),
            props.get("brand", "Độc lập"),
            props.get("address", ""),
            props.get("district_name", "Hà Nội"),
            props.get("phone", ""),
            props.get("website", ""),
            lon,
            lat
        ))
        count += 1

    conn.commit()

    # Thống kê nhanh trong CSDL
    cur.execute("SELECT category, count(*) FROM public_amenities GROUP BY category;")
    rows = cur.fetchall()
    print("\n--- THỐNG KÊ CSDL POSTGIS (public_amenities) ---")
    for r in rows:
        print(f"  • Danh mục '{r[0]}': {r[1]} đối tượng")

    cur.close()
    conn.close()
    print(f"\n[3/3] [✓] Đã import thành công {count} tiện ích công cộng vào PostGIS!")

if __name__ == "__main__":
    import_all_amenities()
