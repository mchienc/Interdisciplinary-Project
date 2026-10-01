import React, { useState, useRef, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  RotateCw, 
  X, 
  Clock, 
  CheckCircle2, 
  Droplets,
  AlertTriangle
} from 'lucide-react';
import { useContextAwareness } from '../../context/ContextAwareContext';
import { SimulationScenario } from '../../types';

export const ContextStatusPill: React.FC = () => {
  const { 
    weather, 
    forecast, 
    traffic, 
    scenario, 
    setScenario, 
    refresh, 
    isLoading 
  } = useContextAwareness();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Đóng popover khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const scenarios: { id: SimulationScenario; label: string; icon: string; desc: string }[] = [
    { id: 'LIVE', label: 'Thời tiết thực tế', icon: '⚡', desc: 'Đang lấy dữ liệu trực tiếp lúc này' },
    { id: 'RAIN_STORM', label: 'Nếu trời mưa', icon: '🌧️', desc: 'Gợi ý ưu tiên các điểm trong nhà' },
    { id: 'HEAT_WAVE', label: 'Nếu trời nắng gắt', icon: '☀️', desc: 'Tránh đi bộ ngoài trời vào giữa trưa' },
    { id: 'PEAK_EVENING', label: 'Giờ tan tầm (17:45)', icon: '🚦', desc: 'Tính thêm thời gian kẹt xe (+25 phút)' },
    { id: 'AUTUMN_PERFECT', label: 'Trời thu mát mẻ', icon: '🍂', desc: 'Thời tiết 25°C, đường thông thoáng' },
  ];

  const weatherBadgeText = weather.condition === 'RAIN' 
    ? 'Có mưa' 
    : weather.condition === 'HEAT_PEAK' 
    ? 'Nắng gắt' 
    : 'Thời tiết đẹp';

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* ========================================================
          TOPBAR PILL BUTTON
          ======================================================== */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-[#FDFCF7]/90 hover:bg-white border border-stone-200/90 hover:border-[#B85D3B]/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-md select-none text-stone-800"
        title="Bấm để xem thời tiết và tình hình giao thông"
      >
        {/* Weather Segment */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1C382B]">
          <span className="text-sm">{weather.conditionIcon}</span>
          <span>{weather.temperature.toFixed(0)}°C</span>
          <span className="hidden md:inline font-normal text-stone-500">• {weather.conditionLabel}</span>
        </div>

        <div className="h-3.5 w-px bg-stone-300 mx-0.5" />

        {/* Traffic Segment */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span 
            style={{ backgroundColor: traffic.color }} 
            className="w-2 h-2 rounded-full animate-pulse shrink-0" 
          />
          <span className="text-stone-700 hidden sm:inline">
            {traffic.level === 'HEAVY' ? 'Đang kẹt xe' : traffic.level === 'MODERATE' ? 'Đường hơi đông' : 'Đường thoáng'}
          </span>
          {traffic.extraMinutes > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
              +{traffic.extraMinutes}p
            </span>
          )}
        </div>

        {/* Indicator arrow */}
        <span className="text-[10px] text-stone-400 pl-0.5">▾</span>
      </div>

      {/* ========================================================
          DETAILED CONTEXT POPOVER MODAL
          ======================================================== */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-88 sm:w-96 bg-[#FDFCF7] border border-stone-200/90 rounded-3xl shadow-2xl p-4 sm:p-5 z-50 text-stone-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
            <div>
              <h3 className="font-serif text-base font-bold text-[#1C382B]">
                Thời tiết & Giao thông
              </h3>
              <p className="text-[11px] text-stone-500 font-sans">
                Hà Nội • Cập nhật lúc {weather.updatedAt}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={refresh}
                disabled={isLoading}
                title="Làm mới thời tiết"
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1. Thẻ Thời tiết hiện tại */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{weather.conditionIcon}</span>
                  <div>
                    <div className="text-xl font-serif font-bold text-[#1C382B]">
                      {weather.temperature.toFixed(1)}°C
                    </div>
                    <div className="text-xs text-stone-500 font-medium">
                      Cảm nhận {weather.apparentTemperature.toFixed(1)}°C • {weather.conditionLabel}
                    </div>
                  </div>
                </div>
              </div>

              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                weather.condition === 'RAIN' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : weather.condition === 'HEAT_PEAK' 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {weatherBadgeText}
              </span>
            </div>

            {/* Chỉ số phụ: Độ ẩm, Lượng mưa, Chỉ số UV */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
              <div className="p-1.5 rounded-xl bg-stone-50">
                <div className="text-[10px] text-stone-500 flex items-center justify-center gap-1">
                  <Droplets className="w-2.5 h-2.5 text-blue-500" />
                  <span>Độ ẩm</span>
                </div>
                <div className="text-xs font-bold text-stone-700 mt-0.5">{weather.humidity}%</div>
              </div>
              <div className="p-1.5 rounded-xl bg-stone-50">
                <div className="text-[10px] text-stone-500 flex items-center justify-center gap-1">
                  <CloudRain className="w-2.5 h-2.5 text-cyan-600" />
                  <span>Lượng mưa</span>
                </div>
                <div className="text-xs font-bold text-stone-700 mt-0.5">{weather.precipitation} mm</div>
              </div>
              <div className="p-1.5 rounded-xl bg-stone-50">
                <div className="text-[10px] text-stone-500 flex items-center justify-center gap-1">
                  <Sun className="w-2.5 h-2.5 text-amber-500" />
                  <span>Chỉ số UV</span>
                </div>
                <div className="text-xs font-bold text-stone-700 mt-0.5">{weather.uvIndex.toFixed(1)}</div>
              </div>
            </div>

            {/* Lời khuyên ngắn */}
            <p className="text-xs text-stone-600 leading-relaxed italic bg-[#FDFBF7] p-2.5 rounded-xl border border-[#B85D3B]/20">
              "{weather.advice}"
            </p>
          </div>

          {/* 2. Khả năng có mưa 6 giờ tới */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#B85D3B]" />
                Khả năng mưa 6 giờ tới
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="grid grid-cols-6 gap-1.5 items-end h-22 pt-2">
                {forecast.map((item, idx) => {
                  const barHeight = Math.max(10, Math.round((item.rainProb / 100) * 50));
                  const barColor = item.rainProb >= 60 
                    ? '#DC2626' 
                    : item.rainProb >= 30 
                    ? '#F59E0B' 
                    : '#10B981';

                  return (
                    <div key={idx} className="flex flex-col items-center justify-end h-full gap-1">
                      <span className="text-[9px] font-bold text-stone-600">
                        {item.rainProb}%
                      </span>
                      <div className="w-full max-w-[18px] bg-stone-100 rounded-t-md overflow-hidden flex items-end h-[50px]">
                        <div 
                          style={{ height: `${barHeight}px`, backgroundColor: barColor }} 
                          className="w-full transition-all duration-500 rounded-t-sm"
                        />
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Tình trạng Giao thông */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  style={{ backgroundColor: traffic.color }} 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                />
                <span className="font-serif text-sm font-bold text-[#1C382B]">
                  {traffic.level === 'HEAVY' ? 'Đường đang đông đúc' : traffic.level === 'MODERATE' ? 'Di chuyển chậm' : 'Đường thông thoáng'}
                </span>
              </div>
              <span className={`text-xs font-semibold ${traffic.extraMinutes > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {traffic.extraMinutes > 0 ? `+${traffic.extraMinutes} phút trễ` : 'Thuận lợi'}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {traffic.level === 'HEAVY'
                ? 'Đang vào giờ cao điểm, các trục đường chính quanh trung tâm có thể ùn tắc.'
                : traffic.level === 'MODERATE'
                ? 'Đường đông hơn vào giờ trưa, xe cộ di chuyển chậm một chút.'
                : 'Đường sá thông thoáng, di chuyển nhanh chóng và thuận lợi.'}
            </p>

            {traffic.extraMinutes > 0 && (
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Dự kiến di chuyển sẽ chậm hơn khoảng <b>+{traffic.extraMinutes} phút</b>.</span>
              </div>
            )}
          </div>

          {/* 4. Thử xem các tình huống khác */}
          <div className="space-y-2 pt-1 border-t border-stone-200/80">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span>Thử xem các tình huống:</span>
              <span className="text-[10px] text-stone-400 font-normal">Bấm để xem lộ trình đổi</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setScenario(sc.id)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    scenario === sc.id
                      ? 'bg-[#1C382B] text-white border-[#1C382B] shadow-xs'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{sc.icon}</span>
                    <div>
                      <div className="font-bold">{sc.label}</div>
                      <div className={`text-[10px] ${scenario === sc.id ? 'text-stone-300' : 'text-stone-500'}`}>
                        {sc.desc}
                      </div>
                    </div>
                  </div>
                  {scenario === sc.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
