import { DayItinerary, POI } from '../types';

export interface ScheduleStep {
  id: string;
  type: 'hotel_depart' | 'travel' | 'poi' | 'lunch' | 'hotel_return';
  startTime: string; // "08:00"
  endTime: string;   // "09:30"
  timeSlot: string;  // "08:00 – 09:30"
  title: string;
  subtitle?: string;
  durationMin: number;
  distanceKm?: number;
  poi?: POI;
  goldenHour?: string;
  isGoldenHourMatch?: boolean;
  warning?: string;
}

/**
 * Từ điển Khung giờ vàng trải nghiệm đẹp nhất tại các địa danh Hà Nội
 */
export const HANOI_GOLDEN_HOURS: Record<string, { slot: string; note: string; startMin: number; endMin: number }> = {
  'Hồ Hoàn Kiếm': {
    slot: '06:30 – 08:30',
    note: 'Ban mai yên ả ngắm Tháp Rùa và người dân tập dưỡng sinh',
    startMin: 390,
    endMin: 510
  },
  'Lăng Chủ tịch': {
    slot: '07:30 – 10:30',
    note: 'Khung giờ viếng Lăng Bác buổi sáng trang nghiêm, tránh nắng gắt',
    startMin: 450,
    endMin: 630
  },
  'Văn Miếu': {
    slot: '08:30 – 10:30',
    note: 'Không gian tĩnh lặng, ánh nắng xuyên qua tán cây Khuê Văn Các',
    startMin: 510,
    endMin: 630
  },
  'Khu Phố Cổ': {
    slot: '19:00 – 22:00',
    note: 'Phố lên đèn rực rỡ, chợ đêm sầm uất và ẩm thực vỉa hè náo nhiệt',
    startMin: 1140,
    endMin: 1320
  },
  'Chùa Trấn Quốc': {
    slot: '16:30 – 18:00',
    note: 'Khung giờ vàng chiêm bái và đón hoàng hôn đỏ rực bên mặt hồ',
    startMin: 990,
    endMin: 1080
  },
  'Hồ Tây': {
    slot: '16:30 – 18:15',
    note: 'Thời khắc hoàng hôn lãng mạn nhất Thủ đô, gió hồ mát lành',
    startMin: 990,
    endMin: 1095
  },
  'Hoàng Thành': {
    slot: '08:30 – 11:00',
    note: 'Thời tiết mát mẻ dễ chịu để tản bộ quanh di tích Đoan Môn',
    startMin: 510,
    endMin: 660
  },
  'Nhà tù Hỏa Lò': {
    slot: '09:00 – 11:00',
    note: 'Buổi sáng vắng khách, dễ dàng lắng nghe thuyết minh sâu sắc',
    startMin: 540,
    endMin: 660
  },
  'Cà phê Giảng': {
    slot: '08:00 – 09:30',
    note: 'Nhâm nhi tách cà phê trứng thơm ngậy đón ngày mới',
    startMin: 480,
    endMin: 570
  },
  'Cầu Long Biên': {
    slot: '16:45 – 18:15',
    note: 'Ánh chiều tà buông xuống bãi bồi sông Hồng hoài niệm',
    startMin: 1005,
    endMin: 1095
  },
  'Chợ Đồng Xuân': {
    slot: '09:30 – 11:30',
    note: 'Các quầy hàng mở đầy đủ, nhộn nhịp mua sắm và thưởng thức quà vặt',
    startMin: 570,
    endMin: 690
  },
  'Bảo tàng Dân tộc': {
    slot: '09:00 – 11:30',
    note: 'Khám phá khu nhà rông ngoài trời khi trời chưa nắng gắt',
    startMin: 540,
    endMin: 690
  },
  'Nhà thờ Lớn': {
    slot: '16:00 – 18:30',
    note: 'Trà chanh vỉa hè, ngắm kiến trúc Gothic cổ kính lúc tan chiều',
    startMin: 960,
    endMin: 1110
  }
};

/**
 * Tìm Khung giờ vàng cho một địa điểm theo tên
 */
