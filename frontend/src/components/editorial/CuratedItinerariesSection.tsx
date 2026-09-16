import React from 'react';
import { ArrowRight, Clock, MapPin } from 'lucide-react';

interface CuratedItinerariesSectionProps {
  onSelectPreset: (poiIds: number[]) => void;
}

export const CuratedItinerariesSection: React.FC<CuratedItinerariesSectionProps> = ({
  onSelectPreset
}) => {
  const itineraries = [
    {
      id: 'pho-co',
      title: 'Phố Cổ Hoài Niệm & Ẩm Thực',
      vibe: 'Ẩm thực & Di sản rêu phong',
      duration: 'Buổi sáng hoặc Chiều',
      image: '/36-pho_phuong.jpg',
      stops: ['Hồ Hoàn Kiếm', 'Cà phê Trứng Giảng', 'Ô Quan Chưởng', 'Chợ Đồng Xuân'],
      desc: 'Lang thang ngắm nhìn những mái ngói rêu phong, thưởng thức ly cà phê trứng trứ danh và đắm mình trong nhịp sống 36 phố phường.',
      poiIds: [1, 4, 3]
    },
    {
      id: 'ho-tay',
      title: 'Chiều Hoàng Hôn Hồ Tây Thư Thái',
      vibe: 'Lãng mạn & Yên bình',
      duration: 'Nửa ngày thư thái',
      image: '/chua-tran-quoc.jpg',
      stops: ['Chùa Trấn Quốc', 'Phủ Tây Hồ', 'Đường Thanh Niên', 'Bánh tôm Hồ Tây'],
      desc: 'Hít hà làn gió mát lành ven hồ, ngắm ngôi chùa cổ kính nghìn năm tuổi khi mặt trời dần lặn và thưởng thức đặc sản bên hồ lộng gió.',
      poiIds: [5, 6, 4]
    },
    {
      id: 'ba-dinh',
      title: 'Dấu Ấn Di Sản Ba Đình Nghìn Năm',
      vibe: 'Lịch sử & Chiều sâu văn hóa',
      duration: 'Trọn vẹn 1 ngày',
      image: '/hoang-thanh.jpg',
      stops: ['Lăng Bác', 'Chùa Một Cột', 'Hoàng Thành Thăng Long', 'Văn Miếu'],
      desc: 'Hành trình ngược dòng lịch sử hào hùng, dạo bước qua quảng trường Ba Đình rợp bóng cây và quần thể Hoàng Thành ngàn năm văn hiến.',
      poiIds: [2, 6, 7, 3]
    }
  ];

  return (
    <section id="lich-trinh-mau" className="w-full py-12 lg:py-20 border-t border-stone-300/60">
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B85D3B]/10 text-[#B85D3B] text-xs font-semibold uppercase tracking-wider font-mono">
          <span>GỢI Ý HÀNH TRÌNH THEO GU</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C382B] font-medium leading-tight">
          Lịch trình tinh hoa thiết kế sẵn
        </h2>
        <p className="font-sans text-sm sm:text-base text-[#6E6A63] max-w-2xl mx-auto leading-relaxed">
          Được gợi ý dựa trên thói quen và cảm nhận thực tế của hàng nghìn du khách yêu Hà Nội. Bấm chọn để mở ngay lộ trình chi tiết.
        </p>
      </div>

      {/* 3 Itinerary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {itineraries.map((itinerary) => (
          <div 
            key={itinerary.id}
            onClick={() => onSelectPreset(itinerary.poiIds)}
            role="button"
            tabIndex={0}
            className="bg-[#FDFBF7] border border-stone-300/80 rounded-[2.2rem] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            {/* Image Header with Badge */}
            <div className="relative h-56 w-full overflow-hidden">
              <img 
                src={itinerary.image} 
                alt={itinerary.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EE]/95 backdrop-blur-md text-[#1C382B] text-xs font-semibold shadow-sm">
                <Clock className="w-3 h-3 text-[#B85D3B]" />
                <span>{itinerary.duration}</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-medium">
                <span className="text-stone-200 text-[11px] block uppercase tracking-wider font-mono">
                  {itinerary.vibe}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <h3 className="font-serif text-2xl text-[#1C382B] font-medium leading-snug group-hover:text-[#B85D3B] transition-colors">
                  {itinerary.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6E6A63] font-sans leading-relaxed">
                  {itinerary.desc}
                </p>
              </div>

              {/* Stop Points */}
              <div className="pt-3 border-t border-stone-200/80 space-y-2">
                <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider font-semibold">
                  Các chặng dừng chân:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {itinerary.stops.map((stop, sIdx) => (
                    <span 
                      key={sIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-200/60 text-[#1C382B] text-[11px] font-sans font-medium"
                    >
                      <MapPin className="w-2.5 h-2.5 text-[#B85D3B]" />
                      <span>{stop}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <div className="w-full py-3 rounded-full bg-[#1C382B] group-hover:bg-[#B85D3B] text-[#F8F5EE] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm">
                  <span>Trải nghiệm lộ trình này</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
