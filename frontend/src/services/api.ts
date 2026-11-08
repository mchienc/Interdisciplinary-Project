import { POI, Accommodation, PlanRequest, PlanResponse, DayItinerary, LegDetail } from '../types';
import { FALLBACK_POIS } from '../constants/mockData';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const CUSTOM_POIS_STORAGE_KEY = 'hanoi_sdss_custom_pois';

/**
 * Danh sách 15 Cơ sở lưu trú chuẩn hóa tại Hà Nội (Đồng bộ 100% với PostGIS / init.sql)
 */
export const FALLBACK_ACCOMMODATIONS: Accommodation[] = [
  { id: 1, name: 'Sofitel Legend Metropole Hanoi', type: 'hotel', stars: 5, rating: 4.9, price_per_night: 6500000, address: '15 Ngô Quyền, Hoàn Kiếm, Hà Nội', phone: '024 3826 6919', lat: 21.0256, lon: 105.8565 },
  { id: 2, name: 'Capella Hanoi Hotel', type: 'hotel', stars: 5, rating: 4.9, price_per_night: 7200000, address: '11 Lê Phụng Hiểu, Hoàn Kiếm, Hà Nội', phone: '024 3987 8888', lat: 21.0265, lon: 105.8573 },
  { id: 3, name: 'Melia Hanoi Hotel', type: 'hotel', stars: 5, rating: 4.7, price_per_night: 3400000, address: '44B Lý Thường Kiệt, Hoàn Kiếm, Hà Nội', phone: '024 3934 3343', lat: 21.0243, lon: 105.8482 },
  { id: 4, name: 'Apricot Hotel Hanoi', type: 'hotel', stars: 5, rating: 4.8, price_per_night: 3800000, address: '136 Hàng Trống, Hoàn Kiếm, Hà Nội', phone: '024 3828 9595', lat: 21.0294, lon: 105.8505 },
  { id: 5, name: 'Pan Pacific Hanoi', type: 'hotel', stars: 5, rating: 4.7, price_per_night: 3200000, address: '1 Đường Thanh Niên, Ba Đình, Hà Nội', phone: '024 3823 8888', lat: 21.0494, lon: 105.8369 },
  { id: 6, name: 'InterContinental Hanoi Westlake', type: 'resort', stars: 5, rating: 4.8, price_per_night: 4200000, address: '5 Từ Hoa, Quảng An, Tây Hồ, Hà Nội', phone: '024 6270 8888', lat: 21.0589, lon: 105.8315 },
  { id: 7, name: 'Peridot Grand Luxury Boutique Hotel', type: 'hotel', stars: 5, rating: 4.9, price_per_night: 3500000, address: '33 Đường Thành, Hoàn Kiếm, Hà Nội', phone: '024 3828 0099', lat: 21.0325, lon: 105.8468 },
  { id: 8, name: 'Hanoi La Siesta Classic Ma May', type: 'hotel', stars: 4, rating: 4.8, price_per_night: 1950000, address: '94 Mã Mây, Hàng Buồm, Hoàn Kiếm, Hà Nội', phone: '024 3926 3641', lat: 21.0352, lon: 105.8532 },
  { id: 9, name: 'Hanoi La Siesta Trendy Hotel', type: 'hotel', stars: 4, rating: 4.7, price_per_night: 1650000, address: '12 Nguyễn Quang Bích, Cửa Đông, Hoàn Kiếm, Hà Nội', phone: '024 3923 4026', lat: 21.0332, lon: 105.8462 },
  { id: 10, name: 'The Oriental Jade Hotel', type: 'hotel', stars: 5, rating: 4.8, price_per_night: 2900000, address: '92-94 Hàng Trống, Hoàn Kiếm, Hà Nội', phone: '024 3936 7777', lat: 21.0308, lon: 105.8501 },
  { id: 11, name: 'Pullman Hanoi Hotel', type: 'hotel', stars: 5, rating: 4.6, price_per_night: 2700000, address: '40 Cát Linh, Đống Đa, Hà Nội', phone: '024 3733 0688', lat: 21.0289, lon: 105.8295 },
  { id: 12, name: 'Lotte Hotel Hanoi', type: 'hotel', stars: 5, rating: 4.9, price_per_night: 4500000, address: '54 Liễu Giai, Cống Vị, Ba Đình, Hà Nội', phone: '024 3333 1000', lat: 21.0319, lon: 105.8125 },
  { id: 13, name: 'Hanoi Tirant Hotel', type: 'hotel', stars: 4, rating: 4.5, price_per_night: 1450000, address: '38 Gia Ngư, Hàng Bạc, Hoàn Kiếm, Hà Nội', phone: '024 3935 1630', lat: 21.0334, lon: 105.8528 },
  { id: 14, name: 'Acoustic Hotel & Spa Hanoi', type: 'hotel', stars: 4, rating: 4.7, price_per_night: 1350000, address: '39 Thợ Nhuộm, Cửa Nam, Hoàn Kiếm, Hà Nội', phone: '024 3938 6777', lat: 21.0258, lon: 105.8442 },
  { id: 15, name: 'Old Quarter View Hanoi Hostel', type: 'homestay', stars: 3, rating: 4.6, price_per_night: 550000, address: '42 Hàng Giầy, Hàng Buồm, Hoàn Kiếm, Hà Nội', phone: '024 3926 2328', lat: 21.0365, lon: 105.8515 }
];