export const findGoldenHourForPoi = (poi: POI): { slot: string; note: string; startMin: number; endMin: number } | null => {
  if (poi.golden_hour) {
    return {
      slot: poi.golden_hour,
      note: 'Khung giờ trải nghiệm lý tưởng nhất',
      startMin: 480,
      endMin: 1080
    };
  }

  for (const [key, val] of Object.entries(HANOI_GOLDEN_HOURS)) {
    if (poi.name.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }

  // Fallback theo ideal_time
  if (poi.ideal_time === 'morning') {
    return { slot: '08:00 – 10:30', note: 'Buổi sáng mát mẻ, thanh tĩnh', startMin: 480, endMin: 630 };
  } else if (poi.ideal_time === 'afternoon') {
    return { slot: '14:30 – 17:00', note: 'Buổi chiều dịu nắng, thuận tiện tản bộ', startMin: 870, endMin: 1020 };
  } else if (poi.ideal_time === 'evening') {
    return { slot: '18:30 – 21:30', note: 'Buổi tối phố xá lên đèn sầm uất', startMin: 1110, endMin: 1290 };
  }

  return null;
};

/**
 * Chuyển số phút từ 00:00 sang chuỗi "HH:MM"
 */
export const minutesToTimeString = (totalMinutes: number): string => {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, Math.round(totalMinutes)));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Chuyển chuỗi "HH:MM" sang số phút
 */
export const timeStringToMinutes = (timeStr: string): number => {
  const parts = timeStr.split(':').map(p => parseInt(p, 10));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 8 * 60; // Mặc định 08:00
};

/**
 * Tự động tính toán Lịch trình mốc giờ chi tiết (Timeline Schedule)
 * dựa trên giờ xuất phát, thời gian di chuyển OSRM và thời lượng tham quan.
 */
