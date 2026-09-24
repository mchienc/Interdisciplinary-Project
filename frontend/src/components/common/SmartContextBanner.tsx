import React from 'react';
import { Sparkles, CloudRain, Sun, AlertTriangle, ArrowRight, Check, X } from 'lucide-react';
import { useContextAwareness } from '../../context/ContextAwareContext';

export const SmartContextBanner: React.FC = () => {
  const { suggestion, applySuggestion, dismissSuggestion, isAdapted } = useContextAwareness();

  if (!suggestion || isAdapted) {
    return null;
  }

  const getIcon = () => {
    switch (suggestion.type) {
      case 'weather_rain':
        return <CloudRain className="w-5 h-5 text-blue-600" />;
      case 'weather_heat':
        return <Sun className="w-5 h-5 text-amber-600" />;
      case 'traffic_congestion':
      default:
        return <AlertTriangle className="w-5 h-5 text-[#B85D3B]" />;
    }
  };

  return (
    <div className="absolute top-18 left-1/2 -translate-x-1/2 z-25 max-w-lg w-[calc(100%-2rem)] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="bg-[#FDFCF7]/95 backdrop-blur-md border-2 border-[#B85D3B]/40 rounded-2xl shadow-xl p-3.5 sm:p-4 text-stone-800 space-y-3">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#B85D3B]/10 flex items-center justify-center shrink-0">
              {getIcon()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.2 rounded-full bg-[#B85D3B]/15 text-[#B85D3B] text-[10px] font-mono uppercase font-bold tracking-wider">
                <Sparkles className="w-3 h-3 text-[#B85D3B]" />
                <span>GỢI Ý THÍCH ỨNG NGỮ CẢNH</span>
              </div>
              <h4 className="font-serif text-sm font-bold text-[#1C382B] mt-0.5">
                {suggestion.title}
              </h4>
            </div>
          </div>

          <button
            onClick={dismissSuggestion}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-full transition cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Suggestion Description */}
        <p className="text-xs text-stone-700 leading-relaxed font-normal pl-0.5">
          {suggestion.message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-200/70">
          <button
            onClick={dismissSuggestion}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
          >
            Giữ nguyên lộ trình
          </button>

          <button
            onClick={applySuggestion}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A04D2D] text-white shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Áp dụng thay đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
