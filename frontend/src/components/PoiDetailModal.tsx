import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  X, 
  Clock, 
  MapPin, 
  Tag, 
  Lightbulb, 
  Navigation, 
  Check, 
  Plus, 
  Ticket,
  Calendar,
  Share2
} from 'lucide-react';
import { POI } from '../types';

gsap.registerPlugin(useGSAP);

interface PoiDetailModalProps {
  poi: POI | null;
  isOpen: boolean;
  onClose: () => void;
  onTogglePoi: (id: number) => void;
  isSelected: boolean;
  onFlyToPoi?: (lat: number, lon: number) => void;
}

const CATEGORY_META: Record<string, { label: string; icon: string; badge: string }> = {
  heritage: { label: 'Di tích / Lịch sử', icon: '🏛️', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  beach: { label: 'Cảnh quan sông / hồ', icon: '🏖️', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  nature: { label: 'Thiên nhiên & Sinh thái', icon: '⛰️', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  bridge: { label: 'Cầu & Biểu tượng', icon: '🌉', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  museum: { label: 'Bảo tàng & Văn hóa', icon: '🎨', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  entertainment: { label: 'Giải trí & Làng nghề', icon: '🎡', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  culinary: { label: 'Ẩm thực & Chợ đêm', icon: '🍜', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40' }
};

export const PoiDetailModal: React.FC<PoiDetailModalProps> = ({
  poi,
  isOpen,
  onClose,
  onTogglePoi,
  isSelected,
  onFlyToPoi
}) => {
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // GSAP: Elastic spring popup entrance
  useGSAP(() => {
    if (isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.9, autoAlpha: 0, y: 25 },
        { scale: 1, autoAlpha: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }
      );
    }
  }, { scope: overlayRef, dependencies: [isOpen, poi?.id] });

  if (!isOpen || !poi) return null;

  const catMeta = CATEGORY_META[poi.category] || { 
    label: poi.category, 
    icon: '📍', 
    badge: 'bg-slate-800 text-slate-300 border-slate-700' 
  };

  const handleShare = () => {
    const text = `Khám phá địa điểm: ${poi.name}\n📍 Tọa độ: ${poi.lat}, ${poi.lon}\n${poi.description}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFly = () => {
    if (onFlyToPoi) {
      onFlyToPoi(poi.lat, poi.lon);
      onClose();
    }
  };

  // Fallback gradient if image fails to load
  const defaultImage = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80";
  const displayImage = imgError || !poi.image_url ? defaultImage : poi.image_url;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div 
        ref={modalBoxRef}
        className="glass-panel border border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* 1. Hero Image Cover */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-900 shrink-0">
          <img 
            src={displayImage}
            alt={poi.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Floating Controls */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
            <span className={`text-xs px-3 py-1 rounded-full border backdrop-blur-md font-semibold flex items-center gap-1.5 shadow-md ${catMeta.badge}`}>
              <span>{catMeta.icon}</span>
              <span>{catMeta.label}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                title="Sao chép thông tin"
                className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-slate-300 hover:text-white backdrop-blur-md border border-white/10 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-slate-300 hover:text-white backdrop-blur-md border border-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Overlay Title on Image */}
          <div className="absolute bottom-3.5 left-4 right-4 z-10">
            <h2 className="text-lg font-extrabold text-white leading-tight drop-shadow-md">
              {poi.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{poi.lat.toFixed(4)}, {poi.lon.toFixed(4)} &bull; Hà Nội</span>
            </div>
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs scrollbar-thin">
          {/* Key Attributes Pills */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/70 p-2.5 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-0.5">
                <Ticket className="w-3 h-3 text-emerald-400" /> Giá vé
              </div>
              <div className="font-bold text-emerald-400 font-mono text-xs">
                {poi.ticket_price === 0 ? 'MIỄN PHÍ' : `${poi.ticket_price.toLocaleString()} đ`}
              </div>
            </div>

            <div className="bg-slate-900/70 p-2.5 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-0.5">
                <Clock className="w-3 h-3 text-indigo-400" /> Thời gian
              </div>
              <div className="font-bold text-indigo-300 font-mono text-xs">
                ~{poi.estimated_duration_min} phút
              </div>
            </div>

            <div className="bg-slate-900/70 p-2.5 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-amber-400" /> Mở cửa
              </div>
              <div className="font-bold text-amber-300 text-[11px] truncate">
                {poi.opening_hours || 'Cả ngày'}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1.5 bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" /> Giới thiệu & Lịch sử
            </span>
            <p className="text-slate-300 leading-relaxed text-xs">
              {poi.description || 'Địa danh du lịch và văn hóa tiêu biểu của Thủ đô Hà Nội.'}
            </p>
          </div>

          {/* Tips & Recommendations */}
          {poi.tips && (
            <div className="space-y-1.5 bg-indigo-950/30 p-3.5 rounded-2xl border border-indigo-500/30">
              <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Mẹo & Kinh nghiệm tham quan
              </span>
              <p className="text-slate-300 leading-relaxed text-xs">
                {poi.tips}
              </p>
            </div>
          )}
        </div>

        {/* 3. Footer Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0 flex items-center gap-2.5">
          <button
            onClick={() => onTogglePoi(poi.id)}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
              isSelected
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isSelected ? (
              <>
                <X className="w-4 h-4 text-rose-400" />
                <span>Bỏ khỏi Lịch trình</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-white" />
                <span>Thêm vào Lịch trình</span>
              </>
            )}
          </button>

          {onFlyToPoi && (
            <button
              onClick={handleFly}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700/80 active:scale-[0.98]"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Xem trên bản đồ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