export const generateDayTimeline = (
  dayItinerary: DayItinerary,
  departureTimeStr: string = '08:00'
): ScheduleStep[] => {
  if (!dayItinerary || !dayItinerary.visit_sequence || dayItinerary.visit_sequence.length === 0) {
    return [];
  }

  const steps: ScheduleStep[] = [];
  let currentMin = timeStringToMinutes(departureTimeStr);
  const hotelName = dayItinerary.hotel?.name || 'Khách sạn lưu trú';

  // 1. Bước khởi hành từ khách sạn
  steps.push({
    id: `depart-${dayItinerary.day}`,
    type: 'hotel_depart',
    startTime: minutesToTimeString(currentMin),
    endTime: minutesToTimeString(currentMin),
    timeSlot: minutesToTimeString(currentMin),
    title: 'Khởi hành từ chỗ nghỉ',
    subtitle: hotelName,
    durationMin: 0
  });

  let hasInsertedLunch = false;
  const pois = dayItinerary.visit_sequence;
  const legs = dayItinerary.legs || [];

  for (let idx = 0; idx < pois.length; idx++) {
    const poi = pois[idx];
    const leg = legs[idx];
    const travelMin = leg ? Math.max(5, Math.round(leg.duration_min)) : 15;
    const distanceKm = leg ? leg.distance_km : 1.5;

    // A. Chặng di chuyển tới điểm này
    const travelStart = currentMin;
    const travelEnd = currentMin + travelMin;

    steps.push({
      id: `travel-${dayItinerary.day}-${idx}`,
      type: 'travel',
      startTime: minutesToTimeString(travelStart),
      endTime: minutesToTimeString(travelEnd),
      timeSlot: `${minutesToTimeString(travelStart)} – ${minutesToTimeString(travelEnd)}`,
      title: `Di chuyển tới ${poi.name}`,
      subtitle: `Khoảng cách ~${distanceKm} km`,
      durationMin: travelMin,
      distanceKm
    });

    currentMin = travelEnd;

    // B. Kiểm tra xem có cần nghỉ trưa không (khoảng 11:45 - 13:15)
    // Nếu điểm ghé này đến sau 11:45 và trước đó chưa ăn trưa, hoặc đã ghé qua ít nhất 2 điểm
    if (!hasInsertedLunch && currentMin >= 11 * 60 + 45 && idx > 0 && idx < pois.length) {
      const lunchDuration = 75; // 1 tiếng 15 phút
      const lunchStart = currentMin;
      const lunchEnd = currentMin + lunchDuration;

      steps.push({
        id: `lunch-${dayItinerary.day}`,
        type: 'lunch',
        startTime: minutesToTimeString(lunchStart),
        endTime: minutesToTimeString(lunchEnd),
        timeSlot: `${minutesToTimeString(lunchStart)} – ${minutesToTimeString(lunchEnd)}`,
        title: 'Nghỉ trưa & Thưởng thức ẩm thực Hà Nội',
        subtitle: 'Thưởng thức bún chả, phở cuốn hoặc nhâm nhi cà phê quanh khu vực',
        durationMin: lunchDuration
      });

      hasInsertedLunch = true;
      currentMin = lunchEnd;
    }

    // C. Chặng tham quan tại điểm POI
    const visitDuration = poi.estimated_duration_min || 60;
    const visitStart = currentMin;
    const visitEnd = currentMin + visitDuration;

    // Kiểm tra Khung giờ vàng
    const goldenInfo = findGoldenHourForPoi(poi);
    let isGoldenHourMatch = false;
    let goldenHourText = undefined;

    if (goldenInfo) {
      goldenHourText = goldenInfo.slot;
      // Trùng hoặc giao nhau với khung giờ vàng
      if (
        (visitStart >= goldenInfo.startMin - 30 && visitStart <= goldenInfo.endMin) ||
        (visitEnd >= goldenInfo.startMin && visitEnd <= goldenInfo.endMin + 30)
      ) {
        isGoldenHourMatch = true;
      }
    }

    // Kiểm tra cảnh báo giờ đóng cửa
    let warning = undefined;
    if (poi.closed_time) {
      const closedMin = timeStringToMinutes(poi.closed_time);
      if (visitEnd > closedMin) {
        warning = `Lưu ý: Điểm này thường đóng cửa lúc ${poi.closed_time}`;
      }
    }

    steps.push({
      id: `poi-${dayItinerary.day}-${poi.id}`,
      type: 'poi',
      startTime: minutesToTimeString(visitStart),
      endTime: minutesToTimeString(visitEnd),
      timeSlot: `${minutesToTimeString(visitStart)} – ${minutesToTimeString(visitEnd)}`,
      title: poi.name,
      subtitle: `${poi.category} • ~${visitDuration} phút`,
      durationMin: visitDuration,
      poi,
      goldenHour: goldenHourText,
      isGoldenHourMatch,
      warning
    });

    currentMin = visitEnd;
  }

  // 3. Chặng quay về khách sạn
  const returnLeg = legs[legs.length - 1];
  const returnTravelMin = returnLeg ? Math.max(5, Math.round(returnLeg.duration_min)) : 15;
  const returnDistanceKm = returnLeg ? returnLeg.distance_km : 2.0;

  const returnTravelStart = currentMin;
  const returnTravelEnd = currentMin + returnTravelMin;

  steps.push({
    id: `return-travel-${dayItinerary.day}`,
    type: 'travel',
    startTime: minutesToTimeString(returnTravelStart),
    endTime: minutesToTimeString(returnTravelEnd),
    timeSlot: `${minutesToTimeString(returnTravelStart)} – ${minutesToTimeString(returnTravelEnd)}`,
    title: `Quay về chỗ nghỉ`,
    subtitle: `Khoảng cách ~${returnDistanceKm} km`,
    durationMin: returnTravelMin,
    distanceKm: returnDistanceKm
  });

  steps.push({
    id: `hotel-return-${dayItinerary.day}`,
    type: 'hotel_return',
    startTime: minutesToTimeString(returnTravelEnd),
    endTime: minutesToTimeString(returnTravelEnd),
    timeSlot: minutesToTimeString(returnTravelEnd),
    title: 'Nghỉ ngơi tại khách sạn',
    subtitle: `Khép lại ngày ${dayItinerary.day} thảnh thơi`,
    durationMin: 0
  });

  return steps;
};
