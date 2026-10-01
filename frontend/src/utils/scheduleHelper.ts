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
 * Thông tin Lịch biểu (Thứ trong tuần, Cuối tuần, Ngày/Tháng)
 */
export interface DayCalendarInfo {
  dateObj: Date;
  dayOfWeek: number;      // 0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy (JS standard)
  isoDayOfWeek: number;   // 0: Thứ Hai, 4: Thứ Sáu, 6: Chủ Nhật (Python standard)
  dayName: string;        // "Thứ Hai", "Thứ Bảy", "Chủ Nhật"...
  shortDayName: string;   // "T2", "T7", "CN"...
  formattedDate: string;  // "03/10"
  fullDateStr: string;    // "03/10/2026"
  isWeekend: boolean;     // Thứ Bảy hoặc Chủ Nhật
  isFriday: boolean;      // Thứ Sáu
  label: string;          // "Thứ Bảy, 03/10"
}

export const getDayCalendarInfo = (dayNumber: number, baseDateStr?: string): DayCalendarInfo => {
  let baseDate = new Date();
  if (baseDateStr) {
    const parts = baseDateStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      baseDate = new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }

  const dateObj = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + (dayNumber - 1));
  const dayOfWeek = dateObj.getDay(); // 0: CN, 1: T2 ... 6: T7
  const isoDayOfWeek = (dayOfWeek + 6) % 7; // 0: T2 ... 4: T6, 6: CN

  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const shortNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const dd = dateObj.getDate().toString().padStart(2, '0');
  const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = dateObj.getFullYear();

  return {
    dateObj,
    dayOfWeek,
    isoDayOfWeek,
    dayName: dayNames[dayOfWeek],
    shortDayName: shortNames[dayOfWeek],
    formattedDate: `${dd}/${mm}`,
    fullDateStr: `${dd}/${mm}/${yyyy}`,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    isFriday: dayOfWeek === 5,
    label: `${dayNames[dayOfWeek]}, ${dd}/${mm}`
  };
};

/**
 * Các lưu ý và cảnh báo đặc thù về ngày trong tuần / cuối tuần ở Hà Nội
 */
export interface DayContextNotice {
  id: string;
  type: 'walking_street' | 'lang_bac' | 'museum' | 'traffic' | 'night_market';
  level: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  badge: string;
}

export const getDayContextNotices = (
  dayItinerary: DayItinerary,
  dayInfo: DayCalendarInfo
): DayContextNotice[] => {
  const notices: DayContextNotice[] = [];
  const pois = dayItinerary.visit_sequence || [];

  const hasHoanKiem = pois.some(p => p.name.includes('Hoàn Kiếm') || p.name.includes('Ngọc Sơn'));
  const hasPhoCo = pois.some(p => p.name.includes('Phố Cổ') || p.name.includes('Đồng Xuân'));
  const hasLangBac = pois.some(p => p.name.includes('Lăng') || p.name.includes('Ba Đình'));
  const hasDanToc = pois.some(p => p.name.includes('Dân tộc'));

  // 1. Phố đi bộ Hồ Gươm (Từ 19h T6 đến hết CN)
  if ((dayInfo.isWeekend || dayInfo.isFriday) && (hasHoanKiem || hasPhoCo)) {
    notices.push({
      id: `notice-walking-${dayItinerary.day}`,
      type: 'walking_street',
      level: 'info',
      badge: '🚶 Không gian đi bộ',
      title: 'Phố đi bộ Hồ Gươm hoạt động',
      message: 'Các tuyến đường quanh Hồ Gươm cấm xe cơ giới (sau 19:00 T6 đến hết CN). Phương tiện sẽ dừng ở bãi gửi xe vành đai để bạn tản bộ thư thái.'
    });
  }

  // 2. Chợ đêm Phố Cổ (Tối T6, T7, CN)
  if ((dayInfo.isWeekend || dayInfo.isFriday) && hasPhoCo) {
    notices.push({
      id: `notice-market-${dayItinerary.day}`,
      type: 'night_market',
      level: 'success',
      badge: '🏮 Chợ đêm Phố Cổ',
      title: 'Chợ đêm Hàng Đào - Đồng Xuân mở cửa',
      message: 'Chỉ diễn ra vào các tối cuối tuần từ 18:30 - 23:00, rất nhộn nhịp ẩm thực phố đêm và quà lưu niệm.'
    });
  }

  // 3. Lăng Bác (Thứ 2 & Thứ 6 đóng cửa viếng)
  if (hasLangBac) {
    if (dayInfo.dayOfWeek === 1 || dayInfo.dayOfWeek === 5) {
      notices.push({
        id: `notice-langbac-closed-${dayItinerary.day}`,
        type: 'lang_bac',
        level: 'warning',
        badge: '⚠️ Đóng cửa định kỳ',
        title: `Lăng Bác đóng cửa viếng vào ${dayInfo.dayName}`,
        message: 'Lăng Bác đóng cửa vào các ngày Thứ 2 và Thứ 6. Bạn vẫn có thể ngắm cảnh bên ngoài Quảng trường Ba Đình hoặc chuyển sang viếng vào ngày khác.'
      });
    } else if (dayInfo.isWeekend) {
      notices.push({
        id: `notice-langbac-weekend-${dayItinerary.day}`,
        type: 'lang_bac',
        level: 'info',
        badge: '✨ Lưu ý cuối tuần',
        title: 'Cuối tuần đông khách viếng Lăng',
        message: 'Lăng Bác mở cửa đón khách viếng buổi sáng cuối tuần nhưng lượng khách đông hơn, nên xuất phát sớm từ 07:30 - 08:00.'
      });
    }
  }

  // 4. Bảo tàng Dân tộc học (Thứ 2 đóng cửa)
  if (hasDanToc && dayInfo.dayOfWeek === 1) {
    notices.push({
      id: `notice-museum-${dayItinerary.day}`,
      type: 'museum',
      level: 'warning',
      badge: '⚠️ Đóng cửa Thứ Hai',
      title: 'Bảo tàng Dân tộc học đóng cửa',
      message: 'Bảo tàng đóng cửa định kỳ vào Thứ Hai hàng tuần.'
    });
  }

  // 5. Giao thông cuối tuần vs ngày thường
  if (dayInfo.isWeekend) {
    notices.push({
      id: `notice-traffic-weekend-${dayItinerary.day}`,
      type: 'traffic',
      level: 'info',
      badge: '🌿 Nhịp sống cuối tuần',
      title: 'Đường sá cuối tuần thông thoáng',
      message: 'Buổi sáng không có cảnh ùn tắc đi làm của ngày thường. Buổi chiều tối các khu vui chơi, ẩm thực Phố Cổ và Hồ Tây sẽ rất đông vui.'
    });
  }

  return notices;
};

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
  departureTimeStr: string = '08:00',
  dayInfo?: DayCalendarInfo
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

    // Kiểm tra cảnh báo giờ đóng cửa & ngày đóng cửa định kỳ
    let warning = undefined;
    if (dayInfo && poi.closed_days && poi.closed_days.includes(dayInfo.isoDayOfWeek)) {
      warning = `⚠️ Điểm này đóng cửa định kỳ vào ${dayInfo.dayName}! Hãy đổi sang ngày khác hoặc ngắm bên ngoài.`;
    } else if (poi.closed_time) {
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
