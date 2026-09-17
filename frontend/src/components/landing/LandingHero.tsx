import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { 
  Play, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Navigation } from './Navigation';
import { SpatialLandmarkCard } from './SpatialLandmarkCard';
import { ComparisonSection } from './ComparisonSection';
import { HowItWorksSection } from './HowItWorksSection';
import { StackingCardsSection } from './StackingCardsSection';
import { FooterBannerSection } from './FooterBannerSection';
import { POI } from '../../types';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface PresetItem {
  id: string;
  num: string;
  name: string;
  desc: string;
  metric: string;
  poiIds: number[];
}

export const USER_PRESETS: PresetItem[] = [
  {
    id: 'van-mieu',
    num: '01',
    name: 'Văn Miếu & Phố Cổ',
    desc: 'Di sản ngàn năm văn hiến & Ẩm thực 36 phố phường',
    metric: 'Tiết kiệm 35% thời gian',
    poiIds: [3, 1, 4]
  },
  {
    id: 'ho-tay',
    num: '02',
    name: 'Cảnh Quan Hồ Tây',
    desc: 'Ngắm hoàng hôn Trấn Quốc & Thư thái ven hồ',
    metric: 'Tiết kiệm 28% cự ly',
    poiIds: [5, 6, 4]
  },
  {
    id: 'ba-dinh',
    num: '03',
    name: 'Ba Đình & Di Tích',
    desc: 'Quần thể Lăng Bác & Hoàng Thành Thăng Long',
    metric: 'Tối ưu 100% cung đường',
    poiIds: [2, 6, 7, 3]
  }
];

