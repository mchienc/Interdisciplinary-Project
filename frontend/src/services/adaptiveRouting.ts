import { 
  PlanResponse, 
  CurrentWeather, 
  TrafficStatus, 
  ContextSuggestion, 
  POI, 
  DayItinerary, 
  LegDetail 
} from '../types';

/**
 * Tính toán khoảng cách Haversine sơ bộ giữa 2 điểm (km)
 */
const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Tái tạo lại danh sách các chặng di chuyển (legs) khi thứ tự điểm ghé thăm thay đổi
 */
const rebuildLegsForSequence = (
  hotel: { name: string; lat: number; lon: number },
  sequence: POI[],
  trafficMultiplier: number = 1.0,
  speedKmH: number = 30.0
): { legs: LegDetail[]; totalDistanceKm: number; totalDurationMin: number } => {
  const nodes = [hotel, ...sequence, hotel];
  const legs: LegDetail[] = [];
  let totalDistanceKm = 0;
  let totalDurationMin = 0;

  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i];
    const to = nodes[i + 1];
    const dist = haversineKm(from.lat, from.lon, to.lat, to.lon) * 1.35; // Hệ số đường bộ nội đô
    const rawMinutes = (dist / speedKmH) * 60;
    const dur = Math.max(5, Math.round(rawMinutes * trafficMultiplier));

    totalDistanceKm += dist;
    totalDurationMin += dur;

    legs.push({
      from_name: from.name,
      to_name: to.name,
      distance_km: Math.round(dist * 10) / 10,
      duration_min: dur
    });
  }

  return {
    legs,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalDurationMin
  };
};

/**
 * Động cơ Thích ứng Ngữ cảnh:
 * Phân tích lộ trình hiện tại và tự động đề xuất tối ưu theo Thời tiết & Tình trạng Giao thông
 */
