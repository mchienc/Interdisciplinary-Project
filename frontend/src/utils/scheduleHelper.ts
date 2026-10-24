import { DayItinerary, POI } from '../types';

export interface MealDetails {
  restaurantName: string;
  recommendedDish: string;
  priceRange: string;
  address: string;
  tip?: string;
}

export interface ActivityDetails {
  name: string;
  highlight: string;
  ticketPrice?: string;
  address?: string;
  isOptional?: boolean;
}

export interface ScheduleStep {
  id: string;
  type: 
    | 'hotel_depart' 
    | 'travel' 
    | 'poi' 
    | 'lunch' 
    | 'noon_rest' 
    | 'afternoon_activity' 
    | 'dinner' 
    | 'evening_activity' 
    | 'hotel_return';
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
  meal?: MealDetails;
  activity?: ActivityDetails;
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
  const dayOfWeek = dateObj.getDay();
  const isoDayOfWeek = (dayOfWeek + 6) % 7;

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
      badge: 'Không gian đi bộ',
      title: 'Phố đi bộ Hồ Gươm hoạt động',
      message: 'Các tuyến phố quanh Hồ Gươm cấm xe cơ giới từ 19:00, lý tưởng để tản bộ ăn kem Tràng Tiền và nghe nhạc sống.'
    });
  }

  // 2. Chợ đêm Phố Cổ (Tối Thứ 6, Thứ 7, Chủ Nhật)
  if (dayInfo.isWeekend || dayInfo.isFriday) {
    notices.push({
      id: `notice-nightmarket-${dayItinerary.day}`,
      type: 'night_market',
      level: 'success',
      badge: 'Chợ đêm cuối tuần',
      title: 'Chợ đêm Hàng Đào - Đồng Xuân mở cửa',
      message: 'Trải dài từ Hàng Đào đến cổng chợ Đồng Xuân với hàng trăm gian hàng quà lưu niệm và ẩm thực đường phố.'
    });
  }

  // 3. Lăng Bác (Thứ 2 & Thứ 6 đóng cửa viếng)
  if (hasLangBac && (dayInfo.dayOfWeek === 1 || dayInfo.dayOfWeek === 5)) {
    notices.push({
      id: `notice-langbac-${dayItinerary.day}`,
      type: 'lang_bac',
      level: 'warning',
      badge: 'Lăng Bác đóng cửa',
      title: 'Lăng Bác không mở cửa viếng vào Thứ Hai & Thứ Sáu',
      message: 'Bạn vẫn có thể tham quan Quảng trường Ba Đình, Chùa Một Cột và khuôn viên Phủ Chủ tịch ở bên ngoài.'
    });
  }

  // 4. Bảo tàng Dân tộc học (Thứ 2 đóng cửa)
  if (hasDanToc && dayInfo.dayOfWeek === 1) {
    notices.push({
      id: `notice-museum-${dayItinerary.day}`,
      type: 'museum',
      level: 'warning',
      badge: 'Đóng cửa Thứ Hai',
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
      badge: 'Nhịp sống cuối tuần',
      title: 'Đường sá cuối tuần thông thoáng',
      message: 'Buổi sáng đường sá dễ đi hơn. Buổi chiều tối các khu vui chơi, ẩm thực Phố Cổ và Hồ Tây sẽ rất đông vui.'
    });
  }

  return notices;
};

/**
 * Kho dữ liệu Ẩm thực Thủ Đô chọn lọc theo từng khu vực địa lý
 */
