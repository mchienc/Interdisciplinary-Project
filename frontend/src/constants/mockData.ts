import { POI } from '../types';

export const FALLBACK_POIS: POI[] = [
  { 
    id: 1, 
    name: 'Hồ Hoàn Kiếm & Đền Ngọc Sơn', 
    category: 'heritage', 
    lat: 21.0287, 
    lon: 105.8523, 
    estimated_duration_min: 60, 
    ticket_price: 30000, 
    description: 'Trái tim của Thủ đô ngàn năm văn hiến, cầu Thê Húc đỏ son và Tháp Rùa cổ kính.',
    image_url: '/ho-hoan-kiem.jpg'
  },
  { 
    id: 2, 
    name: 'Lăng Chủ tịch Hồ Chí Minh & Ba Đình', 
    category: 'heritage', 
    lat: 21.0368, 
    lon: 105.8346, 
    estimated_duration_min: 120, 
    ticket_price: 0, 
    description: 'Quảng trường Ba Đình lịch sử, Lăng Bác và chùa Một Cột ngàn năm tuổi.',
    image_url: '/lang-bac.jpg'
  },
  { 
    id: 3, 
    name: 'Văn Miếu - Quốc Tử Giám', 
    category: 'heritage', 
    lat: 21.0293, 
    lon: 105.8359, 
    estimated_duration_min: 90, 
    ticket_price: 30000, 
    description: 'Trường đại học đầu tiên của Việt Nam với Khuê Văn Các biểu tượng hiếu học.',
    image_url: '/landing-bg.webp'
  },
  { 
    id: 4, 
    name: 'Khu Phố Cổ Hà Nội (36 Phố Phường)', 
    category: 'culinary', 
    lat: 21.0366, 
    lon: 105.8500, 
    estimated_duration_min: 90, 
    ticket_price: 0, 
    description: 'Mái ngói rêu phong và thiên đường ẩm thực phở, bún chả, cà phê trứng trứ danh.',
    image_url: '/36-pho_phuong.jpg'
  },
  { 
    id: 5, 
    name: 'Hồ Tây & Chùa Trấn Quốc', 
    category: 'nature', 
    lat: 21.0545, 
    lon: 105.8285, 
    estimated_duration_min: 90, 
    ticket_price: 0, 
    description: 'Hồ nước tự nhiên lộng gió và ngôi cổ tự nghìn năm trên đảo cá.',
    image_url: '/chua-tran-quoc.jpg'
  },
  { 
    id: 6, 
    name: 'Hoàng thành Thăng Long', 
    category: 'heritage', 
    lat: 21.0353, 
    lon: 105.8402, 
    estimated_duration_min: 120, 
    ticket_price: 30000, 
    description: 'Quần thể di sản văn hóa thế giới nghìn năm lịch sử Thăng Long.',
    image_url: '/hoang-thanh.jpg'
  },
  { 
    id: 7, 
    name: 'Bảo tàng Dân tộc học Việt Nam', 
    category: 'museum', 
    lat: 21.0406, 
    lon: 105.7984, 
    estimated_duration_min: 120, 
    ticket_price: 40000, 
    description: 'Không gian văn hóa đặc sắc của 54 dân tộc anh em Việt Nam.',
    image_url: '/bao_tang_dan_toc.webp'
  },
  {
    id: 16,
    name: 'Lotte Mall West Lake Hanoi (Lotte Tây Hồ)',
    category: 'shopping',
    lat: 21.0754,
    lon: 105.8122,
    estimated_duration_min: 120,
    ticket_price: 0,
    description: 'Đại siêu thị và tổ hợp mua sắm, thủy cung và đại lộ thời trang view Hồ Tây tuyệt đẹp.',
    image_url: 'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 17,
    name: 'Tràng Tiền Plaza & Phố Đi Bộ Hồ Gươm',
    category: 'shopping',
    lat: 21.0258,
    lon: 105.8546,
    estimated_duration_min: 60,
    ticket_price: 0,
    description: 'Biểu tượng mua sắm xa xỉ và cổ kính nhất Thủ đô từ năm 1901 ngay sát bờ Hồ Gươm.',
    image_url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 18,
    name: 'Vincom Mega Mall Times City & Thủy Cung',
    category: 'shopping',
    lat: 20.9950,
    lon: 105.8677,
    estimated_duration_min: 120,
    ticket_price: 0,
    description: 'Đại TTTM ngầm khổng lồ với thủy cung Vinpearl Aquarium và quảng trường nhạc nước.',
    image_url: 'https://images.unsplash.com/photo-1567449303078-57ad995bd301?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 19,
    name: 'Aeon Mall Long Biên',
    category: 'shopping',
    lat: 21.0264,
    lon: 105.9015,
    estimated_duration_min: 120,
    ticket_price: 0,
    description: 'Đại siêu thị mua sắm và ẩm thực chuẩn phong cách Nhật Bản Omotenashi rộng rãi.',
    image_url: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 20,
    name: 'Lotte Center Hà Nội (Liễu Giai) & Sky Walk',
    category: 'shopping',
    lat: 21.0333,
    lon: 105.8130,
    estimated_duration_min: 90,
    ticket_price: 0,
    description: 'Tòa tháp 65 tầng biểu tượng với TTTM cao cấp và đài quan sát sàn kính Sky Walk tầng 65.',
    image_url: 'https://images.unsplash.com/photo-1561069489-c5c56c21e3f8?auto=format&fit=crop&w=800&q=80'
  }
];
