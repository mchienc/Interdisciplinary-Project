import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Clock, MapPin, CheckCircle2, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ItineraryCardData {
  id: string;
  num: string;
  category: string;
  title: string;
  duration: string;
  desc: string;
  benefits: string[];
  stops: string[];
  image: string;
  badge: string;
  badgeSub: string;
  poiIds: number[];
}

const ITINERARIES: ItineraryCardData[] = [
  {
    id: 'pho-co',
    num: '01',
    category: 'ẨM THỰC & PHỐ CỔ HOÀI NIỆM',
    title: 'Phố Cổ Thảnh Thơi & Cà Phê Ban Mai',
    duration: 'Nửa ngày • Thong dong ngắm phố',
    desc: 'Lang thang qua những con ngõ nhỏ ngập tràn hương cà phê rang xay và hoa tươi ban sớm. Tận hưởng nhịp sống chậm rãi giữa lòng 36 phố phường rêu phong nghìn năm văn hiến.',
    benefits: [
      'Gợi ý khách sạn ngay cửa ngõ Hoàn Kiếm',
      'Tiết kiệm 40 phút đi lại giữa các điểm',
      '4 chặng dừng chân liền mạch không quay đầu'
    ],
    stops: ['Hồ Hoàn Kiếm', 'Cà phê Trứng Giảng', 'Ô Quan Chưởng', 'Chợ Đồng Xuân'],
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85',
    badge: '☕ Cà phê Trứng & Góc phố ngàn năm',
    badgeSub: 'Trải nghiệm ẩm thực biểu tượng',
    poiIds: [1, 4, 3]
  },
  {
    id: 'ho-tay',
    num: '02',
    category: 'LÃNG MẠN & YÊN BÌNH',
    title: 'Chiều Gió Hồ Tây & Hoàng Hôn Yên Bình',
    duration: 'Buổi chiều & Tối • Thư thái lộng gió',
    desc: 'Đón làn gió mát lành thổi từ mặt hồ mênh mông, chiêm bái ngôi chùa cổ nghìn năm tuổi và ngắm nhìn hoàng hôn nhuộm đỏ rực rỡ chân trời Thủ đô.',
    benefits: [
      'Nơi ở view hồ Tây thoáng đãng, lộng gió',
      'Cung đường ven hồ tránh trọn giờ tan tầm',
      'Thư thái ngắm hoàng hôn đỏ rực tuyệt đẹp'
    ],
    stops: ['Chùa Trấn Quốc', 'Phủ Tây Hồ', 'Đường Thanh Niên', 'Bánh tôm Hồ Tây'],
    image: '/chua-tran-quoc.jpg',
    badge: '⛵ Hoàng hôn bên Chùa Trấn Quốc',
    badgeSub: 'Cổ tự nghìn năm trên đảo cá',
    poiIds: [5, 6, 4]
  },
  {
    id: 'ba-dinh',
    num: '03',
    category: 'LỊCH SỬ & CHIỀU SÂU VĂN HÓA',
    title: 'Dấu Ấn Di Sản Thăng Long Ngàn Năm',
    duration: 'Trọn vẹn 1 ngày • Ý nghĩa & Sâu lắng',
    desc: 'Hành trình ngược dòng thời gian về với cội nguồn văn hiến. Dạo bước dưới hàng cây xanh mát quanh quảng trường Ba Đình và Hoàng Thành Thăng Long uy nghiêm.',
    benefits: [
      'Tâm điểm nghỉ ngơi gần các di tích Ba Đình',
      'Tuyến đường đi bộ rợp bóng cây cổ thụ',
      'Khám phá trọn vẹn văn hiến Thăng Long'
    ],
    stops: ['Lăng Bác', 'Chùa Một Cột', 'Hoàng Thành Thăng Long', 'Văn Miếu'],
    image: '/landing-bg.webp',
    badge: '🏛️ Quần thể di sản ngàn năm văn hiến',
    badgeSub: 'Không gian linh thiêng & tôn kính',
    poiIds: [2, 6, 7, 3]
  }
];

interface StackingCardsSectionProps {
  scrollerRef?: React.RefObject<HTMLElement | HTMLDivElement>;
  onSelectPreset: (poiIds: number[]) => void;
}

