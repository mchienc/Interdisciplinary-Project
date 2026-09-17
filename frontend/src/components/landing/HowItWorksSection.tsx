import React from 'react';
import { MapPin, BedDouble, Compass } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: MapPin,
      title: 'Chọn điểm thích đến',
      desc: 'Dạo quanh 36 phố phường, ngắm hoàng hôn Hồ Tây hay ghé quán bún chả thơm lừng? Bạn chỉ cần chọn những nơi mình yêu thích.',
      highlight: 'Hơn 50+ điểm di sản & ẩm thực'
    },
    {
      num: '02',
      icon: BedDouble,
      title: 'Nhận gợi ý nơi ở tiện nhất',
      desc: 'Hệ thống tự động tìm vị trí lưu trú trung tâm lý tưởng nhất, giúp bạn đi đến mọi điểm tham quan với cự ly gần nhất và chi phí xe thấp nhất.',
      highlight: 'Tiết kiệm tới 35% thời gian'
    },
    {
      num: '03',
      icon: Compass,
      title: 'Thảnh thơi lên đường',
      desc: 'Cung đường từng ngày được sắp xếp khoa học và vẽ sẵn trên bản đồ trực quan. Bạn chỉ việc xách ba lô và thong dong tận hưởng Thủ đô.',
      highlight: 'Lộ trình tối ưu 1 chiều'
    }
  ];

  return (
    <section id="cach-hoat-dong" className="w-full py-12 lg:py-20 border-t border-stone-300/60">
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C382B]/10 text-[#1C382B] text-xs font-semibold uppercase tracking-wider font-mono">
          <span>DỄ DÀNG TRONG VÀI GIÂY</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C382B] font-medium leading-tight">
          Chỉ 3 bước để có một chuyến đi hoàn hảo
        </h2>
        <p className="font-sans text-sm sm:text-base text-[#6E6A63] max-w-2xl mx-auto leading-relaxed">
          Không cần lên kế hoạch phức tạp hàng tuần liền. Công nghệ thông minh thay bạn làm mọi phép tính khó nhất trong tích tắc.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={idx}
              className="bg-[#FDFBF7] border border-stone-300/80 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl sm:text-4xl font-semibold text-[#B85D3B] group-hover:scale-105 transition-transform">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#B85D3B]/10 flex items-center justify-center text-[#B85D3B] group-hover:bg-[#B85D3B] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl text-[#1C382B] font-medium pt-2">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#6E6A63] font-sans leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200 text-xs font-semibold text-[#B85D3B] flex items-center gap-1.5 font-sans">
                <span>✦</span>
                <span>{step.highlight}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
