import React from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

interface FooterBannerSectionProps {
  onLaunch: () => void;
}

export const FooterBannerSection: React.FC<FooterBannerSectionProps> = ({ onLaunch }) => {
  return (
    <footer className="w-full pt-10 pb-12 space-y-12">
      {/* Large Warm Editorial Banner */}
      <div className="relative bg-[#1C382B] text-[#F8F5EE] rounded-[2.5rem] p-10 sm:p-14 lg:p-20 text-center shadow-2xl shadow-[#1C382B]/20 overflow-hidden">
        {/* Subtle Ambient Shapes */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#B85D3B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-mono font-medium backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#B85D3B]" />
            <span>KHỞI ĐẦU CHUYẾN ĐI THẢNH THƠI</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.2]">
            Bắt đầu chuyến đi Hà Nội <br />
            của bạn ngay hôm nay
          </h2>

          <p className="font-sans text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed">
            Không còn nỗi lo đi lạc hay mất hàng giờ trên đường. Chọn điểm bạn thích, nhận gợi ý nơi nghỉ chân tốt nhất và sẵn sàng tận hưởng vẻ đẹp Hà Nội.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunch}
              className="w-full sm:w-auto px-10 py-4 sm:py-5 rounded-full bg-[#B85D3B] hover:bg-[#9E4C2E] active:scale-95 text-[#F8F5EE] font-semibold text-sm sm:text-base transition-all duration-200 shadow-xl shadow-black/20 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>Tự tạo lịch trình ngay</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="pt-2 text-xs text-stone-400 font-sans">
            Hoàn toàn miễn phí • Không cần đăng ký tài khoản rườm rà
          </div>
        </div>
      </div>

      {/* Warm Heart Footer Note */}
      <div className="w-full pt-6 border-t border-stone-300/50 flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-[#6E6A63] gap-3 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1C382B]" />
          <span className="font-semibold text-[#1C382B]">HÀ NỘI THONG DONG</span>
          <span>— Cẩm nang &amp; Lập lịch trình du lịch thông minh</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-500 font-medium">
          <span>Chúc bạn có chuyến khám phá Thủ đô thật bình yên và đáng nhớ</span>
          <Heart className="w-3.5 h-3.5 text-[#B85D3B] fill-current" />
        </div>
      </div>
    </footer>
  );
};