export const StackingCardsSection: React.FC<StackingCardsSectionProps> = ({
  scrollerRef,
  onSelectPreset
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  const card1ImgRef = useRef<HTMLImageElement>(null);
  const card2ImgRef = useRef<HTMLImageElement>(null);
  const card3ImgRef = useRef<HTMLImageElement>(null);

  // Hiệu ứng chiều sâu (Scale & Brightness) và Parallax mượt mà khi cuộn các thẻ chồng lên nhau
  React.useEffect(() => {
    // Hiệu ứng bồng bềnh cho nhãn nổi
    const badgeTween = gsap.to('.stacking-card-badge', {
      y: -5,
      repeat: -1,
      yoyo: true,
      duration: 2.2,
      ease: 'sine.inOut'
    });

    const scroller = scrollerRef?.current || window;
    let rafId: number;

    const updateCardDepth = () => {
      if (!card1Ref.current || !card2Ref.current || !card3Ref.current) return;

      const r1 = card1Ref.current.getBoundingClientRect();
      const r2 = card2Ref.current.getBoundingClientRect();
      const r3 = card3Ref.current.getBoundingClientRect();

      // Thẻ 1: Thu nhỏ nhẹ và hơi tối khi Thẻ 2 trượt lên đè lên nó
      const overlap1 = Math.max(0, Math.min(1, (r1.bottom - r2.top) / (r1.height * 0.85)));
      const scale1 = 1 - overlap1 * 0.05;
      const brightness1 = 1 - overlap1 * 0.16;
      card1Ref.current.style.transform = `scale(${scale1})`;
      card1Ref.current.style.filter = `brightness(${brightness1})`;

      if (card1ImgRef.current) {
        card1ImgRef.current.style.transform = `translateY(${-overlap1 * 12}%)`;
      }

      // Thẻ 2: Thu nhỏ nhẹ và hơi tối khi Thẻ 3 trượt lên đè lên nó
      const overlap2 = Math.max(0, Math.min(1, (r2.bottom - r3.top) / (r2.height * 0.85)));
      const scale2 = 1 - overlap2 * 0.05;
      const brightness2 = 1 - overlap2 * 0.16;
      card2Ref.current.style.transform = `scale(${scale2})`;
      card2Ref.current.style.filter = `brightness(${brightness2})`;

      if (card2ImgRef.current) {
        card2ImgRef.current.style.transform = `translateY(${-overlap2 * 12}%)`;
      }
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateCardDepth);
    };

    scroller.addEventListener('scroll', handleScroll, { passive: true });
    updateCardDepth();

    return () => {
      badgeTween.kill();
      scroller.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [scrollerRef]);

  return (
    <section id="lich-trinh-mau" className="w-full pt-10 pb-6 border-t border-stone-300/60">
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-12 lg:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B85D3B]/10 text-[#B85D3B] text-xs font-semibold uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GỢI Ý HÀNH TRÌNH THEO GU</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C382B] font-medium leading-tight">
          Lịch trình tinh hoa thiết kế sẵn
        </h2>
        <p className="font-sans text-sm sm:text-base text-[#6E6A63] max-w-2xl mx-auto leading-relaxed">
          Cuộn trang để khám phá 3 phong cách du ngoạn Thủ đô được yêu thích nhất. Bấm chọn để hệ thống tự động tối ưu hóa vị trí lưu trú &amp; toàn bộ cung đường.
        </p>
      </div>

      {/* ========================================================
          DESKTOP VIEW: TRUE STICKY STACKING DECK (min-width: 1024px)
          Mỗi thẻ có thứ tự tự nhiên, ghim dính (sticky) lần lượt tại top-20/24/28
          Hoàn toàn không bị lệch trục hay chồng chéo sai thứ tự
          ======================================================== */}
      <div 
        ref={containerRef} 
        className="hidden lg:flex flex-col max-w-6xl mx-auto relative pb-28"
      >
        {/* Card 01: Phố Cổ */}
        <div
          ref={card1Ref}
          style={{
            position: 'sticky',
            top: '84px',
            zIndex: 10,
            marginBottom: '35vh'
          }}
          className="w-full h-[600px] lg:h-[620px] bg-[#FDFBF7] border border-stone-300/80 rounded-[2.5rem] shadow-2xl shadow-stone-900/10 overflow-hidden will-change-transform transform-gpu origin-top transition-transform duration-100"
        >
          <EditorialCardInner
            item={ITINERARIES[0]}
            imgRef={card1ImgRef}
            onSelect={() => onSelectPreset(ITINERARIES[0].poiIds)}
          />
        </div>

        {/* Card 02: Hồ Tây */}
        <div
          ref={card2Ref}
          style={{
            position: 'sticky',
            top: '108px',
            zIndex: 20,
            marginBottom: '35vh'
          }}
          className="w-full h-[600px] lg:h-[620px] bg-[#FDFBF7] border border-stone-300/80 rounded-[2.5rem] shadow-2xl shadow-stone-900/10 overflow-hidden will-change-transform transform-gpu origin-top transition-transform duration-100"
        >
          <EditorialCardInner
            item={ITINERARIES[1]}
            imgRef={card2ImgRef}
            onSelect={() => onSelectPreset(ITINERARIES[1].poiIds)}
          />
        </div>

        {/* Card 03: Ba Đình */}
        <div
          ref={card3Ref}
          style={{
            position: 'sticky',
            top: '132px',
            zIndex: 30,
            marginBottom: '0px'
          }}
          className="w-full h-[600px] lg:h-[620px] bg-[#FDFBF7] border border-stone-300/80 rounded-[2.5rem] shadow-2xl shadow-stone-900/10 overflow-hidden will-change-transform transform-gpu origin-top transition-transform duration-100"
        >
          <EditorialCardInner
            item={ITINERARIES[2]}
            imgRef={card3ImgRef}
            onSelect={() => onSelectPreset(ITINERARIES[2].poiIds)}
          />
        </div>
      </div>

      {/* ========================================================
          MOBILE / TABLET VIEW: VERTICAL STACK (< 1024px)
          Normal vertical cards for touch-friendly scrolling
          ======================================================== */}
      <div className="lg:hidden flex flex-col gap-8 max-w-2xl mx-auto">
        {ITINERARIES.map((item) => (
          <div 
            key={item.id}
            className="bg-[#FDFBF7] border border-stone-300/80 rounded-[2.2rem] shadow-lg overflow-hidden flex flex-col"
          >
            {/* Image Header */}
            <div className="relative h-60 w-full overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F5EE]/95 backdrop-blur-md text-[#1C382B] text-xs font-semibold shadow-sm">
                <Clock className="w-3 h-3 text-[#B85D3B]" />
                <span>{item.duration}</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
                <span className="text-stone-200 text-[11px] block uppercase tracking-wider font-mono font-semibold">
                  {item.category}
                </span>
                <span className="font-serif text-lg font-medium text-white line-clamp-1 mt-0.5">
                  {item.badge}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-3xl font-bold text-[#B85D3B]/40 leading-none">
                    {item.num}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#1C382B] font-medium leading-snug">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#6E6A63] font-sans leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2 py-2 border-y border-stone-200/80">
                {item.benefits.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2 text-xs text-[#1C382B] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B85D3B] shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Stops */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider font-semibold">
                  Các chặng dừng chân:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.stops.map((stop, sIdx) => (
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

              {/* Button */}
              <button
                onClick={() => onSelectPreset(item.poiIds)}
                className="w-full py-3.5 rounded-full bg-[#1C382B] hover:bg-[#B85D3B] text-[#F8F5EE] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer group"
              >
                <span>Trải nghiệm lộ trình này</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ========================================================
   Editorial Card Inner (Split 45/55 Layout for Desktop)
   ======================================================== */
interface EditorialCardInnerProps {
  item: ItineraryCardData;
  imgRef: React.RefObject<HTMLImageElement>;
  onSelect: () => void;
}

const EditorialCardInner: React.FC<EditorialCardInnerProps> = ({
  item,
  imgRef,
  onSelect
}) => {
  return (
    <div className="w-full h-full grid grid-cols-12 overflow-hidden">
      {/* LEFT COLUMN: 45% Width (5 cols) */}
      <div className="col-span-5 p-8 lg:p-10 flex flex-col justify-between h-full bg-[#FDFBF7] relative z-10">
        
        {/* Top Header Strip */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-serif text-5xl lg:text-6xl font-bold text-[#B85D3B]/25 select-none leading-none">
              {item.num}
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200/70 text-[#1C382B] text-[11px] font-sans font-medium">
              <Clock className="w-3 h-3 text-[#B85D3B]" />
              <span>{item.duration}</span>
            </div>
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-[#B85D3B]/10 text-[#B85D3B] text-[11px] font-mono font-semibold tracking-wider uppercase">
            {item.category}
          </div>

          <h3 className="font-serif text-2xl lg:text-3xl text-[#1C382B] font-medium leading-snug">
            {item.title}
          </h3>

          <p className="text-xs lg:text-sm text-[#6E6A63] font-sans leading-relaxed line-clamp-3">
            {item.desc}
          </p>
        </div>

        {/* Benefits Checklist */}
        <div className="space-y-2 py-4 border-y border-stone-200/80">
          {item.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs lg:text-[13px] text-[#1C382B] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#B85D3B] shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Bottom Actions & Stops */}
        <div className="space-y-4 pt-2">
          {/* Stops preview */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider font-semibold">
              Chặng dừng tiêu biểu:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.stops.map((stop, sIdx) => (
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

          {/* Primary Action Button */}
          <button
            onClick={onSelect}
            className="w-full py-3.5 rounded-full bg-[#1C382B] hover:bg-[#B85D3B] text-[#F8F5EE] text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#B85D3B]/20 cursor-pointer group"
          >
            <span>Trải nghiệm lộ trình này</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: 55% Width (7 cols) - Full-bleed Photo with Parallax & Floating Badge */}
      <div className="col-span-7 relative h-full overflow-hidden bg-stone-900">
        <img
          ref={imgRef}
          src={item.image}
          alt={item.title}
          className="w-full h-[125%] object-cover object-center filter brightness-[0.92] will-change-transform transform -translate-y-[8%]"
        />
        
        {/* Soft Vignette / Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

        {/* Floating Glassmorphic Editorial Badge */}
        <div className="stacking-card-badge absolute bottom-8 left-8 right-8 max-w-sm px-5 py-3.5 rounded-2xl bg-[#F8F5EE]/95 backdrop-blur-md border border-white/60 shadow-2xl">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#B85D3B] font-semibold">
            {item.badgeSub}
          </div>
          <div className="text-sm font-serif font-medium text-[#1C382B] mt-0.5">
            {item.badge}
          </div>
        </div>
      </div>
    </div>
  );
};
