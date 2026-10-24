import os
import sys
import json
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

# Đảm bảo in UTF-8 trên Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

WIKI_TITLE_MAPPING = {
    1: "Hồ Hoàn Kiếm",
    2: "Lăng Chủ tịch Hồ Chí Minh",
    3: "Văn Miếu – Quốc Tử Giám",
    4: "Khu phố cổ Hà Nội",
    5: "Hồ Tây",
    6: "Hoàng thành Thăng Long",
    7: "Bảo tàng Dân tộc học Việt Nam",
    8: "Cầu Long Biên",
    9: "Nhà thờ Lớn Hà Nội",
    10: "Hỏa Lò",
    11: "Nhà hát Lớn Hà Nội",
    12: "Chợ Đồng Xuân",
    13: "Bảo tàng Lịch sử Quân sự Việt Nam",
    14: "Công viên nước Hồ Tây",
    15: "Làng gốm Bát Tràng",
    16: "Lotte Mall West Lake",
    17: "Tràng Tiền Plaza",
    18: "Vinhomes Times City",
    19: "Aeon Mall Long Biên",
    20: "Lotte Center Hà Nội",
    21: "Chùa Trấn Quốc",
    22: "Đền Quán Thánh",
    23: "Đền Bạch Mã",
    24: "Đền Voi Phục",
    25: "Đình Kim Liên",
    26: "Chùa Một Cột",
    27: "Cột cờ Hà Nội",
    28: "Ô Quan Chưởng",
    29: "Chùa Kim Liên",
    30: "Nhà thờ Cửa Bắc",
    31: "Chùa Hương",
    32: "Đường Lâm",
    33: "Vườn quốc gia Ba Vì",
    34: "Thành Cổ Loa",
    35: "Đền Sóc",
    36: "Chùa Thầy",
    37: "Chùa Tây Phương",
    38: "Đền Hai Bà Trưng (Mê Linh)",
    39: "Làng lụa Vạn Phúc",
    40: "Quảng Phú Cầu",
    41: "Làng Chuông",
    42: "Thạch Xá",
    43: "Bảo tàng Hà Nội",
    44: "Bảo tàng Mỹ thuật Việt Nam",
    45: "Bảo tàng Phụ nữ Việt Nam",
    46: "Bảo tàng Lịch sử Quốc gia",
    47: "Vincom Mega Mall Royal City",
    48: "Phố Tạ Hiện",
    49: "Phố ẩm thực Tống Duy Tân",
    50: "Cà phê Giảng",
    51: "Hồ Hoàn Kiếm",
    52: "Phở Bát Đàn",
    53: "Chả cá Lã Vọng",
    54: "Bún chả",
    55: "Đường Thanh Niên (Hà Nội)",
    56: "Công viên Thống Nhất",
    57: "Vườn Bách Thảo Hà Nội",
    58: "Hồ Tây",
    59: "Khu du lịch Thiên đường Bảo Sơn",
    60: "Sóc Sơn",
    61: "Khu du lịch Quan Sơn",
    62: "Vincom Mega Mall Royal City",
    63: "Aeon Mall Hà Đông",
    64: "Keangnam Hanoi Landmark Tower",
    65: "Indochina Plaza Hanoi",
    66: "Phố sách Hà Nội"
}

def fetch_wiki_image(poi_id: int, title: str) -> tuple[int, str]:
    """Truy vấn ảnh thực địa từ Wikipedia API"""
    headers = {"User-Agent": "HanoiTourismWebGIS/2.0 (student.gis.project@gmail.com)"}
    try:
        url = f"https://vi.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&format=json&pithumbsize=960"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            pages = data.get("query", {}).get("pages", {})
            for pid, p in pages.items():
                if pid != "-1" and "thumbnail" in p:
                    return poi_id, p["thumbnail"]["source"]

        # Tìm kiếm dự phòng
        search_url = f"https://vi.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(title)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=960"
        req = urllib.request.Request(search_url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            pages = data.get("query", {}).get("pages", {})
            for pid, p in pages.items():
                if "thumbnail" in p:
                    return poi_id, p["thumbnail"]["source"]
    except Exception:
        pass
    return poi_id, ""

def main():
    backend_mock_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app", "services", "mock_data.py"))
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
    from backend.app.services.mock_data import MOCK_POIS

    print(f"Bắt đầu tải song song ảnh Wikimedia thực địa cho {len(MOCK_POIS)} địa danh...")
    
    results = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [
            executor.submit(fetch_wiki_image, poi["id"], WIKI_TITLE_MAPPING.get(poi["id"], poi["name"]))
            for poi in MOCK_POIS
        ]
        for f in as_completed(futures):
            poi_id, img_url = f.result()
            if img_url:
                results[poi_id] = img_url

    updated_count = 0
    for poi in MOCK_POIS:
        if poi["id"] in results:
            poi["image_url"] = results[poi["id"]]
            updated_count += 1
            print(f"[OK] {poi['name']} -> {poi['image_url'][:65]}...")

    print(f"\nTổng kết: Đã cập nhật thành công {updated_count}/{len(MOCK_POIS)} ảnh thực tế từ Wikimedia!")

    # Cập nhật backend mock_data.py
    backend_content = "from typing import List, Dict, Any\n\nMOCK_POIS: List[Dict[str, Any]] = " + json.dumps(MOCK_POIS, ensure_ascii=False, indent=4) + "\n"
    with open(backend_mock_file, "w", encoding="utf-8") as f:
        f.write(backend_content)
    print(f"Đã lưu: {backend_mock_file}")

    # Cập nhật frontend mockData.ts
    frontend_mock_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "src", "constants", "mockData.ts"))
    frontend_content = "import { POI } from '../types';\n\nexport const FALLBACK_POIS: POI[] = " + json.dumps(MOCK_POIS, ensure_ascii=False, indent=2) + ";\n"
    with open(frontend_mock_file, "w", encoding="utf-8") as f:
        f.write(frontend_content)
    print(f"Đã lưu: {frontend_mock_file}")

if __name__ == "__main__":
    main()
