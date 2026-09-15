import React from 'react';
import { XCircle, CheckCircle2, Sparkles } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  return (
    <section id="thau-hieu" className="w-full py-12 lg:py-20 border-t border-stone-300/60">
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B85D3B]/10 text-[#B85D3B] text-xs font-semibold uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>THẤU HIỂU DU KHÁCH</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C382B] font-medium leading-tight">
          Đi du lịch là để tận hưởng, <br className="hidden sm:block" />
          không phải để loay hoay tìm đường
        </h2>
        <p className="font-sans text-sm sm:text-base text-[#6E6A63] max-w-2xl mx-auto leading-relaxed">
          Hà Nội đẹp nhất khi bạn được thong dong ngắm phố. Đừng để những chuyến xe lòng vòng ngược xuôi làm vơi bớt niềm vui của bạn.
        </p>
      </div>

      {/* Side by Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        
        {/* CARD 1: Đi tự túc lòng vòng (Cũ & Mệt mỏi) */}
        <div className="bg-stone-200/40 border border-stone-300/70 rounded-[2rem] p-7 sm:p-9 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-stone-300/60 text-stone-600 text-xs font-semibold">
              Cách đi truyền thống
            </div>
            <h3 className="font-serif text-2xl text-stone-800 font-medium">
              Đi tự túc lòng vòng, mệt mỏi
            </h3>
            <p className="text-xs text-stone-500 font-sans">
              Tự tìm kiếm trên mạng xã hội rồi góp nhặt từng điểm đến mà không tính toán cự ly thực tế.
            </p>
          </div>

          <ul className="space-y-3.5 text-xs sm:text-sm text-stone-600 font-sans">
            <li className="flex items-start gap-3">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>Đặt phòng khách sạn xa điểm tham quan, tốn cả trăm ngàn tiền xe mỗi chặng</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>Chạy qua chạy lại giữa hai đầu thành phố, dính kẹt xe vào giờ cao điểm</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>Mệt nhoài vì di chuyển liên tục, đến nơi thì hết thời gian chụp ảnh và ngắm cảnh</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>Phân vân không biết đi đâu trước, đi đâu sau, dễ bỏ sót những trải nghiệm đặc sắc</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-stone-300/60 text-xs text-stone-500 italic">
            "Chuyến đi biến thành cuộc chạy đua với thời gian và tắc đường."
          </div>
        </div>

        {/* CARD 2: Lộ trình thông minh thảnh thơi (Mới & Tinh Tế) */}
        <div className="bg-[#FDFBF7] border-2 border-[#B85D3B]/40 rounded-[2rem] p-7 sm:p-9 shadow-xl shadow-stone-900/5 flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#B85D3B]/5 rounded-bl-full pointer-events-none" />

          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-[#B85D3B] text-[#F8F5EE] text-xs font-semibold shadow-sm">
              Trải nghiệm với Hà Nội Thong Dong
            </div>
            <h3 className="font-serif text-2xl text-[#1C382B] font-medium">
              Lộ trình thông minh, thảnh thơi tận hưởng
            </h3>
            <p className="text-xs text-[#6E6A63] font-sans">
              Hệ thống tự động kết nối các điểm bạn thích thành một hành trình liền mạch, mượt mà.
            </p>
          </div>

          <ul className="space-y-3.5 text-xs sm:text-sm text-[#1C382B] font-sans font-medium">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#B85D3B] shrink-0 mt-0.5" />
              <span>Nơi ở nằm ngay vị trí trung tâm tiện lợi nhất giữa tất cả các điểm bạn muốn ghé</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#B85D3B] shrink-0 mt-0.5" />
              <span>Cung đường 1 chiều tuần tự khoa học, không quay đầu xe, tránh xa các điểm ùn tắc</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#B85D3B] shrink-0 mt-0.5" />
              <span>Tiết kiệm đến 35% thời gian di chuyển để thong thả nhâm nhi cà phê trứng và ngắm hồ</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#B85D3B] shrink-0 mt-0.5" />
              <span>Lịch trình từng ngày rõ ràng từng khung giờ, chỉ việc mở điện thoại và lên đường</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-stone-200/80 text-xs text-[#B85D3B] font-medium">
            ✓ Giữ trọn vẹn năng lượng và niềm vui cho từng khoảnh khắc tại Thủ đô.
          </div>
        </div>

      </div>
    </section>
  );
};