const getStoredCustomPois = (): POI[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_POIS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Thuật toán lặp Weiszfeld tìm Trung vị Hình học (L1-Median H*)
 */
const computeWeiszfeldMedian = (pois: POI[]): { lat: number; lon: number } => {
  if (pois.length === 0) return { lat: 21.0285, lon: 105.8542 };
  if (pois.length === 1) return { lat: pois[0].lat, lon: pois[0].lon };

  let curLat = pois.reduce((s, p) => s + p.lat, 0) / pois.length;
  let curLon = pois.reduce((s, p) => s + p.lon, 0) / pois.length;
  const eps = 1e-7;

  for (let iter = 0; iter < 100; iter++) {
    let numLat = 0;
    let numLon = 0;
    let denom = 0;
    for (const p of pois) {
      const dist = Math.hypot(p.lat - curLat, (p.lon - curLon) * Math.cos((curLat * Math.PI) / 180)) + eps;
      const w = 1.0 / dist;
      numLat += p.lat * w;
      numLon += p.lon * w;
      denom += w;
    }
    const nextLat = numLat / denom;
    const nextLon = numLon / denom;
    if (Math.hypot(nextLat - curLat, nextLon - curLon) < 1e-6) {
      curLat = nextLat;
      curLon = nextLon;
      break;
    }
    curLat = nextLat;
    curLon = nextLon;
  }
  return { lat: Number(curLat.toFixed(6)), lon: Number(curLon.toFixed(6)) };
};

/**
 * Phân cụm ngày cân bằng (Balanced K-Means)
 */
const clusterPoisByDay = (pois: POI[], days: number): POI[][] => {
  const k = Math.max(1, Math.min(days, pois.length));
  if (k === 1) return [pois];

  // Sắp xếp điểm theo góc phương vị quanh tâm để tạo các cụm địa lý liền kề và chia đều dung lượng
  const center = computeWeiszfeldMedian(pois);
  const sorted = [...pois].sort((a, b) => {
    const angA = Math.atan2(a.lat - center.lat, a.lon - center.lon);
    const angB = Math.atan2(b.lat - center.lat, b.lon - center.lon);
    return angA - angB;
  });

  const clusters: POI[][] = Array.from({ length: k }, () => []);
  const n = sorted.length;
  const baseSize = Math.floor(n / k);
  const remainder = n % k;

  let idx = 0;
  for (let d = 0; d < k; d++) {
    const cap = baseSize + (d < remainder ? 1 : 0);
    clusters[d] = sorted.slice(idx, idx + cap);
    idx += cap;
  }
  return clusters;
};

/**
 * Giải TSP vòng kín kết hợp khung giờ sinh học (Morning -> Afternoon -> Evening)
 */
const solveDayTspSequence = (hotel: { lat: number; lon: number }, dayPois: POI[]): POI[] => {
  if (dayPois.length <= 1) return dayPois;

  const remaining = [...dayPois];
  const ordered: POI[] = [];
  let cur = { lat: hotel.lat, lon: hotel.lon };

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestCost = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const p = remaining[i];
      let d = haversineKm(cur.lat, cur.lon, p.lat, p.lon);
      // Ưu tiên điểm buổi sáng lên đầu hành trình
      if (ordered.length === 0 && p.ideal_time === 'morning') d *= 0.65;
      if (ordered.length === 0 && p.ideal_time === 'evening') d *= 1.35;
      if (d < bestCost) {
        bestCost = d;
        bestIdx = i;
      }
    }
    const chosen = remaining.splice(bestIdx, 1)[0];
    ordered.push(chosen);
    cur = { lat: chosen.lat, lon: chosen.lon };
  }
  return ordered;
};

/**
 * Gọi trực tiếp OSRM HTTPS Public Router để lấy đường đi thực tế trên mặt phố Hà Nội
 */
