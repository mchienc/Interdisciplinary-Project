import { TrafficStatus, CongestionLevel, SimulationScenario } from '../types';

/**
 * Các nút giao thông và trục đường trọng điểm thường xuyên ùn tắc tại Hà Nội
 */
export const HANOI_BOTTLENECK_NODES = [
  { name: 'Trục Kim Mã - Liễu Giai', lat: 21.0330, lon: 105.8160, radiusM: 800 },
  { name: 'Nút giao Đê La Thành - Giảng Võ', lat: 21.0265, lon: 105.8235, radiusM: 700 },
  { name: 'Trục Chùa Bộc - Tây Sơn', lat: 21.0095, lon: 105.8280, radiusM: 750 },
  { name: 'Trục Cầu Giấy - Xuân Thủy', lat: 21.0365, lon: 105.7950, radiusM: 900 },
  { name: 'Nút giao Ngã Tư Sở - Trường Chinh', lat: 21.0035, lon: 105.8210, radiusM: 850 },
  { name: 'Khu vực lõi Phố Cổ & Chợ Đồng Xuân', lat: 21.0360, lon: 105.8500, radiusM: 600 },
];

/**
 * Tính toán trạng thái giao thông dựa trên mô hình giờ cao điểm đặc thù Hà Nội
 * - Sáng: 07:30 - 09:00 (1.6x, HEAVY)
 * - Tối: 17:00 - 19:00 (1.7x, HEAVY)
 * - Trưa: 11:30 - 12:30 (1.25x, MODERATE)
 * - Thấp điểm: 1.0x (LOW)
 */
export const getCurrentTrafficStatus = (date: Date = new Date()): TrafficStatus => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // Sáng: 07:30 (450p) - 09:00 (540p)
  if (timeInMinutes >= 450 && timeInMinutes <= 540) {
    return {
      level: 'HEAVY',
      multiplier: 1.6,
      label: 'Cao điểm sáng',
      color: '#DC2626',
      extraMinutes: 18,
      description: 'Ùn tắc cục bộ trục Kim Mã, Cầu Giấy và đường gom Vành đai. Thời gian di chuyển tăng 1.6x.',
      isPeakHour: true
    };
  }

  // Tối: 17:00 (1020p) - 19:00 (1140p)
  if (timeInMinutes >= 1020 && timeInMinutes <= 1140) {
    return {
      level: 'HEAVY',
      multiplier: 1.7,
      label: 'Cao điểm tan tầm',
      color: '#DC2626',
      extraMinutes: 22,
      description: 'Mật độ phương tiện tăng đột biến quanh Phố Cổ, Đống Đa và nút giao Ngã Tư Sở. Thời gian tăng 1.7x.',
      isPeakHour: true
    };
  }

  // Trưa: 11:30 (690p) - 12:30 (750p)
  if (timeInMinutes >= 690 && timeInMinutes <= 750) {
    return {
      level: 'MODERATE',
      multiplier: 1.25,
      label: 'Tan tầm trưa',
      color: '#F59E0B',
      extraMinutes: 8,
      description: 'Di chuyển chậm tại các khu văn phòng và trường học. Thời gian tăng 1.25x.',
      isPeakHour: false
    };
  }

  // Thấp điểm
  return {
    level: 'LOW',
    multiplier: 1.0,
    label: 'Đường thông thoáng',
    color: '#10B981',
    extraMinutes: 0,
    description: 'Đường sá lưu thông thuận lợi, phương tiện đạt vận tốc chuẩn theo mô hình OSRM.',
    isPeakHour: false
  };
};

/**
 * Trả về thông số giao thông tương ứng với các kịch bản giả lập
 */
export const getSimulatedTraffic = (scenario: SimulationScenario): TrafficStatus => {
  switch (scenario) {
    case 'PEAK_EVENING':
      return {
        level: 'HEAVY',
        multiplier: 1.75,
        label: 'Giờ cao điểm 17:45',
        color: '#DC2626',
        extraMinutes: 25,
        description: 'Ùn tắc nghiêm trọng tại các trục Kim Mã, Chùa Bộc, Đê La Thành. Dự kiến trễ 25 phút.',
        isPeakHour: true
      };
    case 'RAIN_STORM':
      return {
        level: 'HEAVY',
        multiplier: 1.5,
        label: 'Mưa rào • Đường trơn',
        color: '#DC2626',
        extraMinutes: 16,
        description: 'Mưa lớn khiến tốc độ lưu thông giảm sâu, các ngã tư ngập úng cục bộ. Dự kiến trễ 16 phút.',
        isPeakHour: false
      };
    case 'HEAT_WAVE':
      return {
        level: 'MODERATE',
        multiplier: 1.15,
        label: 'Nắng gắt • Vắng xe',
        color: '#F59E0B',
        extraMinutes: 5,
        description: 'Thời tiết nắng gắt trên 38°C, đường sá tương đối vắng vẻ, xe cộ di chuyển nhanh.',
        isPeakHour: false
      };
    case 'AUTUMN_PERFECT':
      return {
        level: 'LOW',
        multiplier: 1.0,
        label: 'Đường thông thoáng',
        color: '#10B981',
        extraMinutes: 0,
        description: 'Mật độ giao thông lý tưởng, di chuyển êm ả thuận tiện.',
        isPeakHour: false
      };
    case 'LIVE':
    default:
      return getCurrentTrafficStatus();
  }
};

