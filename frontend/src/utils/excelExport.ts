import * as XLSX from 'xlsx';
import { PlanResponse } from '../types';

/**
 * Tiện ích xuất kế hoạch du lịch thông minh SDSS sang file Excel (.xlsx) chuyên nghiệp
 * Bao gồm 3 Sheet:
 * 1. Tong_Quan_Chuyen_Di: Tóm tắt điểm lưu trú Weiszfeld, các chỉ số cự ly, thời gian, lộ trình từng ngày
 * 2. Lich_Trinh_Chi_Tiet: Chi tiết từng điểm ghé thăm, thứ tự TSP, cự ly từng chặng (Legs), giá vé, giờ mở cửa, tips, link Google Maps
 * 3. Du_Toan_Ngan_Sach: Bảng dự toán chi phí phòng khách sạn, vé tham quan, di chuyển và chia theo đầu người
 */
export const exportItineraryToExcel = (plan: PlanResponse) => {
  const wb = XLSX.utils.book_new();

  const totalDays = plan.daily_itineraries.length || plan.days;
  const hotelNights = Math.max(1, totalDays - 1);
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // ==========================================
  // 1. SHEET TỔNG QUAN CHUYẾN ĐI
  // ==========================================
  const overviewRows: (string | number)[][] = [
    ['HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH KHÔNG GIAN (SDSS) - DU LỊCH HÀ NỘI'],
    ['KẾ HOẠCH LỊCH TRÌNH VÀ VỊ TRÍ LƯU TRÚ TỐI ƯU TOÀN DIỆN'],
    [],
    ['I. THÔNG TIN CHUNG VỀ CHUYẾN ĐI'],
    ['Thời gian lập kế hoạch:', dateStr],
    ['Thời lượng chuyến đi:', `${totalDays} ngày`],
    ['Tổng số điểm tham quan:', `${plan.total_pois} địa điểm`],
    ['Tổng cự ly di chuyển toàn chuyến:', `${plan.total_trip_distance_km} km`],
    ['Tổng thời gian di chuyển ước tính:', `${Math.round(plan.total_trip_duration_min)} phút (~${(plan.total_trip_duration_min / 60).toFixed(1)} giờ)`],
    [],
    ['II. ĐIỂM LƯU TRÚ TỐI ƯU (GIẢI THUẬT L1-MEDIAN & MCDA)'],
    ['Tên khách sạn được chọn:', plan.selected_hotel.name],
    ['Địa chỉ:', plan.selected_hotel.address || 'Hà Nội'],
    ['Tiêu chuẩn / Đánh giá:', `${plan.selected_hotel.stars} sao (${plan.selected_hotel.rating}⭐)`],
    ['Giá phòng tham khảo:', `${plan.selected_hotel.price_per_night.toLocaleString('vi-VN')} VNĐ / đêm`],
    ['Khoảng cách tới Trung vị Weiszfeld:', `${plan.selected_hotel.distance_to_median_m ? plan.selected_hotel.distance_to_median_m + ' m' : 'Rất gần (< 500m)'}`],
    ['Điểm đánh giá đa tiêu chí (MCDA):', `${plan.selected_hotel.multi_criteria_score || 95} / 100 điểm`],
    ['Tọa độ trung vị hình học lý tưởng:', `${plan.geometric_median.lat.toFixed(4)}, ${plan.geometric_median.lon.toFixed(4)}`],
    ['Hiệu quả tối ưu so với Trọng tâm Centroid:', `Tiết kiệm thêm +${plan.geometric_median.centroid_comparison_gain_km} km`],
    [],
    ['III. TÓM TẮT DI CHUYỂN THEO NGÀY'],
    ['Ngày', 'Số điểm ghé thăm', 'Quãng đường (km)', 'Thời gian di chuyển (phút)', 'Lộ trình tóm tắt']
  ];

  plan.daily_itineraries.forEach(d => {
    const routeSummary = [
      plan.selected_hotel.name,
      ...d.visit_sequence.map(p => p.name),
      plan.selected_hotel.name
    ].join(' ➔ ');

    overviewRows.push([
      `Ngày ${d.day}`,
      d.visit_sequence.length,
      d.total_distance_km,
      Math.round(d.total_duration_min),
      routeSummary
    ]);
  });

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewRows);
  wsOverview['!cols'] = [
    { wch: 38 },
    { wch: 22 },
    { wch: 18 },
    { wch: 26 },
    { wch: 70 }
  ];
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Tong_Quan_Chuyen_Di');

  // ==========================================
  // 2. SHEET LỊCH TRÌNH CHI TIẾT TỪNG NGÀY
  // ==========================================
  const itineraryHeaders = [
    'Ngày',
    'Thứ tự',
    'Tên địa điểm / Chặng dừng',
    'Phân loại',
    'Thời gian tham quan (phút)',
    'Giờ mở cửa',
    'Giá vé (VNĐ)',
    'Kinh nghiệm / Tips bỏ túi',
    'Tọa độ GPS',
    'Link Google Maps'
  ];

  const itineraryRows: (string | number)[][] = [
    ['LỊCH TRÌNH THAM QUAN CHI TIẾT THEO NGÀY'],
    ['(Thứ tự các điểm được tối ưu hóa bằng Google OR-Tools TSP kết hợp OSRM Routing)'],
    [],
    itineraryHeaders
  ];

  plan.daily_itineraries.forEach(d => {
    // 1. Xuất phát từ khách sạn
    itineraryRows.push([
      `Ngày ${d.day}`,
      'Khởi hành',
      `🏨 ${plan.selected_hotel.name}`,
      'Khách sạn lưu trú',
      '-',
      '24/7',
      0,
      `Bắt đầu ngày từ ${plan.selected_hotel.address || 'khách sạn'}`,
      `${plan.selected_hotel.lat}, ${plan.selected_hotel.lon}`,
      `https://www.google.com/maps/search/?api=1&query=${plan.selected_hotel.lat},${plan.selected_hotel.lon}`
    ]);

    // 2. Từng điểm ghé thăm trong ngày
    d.visit_sequence.forEach((p, idx) => {
      itineraryRows.push([
        `Ngày ${d.day}`,
        `Điểm ${idx + 1}`,
        p.name,
        p.category,
        p.estimated_duration_min || 60,
        p.opening_hours || 'Cả ngày',
        p.ticket_price || 0,
        p.tips || 'Điểm tham quan nổi tiếng tại Thủ đô Hà Nội',
        `${p.lat}, ${p.lon}`,
        `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`
      ]);
    });

    // 3. Kết thúc ngày trở về khách sạn
    itineraryRows.push([
      `Ngày ${d.day}`,
      'Trở về',
      `🏨 ${plan.selected_hotel.name}`,
      'Khách sạn lưu trú',
      '-',
      '24/7',
      0,
      'Trở về khách sạn nghỉ ngơi, dùng bữa tối và chuẩn bị cho ngày tiếp theo',
      `${plan.selected_hotel.lat}, ${plan.selected_hotel.lon}`,
      `https://www.google.com/maps/search/?api=1&query=${plan.selected_hotel.lat},${plan.selected_hotel.lon}`
    ]);
  });

  const wsItinerary = XLSX.utils.aoa_to_sheet(itineraryRows);
  wsItinerary['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 40 },
    { wch: 20 },
    { wch: 25 },
    { wch: 22 },
    { wch: 16 },
    { wch: 55 },
    { wch: 22 },
    { wch: 48 }
  ];
  XLSX.utils.book_append_sheet(wb, wsItinerary, 'Lich_Trinh_Chi_Tiet');

  // ==========================================
  // 3. SHEET DỰ TOÁN NGÂN SÁCH
  // ==========================================
  let totalTicketPrice = 0;
  const poiPriceMap = new Map<string, number>();
  plan.daily_itineraries.forEach(d => {
    d.visit_sequence.forEach(p => {
      if (!poiPriceMap.has(p.name)) {
        const price = p.ticket_price || 0;
        poiPriceMap.set(p.name, price);
        totalTicketPrice += price;
      }
    });
  });

  const totalHotelPrice = plan.selected_hotel.price_per_night * hotelNights;
  // Ước tính chi phí di chuyển: 12.000 VNĐ / km
  const estTransportCost = Math.round(plan.total_trip_distance_km * 12000);
  const grandTotal = totalHotelPrice + totalTicketPrice + estTransportCost;

  const budgetRows: (string | number)[][] = [
    ['BẢNG DỰ TOÁN NGÂN SÁCH CƠ BẢN CHO CHUYẾN ĐI'],
    ['(Ước tính tiêu chuẩn cho 1 phòng khách sạn & 1 vé tham quan tiêu chuẩn)'],
    [],
    ['STT', 'Khoản mục chi phí', 'Chi tiết hạng mục', 'Số lượng', 'Đơn giá (VNĐ)', 'Thành tiền (VNĐ)', 'Ghi chú'],
    [1, 'Phòng khách sạn', `${plan.selected_hotel.name} (${plan.selected_hotel.stars}⭐)`, `${hotelNights} đêm`, plan.selected_hotel.price_per_night, totalHotelPrice, 'Cơ sở lưu trú Weiszfeld tối ưu'],
    [2, 'Vé tham quan các điểm', 'Tổng tiền vé toàn bộ các điểm trong lịch trình', `${poiPriceMap.size} điểm`, '-', totalTicketPrice, 'Tổng tiền vé các điểm tham quan'],
    [3, 'Chi phí di chuyển ước tính', 'Taxi / Grab / Xăng xe ước lượng theo cự ly', `${plan.total_trip_distance_km} km`, 12000, estTransportCost, 'Ước tính ~12.000 VNĐ / km'],
    [],
    ['', 'TỔNG DỰ TOÁN CƠ BẢN', '', '', '', grandTotal, 'Chưa bao gồm chi phí ăn uống & quà tặng cá nhân'],
    [],
    ['GỢI Ý PHÂN CHIA CHI PHÍ THEO ĐẦU NGƯỜI:'],
    ['Nhóm 2 người:', `${Math.round(grandTotal / 2).toLocaleString('vi-VN')} VNĐ / người`],
    ['Nhóm 4 người (ở 2 phòng):', `${Math.round((grandTotal + totalHotelPrice) / 4).toLocaleString('vi-VN')} VNĐ / người`],
    [],
    ['BẢNG GIÁ VÉ CHI TIẾT TỪNG ĐIỂM THAM QUAN:'],
    ['Tên điểm đến', 'Giá vé niêm yết (VNĐ)', 'Ghi chú']
  ];

  poiPriceMap.forEach((price, name) => {
    budgetRows.push([
      name,
      price === 0 ? 'Miễn phí' : price,
      price === 0 ? 'Không thu vé vào cửa' : 'Vé vào cổng tiêu chuẩn'
    ]);
  });

  const wsBudget = XLSX.utils.aoa_to_sheet(budgetRows);
  wsBudget['!cols'] = [
    { wch: 8 },
    { wch: 32 },
    { wch: 45 },
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
    { wch: 35 }
  ];
  XLSX.utils.book_append_sheet(wb, wsBudget, 'Du_Toan_Ngan_Sach');

  // Kích hoạt lưu file Excel
  const safeDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  XLSX.writeFile(wb, `Ke_hoach_du_lich_Ha_Noi_SDSS_${safeDate}.xlsx`);
};