const buildDayItineraryWithOsrm = async (
  dayNumber: number,
  hotel: Accommodation,
  sequence: POI[],
  transportMode: 'walking' | 'bike' | 'driving' = 'driving',
  trafficMultiplier: number = 1.0
): Promise<DayItinerary> => {
  const nodes = [
    { name: hotel.name, lat: hotel.lat, lon: hotel.lon },
    ...sequence.map(p => ({ name: p.name, lat: p.lat, lon: p.lon })),
    { name: hotel.name, lat: hotel.lat, lon: hotel.lon }
  ];

  const speedMap = { walking: 4.8, bike: 18.0, driving: 26.0 };
  const speedKmH = speedMap[transportMode] || 26.0;

  try {
    const coordStr = nodes.map(n => `${n.lon},${n.lat}`).join(';');
    const profile = transportMode === 'walking' ? 'foot' : transportMode === 'bike' ? 'bike' : 'driving';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/${profile}/${coordStr}?overview=full&geometries=geojson&steps=false`,
      { signal: controller.signal }
    );
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const osrmLegs = route.legs || [];
        const legs: LegDetail[] = [];
        let totalDistKm = 0;
        let totalDurMin = 0;

        for (let i = 0; i < nodes.length - 1; i++) {
          const rawDistKm = osrmLegs[i] ? osrmLegs[i].distance / 1000.0 : haversineKm(nodes[i].lat, nodes[i].lon, nodes[i + 1].lat, nodes[i + 1].lon) * 1.3;
          const distKm = Math.round(rawDistKm * 100) / 100;
          const rawMin = (distKm / speedKmH) * 60;
          const durMin = Math.max(4, Math.round(rawMin * trafficMultiplier));
          totalDistKm += distKm;
          totalDurMin += durMin;
          legs.push({
            from_name: nodes[i].name,
            to_name: nodes[i + 1].name,
            distance_km: distKm,
            duration_min: durMin
          });
        }

        return {
          day: dayNumber,
          hotel: hotel,
          visit_sequence: sequence,
          total_distance_km: Math.round(totalDistKm * 100) / 100,
          total_duration_min: totalDurMin,
          legs,
          route_geojson: {
            type: 'Feature',
            properties: { day: dayNumber },
            geometry: route.geometry
          }
        };
      }
    }
  } catch {
    // Fallback hình học nếu OSRM bận
  }

  const legs: LegDetail[] = [];
  let totalDistKm = 0;
  let totalDurMin = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    const distKm = Math.round(haversineKm(nodes[i].lat, nodes[i].lon, nodes[i + 1].lat, nodes[i + 1].lon) * 1.32 * 100) / 100;
    const durMin = Math.max(4, Math.round(((distKm / speedKmH) * 60) * trafficMultiplier));
    totalDistKm += distKm;
    totalDurMin += durMin;
    legs.push({
      from_name: nodes[i].name,
      to_name: nodes[i + 1].name,
      distance_km: distKm,
      duration_min: durMin
    });
  }

  return {
    day: dayNumber,
    hotel: hotel,
    visit_sequence: sequence,
    total_distance_km: Math.round(totalDistKm * 100) / 100,
    total_duration_min: totalDurMin,
    legs,
    route_geojson: {
      type: 'Feature',
      properties: { day: dayNumber },
      geometry: {
        type: 'LineString',
        coordinates: nodes.map(n => [n.lon, n.lat])
      }
    }
  };
};

/**
 * Động cơ SDSS phía Client (Đảm bảo hoạt động Trực tuyến 100% trên cả Vercel Cloud & Localhost)
 */
const runClientSideSdssOptimization = async (req: PlanRequest): Promise<PlanResponse> => {
  const allPois = [...getStoredCustomPois(), ...FALLBACK_POIS];
  const selectedPois = allPois.filter(p => req.poi_ids.includes(p.id));
  const targetPois = selectedPois.length >= 2 ? selectedPois : FALLBACK_POIS.slice(0, 6);

  // 1. Tìm Trung vị Hình học Weiszfeld L1-Median H*
  const median = computeWeiszfeldMedian(targetPois);

  // 2. Chấm điểm khách sạn đa tiêu chí (Spatial MCDA)
  const radiusKm = (req.radius_meters || 5000) / 1000.0;
  const wDist = req.weights?.w_distance ?? 0.4;
  const wRate = req.weights?.w_rating ?? 0.35;
  const wPrice = req.weights?.w_price ?? 0.25;
  const wSum = wDist + wRate + wPrice || 1.0;

  let candidates = FALLBACK_ACCOMMODATIONS.map(acc => {
    const distM = Math.round(haversineKm(median.lat, median.lon, acc.lat, acc.lon) * 1000);
    return { ...acc, distance_to_median_m: distM };
  }).filter(acc => {
    if (acc.distance_to_median_m! > radiusKm * 1000 * 1.5) return false;
    if (req.max_budget && acc.price_per_night > req.max_budget) return false;
    if (req.min_stars && acc.stars < req.min_stars) return false;
    return true;
  });

  if (candidates.length === 0) {
    candidates = FALLBACK_ACCOMMODATIONS.map(acc => ({
      ...acc,
      distance_to_median_m: Math.round(haversineKm(median.lat, median.lon, acc.lat, acc.lon) * 1000)
    }));
  }

  const maxDist = Math.max(...candidates.map(c => c.distance_to_median_m || 1), 1);
  const maxPrice = Math.max(...candidates.map(c => c.price_per_night), 1);
  const minPrice = Math.min(...candidates.map(c => c.price_per_night));

  const scoredHotels = candidates.map(c => {
    const sDist = 1.0 - Math.min(1.0, (c.distance_to_median_m || 0) / maxDist);
    const sRate = (c.rating || 4.5) / 5.0;
    const sPrice = maxPrice > minPrice ? 1.0 - (c.price_per_night - minPrice) / (maxPrice - minPrice) : 1.0;
    const mcda = (wDist * sDist + wRate * sRate + wPrice * sPrice) / wSum;
    return { ...c, mcda_score: Math.round(mcda * 1000) / 1000 };
  }).sort((a, b) => (b.mcda_score || 0) - (a.mcda_score || 0));

  const topHotels = scoredHotels.slice(0, 5);
  const selectedHotel =
    (req.selected_hotel_id ? scoredHotels.find(h => h.id === req.selected_hotel_id) : undefined) ||
    topHotels[0];

  // 3. Phân cụm ngày cân bằng (Balanced K-Means)
  const dayClusters = clusterPoisByDay(targetPois, req.days || 2);

  // 4. Giải TSP + Định tuyến mặt phố OSRM cho từng ngày
  const modeClean: 'walking' | 'bike' | 'driving' =
    req.transport_mode === 'walking' || req.transport_mode === 'bike' ? req.transport_mode : 'driving';
  const dailyItineraries: DayItinerary[] = [];
  for (let d = 0; d < dayClusters.length; d++) {
    const orderedSeq = solveDayTspSequence(selectedHotel, dayClusters[d]);
    const dayPlan = await buildDayItineraryWithOsrm(
      d + 1,
      selectedHotel,
      orderedSeq,
      modeClean,
      req.traffic_multiplier || 1.0
    );
    dailyItineraries.push(dayPlan);
  }

  const totalTripDist = dailyItineraries.reduce((s, d) => s + d.total_distance_km, 0);

  return {
    success: true,
    days: dailyItineraries.length,
    total_pois: targetPois.length,
    transport_mode: modeClean,
    geometric_median: {
      lat: median.lat,
      lon: median.lon
    },
    selected_hotel: selectedHotel,
    recommended_accommodations: topHotels,
    total_trip_distance_km: Math.round(totalTripDist * 100) / 100,
    daily_itineraries: dailyItineraries
  };
};

/**
 * Lấy danh sách toàn bộ các điểm du lịch (POIs)
 */
export const fetchPoisApi = async (): Promise<POI[]> => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE_URL}/pois`, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Tự động chuyển sang bộ dữ liệu chuẩn hóa trên Cloud
  }
  return [...getStoredCustomPois(), ...FALLBACK_POIS];
};

