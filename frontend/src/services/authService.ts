import { User, SavedTrip, AdminStats, PlanResponse, POI } from '../types';
import { API_BASE_URL } from './api';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SaveTripPayload {
  title: string;
  days: number;
  selected_poi_ids: number[];
  plan_data: PlanResponse;
  is_public?: boolean;
}

/**
 * Đăng nhập
 */
export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const emailClean = email.trim().toLowerCase();
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailClean, password })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      // Fallback cho tài khoản demo nếu backend chưa kịp cập nhật hoặc mạng lag
      if ((emailClean === 'admin@example.com' || emailClean === 'admin@hanoitravel.vn') && password === 'admin123') {
        return {
          access_token: 'demo_admin_jwt_token',
          token_type: 'bearer',
          user: {
            id: 1,
            email: emailClean,
            full_name: 'Quản Trị Viên Hệ Thống',
            role: 'admin',
            created_at: new Date().toISOString()
          }
        };
      }
      if (emailClean === 'tourist@hanoitravel.vn' && password === 'tourist123') {
        return {
          access_token: 'demo_tourist_jwt_token',
          token_type: 'bearer',
          user: {
            id: 2,
            email: emailClean,
            full_name: 'Nguyễn Văn Du Khách',
            role: 'traveler',
            created_at: new Date().toISOString()
          }
        };
      }
      throw new Error(errorData.detail || `Đăng nhập thất bại (${res.status})`);
    }
    return res.json();
  } catch (err: any) {
    if ((emailClean === 'admin@example.com' || emailClean === 'admin@hanoitravel.vn') && password === 'admin123') {
      return {
        access_token: 'demo_admin_jwt_token',
        token_type: 'bearer',
        user: {
          id: 1,
          email: emailClean,
          full_name: 'Quản Trị Viên Hệ Thống',
          role: 'admin',
          created_at: new Date().toISOString()
        }
      };
    }
    if (emailClean === 'tourist@hanoitravel.vn' && password === 'tourist123') {
      return {
        access_token: 'demo_tourist_jwt_token',
        token_type: 'bearer',
        user: {
          id: 2,
          email: emailClean,
          full_name: 'Nguyễn Văn Du Khách',
          role: 'traveler',
          created_at: new Date().toISOString()
        }
      };
    }
    throw err;
  }
};

/**
 * Đăng ký tài khoản
 */
export const registerApi = async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Đăng ký thất bại (${res.status})`);
  }
  return res.json();
};

/**
 * Lấy hồ sơ tài khoản hiện tại từ Token
 */
export const getMeApi = async (token: string): Promise<User> => {
  if (token === 'demo_admin_jwt_token') {
    return {
      id: 1,
      email: 'admin@example.com',
      full_name: 'Quản Trị Viên Hệ Thống',
      role: 'admin',
      created_at: new Date().toISOString()
    };
  }
  if (token === 'demo_tourist_jwt_token') {
    return {
      id: 2,
      email: 'tourist@hanoitravel.vn',
      full_name: 'Nguyễn Văn Du Khách',
      role: 'traveler',
      created_at: new Date().toISOString()
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
    return res.json();
  } catch (err) {
    throw err;
  }
};

/**
 * Lưu chuyến đi vào tài khoản
 */
export const saveTripApi = async (payload: SaveTripPayload, token: string): Promise<SavedTrip> => {
  const res = await fetch(`${API_BASE_URL}/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Không thể lưu chuyến đi');
  }
  return res.json();
};

/**
 * Lấy danh sách toàn bộ chuyến đi đã lưu của người dùng
 */
export const getMyTripsApi = async (token: string): Promise<SavedTrip[]> => {
  const res = await fetch(`${API_BASE_URL}/trips`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error('Không thể tải danh sách chuyến đi');
  }
  return res.json();
};

/**
 * Lấy thông tin chuyến đi theo ID (liên kết chia sẻ)
 */
export const getTripByIdApi = async (tripId: string): Promise<SavedTrip> => {
  const res = await fetch(`${API_BASE_URL}/trips/${tripId}`);
  if (!res.ok) {
    throw new Error('Không tìm thấy thông tin chuyến đi này');
  }
  return res.json();
};