/**
 * Tính khoảng cách xấp xỉ giữa 2 tọa độ (m)
 */
const distanceMeters = (lon1: number, lat1: number, lon2: number, lat2: number): number => {
  const R = 6371000;
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
 * Kiểm tra xem một điểm tọa độ có nằm trong vùng điểm nghẽn giao thông Hà Nội hay không
 */
export const isNearBottleneck = (lon: number, lat: number): boolean => {
  return HANOI_BOTTLENECK_NODES.some((node) => {
    return distanceMeters(lon, lat, node.lon, node.lat) <= node.radiusM;
  });
};

/**
 * Chia GeoJSON LineString coordinates thành các phân đoạn có màu giao thông:
 * - Xanh lá mạ (#10B981): Đường thông thoáng
 * - Hổ phách (#F59E0B): Di chuyển chậm / Giờ tan tầm
 * - Đỏ gạch (#DC2626): Ùn tắc cục bộ
 */
export interface TrafficLineSegment {
  type: 'Feature';
  properties: {
    congestion: CongestionLevel;
    color: string;
    speedFactor: number;
  };
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export const buildTrafficColoredSegments = (
  fullCoords: [number, number][],
  traffic: TrafficStatus
): TrafficLineSegment[] => {
  if (fullCoords.length < 2) return [];

  // Nếu đường hoàn toàn thông thoáng (LOW)
  if (traffic.level === 'LOW') {
    return [
      {
        type: 'Feature',
        properties: {
          congestion: 'LOW',
          color: '#10B981',
          speedFactor: 1.0
        },
        geometry: {
          type: 'LineString',
          coordinates: fullCoords
        }
      }
    ];
  }

  // Nếu kẹt xe hoặc mô phỏng, phân tích từng đoạn điểm ảnh hưởng
  const segments: TrafficLineSegment[] = [];
  let currentCoords: [number, number][] = [fullCoords[0]];
  let currentLevel: CongestionLevel = isNearBottleneck(fullCoords[0][0], fullCoords[0][1]) && traffic.isPeakHour
    ? 'HEAVY'
    : traffic.level === 'HEAVY' ? 'MODERATE' : 'LOW';

  for (let i = 1; i < fullCoords.length; i++) {
    const pt = fullCoords[i];
    const nearBottleneck = isNearBottleneck(pt[0], pt[1]);

    let ptLevel: CongestionLevel = 'LOW';
    if (traffic.level === 'HEAVY') {
      ptLevel = nearBottleneck ? 'HEAVY' : 'MODERATE';
    } else if (traffic.level === 'MODERATE') {
      ptLevel = nearBottleneck ? 'MODERATE' : 'LOW';
    }

    if (ptLevel !== currentLevel && currentCoords.length >= 2) {
      // Đóng phân đoạn cũ và mở phân đoạn mới
      currentCoords.push(pt);
      const color = currentLevel === 'HEAVY' ? '#DC2626' : currentLevel === 'MODERATE' ? '#F59E0B' : '#10B981';
      segments.push({
        type: 'Feature',
        properties: {
          congestion: currentLevel,
          color,
          speedFactor: currentLevel === 'HEAVY' ? 1.7 : currentLevel === 'MODERATE' ? 1.25 : 1.0
        },
        geometry: {
          type: 'LineString',
          coordinates: [...currentCoords]
        }
      });
      currentCoords = [pt];
      currentLevel = ptLevel;
    } else {
      currentCoords.push(pt);
    }
  }

  // Đóng đoạn cuối cùng
  if (currentCoords.length >= 2) {
    const color = currentLevel === 'HEAVY' ? '#DC2626' : currentLevel === 'MODERATE' ? '#F59E0B' : '#10B981';
    segments.push({
      type: 'Feature',
      properties: {
        congestion: currentLevel,
        color,
        speedFactor: currentLevel === 'HEAVY' ? 1.7 : currentLevel === 'MODERATE' ? 1.25 : 1.0
      },
      geometry: {
        type: 'LineString',
        coordinates: currentCoords
      }
    });
  }

  return segments;
};

/**
 * Cấu hình Mapbox Traffic Vector Tiles nếu người dùng có API Key
 */
export const getMapboxTrafficSource = (token: string) => {
  return {
    type: 'vector' as const,
    url: `mapbox://mapbox.mapbox-traffic-v1?access_token=${token}`
  };
};