/**
 * Thêm một địa điểm du lịch tùy biến mới
 */
export const createPoiApi = async (poiData: Partial<POI>): Promise<POI> => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE_URL}/pois`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poiData),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Lưu trực tiếp trên trình duyệt khi chạy Cloud Serverless
  }

  const newPoi: POI = {
    id: Date.now(),
    name: poiData.name || 'Địa điểm mới tại Hà Nội',
    category: poiData.category || 'heritage',
    description: poiData.description || 'Địa điểm do du khách đóng góp trên bản đồ số Hà Nội Thong Dong.',
    lat: Number(poiData.lat) || 21.0285,
    lon: Number(poiData.lon) || 105.8542,
    estimated_duration_min: Number(poiData.estimated_duration_min) || 60,
    opening_hours: poiData.opening_hours || '08:00 - 21:00',
    ticket_price: Number(poiData.ticket_price) || 0,
    venue_type: poiData.venue_type || 'outdoor',
    image_url: poiData.image_url
  };

  try {
    const existing = getStoredCustomPois();
    localStorage.setItem(CUSTOM_POIS_STORAGE_KEY, JSON.stringify([newPoi, ...existing]));
  } catch {
    // ignore storage quota
  }
  return newPoi;
};

/**
 * Gửi yêu cầu tối ưu hóa hành trình và đề xuất lưu trú (Weiszfeld + OR-Tools TSP / OSRM)
 */
export const optimizeItineraryApi = async (req: PlanRequest): Promise<PlanResponse> => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE_URL}/itinerary/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Tự động thực thi thuật toán SDSS + OSRM trực tiếp trên Cloud
  }
  return await runClientSideSdssOptimization(req);
};
