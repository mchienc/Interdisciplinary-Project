"""
Script thu thập và chuẩn hóa dữ liệu 30 Quận/Huyện TP. Hà Nội từ geoBoundaries OGC.
Tự động nạp vào PostgreSQL/PostGIS và thực hiện Spatial Join (ST_Contains)
để gán mỗi TTTM vào đúng quận quản lý.
"""

import json
import os
import sys
import urllib.request
from shapely.geometry import shape

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

GEOBOUNDARIES_URL = "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/VNM/ADM2/geoBoundaries-VNM-ADM2_simplified.geojson"

# Bảng thông tin dân số và diện tích ước tính (Niên giám thống kê Hà Nội)
DISTRICT_META = {
    'Ba Dinh': {'vn': 'Quận Ba Đình', 'pop': 226000, 'area': 9.21},
    'Hoan Kiem': {'vn': 'Quận Hoàn Kiếm', 'pop': 155000, 'area': 5.29},
    'Tay Ho': {'vn': 'Quận Tây Hồ', 'pop': 168000, 'area': 24.38},
    'Long Bien': {'vn': 'Quận Long Biên', 'pop': 322000, 'area': 60.38},
    'Cau Giay': {'vn': 'Quận Cầu Giấy', 'pop': 292000, 'area': 12.04},
    'Dong Da': {'vn': 'Quận Đống Đa', 'pop': 371000, 'area': 9.95},
    'Hai Ba Trung': {'vn': 'Quận Hai Bà Trưng', 'pop': 303000, 'area': 10.09},
    'Hoang Mai': {'vn': 'Quận Hoàng Mai', 'pop': 532000, 'area': 41.04},
    'Thanh Xuan': {'vn': 'Quận Thanh Xuân', 'pop': 293000, 'area': 9.11},
    'Nam Tu Liem': {'vn': 'Quận Nam Từ Liêm', 'pop': 269000, 'area': 32.17},
    'Bac Tu Liem': {'vn': 'Quận Bắc Từ Liêm', 'pop': 333000, 'area': 45.24},
    'Ha Dong': {'vn': 'Quận Hà Đông', 'pop': 397000, 'area': 49.64},
    'Son Tay': {'vn': 'Thị xã Sơn Tây', 'pop': 151000, 'area': 117.20},
    'Ba Vi': {'vn': 'Huyện Ba Vì', 'pop': 282000, 'area': 428.00},
    'Chuong My': {'vn': 'Huyện Chương Mỹ', 'pop': 330000, 'area': 237.40},
    'Dan Phuong': {'vn': 'Huyện Đan Phượng', 'pop': 174000, 'area': 77.80},
    'Dong Anh': {'vn': 'Huyện Đông Anh', 'pop': 407000, 'area': 185.62},
    'Gia Lam': {'vn': 'Huyện Gia Lâm', 'pop': 286000, 'area': 116.64},
    'Hoai Duc': {'vn': 'Huyện Hoài Đức', 'pop': 262000, 'area': 84.93},
    'Me Linh': {'vn': 'Huyện Mê Linh', 'pop': 240000, 'area': 141.64},
    'My Duc': {'vn': 'Huyện Mỹ Đức', 'pop': 203000, 'area': 226.30},
    'Phu Xuyen': {'vn': 'Huyện Phú Xuyên', 'pop': 211000, 'area': 171.10},
    'Phuc Tho': {'vn': 'Huyện Phúc Thọ', 'pop': 190000, 'area': 118.50},
    'Quoc Oai': {'vn': 'Huyện Quốc Oai', 'pop': 192000, 'area': 151.20},
    'Soc Son': {'vn': 'Huyện Sóc Sơn', 'pop': 357000, 'area': 306.50},
    'Thach That': {'vn': 'Huyện Thạch Thất', 'pop': 215000, 'area': 187.50},
    'Thanh Oai': {'vn': 'Huyện Thanh Oai', 'pop': 214000, 'area': 124.60},
    'Thanh Tri': {'vn': 'Huyện Thanh Trì', 'pop': 274000, 'area': 63.17},
    'Thuong Tin': {'vn': 'Huyện Thường Tín', 'pop': 255000, 'area': 127.59},
    'Ung Hoa': {'vn': 'Huyện Ứng Hòa', 'pop': 210000, 'area': 188.20}
}

