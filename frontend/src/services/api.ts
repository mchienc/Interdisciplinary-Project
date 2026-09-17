import { POI, PlanRequest, PlanResponse } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Lấy danh sách toàn bộ các điểm du lịch (POIs)
 */
export const fetchPoisApi = async (): Promise<POI[]> => {
  const res = await fetch(`${API_BASE_URL}/pois`);
  if (!res.ok) {
    throw new Error(`Failed to fetch POIs: ${res.statusText}`);
  }
  return res.json();
};

/**
 * Thêm một địa điểm du lịch tùy biến mới
 */
export const createPoiApi = async (poiData: Partial<POI>): Promise<POI> => {
  const res = await fetch(`${API_BASE_URL}/pois`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(poiData)
  });
  if (!res.ok) {
    throw new Error(`Failed to create POI: ${res.statusText}`);
  }
  return res.json();
};

/**
 * Gửi yêu cầu tối ưu hóa hành trình và đề xuất lưu trú (Weiszfeld + OR-Tools TSP)
 */
export const optimizeItineraryApi = async (req: PlanRequest): Promise<PlanResponse> => {
  const res = await fetch(`${API_BASE_URL}/itinerary/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Optimization failed (${res.status}): ${errorText}`);
  }
  return res.json();
};
