import numpy as np
from typing import List, Dict, Any, Tuple
from pyproj import Transformer
from sklearn.cluster import KMeans

# Transformer chuyển đổi giữa WGS84 (kinh độ, vĩ độ) và UTM Zone 49N (hệ tọa độ mét chuẩn cho Việt Nam)
to_metric = Transformer.from_crs("EPSG:4326", "EPSG:32649", always_xy=True)
to_wgs84 = Transformer.from_crs("EPSG:32649", "EPSG:4326", always_xy=True)

def compute_geometric_median_weiszfeld(
    coords: List[Tuple[float, float]], # List of (lat, lon)
    eps: float = 1e-6,
    max_iter: int = 150,
    tol: float = 1e-4
) -> Dict[str, Any]:
    """
    Tính toán Trung vị Hình học (Geometric Median / L1-Median) bằng Thuật toán lặp Weiszfeld.
    
    Toán học:
      Tìm điểm H(x, y) sao cho tổng khoảng cách Euclidean đến tập N điểm là nhỏ nhất:
        min_H sum_{i=1}^N ||H - P_i||_2
        
      Công thức lặp Weiszfeld:
        H^(t+1) = [sum_{i=1}^N P_i / (||H^(t) - P_i|| + eps)] / [sum_{i=1}^N 1 / (||H^(t) - P_i|| + eps)]
        
    Ưu thế học thuật so với Trọng tâm số học (Arithmetic Centroid):
      - Trọng tâm số học (L2 norm bình phương) cực kỳ nhạy cảm với các điểm ngoại lai (Outliers)
        như Bà Nà Hills hay đỉnh Bán đảo Sơn Trà, làm lệch vị trí khách sạn ra xa khu vực tập trung.
      - Geometric Median (L1 norm) là ước lượng trung tâm kháng ngoại lai (Robust Spatial Central Tendency),
        đảm bảo tổng quãng đường di chuyển của du khách trong suốt chuyến đi là ngắn nhất.
    """
    if not coords:
        raise ValueError("Danh sách tọa độ không được rỗng.")
        
    # Chuyển đổi toàn bộ tọa độ (lat, lon) sang không gian phẳng mét UTM (x, y)
    metric_pts = np.array([to_metric.transform(lon, lat) for lat, lon in coords])
    N = len(metric_pts)
    
    if N == 1:
        lat, lon = coords[0]
        return {
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "iterations": 0,
            "mean_distance_to_pois_km": 0.0,
            "centroid_comparison_gain_km": 0.0
        }
    elif N == 2:
        # Nếu chỉ có 2 điểm, trung vị hình học trùng với trung điểm đoạn thẳng
        mid = (metric_pts[0] + metric_pts[1]) / 2.0
        lon_mid, lat_mid = to_wgs84.transform(mid[0], mid[1])
        d_km = np.linalg.norm(metric_pts[0] - metric_pts[1]) / 2000.0
        return {
            "lat": round(lat_mid, 6),
            "lon": round(lon_mid, 6),
            "iterations": 1,
            "mean_distance_to_pois_km": round(float(d_km), 2),
            "centroid_comparison_gain_km": 0.0
        }

    # Điểm khởi tạo H(0): Trọng tâm số học (Centroid)
    centroid = np.mean(metric_pts, axis=0)
    H = centroid.copy()
    
    iterations = 0
    for it in range(max_iter):
        iterations += 1
        # Tính khoảng cách Euclidean từ H(t) đến từng điểm P_i
        distances = np.linalg.norm(metric_pts - H, axis=1)
        
        # Tránh chia cho 0 với epsilon ổn định số học
        weights = 1.0 / np.maximum(distances, eps)
        
        # Cập nhật tọa độ H(t+1)
        H_new = np.sum(metric_pts * weights[:, np.newaxis], axis=0) / np.sum(weights)
        
        # Kiểm tra điều kiện dừng: Độ dịch chuyển nhỏ hơn ngưỡng dung sai
        shift = np.linalg.norm(H_new - H)
        H = H_new
        if shift < tol:
            break

    # Tính tổng khoảng cách từ Geometric Median và từ Centroid đến tất cả POIs
    dist_from_median = np.sum(np.linalg.norm(metric_pts - H, axis=1)) / 1000.0 # km
    dist_from_centroid = np.sum(np.linalg.norm(metric_pts - centroid, axis=1)) / 1000.0 # km
    gain_km = max(0.0, dist_from_centroid - dist_from_median)
    
    # Chuyển ngược lại hệ tọa độ WGS84
    lon_res, lat_res = to_wgs84.transform(H[0], H[1])
    
    return {
        "lat": round(float(lat_res), 6),
        "lon": round(float(lon_res), 6),
        "iterations": iterations,
        "mean_distance_to_pois_km": round(float(dist_from_median / N), 2),
        "centroid_comparison_gain_km": round(float(gain_km), 2)
    }

def cluster_pois_by_days(
    pois: List[Dict[str, Any]],
    k_days: int
) -> List[List[Dict[str, Any]]]:
    """
    Phân cụm không gian N điểm tham quan thành K cụm ngày du lịch bằng thuật toán K-Means.
    
    Nguyên lý:
      - Các điểm du lịch gần nhau về mặt không gian địa lý sẽ được gom vào cùng một ngày,
        giúp hạn chế việc du khách phải di chuyển con thoi (zigzag) qua lại giữa các khu vực.
      - Chuyển đổi tọa độ sang hệ UTM để khoảng cách tính toán chuẩn xác theo mét.
    """
    N = len(pois)
    if k_days <= 1 or N <= k_days:
        if k_days == 1:
            return [pois]
        # Nếu số điểm <= số ngày, mỗi điểm tham quan 1 ngày
        clusters = [[p] for p in pois]
        while len(clusters) < k_days:
            clusters.append([])
        return clusters

    # Chuyển tọa độ sang metric phẳng
    metric_coords = np.array([
        to_metric.transform(p["lon"], p["lat"]) for p in pois
    ])

    kmeans = KMeans(n_clusters=k_days, random_state=42, n_init=10)
    labels = kmeans.fit_predict(metric_coords)

    # Gom nhóm các điểm theo label
    grouped: Dict[int, List[Dict[str, Any]]] = {i: [] for i in range(k_days)}
    for idx, label in enumerate(labels):
        grouped[int(label)].append(pois[idx])

    # Sắp xếp các cụm theo khoảng cách từ Tây sang Đông hoặc theo thứ tự địa lý hợp lý
    # để lịch trình giữa các ngày có tính tuần tự, mạch lạc
    cluster_centers = kmeans.cluster_centers_
    order = np.argsort(cluster_centers[:, 0]) # Sắp xếp theo trục X (kinh độ)

    sorted_clusters = [grouped[int(o)] for o in order if len(grouped[int(o)]) > 0]
    return sorted_clusters