def fetch_and_process_districts():
    print("[1/4] Đang tải dữ liệu ranh giới địa lý từ geoBoundaries...")
    req = urllib.request.Request(GEOBOUNDARIES_URL, headers={'User-Agent': 'UrbanGIS/1.0'})
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw_data = json.loads(resp.read().decode('utf-8'))
    
    features = []
    for f in raw_data.get('features', []):
        name = f['properties'].get('shapeName')
        if name in DISTRICT_META:
            geom = shape(f['geometry'])
            centroid = geom.centroid
            # Lọc theo bounding box Hà Nội
            if 20.5 <= centroid.y <= 21.4 and 105.2 <= centroid.x <= 106.1:
                meta = DISTRICT_META[name]
                density = round(meta['pop'] / meta['area'], 1)
                f['properties']['district_code'] = name.lower().replace(' ', '_')
                f['properties']['name'] = meta['vn']
                f['properties']['name_en'] = name
                f['properties']['population'] = meta['pop']
                f['properties']['area_km2'] = meta['area']
                f['properties']['density_per_km2'] = density
                features.append(f)

    geojson_out = {
        "type": "FeatureCollection",
        "name": "hanoi_districts",
        "features": features
    }

    current_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(current_dir, "raw", "hanoi_districts.geojson")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geojson_out, f, ensure_ascii=False, indent=2)
    print(f"[+] Đã lọc và lưu thành công {len(features)} quận/huyện tại {out_path}")
    return geojson_out

def import_districts_to_postgis(geojson_data):
    print("[2/4] Đang kết nối PostGIS để import lớp 'districts'...")
    import psycopg2
    try:
        conn = psycopg2.connect(
            host="localhost", port=5432, dbname="webgis_db", user="postgres", password="postgis_password"
        )
        cur = conn.cursor()
    except Exception as e:
        print(f"[-] Lỗi kết nối PostGIS: {e}")
        return

    # Mở rộng kích thước cột nếu cần và làm sạch bảng trước khi import
    cur.execute("ALTER TABLE districts ALTER COLUMN district_code TYPE VARCHAR(100);")
    cur.execute("TRUNCATE TABLE districts RESTART IDENTITY CASCADE;")

    insert_sql = """
        INSERT INTO districts (district_code, name, population, area_km2, density_per_km2, geom)
        VALUES (%s, %s, %s, %s, %s, ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)))
        ON CONFLICT (district_code) DO NOTHING;
    """

    count = 0
    for f in geojson_data['features']:
        props = f['properties']
        geom_str = json.dumps(f['geometry'])
        cur.execute(insert_sql, (
            props['district_code'],
            props['name'],
            props['population'],
            props['area_km2'],
            props['density_per_km2'],
            geom_str
        ))
        count += 1

    conn.commit()
    print(f"[3/4] [✓] Đã import thành công {count} quận/huyện vào CSDL PostGIS!")

    # 4. Thực hiện Spatial Join để gán TTTM vào đúng quận
    print("[4/4] Đang chạy Spatial Join ST_Contains trong PostGIS...")
    spatial_join_sql = """
        UPDATE commercial_centers c
        SET district_name = d.name
        FROM districts d
        WHERE ST_Contains(d.geom, c.geom);
    """
    cur.execute(spatial_join_sql)
    conn.commit()

    # Thống kê kết quả phân bố
    cur.execute("""
        SELECT d.name, count(c.id) as mall_count, d.population, d.density_per_km2
        FROM districts d
        LEFT JOIN commercial_centers c ON ST_Contains(d.geom, c.geom)
        GROUP BY d.name, d.population, d.density_per_km2
        ORDER BY mall_count DESC;
    """)
    stats = cur.fetchall()
    print("\n--- BẢNG PHÂN BỐ TTTM / SIÊU THỊ THEO QUẬN (TOP 10) ---")
    for s in stats[:10]:
        print(f"{s[0]:<22} | Số TTTM: {s[1]:<3} | Dân số: {s[2]:<8} | Mật độ: {s[3]} ng/km2")

    cur.close()
    conn.close()
    print("[✓] Hoàn thành toàn bộ quy trình tích hợp Dữ liệu Đô thị!")

if __name__ == "__main__":
    data = fetch_and_process_districts()
    import_districts_to_postgis(data)
