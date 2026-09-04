"""
Script nạp dữ liệu GeoJSON các TTTM Hà Nội vào PostgreSQL / PostGIS
"""

import json
import os
import sys

# Windows UTF-8 console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def import_data(db_host="localhost", db_port="5432", db_name="webgis_db", db_user="postgres", db_pass="postgis_password"):
    try:
        import psycopg2
    except ImportError:
        print("[-] Cần cài đặt psycopg2-binary: pip install psycopg2-binary")
        return

    current_dir = os.path.dirname(os.path.abspath(__file__))
    geojson_path = os.path.join(current_dir, "raw", "hanoi_commercial_centers.geojson")
    
    if not os.path.exists(geojson_path):
        print(f"[-] Không tìm thấy tệp {geojson_path}. Hãy chạy python data/fetch_osm_hanoi.py trước.")
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
        print("[*] Gợi ý: Hãy đảm bảo Docker Desktop đang chạy và đã chạy lệnh: docker compose -f docker/docker-compose.yml up -d")
        return

    print(f"[2/3] Bắt đầu import {len(features)} TTTM vào bảng 'commercial_centers'...")
    insert_sql = """
        INSERT INTO commercial_centers (osm_id, name, brand, type, address, opening_hours, website, phone, geom)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_Point(%s, %s), 4326))
        ON CONFLICT (osm_id) DO UPDATE 
        SET name = EXCLUDED.name,
            brand = EXCLUDED.brand,
            type = EXCLUDED.type,
            address = EXCLUDED.address,
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
            props.get("brand"),
            props.get("type"),
            props.get("address"),
            props.get("opening_hours"),
            props.get("website"),
            props.get("phone"),
            lon,
            lat
        ))
        count += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"[3/3] [✓] Đã import thành công {count} đối tượng không gian vào PostGIS!")

if __name__ == "__main__":
    import_data()