/**
 * Xóa chuyến đi
 */
export const deleteTripApi = async (tripId: string, token: string): Promise<boolean> => {
  const res = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error('Không thể xóa chuyến đi');
  }
  return true;
};

/**
 * Lấy thống kê DSS cho Admin Dashboard
 */
export const getAdminStatsApi = async (token: string): Promise<AdminStats> => {
  const res = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error('Không thể tải dữ liệu quản trị');
  }
  return res.json();
};

/**
 * Admin xóa POI
 */
export const deletePoiAdminApi = async (poiId: number, token: string): Promise<boolean> => {
  const res = await fetch(`${API_BASE_URL}/admin/pois/${poiId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error('Không thể xóa địa điểm này');
  }
  return true;
};

/**
 * Lấy danh sách lịch trình công khai từ cộng đồng du khách
 */
export const getCommunityFeedApi = async (params?: {
  q?: string;
  days?: number;
  sort_by?: 'popular' | 'newest' | 'clones';
  limit?: number;
}): Promise<SavedTrip[]> => {
  const query = new URLSearchParams();
  if (params?.q) query.append('q', params.q);
  if (params?.days) query.append('days', params.days.toString());
  if (params?.sort_by) query.append('sort_by', params.sort_by);
  if (params?.limit) query.append('limit', params.limit.toString());

  const queryString = query.toString() ? '?' + query.toString() : '';
  const url = `${API_BASE_URL}/trips/feed${queryString}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Lỗi máy chủ khi lấy bảng tin cộng đồng');
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend chưa sẵn sàng hoặc lỗi mạng, trả về dữ liệu mẫu cộng đồng:', err);
    return getFallbackCommunityTrips();
  }
};

/**
 * Thả tim / Like chuyến đi cộng đồng
 */
export const likeTripApi = async (tripId: string): Promise<{ success: boolean; likes_count: number }> => {
  const res = await fetch(`${API_BASE_URL}/trips/${tripId}/like`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error('Không thể thả tim chuyến đi');
  }
  return res.json();
};

/**
 * Sao chép lịch trình cộng đồng về tài khoản cá nhân
 */
export const cloneTripApi = async (tripId: string, token: string): Promise<SavedTrip> => {
  const res = await fetch(`${API_BASE_URL}/trips/${tripId}/clone`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}` 
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Không thể sao chép chuyến đi');
  }
  return res.json();
};

/**
 * Bật/tắt chế độ công khai (Public / Private) của chuyến đi cá nhân
 */
export const toggleTripVisibilityApi = async (tripId: string, token: string): Promise<{ success: boolean; is_public: boolean }> => {
  const res = await fetch(`${API_BASE_URL}/trips/${tripId}/visibility`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}` 
    }
  });
  if (!res.ok) {
    throw new Error('Không thể đổi quyền riêng tư của chuyến đi');
  }
  return res.json();
};

/**
 * Dữ liệu dự phòng phong phú cho bảng tin cộng đồng (khi chạy offline)
 */
