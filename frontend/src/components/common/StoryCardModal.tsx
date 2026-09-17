import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Download, Sparkles, MapPin, Hotel, Clock, Share2, Compass } from 'lucide-react';
import { PlanResponse } from '../../types';

interface StoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanResponse | null;
  tripTitle?: string;
}

export const StoryCardModal: React.FC<StoryCardModalProps> = ({
  isOpen,
  onClose,
  plan,
  tripTitle = 'Kế hoạch khám phá Thủ đô'
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  if (!isOpen || !plan) return null;

  const currentDayItin = plan.daily_itineraries.find(d => d.day === selectedDay) || plan.daily_itineraries[0];
  const hotel = plan.selected_hotel;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2.5,
        cacheBust: true
      });
      const link = document.createElement('a');
      link.download = `hanoi-story-day-${selectedDay}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi xuất ảnh Story:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Mock timestamps cho chặng dừng trong ngày
  const timeSlots = ['08:00', '09:45', '14:00', '16:30', '19:00', '21:00'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative max-w-lg w-full flex flex-col items-center space-y-4 my-auto">
        
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between px-2 text-white">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-semibold text-stone-200">
              Xuất Card Story (9:16)
            </span>
            {plan.daily_itineraries.length > 1 && (
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl">
                {plan.daily_itineraries.map(d => (
                  <button
                    key={d.day}
                    onClick={() => setSelectedDay(d.day)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      selectedDay === d.day ? 'bg-white text-stone-900 font-bold' : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    Ngày {d.day}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================
            THE 9:16 STORY CARD (1080 x 1920 Proportional Preview)
            ======================================================== */}
        <div 
          ref={cardRef}
          className="w-[360px] h-[640px] bg-[#F8F5EE] border-4 border-white rounded-[2.5rem] p-7 shadow-2xl flex flex-col justify-between relative overflow-hidden select-none text-[#1F2421]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {/* Subtle Background Postal Texture */}
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border border-stone-300/40 pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full border border-stone-300/40 pointer-events-none" />

          {/* CARD TOP: BRANDING & TITLE */}
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#B85D3B]" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-[#6E6A63]">
                  HÀ NỘI TRAVEL JOURNAL
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#B85D3B]/10 text-[#B85D3B] font-bold">
                NGÀY {selectedDay} / {plan.days}
              </span>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1C382B] leading-tight" style={{ fontFamily: "'Playfair Display', 'Lora', serif" }}>
                {tripTitle}
              </h2>
              <p className="text-[11px] text-[#6E6A63] mt-0.5">
                Tối ưu cự ly &amp; vị trí lưu trú bằng thuật toán không gian
              </p>
            </div>

            {/* Hotel Mini Badge */}
            <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-stone-300/80 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#B85D3B]/10 text-[#B85D3B] flex items-center justify-center font-bold shrink-0">
                🏨
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-mono uppercase tracking-wider text-[#B85D3B] font-bold">
                  ĐIỂM NGHỈ CHÂN TỐI ƯU
                </div>
                <div className="text-xs font-bold text-[#1C382B] truncate font-serif" style={{ fontFamily: "'Playfair Display', 'Lora', serif" }}>
                  {hotel.name}
                </div>
                <div className="text-[10px] text-stone-500">
                  {hotel.stars}★ • {hotel.rating}⭐ • {hotel.address?.split(',')[0]}
                </div>
              </div>
            </div>
          </div>

          {/* CARD CENTER: TIMELINE OF STOPS */}
          <div className="space-y-2.5 my-3 relative z-10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold">
              Hành trình ghé thăm:
            </div>

            <div className="space-y-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-300/60">
              {currentDayItin?.visit_sequence.slice(0, 4).map((poi, idx) => (
                <div key={poi.id} className="relative flex items-center gap-3 pl-1">
                  <div className="w-5 h-5 rounded-full bg-[#1C382B] text-white text-[10px] font-bold flex items-center justify-center shrink-0 ring-2 ring-[#F8F5EE] z-10">
                    {idx + 1}
                  </div>
                  <div className="flex-1 p-2 rounded-xl bg-white/80 border border-stone-200/70 shadow-3xs flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <div className="text-[11px] font-bold text-[#1C382B] truncate">
                        {poi.name}
                      </div>
                      <div className="text-[9px] text-stone-500 flex items-center gap-1.5">
                        <span>{timeSlots[idx % timeSlots.length]}</span>
                        <span>•</span>
                        <span>~{poi.estimated_duration_min}p</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                      {poi.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD BOTTOM: METRICS & WATERMARK */}
          <div className="space-y-3 pt-3 border-t border-stone-300/70 relative z-10">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[9px] text-stone-500 uppercase font-semibold">Quãng đường</div>
                <div className="font-serif text-sm font-bold text-[#1C382B] mt-0.5">
                  {currentDayItin?.total_distance_km} km
                </div>
              </div>
              <div className="border-x border-stone-300/70">
                <div className="text-[9px] text-stone-500 uppercase font-semibold">Ngồi xe</div>
                <div className="font-serif text-sm font-bold text-[#1C382B] mt-0.5">
                  ~{Math.round(currentDayItin?.total_duration_min || 0)}p
                </div>
              </div>
              <div>
                <div className="text-[9px] text-stone-500 uppercase font-semibold">Chặng dừng</div>
                <div className="font-serif text-sm font-bold text-[#B85D3B] mt-0.5">
                  {currentDayItin?.visit_sequence.length} trạm
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[9px] text-stone-500">
              <span>Hà Nội SDSS • Smart Urban Tourism</span>
              <span className="font-mono text-[#B85D3B] font-semibold">#ThongDongHaNoi</span>
            </div>
          </div>
        </div>

        {/* Download Action Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-[360px] py-3.5 rounded-2xl bg-[#B85D3B] hover:bg-[#9E4C2E] active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#B85D3B]/25 transition cursor-pointer"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Đang kết xuất ảnh Story...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Tải ảnh Story 9:16 (PNG độ nét cao)</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
