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

// Cấu hình các phong cách bản đồ nền
export const BASEMAP_STYLES: Record<string, { label: string; icon: string; tileUrl: string; desc: string }> = {
  voyager: {
    label: 'Du Lịch Thảnh Thơi',
    icon: '🗺️',
    tileUrl: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    desc: 'Carto Voyager: Nước hồ ngọc lam, công viên xanh non'
  },
  light: {
    label: 'Tối Giản Tinh Tế',
    icon: '🏛️',
    tileUrl: 'https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png',
    desc: 'Carto Positron: Gam màu xám ấm thanh lịch'
  },
  osm: {
    label: 'OpenStreetMap Chuẩn',
    icon: '🧭',
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    desc: 'Bản đồ mở quốc tế, chi tiết từng ngõ ngách'
  },
  satellite: {
    label: 'Ảnh Vệ Tinh Trực Quan',
    icon: '🛰️',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    desc: 'Esri World Imagery chân thực'
  }
};
