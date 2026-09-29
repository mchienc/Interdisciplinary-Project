// Tọa độ trung tâm Thủ đô Hà Nội (Hồ Hoàn Kiếm)
export const HANOI_CENTER_COORDS = {
  lat: 21.0287,
  lon: 105.8523
} as const;

export const HANOI_LNG_LAT: [number, number] = [HANOI_CENTER_COORDS.lon, HANOI_CENTER_COORDS.lat];

export const MAP_DEFAULT_ZOOM = {
  landing: 10.5,
  workspace: 13.8
} as const;

// Bảng màu 5 ngày du lịch hài hòa theo phong cách du lịch thảnh thơi
export const DAY_COLORS = [
  '#B85D3B', // Terracotta gốm Bát Tràng (Ngày 1)
  '#0F766E', // Xanh mòng két di sản (Ngày 2)
  '#2563EB', // Xanh lam sông Hồng (Ngày 3)
  '#D97706', // Hổ phách rêu phong (Ngày 4)
  '#7C3AED'  // Tím hoa bằng lăng (Ngày 5)
];

// Cấu hình các phong cách bản đồ nền (Hoàn toàn miễn phí, không watermark, không đòi hỏi API Key)
export const BASEMAP_STYLES: Record<string, { label: string; icon: string; tileUrl: string; tiles?: string[]; desc: string; attribution: string }> = {
  voyager: {
    label: 'Du Lịch Thảnh Thơi',
    icon: '🗺️',
    tileUrl: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    tiles: [
      'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    ],
    desc: 'OSM Humanitarian: Tông màu ấm áp, hiển thị chi tiết phố cổ & danh thắng',
    attribution: '&copy; OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team'
  },
  light: {
    label: 'Tối Giản Tinh Tế',
    icon: '🏛️',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    ],
    desc: 'Esri Light Gray: Nền xám ấm thanh lịch, nổi bật tuyến đường',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  },
  osm: {
    label: 'OpenStreetMap Chuẩn',
    icon: '🧭',
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    tiles: [
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    ],
    desc: 'Bản đồ mở quốc tế, chi tiết từng ngõ ngách Thủ đô',
    attribution: '&copy; OpenStreetMap contributors'
  },
  topo: {
    label: 'Địa Hình Tự Nhiên',
    icon: '⛰️',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
    ],
    desc: 'Esri World Topo: Bản đồ địa hình & danh thắng tự nhiên',
    attribution: 'Tiles &copy; Esri'
  },
  satellite: {
    label: 'Ảnh Vệ Tinh Trực Quan',
    icon: '🛰️',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    ],
    desc: 'Esri World Imagery: Ảnh vệ tinh quang học độ nét cao',
    attribution: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar Geographics'
  }
};
