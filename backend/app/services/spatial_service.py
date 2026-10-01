import numpy as np
from typing import List, Dict, Any, Tuple
from pyproj import Transformer
from sklearn.cluster import KMeans
from scipy.optimize import linear_sum_assignment

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
    Phân cụm không gian N điểm tham quan thành K cụm ngày du lịch bằng thuật toán 
    K-Means có ràng buộc dung lượng (Balanced / Capacity-Constrained K-Means).
    
    Nguyên lý:
      - Các điểm du lịch gần nhau về mặt không gian địa lý sẽ được gom vào cùng một ngày,
        giúp hạn chế việc du khách phải di chuyển con thoi (zigzag) qua lại giữa các khu vực.
      - Chuyển đổi tọa độ sang hệ UTM Zone 49N để khoảng cách tính toán chuẩn xác theo mét.
      - Khắc phục nhược điểm của K-Means truyền thống (thường tạo ra các cụm lệch số lượng lớn,
        ví dụ: 1 điểm đơn độc ở Tây Hồ còn 5 điểm dồn vào cụm trung tâm):
        Sử dụng thuật toán Hungarian (Linear Sum Assignment) với N vị trí (slots) được phân bổ đều
        theo dung lượng floor(N/K) và ceil(N/K) cho từng ngày.
        Đảm bảo số điểm mỗi ngày luôn đồng đều (chênh lệch tối đa 1 điểm giữa các ngày).
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

    # Chuyển tọa độ sang metric phẳng (UTM Zone 49N)
    metric_coords = np.array([
        to_metric.transform(p["lon"], p["lat"]) for p in pois
    ])

    # 1. Khởi tạo trọng tâm cụm ban đầu bằng K-Means
    kmeans = KMeans(n_clusters=k_days, random_state=42, n_init=10)
    kmeans.fit(metric_coords)
    centers = kmeans.cluster_centers_.copy()

    # 2. Xác định dung lượng cân bằng cho từng ngày
    # Mỗi ngày nhận floor(N/k) hoặc ceil(N/k) điểm, tổng dung lượng đúng bằng N
    base = N // k_days
    rem = N % k_days

    # Ưu tiên thêm 1 slot cho các cụm có mật độ điểm tự nhiên cao hơn trong K-Means ban đầu
    initial_counts = np.bincount(kmeans.labels_, minlength=k_days)
    order_by_density = np.argsort(-initial_counts)

    capacities = [base] * k_days
    for i in range(rem):
        capacities[order_by_density[i]] += 1

    slot_cluster_ids = []
    for c, cap in enumerate(capacities):
        slot_cluster_ids.extend([c] * cap)
    slot_cluster_ids = np.array(slot_cluster_ids)

    # 3. Lặp tinh chỉnh (Iterative Centroid Refinement) kết hợp Bipartite Matching
    # Tối ưu hóa việc gán điểm vào các slot ngày để tổng khoảng cách Euclide di chuyển là cực tiểu
    labels = kmeans.labels_
    for _ in range(10):
        expanded_centers = centers[slot_cluster_ids]
        cost_matrix = np.linalg.norm(metric_coords[:, None, :] - expanded_centers[None, :, :], axis=2)
        row_ind, col_ind = linear_sum_assignment(cost_matrix)
        new_labels = slot_cluster_ids[col_ind]

        # Cập nhật lại trọng tâm cụm
        new_centers = np.zeros_like(centers)
        for c in range(k_days):
            pts_in_c = metric_coords[new_labels == c]
            if len(pts_in_c) > 0:
                new_centers[c] = np.mean(pts_in_c, axis=0)
            else:
                new_centers[c] = centers[c]
        if np.allclose(centers, new_centers, atol=1.0):
            labels = new_labels
            centers = new_centers
            break
        centers = new_centers
        labels = new_labels

    # Gom nhóm các điểm theo label ngày
    grouped: Dict[int, List[Dict[str, Any]]] = {i: [] for i in range(k_days)}
    for idx, label in enumerate(labels):
        grouped[int(label)].append(pois[idx])

    # Sắp xếp các cụm theo khoảng cách từ Tây sang Đông (trục X)
    # để lịch trình giữa các ngày có tính tuần tự, mạch lạc
    order = np.argsort(centers[:, 0])

    sorted_clusters = [grouped[int(o)] for o in order if len(grouped[int(o)]) > 0]
    return sorted_clusters