interface LandingHeroProps {
  onLaunchWorkspace: (presetPoiIds?: number[]) => void;
  isTransitioning: boolean;
  heroRef: React.RefObject<HTMLDivElement>;
  backdropRef: React.RefObject<HTMLDivElement>;
  pois?: POI[];
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLaunchWorkspace,
  isTransitioning,
  heroRef,
  backdropRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  // Lenis Smooth Scroll & GSAP ScrollTrigger Synchronization
  useEffect(() => {
    if (!backdropRef.current) return;

    const lenis = new Lenis({
      wrapper: backdropRef.current,
      content: heroRef.current || undefined,
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    });

    const onScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', onScroll);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.off('scroll', onScroll);
      lenis.destroy();
    };
  }, [backdropRef, heroRef]);

  // GSAP: Refined Editorial Motion Choreography
  useGSAP(() => {
    const ctx = gsap.context(() => {
      // 1. Cột trái: Text trượt nhẹ từ dưới lên
      gsap.from('.editorial-stagger', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'all'
      });

      // 2. Cột phải: Khung ảnh chính scale từ 0.96 lên 1.0
      gsap.from('.visual-showcase-main', {
        opacity: 0,
        scale: 0.96,
        duration: 0.9,
        ease: 'power3.out',
        clearProps: 'all'
      });
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef });

  return (
    <div 
      ref={backdropRef} 
      className="landing-backdrop fixed inset-0 z-20 w-full min-h-screen bg-[#F8F5EE] overflow-y-auto no-scrollbar select-none"
    >
      <div 
        ref={heroRef} 
        className="max-w-[1600px] mx-auto min-h-screen flex flex-col justify-start gap-12 lg:gap-20 px-6 sm:px-8 lg:px-16 py-8"
      >
        
        {/* ========================================================
            SECTION 1: HERO VIEWPORT (45% Trái / 55% Phải)
            ======================================================== */}
        <div className="w-full flex flex-col justify-start gap-8 lg:gap-12 min-h-[90vh]">
          {/* Top Navigation */}
          <Navigation onLaunch={() => onLaunchWorkspace()} />

          {/* Rebalanced 12-Column Hero Grid */}
          <div ref={containerRef} className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center flex-1">
            
            {/* LEFT COLUMN: 45% Width (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              
              {/* Friendly Non-Technical Eyebrow */}
              <div className="editorial-stagger flex items-center gap-2.5">
                <span className="w-6 h-px bg-[#B85D3B]" />
                <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#6E6A63] font-semibold">
                  CẨM NANG &amp; LẬP LỊCH TRÌNH DU LỊCH THỦ ĐÔ
                </span>
              </div>

              {/* Main Headline for Real Travelers */}
              <h1 className="editorial-stagger editorial-headline font-serif text-4xl sm:text-5xl lg:text-[44px] xl:text-[52px] font-medium text-[#1C382B] leading-[1.18]">
                Thong dong Hà&nbsp;Nội, <br className="hidden sm:block" />
                <span className="italic font-normal text-[#B85D3B] tracking-normal">trọn vẹn từng</span> cung&nbsp;đường.
              </h1>

              {/* Friendly, Warm Description (Zero Jargon) */}
              <p className="editorial-stagger font-sans text-sm sm:text-base text-[#6E6A63] leading-[1.72] max-w-xl">
                Chọn những nơi bạn muốn đến. Chúng tôi tự động gợi ý điểm nghỉ chân thuận tiện nhất và vẽ sẵn lộ trình thông minh, giúp bạn tạm biệt cảnh đi lòng vòng hay kẹt xe giữa Thủ đô.
              </p>

              {/* Action Buttons & Presets Selector */}
              <div className="editorial-stagger flex flex-wrap items-center gap-4 pt-2 relative">
                {/* Primary CTA (Terracotta Pill) */}
                <button
                  onClick={() => onLaunchWorkspace()}
                  disabled={isTransitioning}
                  className="px-8 py-4 rounded-full bg-[#B85D3B] hover:bg-[#9E4C2E] active:scale-95 text-[#F8F5EE] font-semibold text-sm transition-all duration-200 shadow-lg shadow-[#B85D3B]/25 flex items-center gap-2.5 cursor-pointer group"
                >
                  <Play className="w-4 h-4 fill-current transition-transform group-hover:translate-x-0.5" />
                  <span>Tự tạo lịch trình ngay</span>
                </button>

                {/* Secondary Button: Lộ trình mẫu gợi ý */}
                <div className="relative">
                  <button
                    onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                    className="px-4 py-3 text-sm font-semibold text-[#1C382B] hover:text-[#B85D3B] transition flex items-center gap-1.5 group cursor-pointer"
                  >
                    <span className="border-b border-stone-400 group-hover:border-[#B85D3B] transition-colors pb-0.5">
                      Lộ trình mẫu gợi ý
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showPresetsMenu ? 'rotate-180 text-[#B85D3B]' : ''}`} />
                  </button>

                  {/* Floating Presets Popover Menu */}
                  {showPresetsMenu && (
                    <div className="absolute left-0 bottom-full mb-3 w-80 bg-[#F8F5EE] border border-stone-300 rounded-2xl p-3 shadow-2xl z-40 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2 py-1 text-[11px] font-sans uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#B85D3B]" />
                        <span>Chọn kịch bản gợi ý:</span>
                      </div>
                      {USER_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setShowPresetsMenu(false);
                            onLaunchWorkspace(p.poiIds);
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-stone-200/70 transition flex items-center justify-between group cursor-pointer"
                        >
                          <div className="pr-2">
                            <div className="text-xs font-bold text-[#1C382B] group-hover:text-[#B85D3B] transition-colors">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                              {p.desc}
                            </div>
                          </div>
                          <span className="text-[10px] font-sans font-semibold text-[#B85D3B] bg-[#B85D3B]/10 px-2.5 py-1 rounded-full shrink-0">
                            {p.metric}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Travel Metric Strip (User-Friendly Travel Metrics) */}
              <div className="editorial-stagger pt-6 border-t border-stone-300/70 grid grid-cols-3 gap-4 text-left max-w-lg">
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C382B] leading-tight">
                    35%
                  </div>
                  <div className="text-xs text-[#6E6A63] font-sans mt-0.5">
                    Tiết kiệm thời gian
                  </div>
                </div>

                <div className="border-l border-stone-300/70 pl-4">
                  <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C382B] leading-tight">
                    100%
                  </div>
                  <div className="text-xs text-[#6E6A63] font-sans mt-0.5">
                    Tuyến đường thông minh
                  </div>
                </div>

                <div className="border-l border-stone-300/70 pl-4">
                  <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C382B] leading-tight">
                    50+
                  </div>
                  <div className="text-xs text-[#6E6A63] font-sans mt-0.5">
                    Điểm đến &amp; ẩm thực
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: 55% Width - Pure Clean Photo */}
            <div className="lg:col-span-7 flex items-center justify-center lg:pl-4">
              <SpatialLandmarkCard onSelectPreset={onLaunchWorkspace} />
            </div>

          </div>
        </div>

        {/* ========================================================
            SECTION 2: THẤU HIỂU DU KHÁCH (So Sánh Trực Quan)
            ======================================================== */}
        <ComparisonSection />

        {/* ========================================================
            SECTION 3: CÁCH HOẠT ĐỘNG (3 Bước Đơn Giản)
            ======================================================== */}
        <HowItWorksSection />

        {/* ========================================================
            SECTION 4: LỊCH TRÌNH MẪU THEO GU (3 Thẻ Trượt Xếp Chồng Stacking Cards)
            ======================================================== */}
        <StackingCardsSection scrollerRef={backdropRef} onSelectPreset={onLaunchWorkspace} />

        {/* ========================================================
            SECTION 5: CHÂN TRANG & CTA LỚN
            ======================================================== */}
        <FooterBannerSection onLaunch={() => onLaunchWorkspace()} />

      </div>
    </div>
  );
};
