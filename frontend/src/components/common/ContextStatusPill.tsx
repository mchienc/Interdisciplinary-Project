import React, { useState, useRef, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  CloudSun, 
  AlertTriangle, 
  Activity, 
  RotateCw, 
  X, 
  Clock, 
  CheckCircle2, 
  Gauge, 
  Navigation2,
  Droplets,
  Thermometer,
  ShieldAlert
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
    { id: 'LIVE', label: 'Trực tiếp (Live)', icon: '⚡', desc: 'Open-Meteo API thời gian thực & giờ thực' },
    { id: 'RAIN_STORM', label: 'Mưa rào 4.8mm', icon: '🌧️', desc: 'Mưa dông lớn • Kích hoạt ưu tiên bảo tàng trong nhà' },
    { id: 'HEAT_WAVE', label: 'Nắng gắt 38.4°C', icon: '☀️', desc: 'UV 10.4 • Tránh tản bộ ngoài trời giữa trưa' },
    { id: 'PEAK_EVENING', label: 'Cao điểm 17:45', icon: '🚦', desc: 'Ùn tắc tan tầm • Tăng thời gian 1.75x (+25p)' },
    { id: 'AUTUMN_PERFECT', label: 'Thu Hà Nội 25°C', icon: '🍂', desc: 'Tiết trời trong trẻo • Đường sá thông thoáng' },
  ];

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* ========================================================
          TOPBAR PILL BUTTON (Warm Editorial Glassmorphic)
          ======================================================== */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-[#FDFCF7]/90 hover:bg-white border border-stone-200/90 hover:border-[#B85D3B]/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-md select-none text-stone-800"
        title="Bấm để xem chi tiết dự báo thời tiết, giao thông và chuyển đổi kịch bản giả lập"
      >
        {/* Weather Pill Segment */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1C382B]">
          <span className="text-sm">{weather.conditionIcon}</span>
          <span>{weather.temperature.toFixed(0)}°C</span>
          <span className="hidden md:inline font-normal text-stone-500">• {weather.conditionLabel}</span>
        </div>

        <div className="h-3.5 w-px bg-stone-300 mx-0.5" />

        {/* Traffic Pill Segment */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span 
            style={{ backgroundColor: traffic.color }} 
            className="w-2 h-2 rounded-full animate-pulse shrink-0" 
          />
          <span className="text-stone-700 hidden sm:inline">
            {traffic.level === 'HEAVY' ? 'Ùn tắc cao điểm' : traffic.level === 'MODERATE' ? 'Di chuyển chậm' : 'Lưu thông tốt'}
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
        <div className="absolute right-0 top-11 w-88 sm:w-104 bg-[#FDFCF7] border border-stone-200/90 rounded-3xl shadow-2xl p-4 sm:p-5 z-50 text-stone-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#B85D3B]/10 text-[#B85D3B] text-[10px] font-mono uppercase font-semibold">
                <span>CONTEXT-AWARE ENGINE</span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#1C382B] mt-0.5">
                Nhận Thức Môi Trường Hà Nội
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={refresh}
                disabled={isLoading}
                title="Cập nhật lại thời tiết trực tiếp"
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

              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                weather.condition === 'RAIN' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : weather.condition === 'HEAT_PEAK' 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {weather.condition}
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

            {/* Lời khuyên văn phong Editorial */}
            <p className="text-xs text-stone-600 leading-relaxed italic bg-[#FDFBF7] p-2.5 rounded-xl border border-[#B85D3B]/20">
              "{weather.advice}"
            </p>
          </div>

          {/* 2. Biểu đồ khả năng mưa 6 giờ tới */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#B85D3B]" />
                Khả năng có mưa 6 giờ tới
              </span>
              <span className="text-[10px] text-stone-400 font-normal">Cập nhật: {weather.updatedAt}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="grid grid-cols-6 gap-1.5 items-end h-24 pt-2">
                {forecast.map((item, idx) => {
                  const barHeight = Math.max(12, Math.round((item.rainProb / 100) * 60));
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
                      <div className="w-full max-w-[20px] bg-stone-100 rounded-t-md overflow-hidden flex items-end h-[60px]">
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

          {/* 3. Thẻ Mật độ Giao thông Hà Nội */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  style={{ backgroundColor: traffic.color }} 
                  className="w-3 h-3 rounded-full shrink-0" 
                />
                <span className="font-serif text-sm font-bold text-[#1C382B]">
                  {traffic.label}
                </span>
              </div>
              <span className="text-xs font-bold text-stone-600">
                Hệ số {traffic.multiplier.toFixed(2)}x
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {traffic.description}
            </p>

            {traffic.extraMinutes > 0 && (
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Dự kiến kéo dài thêm <b>+{traffic.extraMinutes} phút</b> di chuyển qua các điểm nghẽn.</span>
              </div>
            )}
          </div>

          {/* 4. Bộ chuyển đổi Kịch bản Giả lập (Simulation Selector) */}
          <div className="space-y-2 pt-1 border-t border-stone-200/80">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span>Chế độ mô phỏng kiểm thử đồ án:</span>
              <span className="text-[10px] text-[#B85D3B] font-mono">5 KỊCH BẢN</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setScenario(sc.id)}
                  className={`w-full p-2 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    scenario === sc.id
                      ? 'bg-[#1C382B] text-white border-[#1C382B] shadow-xs'
                      : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
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