export const getDiningSpotForPoi = (
  poiOrLocation?: POI,
  mealType: 'lunch' | 'dinner' = 'lunch'
): MealDetails => {
  const name = poiOrLocation ? poiOrLocation.name.toLowerCase() : '';

  // 1. Gần Lăng Bác / Ba Đình / Văn Miếu / Hoàng Thành
  if (name.includes('lăng') || name.includes('ba đình') || name.includes('văn miếu') || name.includes('hoàng thành') || name.includes('mỹ thuật')) {
    if (mealType === 'lunch') {
      return {
        restaurantName: 'Bún Chả Cửa Đông & Nem Cua Bể',
        recommendedDish: 'Bún chả que tre nướng than hoa, nem cua bể giòn rụm',
        priceRange: '55.000đ – 70.000đ/suất',
        address: '41 Cửa Đông, Ba Đình / Hoàn Kiếm',
        tip: 'Nước chấm ấm nóng chua ngọt thanh tao, thịt nướng than hoa thơm nức đậm đà.'
      };
    } else {
      return {
        restaurantName: 'Chả Cá Thăng Long',
        recommendedDish: 'Chả cá lăng nướng chảo ăn kèm bún, lạc rang, thì là & mắm tôm',
        priceRange: '150.000đ – 180.000đ/suất',
        address: '19-21-2D Đường Thành, Hoàn Kiếm',
        tip: 'Món ăn di sản đất kinh kỳ, thưởng thức chảo cá xèo xèo trong không gian nhà cổ ấm cúng.'
      };
    }
  }

  // 2. Gần Hồ Tây / Trúc Bạch / Chùa Trấn Quốc
  if (name.includes('tây') || name.includes('trúc bạch') || name.includes('trấn quốc') || name.includes('thanh niên')) {
    if (mealType === 'lunch') {
      return {
        restaurantName: 'Phở Cuốn Hương Mai (Ngũ Xá)',
        recommendedDish: 'Phở cuốn bò tái lăn, phở chiên phồng & chả ngan nướng',
        priceRange: '60.000đ – 85.000đ/người',
        address: '25 Ngũ Xá, Trúc Bạch, Ba Đình',
        tip: 'Khu ẩm thực ven hồ lộng gió mát rượi, món phở cuốn thanh nhẹ rất dễ ăn.'
      };
    } else {
      return {
        restaurantName: 'Bánh Tôm Hồ Tây & Lẩu Cá Lăng Ven Hồ',
        recommendedDish: 'Bánh tôm chiên giòn, lẩu cá lăng sông Đà nhúng rau cần',
        priceRange: '140.000đ – 200.000đ/người',
        address: '1 Đường Thanh Niên / Bán đảo Quảng Bá, Tây Hồ',
        tip: 'Vừa thưởng thức bữa tối vừa đón gió hồ Tây mát lành ngắm mặt nước lung linh.'
      };
    }
  }

  // 3. Gần Phố Cổ / Hoàn Kiếm / Đồng Xuân / Nhà thờ Lớn
  if (mealType === 'lunch') {
    return {
      restaurantName: 'Phở Gia Truyền Bát Đàn',
      recommendedDish: 'Phở bò tái nạm bắp, nước dùng ngọt thanh từ xương ống',
      priceRange: '55.000đ – 65.000đ/bát',
      address: '49 Bát Đàn, Hàng Bồ, Hoàn Kiếm',
      tip: 'Quán phở lâu đời bậc nhất Hà Nội, hãy gọi thêm 1 đĩa quẩy giòn và trứng chần.'
    };
  } else {
    return {
      restaurantName: 'Phố Ẩm Thực Tống Duy Tân & Ngõ Cấm Chỉ',
      recommendedDish: 'Gà tần thuốc bắc ngải cứu, cơm đảo sườn non, cháo sườn phố cổ',
      priceRange: '70.000đ – 120.000đ/người',
      address: 'Phố Tống Duy Tân, Hàng Bông, Hoàn Kiếm',
      tip: 'Con phố ẩm thực đêm nhộn nhịp nhất Hà Nội, mở cửa 24/7 phục vụ các món ăn ấm bụng.'
    };
  }
};

/**
 * Các hoạt động bổ trợ buổi chiều khi số điểm tham quan chính còn ít
 */
export const getSuggestedAfternoonActivities = (dayNumber: number): ActivityDetails[] => {
  if (dayNumber === 1) {
    return [
      {
        name: 'Hoàng Thành Thăng Long & Tản Bộ Đường Hoàng Diệu',
        highlight: 'Di sản thế giới UNESCO nghìn năm, rợp bóng cây xà cừ cổ thụ mát rượi',
        ticketPrice: '30.000đ/vé',
        address: '19C Hoàng Diệu, Ba Đình',
        isOptional: true
      },
      {
        name: 'Đón Hoàng Hôn Hồ Tây & Chiêm Bái Chùa Trấn Quốc',
        highlight: 'Khung giờ vàng 16:30 – 17:30 ngắm mặt hồ dát vàng và chùa cổ nhất Thăng Long',
        ticketPrice: 'Miễn phí',
        address: 'Đường Thanh Niên, Tây Hồ',
        isOptional: true
      }
    ];
  } else {
    return [
      {
        name: 'Bảo Tàng Mỹ Thuật Việt Nam / Nhà Tù Hỏa Lò',
        highlight: 'Không gian nghệ thuật hội họa đặc sắc và di tích lịch sử thiêng liêng hào hùng',
        ticketPrice: '30.000đ – 40.000đ',
        address: '66 Nguyễn Thái Học / 1 Hỏa Lò',
        isOptional: true
      },
      {
        name: 'Check-in Cầu Long Biên Ráng Chiều Hoài Niệm',
        highlight: 'Chứng nhân lịch sử vắt qua 3 thế kỷ, góc chụp ảnh vintage tuyệt đẹp lúc hoàng hôn',
        ticketPrice: 'Miễn phí',
        address: 'Cầu Long Biên, Hoàn Kiếm',
        isOptional: true
      }
    ];
  }
};

