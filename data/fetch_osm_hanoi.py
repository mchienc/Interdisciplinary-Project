"""
Script thu thập dữ liệu các Trung tâm Thương mại & Đại siêu thị tại Hà Nội
từ OpenStreetMap sử dụng Overpass API.
Kết quả được chuẩn hóa sang định dạng GeoJSON chuẩn OGC (EPSG:4326).
"""

import json
import os
import sys
import urllib.request
import urllib.parse

# Fix Windows console UTF-8 encoding
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Bounding box khu vực Hà Nội: (min_lat, min_lon, max_lat, max_lon)
HANOI_BBOX = "20.56,105.28,21.38,106.02"

OVERPASS_QUERY = f"""
[out:json][timeout:60];
(
  node["shop"="mall"]({HANOI_BBOX});
  way["shop"="mall"]({HANOI_BBOX});
  node["shop"="department_store"]({HANOI_BBOX});
  way["shop"="department_store"]({HANOI_BBOX});
  node["shop"="supermarket"]({HANOI_BBOX});
  way["shop"="supermarket"]({HANOI_BBOX});
);
out center;
"""

def fetch_osm_data():
    print("[1/3] Đang gửi truy vấn tới Overpass API (OpenStreetMap)...")
    data = urllib.parse.urlencode({'data': OVERPASS_QUERY}).encode('utf-8')
    req = urllib.request.Request(OVERPASS_URL, data=data, headers={'User-Agent': 'UrbanWebGIS_Academic_Bot/1.0'})
    
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            result = json.loads(response.read().decode('utf-8'))
            elements = result.get('elements', [])
            print(f"[+] Nhận thành công {len(elements)} đối tượng từ OSM.")
            return elements
    except Exception as e:
        print(f"[-] Lỗi khi kết nối Overpass API: {e}")
        return []

def convert_to_geojson(elements):
    print("[2/3] Đang chuẩn hóa thuộc tính và chuyển đổi sang chuẩn GeoJSON...")
    features = []
    
    for item in elements:
        tags = item.get('tags', {})
        name = tags.get('name') or tags.get('name:en') or tags.get('operator')
        if not name:
            continue  # Bỏ qua các điểm không có tên
        
        # Xác định tọa độ (Node có trực tiếp lat/lon, Way lấy center)
        lat = item.get('lat') or (item.get('center', {}).get('lat'))
        lon = item.get('lon') or (item.get('center', {}).get('lon'))
        
        if not lat or not lon:
            continue
            
        feature = {
            "type": "Feature",
            "properties": {
                "osm_id": item.get('id'),
                "name": name,
                "brand": tags.get('brand') or tags.get('operator') or "Khác",
                "type": tags.get('shop', 'shopping_mall'),
                "address": tags.get('addr:street', '') + (f", {tags.get('addr:district')}" if tags.get('addr:district') else ""),
                "opening_hours": tags.get('opening_hours', 'Chưa cập nhật'),
                "website": tags.get('website', ''),
                "phone": tags.get('phone', '')
            },
            "geometry": {
                "type": "Point",
                "coordinates": [float(lon), float(lat)]
            }
        }
        features.append(feature)
        
    geojson = {
        "type": "FeatureCollection",
        "name": "hanoi_commercial_centers",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "features": features
    }
    print(f"[+] Đã lọc và chuẩn hóa {len(features)} TTTM/Siêu thị có đầy đủ thông tin.")
    return geojson

def save_geojson(geojson_data, output_path):
    print(f"[3/3] Đang lưu tệp GeoJSON tại {output_path}...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(geojson_data, f, ensure_ascii=False, indent=2)
    print(f"[✓] Hoàn thành! File đã sẵn sàng nạp vào PostGIS: {output_path}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    out_file = os.path.join(current_dir, "raw", "hanoi_commercial_centers.geojson")
    
    raw_elements = fetch_osm_data()
    if raw_elements:
        geojson = convert_to_geojson(raw_elements)
        save_geojson(geojson, out_file)
    else:
        print("[-] Không có dữ liệu để xử lý.")