export const evaluateAdaptiveItinerary = (
  basePlan: PlanResponse | null,
  weather: CurrentWeather,
  traffic: TrafficStatus
): {
  adaptedPlan: PlanResponse | null;
  suggestion: ContextSuggestion | null;
  hasChanges: boolean;
} => {
  if (!basePlan || !basePlan.daily_itineraries || basePlan.daily_itineraries.length === 0) {
    return { adaptedPlan: basePlan, suggestion: null, hasChanges: false };
  }

  // Sao chép sâu đối tượng lịch trình
  const adaptedPlan: PlanResponse = JSON.parse(JSON.stringify(basePlan));
  let hasChanges = false;
  let suggestion: ContextSuggestion | null = null;

  // -------------------------------------------------------------
  // TRƯỜNG HỢP 1: CÓ MƯA (RAIN) -> Đẩy điểm Indoor lên trước
  // -------------------------------------------------------------
  if (weather.condition === 'RAIN') {
    for (let dayIdx = 0; dayIdx < adaptedPlan.daily_itineraries.length; dayIdx++) {
      const dayItin = adaptedPlan.daily_itineraries[dayIdx];
      const seq = dayItin.visit_sequence;

      if (seq.length < 2) continue;

      // Tìm xem điểm đầu tiên có phải outdoor không
      const firstIsOutdoor = (seq[0].venue_type || 'outdoor') === 'outdoor';
      const indoorIndex = seq.findIndex(
        (p, idx) => idx > 0 && (p.venue_type === 'indoor' || p.venue_type === 'semi-indoor')
      );

      if (firstIsOutdoor && indoorIndex !== -1) {
        const outdoorPoi = seq[0];
        const indoorPoi = seq[indoorIndex];

        // Hoán đổi vị trí: Đưa điểm Indoor lên đầu tiên
        const newSeq = [...seq];
        newSeq[0] = indoorPoi;
        newSeq[indoorIndex] = outdoorPoi;
        dayItin.visit_sequence = newSeq;

        // Tái tạo các chặng với hệ số giao thông
        const legResult = rebuildLegsForSequence(
          dayItin.hotel,
          newSeq,
          traffic.multiplier
        );
        dayItin.legs = legResult.legs;
        dayItin.total_distance_km = legResult.totalDistanceKm;
        dayItin.total_duration_min = legResult.totalDurationMin;

        hasChanges = true;
        suggestion = {
          id: 'weather_rain_swap',
          type: 'weather_rain',
          title: 'Dự báo trời sắp có mưa',
          message: `Nên ghé thăm [${indoorPoi.name}] (trong nhà) trước thay vì [${outdoorPoi.name}] để chuyến đi thoải mái và không bị ướt mưa.`,
          beforePoiName: outdoorPoi.name,
          recommendedPoiName: indoorPoi.name,
          applied: false
        };
        break; // Tối ưu ngày đầu tiên bị ảnh hưởng
      }
    }
  }

  // -------------------------------------------------------------
  // TRƯỜNG HỢP 2: NẮNG GẮT GAY GẮT (HEAT_PEAK) -> Tránh outdoor giữa trưa
  // -------------------------------------------------------------
  else if (weather.condition === 'HEAT_PEAK') {
    for (let dayIdx = 0; dayIdx < adaptedPlan.daily_itineraries.length; dayIdx++) {
      const dayItin = adaptedPlan.daily_itineraries[dayIdx];
      const seq = dayItin.visit_sequence;

      if (seq.length >= 3) {
        // Vị trí giữa trưa thường là index 1 hoặc 2
        const midIdx = Math.floor(seq.length / 2);
        const midIsOutdoor = (seq[midIdx].venue_type || 'outdoor') === 'outdoor';

        // Tìm điểm indoor để tráo vào giữa trưa mát mẻ
        const indoorIdx = seq.findIndex(
          (p, idx) => idx !== midIdx && (p.venue_type === 'indoor' || p.venue_type === 'semi-indoor')
        );

        if (midIsOutdoor && indoorIdx !== -1) {
          const outdoorPoi = seq[midIdx];
          const indoorPoi = seq[indoorIdx];

          const newSeq = [...seq];
          newSeq[midIdx] = indoorPoi;
          newSeq[indoorIdx] = outdoorPoi;
          dayItin.visit_sequence = newSeq;

          const legResult = rebuildLegsForSequence(
            dayItin.hotel,
            newSeq,
            traffic.multiplier
          );
          dayItin.legs = legResult.legs;
          dayItin.total_distance_km = legResult.totalDistanceKm;
          dayItin.total_duration_min = legResult.totalDurationMin;

          hasChanges = true;
          suggestion = {
            id: 'weather_heat_swap',
            type: 'weather_heat',
            title: `Trời nắng gắt (${weather.temperature.toFixed(1)}°C)`,
            message: `Buổi trưa trời rất nắng. Bạn nên ghé [${indoorPoi.name}] có điều hòa mát mẻ, và dời [${outdoorPoi.name}] về lúc trời dịu mát hơn.`,
            beforePoiName: outdoorPoi.name,
            recommendedPoiName: indoorPoi.name,
            applied: false
          };
          break;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // TRƯỜNG HỢP 3: GIỜ CAO ĐIỂM (TRAFFIC CONGESTION) -> Cập nhật hệ số trễ
  // -------------------------------------------------------------
  if (traffic.multiplier > 1.0) {
    let totalTripDur = 0;
    adaptedPlan.daily_itineraries.forEach((dayItin) => {
      dayItin.legs.forEach((leg) => {
        leg.duration_min = Math.round(leg.duration_min * traffic.multiplier);
      });
      dayItin.total_duration_min = dayItin.legs.reduce((acc, l) => acc + l.duration_min, 0);
      totalTripDur += dayItin.total_duration_min;
    });
    adaptedPlan.total_trip_duration_min = totalTripDur;
    hasChanges = true;

    if (!suggestion) {
      suggestion = {
        id: 'traffic_congestion_alert',
        type: 'traffic_congestion',
        title: traffic.label,
        message: `${traffic.description} Thời gian di chuyển có thể chậm hơn khoảng ${traffic.extraMinutes} phút.`,
        applied: false
      };
    }
  }

  if (suggestion) {
    suggestion.adaptedPlan = adaptedPlan;
  }

  return {
    adaptedPlan: hasChanges ? adaptedPlan : basePlan,
    suggestion,
    hasChanges
  };
};