/**
 * Trải nghiệm buổi tối phong vị Thủ Đô
 */
export const getSuggestedEveningActivity = (dayInfo?: DayCalendarInfo): ActivityDetails => {
  if (dayInfo && (dayInfo.isWeekend || dayInfo.isFriday)) {
    return {
      name: 'Không Gian Đi Bộ Hồ Gươm & Chợ Đêm Phố Cổ',
      highlight: 'Thưởng thức kem Tràng Tiền, nghe biểu diễn nghệ thuật đường phố, ngắm Tháp Rùa và cầu Thê Húc lên đèn lung linh',
      ticketPrice: 'Miễn phí dạo phố',
      address: 'Xung quanh Hồ Hoàn Kiếm & Phố Hàng Đào - Đồng Xuân',
      isOptional: true
    };
  }
  return {
    name: 'Dạo Phố Đêm Nhà Thờ Lớn & Thưởng Thức Trà Chanh Vỉa Hè',
    highlight: 'Ngắm kiến trúc Gothic cổ kính dưới ánh đèn vàng ấm áp, lắng nghe tiếng chuông nhà thờ và nhịp sống thanh lịch Hà Nội',
    ticketPrice: 'Trà chanh 20.000đ – 30.000đ',
    address: 'Quảng trường Nhà thờ Lớn, số 40 Nhà Chung, Hoàn Kiếm',
    isOptional: true
  };
};

/**
 * Từ điển Khung giờ vàng trải nghiệm đẹp nhất tại các địa danh Hà Nội
 */
export const HANOI_GOLDEN_HOURS: Record<string, { slot: string; note: string; startMin: number; endMin: number }> = {
  'Hồ Hoàn Kiếm': { slot: '06:30 – 08:30', note: 'Ban mai yên ả ngắm Tháp Rùa và người dân tập dưỡng sinh', startMin: 390, endMin: 510 },
  'Lăng Chủ tịch': { slot: '07:30 – 10:30', note: 'Khung giờ viếng Lăng Bác buổi sáng trang nghiêm, tránh nắng gắt', startMin: 450, endMin: 630 },
  'Văn Miếu': { slot: '08:30 – 10:30', note: 'Không gian tĩnh lặng, ánh nắng xuyên qua tán cây Khuê Văn Các', startMin: 510, endMin: 630 },
  'Khu Phố Cổ': { slot: '19:00 – 22:00', note: 'Phố lên đèn rực rỡ, chợ đêm sầm uất và ẩm thực vỉa hè náo nhiệt', startMin: 1140, endMin: 1320 },
  'Chùa Trấn Quốc': { slot: '16:30 – 18:00', note: 'Khung giờ vàng chiêm bái và đón hoàng hôn đỏ rực bên mặt hồ', startMin: 990, endMin: 1080 },
  'Hồ Tây': { slot: '16:30 – 18:15', note: 'Thời khắc hoàng hôn lãng mạn nhất Thủ đô, gió hồ mát lành', startMin: 990, endMin: 1095 },
  'Hoàng Thành': { slot: '08:30 – 11:00', note: 'Thời tiết mát mẻ dễ chịu để tản bộ quanh di tích Đoan Môn', startMin: 510, endMin: 660 },
  'Nhà tù Hỏa Lò': { slot: '09:00 – 11:00', note: 'Buổi sáng vắng khách, dễ dàng lắng nghe thuyết minh sâu sắc', startMin: 540, endMin: 660 },
  'Cà phê Giảng': { slot: '08:00 – 09:30', note: 'Nhâm nhi tách cà phê trứng thơm ngậy đón ngày mới', startMin: 480, endMin: 570 },
  'Cầu Long Biên': { slot: '16:45 – 18:15', note: 'Ánh chiều tà buông xuống bãi bồi sông Hồng hoài niệm', startMin: 1005, endMin: 1095 },
  'Chợ Đồng Xuân': { slot: '09:30 – 11:30', note: 'Các quầy hàng mở đầy đủ, nhộn nhịp mua sắm và thưởng thức quà vặt', startMin: 570, endMin: 690 },
  'Bảo tàng Dân tộc': { slot: '09:00 – 11:30', note: 'Khám phá khu nhà rông ngoài trời khi trời chưa nắng gắt', startMin: 540, endMin: 690 },
  'Nhà thờ Lớn': { slot: '16:00 – 18:30', note: 'Trà chanh vỉa hè, ngắm kiến trúc Gothic cổ kính lúc tan chiều', startMin: 960, endMin: 1110 }
};

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

  if (poi.ideal_time === 'morning') {
    return { slot: '08:00 – 10:30', note: 'Buổi sáng mát mẻ, thanh tĩnh', startMin: 480, endMin: 630 };
  } else if (poi.ideal_time === 'afternoon') {
    return { slot: '14:30 – 17:00', note: 'Buổi chiều dịu nắng, thuận tiện tản bộ', startMin: 870, endMin: 1020 };
  } else if (poi.ideal_time === 'evening') {
    return { slot: '18:30 – 21:30', note: 'Buổi tối phố xá lên đèn sầm uất', startMin: 1110, endMin: 1290 };
  }

  return null;
};