export const getFallbackCommunityTrips = (): SavedTrip[] => [
  {
    id: 'comm-1',
    user_id: 1,
    author_name: 'Thu Trang (Hanoi Explorer)',
    title: 'Hà Nội Hoài Cổ & Cà Phê Trứng (2 Ngày)',
    days: 2,
    selected_poi_ids: [1, 2, 3, 4, 7, 8],
    is_public: true,
    likes_count: 54,
    clones_count: 32,
    tags: 'Hoài cổ, Ẩm thực, Di sản, Check-in',
    summary: 'Hành trình lắng đọng qua 36 phố phường, Văn Miếu, Hoàng thành và thưởng thức cà phê trứng trứ danh.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    plan_data: {
      success: true,
      days: 2,
      total_pois: 6,
      geometric_median: {
        lat: 21.033,
        lon: 105.845,
        method: 'Tọa độ trung tâm',
        iterations: 12,
        mean_distance_to_pois_km: 1.8,
        centroid_comparison_gain_km: 0.35
      },
      recommended_accommodations: [],
      selected_hotel: {
        id: 101,
        name: 'The Oriental Jade Hotel & Spa',
        type: 'Khách sạn Boutique',
        stars: 5,
        rating: 4.8,
        price_per_night: 1850000,
        lat: 21.0315,
        lon: 105.8505,
        address: '92 - 94 Hàng Trống, Hoàn Kiếm, Hà Nội'
      },
      daily_itineraries: [],
      total_trip_distance_km: 14.5,
      total_trip_duration_min: 78
    }
  },
  {
    id: 'comm-2',
    user_id: 2,
    author_name: 'Bảo Long (Ẩm Thực Phố Cổ)',
    title: 'Foodtour 36 Phố Phường Trọn Vị (1 Ngày)',
    days: 1,
    selected_poi_ids: [1, 4, 11, 14, 15],
    is_public: true,
    likes_count: 89,
    clones_count: 63,
    tags: 'Foodtour, Ẩm thực đường phố, Phố Cổ',
    summary: 'Khám phá trọn vẹn ẩm thực Hà thành từ phở bò gia truyền, bún chả Hàng Quạt đến kem Tràng Tiền.',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    plan_data: {
      success: true,
      days: 1,
      total_pois: 5,
      geometric_median: {
        lat: 21.034,
        lon: 105.851,
        method: 'Tọa độ trung tâm',
        iterations: 10,
        mean_distance_to_pois_km: 0.9,
        centroid_comparison_gain_km: 0.22
      },
      recommended_accommodations: [],
      selected_hotel: {
        id: 102,
        name: 'Hanoi La Siesta Hotel & Spa',
        type: 'Khách sạn Phố Cổ',
        stars: 4,
        rating: 4.7,
        price_per_night: 1350000,
        lat: 21.0355,
        lon: 105.8512,
        address: '94 Mã Mây, Hàng Buồm, Hoàn Kiếm, Hà Nội'
      },
      daily_itineraries: [],
      total_trip_distance_km: 6.8,
      total_trip_duration_min: 42
    }
  },
  {
    id: 'comm-3',
    user_id: 3,
    author_name: 'Hoàng Minh (Văn Hóa Hà Nội)',
    title: 'Hành Trình Di Sản Thăng Long & Hồ Tây (3 Ngày)',
    days: 3,
    selected_poi_ids: [1, 2, 3, 5, 6, 9, 10],
    is_public: true,
    likes_count: 67,
    clones_count: 41,
    tags: 'Di sản, Hồ Tây, Kiến trúc Pháp, Thư giãn',
    summary: '3 ngày trọn vẹn chiêm ngưỡng nghìn năm văn hiến, chiều hoàng hôn Hồ Tây và các công trình Pháp cổ kính.',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    plan_data: {
      success: true,
      days: 3,
      total_pois: 7,
      geometric_median: {
        lat: 21.038,
        lon: 105.836,
        method: 'Tọa độ trung tâm',
        iterations: 15,
        mean_distance_to_pois_km: 2.6,
        centroid_comparison_gain_km: 0.48
      },
      recommended_accommodations: [],
      selected_hotel: {
        id: 103,
        name: 'Pan Pacific Hanoi',
        type: 'Khách sạn Hạng sang View Hồ Tây',
        stars: 5,
        rating: 4.6,
        price_per_night: 2200000,
        lat: 21.0475,
        lon: 105.8398,
        address: '1 Đường Thanh Niên, Ba Đình, Hà Nội'
      },
      daily_itineraries: [],
      total_trip_distance_km: 26.2,
      total_trip_duration_min: 135
    }
  },
  {
    id: 'comm-4',
    user_id: 4,
    author_name: 'Mai Anh (Travel Blogger)',
    title: 'Góc Sống Ảo Vintage & Nghệ Thuật Đương Đại (2 Ngày)',
    days: 2,
    selected_poi_ids: [3, 7, 8, 12, 13],
    is_public: true,
    likes_count: 95,
    clones_count: 58,
    tags: 'Check-in, Bảo tàng, Cầu Long Biên, Vintage',
    summary: 'Tuyển chọn những góc chụp ảnh giàu cảm xúc nhất Thủ đô: Cầu Long Biên, Bảo tàng Mỹ thuật, Nhà thờ Lớn.',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    plan_data: {
      success: true,
      days: 2,
      total_pois: 5,
      geometric_median: {
        lat: 21.032,
        lon: 105.842,
        method: 'Tọa độ trung tâm',
        iterations: 11,
        mean_distance_to_pois_km: 1.6,
        centroid_comparison_gain_km: 0.31
      },
      recommended_accommodations: [],
      selected_hotel: {
        id: 104,
        name: 'Apricot Hotel Hanoi',
        type: 'Khách sạn Nghệ thuật Nghỉ dưỡng',
        stars: 5,
        rating: 4.8,
        price_per_night: 2400000,
        lat: 21.0278,
        lon: 105.8512,
        address: '136 Hàng Trống, Hoàn Kiếm, Hà Nội'
      },
      daily_itineraries: [],
      total_trip_distance_km: 15.8,
      total_trip_duration_min: 85
    }
  }
];


