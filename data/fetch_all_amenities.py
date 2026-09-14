"""
Script thu thập toàn diện các Điểm Dịch vụ Công cộng Đô thị tại TP. Hà Nội:
1. Thương mại & Mua sắm (TTTM, Siêu thị lớn)
2. Y tế & Sức khỏe (Bệnh viện đa khoa, Viện chuyên khoa, Phòng khám lớn)
3. Giáo dục & Đào tạo (Trường Đại học, Cao đẳng, THPT lớn)
Dữ liệu được chuẩn hóa và phân loại theo OGC GeoJSON FeatureCollection.
"""

import json
import os
import sys
import urllib.request
import urllib.parse
from shapely.geometry import shape, Point

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
HANOI_BBOX = "20.56,105.28,21.38,106.02"

# Truy vấn Overpass QL lấy đồng thời 3 nhóm dịch vụ công cộng
OVERPASS_QUERY = f"""
[out:json][timeout:90];
(
  // 1. Thương mại & Bán lẻ
  node["shop"="mall"]({HANOI_BBOX});
  way["shop"="mall"]({HANOI_BBOX});
  node["shop"="supermarket"]({HANOI_BBOX});
  way["shop"="supermarket"]({HANOI_BBOX});

  // 2. Y tế & Sức khỏe
  node["amenity"="hospital"]({HANOI_BBOX});
  way["amenity"="hospital"]({HANOI_BBOX});
  node["amenity"="clinic"]({HANOI_BBOX});
  way["amenity"="clinic"]({HANOI_BBOX});

  // 3. Giáo dục & Đào tạo
  node["amenity"="university"]({HANOI_BBOX});
  way["amenity"="university"]({HANOI_BBOX});
  node["amenity"="college"]({HANOI_BBOX});
  way["amenity"="college"]({HANOI_BBOX});
  node["amenity"="school"]({HANOI_BBOX});
  way["amenity"="school"]({HANOI_BBOX});
);
out center;
"""

def fetch_data():
    print("[1/3] Đang gửi truy vấn Overpass API lấy TTTM, Bệnh viện, Trường học...")
    data = urllib.parse.urlencode({'data': OVERPASS_QUERY}).encode('utf-8')
    req = urllib.request.Request(OVERPASS_URL, data=data, headers={'User-Agent': 'UrbanSpatialWebGIS/2.0'})
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            elements = res.get('elements', [])
            print(f"[+] Nhận thành công {len(elements)} đối tượng từ OpenStreetMap.")
            return elements
    except Exception as e:
        print(f"[-] Lỗi Overpass: {e}")
        return []

def classify_amenity(tags):
    # Phân loại danh mục
    shop = tags.get('shop')
    amenity = tags.get('amenity')
    
    if shop in ['mall', 'department_store', 'supermarket']:
        cat = 'commercial'
        cat_vn = 'Thương mại & Dịch vụ'
        icon = '🛒'
        sub_type = 'TTTM / Siêu thị' if shop == 'mall' else 'Siêu thị'
    elif amenity in ['hospital', 'clinic']:
        cat = 'healthcare'
        cat_vn = 'Y tế & Sức khỏe'
        icon = '🏥'
        sub_type = 'Bệnh viện' if amenity == 'hospital' else 'Phòng khám / TT Y tế'
    elif amenity in ['university', 'college', 'school']:
        cat = 'education'
        cat_vn = 'Giáo dục & Đào tạo'
        icon = '🎓'
        sub_type = 'Đại học / Học viện' if amenity in ['university', 'college'] else 'Trường học'
    else:
        cat = 'other'
        cat_vn = 'Khác'
        icon = '📍'
        sub_type = 'Dịch vụ công cộng'
        
    return cat, cat_vn, sub_type, icon

def process_features(elements, districts_geojson_path):
    print("[2/3] Đang lọc thuộc tính và thực hiện Spatial Join gán Quận/Huyện...")
    # Tải ranh giới quận để gán quận
    districts = []
    if os.path.exists(districts_geojson_path):
        with open(districts_geojson_path, 'r', encoding='utf-8') as f:
            d_data = json.load(f)
            for d in d_data.get('features', []):
                districts.append({
                    'name': d['properties']['name'],
                    'polygon': shape(d['geometry'])
                })

    features = []
    category_counter = {'commercial': 0, 'healthcare': 0, 'education': 0, 'other': 0}

    for item in elements:
        tags = item.get('tags', {})
        name = tags.get('name') or tags.get('name:en') or tags.get('operator')
        if not name:
            continue

        lat = item.get('lat') or item.get('center', {}).get('lat')
        lon = item.get('lon') or item.get('center', {}).get('lon')
        if not lat or not lon:
            continue

        cat, cat_vn, sub_type, icon = classify_amenity(tags)
        category_counter[cat] = category_counter.get(cat, 0) + 1

        # Xác định quận bằng Shapely Spatial Join
        pt = Point(lon, lat)
        assigned_district = "Hà Nội"
        for d in districts:
            if d['polygon'].contains(pt):
                assigned_district = d['name']
                break

        features.append({
            "type": "Feature",
            "properties": {
                "osm_id": item.get('id'),
                "name": name,
                "category": cat,
                "category_vn": cat_vn,
                "type": sub_type,
                "icon": icon,
                "brand": tags.get('brand') or tags.get('operator') or "Độc lập",
                "address": tags.get('addr:street', '') + (f", {tags.get('addr:district')}" if tags.get('addr:district') else ""),
                "district_name": assigned_district,
                "phone": tags.get('phone', tags.get('contact:phone', '')),
                "website": tags.get('website', tags.get('contact:website', ''))
            },
            "geometry": {
                "type": "Point",
                "coordinates": [float(lon), float(lat)]
            }
        })

    geojson_out = {
        "type": "FeatureCollection",
        "name": "hanoi_public_amenities",
        "features": features
    }

    print(f"\n[+] Tổng hợp các loại hình dịch vụ công cộng thu thập được:")
    print(f"    🛒 Thương mại & Mua sắm : {category_counter.get('commercial', 0)} cơ sở")
    print(f"    🏥 Y tế & Bệnh viện     : {category_counter.get('healthcare', 0)} cơ sở")
    print(f"    🎓 Giáo dục & Trường học: {category_counter.get('education', 0)} cơ sở")
    print(f"    🎯 TỔNG CỘNG            : {len(features)} điểm dịch vụ đô thị!")
    return geojson_out

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    districts_file = os.path.join(current_dir, "raw", "hanoi_districts.geojson")
    out_file = os.path.join(current_dir, "raw", "hanoi_public_amenities.geojson")

    elements = fetch_data()
    if elements:
        geojson = process_features(elements, districts_file)
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, ensure_ascii=False, indent=2)
        print(f"[✓] Đã xuất file chuẩn: {out_file}")
    else:
        print("[-] Không có dữ liệu.")