export const minutesToTimeString = (totalMinutes: number): string => {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, Math.round(totalMinutes)));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const timeStringToMinutes = (timeStr: string): number => {
  const parts = timeStr.split(':').map(p => parseInt(p, 10));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 8 * 60;
};

/**
 * TỰ ĐỘNG LẬP LỊCH TRÌNH TRỌN VẸN CẢ NGÀY (FULL-DAY COMPREHENSIVE TIMELINE)
 * Đảm bảo luôn đầy đủ 4 buổi: Sáng (Di sản) -> Trưa (Ăn trưa & Cà phê) -> Chiều (Tham quan & Hoàng hôn) -> Tối (Ăn tối & Phố đêm)
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

  // 1. KHỞI HÀNH TỪ KHÁCH SẠN BUỔI SÁNG
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

  const pois = dayItinerary.visit_sequence;
  const legs = dayItinerary.legs || [];
  let hasInsertedLunch = false;
  let lastMorningPoi: POI | undefined = undefined;

  // 2. DUYỆT QUA CÁC ĐIỂM THAM QUAN
  for (let idx = 0; idx < pois.length; idx++) {
    const poi = pois[idx];
    const leg = legs[idx];
    const travelMin = leg ? Math.max(5, Math.round(leg.duration_min)) : 12;
    const distanceKm = leg ? leg.distance_km : 1.5;

    // Chèn ăn trưa nếu thời gian đã sang trưa (khoảng 11:30 - 12:30) và trước đó chưa ăn trưa
    if (!hasInsertedLunch && currentMin >= 11 * 60 + 30) {
      const lunchSpot = getDiningSpotForPoi(lastMorningPoi || poi, 'lunch');
      const lunchDuration = 60;
      const lunchStart = currentMin;
      const lunchEnd = currentMin + lunchDuration;

      steps.push({
        id: `lunch-${dayItinerary.day}`,
        type: 'lunch',
        startTime: minutesToTimeString(lunchStart),
        endTime: minutesToTimeString(lunchEnd),
        timeSlot: `${minutesToTimeString(lunchStart)} – ${minutesToTimeString(lunchEnd)}`,
        title: `Ăn trưa: ${lunchSpot.restaurantName}`,
        subtitle: `${lunchSpot.recommendedDish} • ${lunchSpot.priceRange}`,
        durationMin: lunchDuration,
        meal: lunchSpot
      });

      // Thêm chặng nghỉ ngơi cà phê trưa (tránh nắng gắt)
      const restDuration = 45;
      const restStart = lunchEnd;
      const restEnd = lunchEnd + restDuration;

      steps.push({
        id: `noon-rest-${dayItinerary.day}`,
        type: 'noon_rest',
        startTime: minutesToTimeString(restStart),
        endTime: minutesToTimeString(restEnd),
        timeSlot: `${minutesToTimeString(restStart)} – ${minutesToTimeString(restEnd)}`,
        title: 'Nghỉ trưa & Cà phê thư giãn',
        subtitle: 'Nhâm nhi tách Cà phê Giảng / trà hoa cúc hoặc nghỉ chân tránh nắng gắt buổi trưa',
        durationMin: restDuration
      });

      hasInsertedLunch = true;
      currentMin = restEnd;
    }

    // Chặng di chuyển tới POI
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

    // Chặng tham quan tại điểm POI
    const visitDuration = poi.estimated_duration_min || 60;
    const visitStart = currentMin;
    const visitEnd = currentMin + visitDuration;

    const goldenInfo = findGoldenHourForPoi(poi);
    let isGoldenHourMatch = false;
    let goldenHourText = undefined;

    if (goldenInfo) {
      goldenHourText = goldenInfo.slot;
      if (
        (visitStart >= goldenInfo.startMin - 30 && visitStart <= goldenInfo.endMin) ||
        (visitEnd >= goldenInfo.startMin && visitEnd <= goldenInfo.endMin + 30)
      ) {
        isGoldenHourMatch = true;
      }
    }

    let warning = undefined;
    if (dayInfo && poi.closed_days && poi.closed_days.includes(dayInfo.isoDayOfWeek)) {
      warning = `Điểm này đóng cửa định kỳ vào ${dayInfo.dayName}! Hãy đổi sang ngày khác hoặc ngắm bên ngoài.`;
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
    lastMorningPoi = poi;
  }

  // 3. NẾU CHƯA ĂN TRƯA (Ví dụ các điểm tham quan kết thúc trước hoặc đúng lúc 11:45)
  if (!hasInsertedLunch) {
    const lunchSpot = getDiningSpotForPoi(lastMorningPoi || pois[pois.length - 1], 'lunch');
    const lunchDuration = 60;
    const lunchStart = Math.max(currentMin, 11 * 60 + 45);
    const lunchEnd = lunchStart + lunchDuration;

    steps.push({
      id: `lunch-${dayItinerary.day}`,
      type: 'lunch',
      startTime: minutesToTimeString(lunchStart),
      endTime: minutesToTimeString(lunchEnd),
      timeSlot: `${minutesToTimeString(lunchStart)} – ${minutesToTimeString(lunchEnd)}`,
      title: `Ăn trưa: ${lunchSpot.restaurantName}`,
      subtitle: `${lunchSpot.recommendedDish} • ${lunchSpot.priceRange}`,
      durationMin: lunchDuration,
      meal: lunchSpot
    });

    // Thêm chặng nghỉ ngơi cà phê trưa
    const restDuration = 45;
    const restStart = lunchEnd;
    const restEnd = lunchEnd + restDuration;

    steps.push({
      id: `noon-rest-${dayItinerary.day}`,
      type: 'noon_rest',
      startTime: minutesToTimeString(restStart),
      endTime: minutesToTimeString(restEnd),
      timeSlot: `${minutesToTimeString(restStart)} – ${minutesToTimeString(restEnd)}`,
      title: 'Nghỉ trưa & Cà phê thư giãn',
      subtitle: 'Nhâm nhi cà phê trứng Giảng hoặc nghỉ chân tránh nắng gắt buổi trưa',
      durationMin: restDuration
    });

    hasInsertedLunch = true;
    currentMin = restEnd;
  }

  // 4. BỔ SUNG TRẢI NGHIỆM BUỔI CHIỀU NẾU LỊCH TRÌNH KẾT THÚC SỚM (Trước 17:30)
  if (currentMin < 17 * 60 + 30) {
    const afternoonSuggestions = getSuggestedAfternoonActivities(dayItinerary.day);
    
    // Nếu còn sớm (đầu giờ chiều từ 13:45 - 15:30)
    if (currentMin <= 14 * 60 + 30 && afternoonSuggestions.length > 0) {
      const act1 = afternoonSuggestions[0];
      const act1Start = Math.max(currentMin, 14 * 60);
      const act1End = act1Start + 90;

      steps.push({
        id: `afternoon-act-1-${dayItinerary.day}`,
        type: 'afternoon_activity',
        startTime: minutesToTimeString(act1Start),
        endTime: minutesToTimeString(act1End),
        timeSlot: `${minutesToTimeString(act1Start)} – ${minutesToTimeString(act1End)}`,
        title: act1.name,
        subtitle: `${act1.highlight} • Vé: ${act1.ticketPrice}`,
        durationMin: 90,
        activity: act1
      });

      currentMin = act1End;
    }

    // Chặng đón hoàng hôn (16:30 - 17:45)
    if (currentMin <= 16 * 60 + 30 && afternoonSuggestions.length > 1) {
      const act2 = afternoonSuggestions[1];
      const act2Start = Math.max(currentMin + 15, 16 * 60 + 30);
      const act2End = act2Start + 75;

      steps.push({
        id: `afternoon-act-2-${dayItinerary.day}`,
        type: 'afternoon_activity',
        startTime: minutesToTimeString(act2Start),
        endTime: minutesToTimeString(act2End),
        timeSlot: `${minutesToTimeString(act2Start)} – ${minutesToTimeString(act2End)}`,
        title: act2.name,
        subtitle: `${act2.highlight} • Vé: ${act2.ticketPrice}`,
        durationMin: 75,
        goldenHour: '16:30 – 17:45',
        isGoldenHourMatch: true,
        activity: act2
      });

      currentMin = act2End;
    }
  }

  // 5. BỮA TỐI ĐẶC SẢN THỦ ĐÔ (18:00 – 19:30)
  const dinnerStart = Math.max(currentMin + 15, 18 * 60 + 15);
  const dinnerDuration = 75;
  const dinnerEnd = dinnerStart + dinnerDuration;
  const dinnerSpot = getDiningSpotForPoi(pois[0], 'dinner');

  steps.push({
    id: `dinner-${dayItinerary.day}`,
    type: 'dinner',
    startTime: minutesToTimeString(dinnerStart),
    endTime: minutesToTimeString(dinnerEnd),
    timeSlot: `${minutesToTimeString(dinnerStart)} – ${minutesToTimeString(dinnerEnd)}`,
    title: `Bữa tối: ${dinnerSpot.restaurantName}`,
    subtitle: `${dinnerSpot.recommendedDish} • ${dinnerSpot.priceRange}`,
    durationMin: dinnerDuration,
    meal: dinnerSpot
  });

  currentMin = dinnerEnd;

  // 6. TRẢI NGHIỆM PHỐ ĐÊM THỦ ĐÔ (19:45 – 21:30)
  const eveningAct = getSuggestedEveningActivity(dayInfo);
  const eveningStart = currentMin + 15;
  const eveningDuration = 90;
  const eveningEnd = eveningStart + eveningDuration;

  steps.push({
    id: `evening-act-${dayItinerary.day}`,
    type: 'evening_activity',
    startTime: minutesToTimeString(eveningStart),
    endTime: minutesToTimeString(eveningEnd),
    timeSlot: `${minutesToTimeString(eveningStart)} – ${minutesToTimeString(eveningEnd)}`,
    title: eveningAct.name,
    subtitle: `${eveningAct.highlight} • ${eveningAct.address}`,
    durationMin: eveningDuration,
    activity: eveningAct
  });

  currentMin = eveningEnd;

  // 7. TRỞ VỀ KHÁCH SẠN NGHỈ NGƠI CUỐI NGÀY (21:30 – 22:00)
  const returnLeg = legs[legs.length - 1];
  const returnTravelMin = returnLeg ? Math.max(10, Math.round(returnLeg.duration_min)) : 15;
  const returnDistanceKm = returnLeg ? returnLeg.distance_km : 2.5;

  const returnTravelStart = currentMin;
  const returnTravelEnd = currentMin + returnTravelMin;

  steps.push({
    id: `return-travel-${dayItinerary.day}`,
    type: 'travel',
    startTime: minutesToTimeString(returnTravelStart),
    endTime: minutesToTimeString(returnTravelEnd),
    timeSlot: `${minutesToTimeString(returnTravelStart)} – ${minutesToTimeString(returnTravelEnd)}`,
    title: `Di chuyển về chỗ nghỉ`,
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
    subtitle: `Khép lại trọn vẹn Ngày ${dayItinerary.day} thảnh thơi`,
    durationMin: 0
  });

  return steps;
};