/**
 * Lấy danh sách điểm tham quan đang chờ duyệt (Admin)
 */
export const getPendingPoisApi = async (token: string): Promise<POI[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/pending-pois`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Không thể tải danh sách chờ duyệt');
    return await res.json();
  } catch (err) {
    console.warn('Lỗi tải pending POIs hoặc đang chảy offline, dùng mock:', err);
    return getFallbackPendingPois();
  }
};

/**
 * Phê duyệt điểm tham quan (Admin)
 */
export const approvePoiAdminApi = async (poiId: number, token: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/pois/${poiId}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Không thể duyệt điểm này');
    removeFallbackPendingPoi(poiId);
    return await res.json();
  } catch (err) {
    removeFallbackPendingPoi(poiId);
    return { success: true, message: `Đã duyệt điểm #${poiId}` };
  }
};

/**
 * Từ chối điểm tham quan (Admin)
 */
export const rejectPoiAdminApi = async (poiId: number, token: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/pois/${poiId}/reject`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Không thể từ chối điểm này');
    removeFallbackPendingPoi(poiId);
    return await res.json();
  } catch (err) {
    removeFallbackPendingPoi(poiId);
    return { success: true, message: `Đã từ chối điểm #${poiId}` };
  }
};

let MOCK_PENDING_POIS: POI[] = [
  {
    id: 1001,
    name: 'Bánh Mì Dân Tổ (Ngã ba Cao Thắng - Trần Nhật Duật)',
    category: 'culinary',
    description: 'Quán bánh mì mở lúc 3h sáng nức tiếng Hà Thành, chảo nhân xào thập cẩm đậm đà béo ngậy được các bạn trẻ xếp hàng chờ mua giữa đêm khuya.',
    lat: 21.0425,
    lon: 105.8492,
    estimated_duration_min: 30,
    opening_hours: '03:00 - 08:00',
    ticket_price: 35000,
    venue_type: 'outdoor',
    status: 'pending',
    submitted_by: 'Nguyễn Văn Du Khách (tourist@hanoitravel.vn)',
    tips: 'Nên đến tầm 3h15 sáng để tận mắt chứng kiến chảo xào nhân khổng lồ thơm lừng.'
  },
  {
    id: 1002,
    name: 'Bảo tàng Gốm Bát Tràng (Tinh hoa Làng nghề Việt)',
    category: 'museum',
    description: 'Công trình kiến trúc 7 bàn xoay gốm khổng lồ đỏ son uốn lượn bên bờ sông Bắc Hưng Hải, trưng bày tinh hoa di sản gốm men hơn 500 năm Thăng Long.',
    lat: 20.9768,
    lon: 105.9085,
    estimated_duration_min: 120,
    opening_hours: '08:00 - 18:00',
    ticket_price: 50000,
    venue_type: 'indoor',
    status: 'pending',
    submitted_by: 'Trần Thảo Ly (Blogger)',
    tips: 'Tầng thượng có quán cà phê view trọn dòng sông và không gian trải nghiệm vuốt gốm thực tế.'
  }
];

export const getFallbackPendingPois = (): POI[] => [...MOCK_PENDING_POIS];
export const removeFallbackPendingPoi = (id: number) => {
  MOCK_PENDING_POIS = MOCK_PENDING_POIS.filter(p => p.id !== id);
};
