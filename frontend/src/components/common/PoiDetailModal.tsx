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
  Share2,
  Building
} from 'lucide-react';
import { POI } from '../../types';

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
  heritage: { label: 'Di tích / Lịch sử', icon: '🏛️', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
  beach: { label: 'Cảnh quan sông / hồ', icon: '🏖️', badge: 'bg-sky-100 text-sky-900 border-sky-300' },
  nature: { label: 'Thiên nhiên & Sinh thái', icon: '⛰️', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  bridge: { label: 'Cầu & Biểu tượng', icon: '🌉', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  museum: { label: 'Bảo tàng & Văn hóa', icon: '🎨', badge: 'bg-purple-100 text-purple-900 border-purple-300' },
  entertainment: { label: 'Giải trí & Làng nghề', icon: '🎡', badge: 'bg-pink-100 text-pink-900 border-pink-300' },
  culinary: { label: 'Ẩm thực & Chợ đêm', icon: '🍜', badge: 'bg-orange-100 text-orange-900 border-orange-300' },
  shopping: { label: 'Mua sắm & TTTM', icon: '🛍️', badge: 'bg-rose-100 text-rose-900 border-rose-300' }
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
        { scale: 0.92, autoAlpha: 0, y: 20 },
        { scale: 1, autoAlpha: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }
      );
    }
  }, { scope: overlayRef, dependencies: [isOpen, poi?.id] });

  if (!isOpen || !poi) return null;

  const catMeta = CATEGORY_META[poi.category] || { 
    label: poi.category, 
    icon: '📍', 
    badge: 'bg-stone-100 text-stone-800 border-stone-300' 
  };

  const handleShare = () => {
    const text = `Khám phá địa điểm: ${poi.name}\n📍 Tọa độ: ${poi.lat}, ${poi.lon}\n${poi.description || ''}`;
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

  const defaultImage = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80";
  const displayImage = imgError || !poi.image_url ? defaultImage : poi.image_url;

  const venueLabel = poi.venue_type === 'indoor'
    ? '🏢 Trong nhà'
    : poi.venue_type === 'semi-indoor'
    ? '🏛️ Bán lộ thiên'
    : '🌳 Ngoài trời';

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div 
        ref={modalBoxRef}
        className="bg-[#FDFCF7] border border-stone-200 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[#1F2421] animate-in zoom-in-95 duration-200"
      >
        {/* 1. Hero Image Cover */}
        <div className="relative h-56 w-full overflow-hidden bg-stone-200 shrink-0">
          <img 
            src={displayImage}
            alt={poi.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top Floating Controls */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs px-3 py-1 rounded-full border backdrop-blur-md font-semibold flex items-center gap-1.5 shadow-md ${catMeta.badge}`}>
                <span>{catMeta.icon}</span>
                <span>{catMeta.label}</span>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full border backdrop-blur-md font-semibold bg-white/90 text-stone-800 border-white/40 shadow-xs">
                {venueLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShare}
                title="Sao chép thông tin"
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                title="Đóng"
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-3.5 left-4 right-4 z-10">
            <h2 className="font-serif text-lg font-bold text-white leading-tight drop-shadow-md">
              {poi.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-200 mt-1 font-mono">
              <MapPin className="w-3.5 h-3.5 text-[#B85D3B] shrink-0" />
              <span>{poi.lat.toFixed(4)}, {poi.lon.toFixed(4)} &bull; Hà Nội</span>
            </div>
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
          {/* Key Attributes Strip */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#FAF7F0] p-2.5 rounded-2xl border border-stone-200/80">
              <div className="text-[10px] text-stone-500 flex items-center justify-center gap-1 mb-0.5 font-semibold">
                <Ticket className="w-3 h-3 text-[#B85D3B]" /> 
                <span>Giá vé</span>
              </div>
              <div className="font-bold text-[#B85D3B] font-mono text-xs">
                {poi.ticket_price === 0 ? 'MIỄN PHÍ' : `${poi.ticket_price.toLocaleString('vi-VN')} đ`}
              </div>
            </div>

            <div className="bg-[#FAF7F0] p-2.5 rounded-2xl border border-stone-200/80">
              <div className="text-[10px] text-stone-500 flex items-center justify-center gap-1 mb-0.5 font-semibold">
                <Clock className="w-3 h-3 text-[#1C382B]" /> 
                <span>Thời gian</span>
              </div>
              <div className="font-bold text-[#1C382B] font-mono text-xs">
                ~{poi.estimated_duration_min} phút
              </div>
            </div>

            <div className="bg-[#FAF7F0] p-2.5 rounded-2xl border border-stone-200/80">
              <div className="text-[10px] text-stone-500 flex items-center justify-center gap-1 mb-0.5 font-semibold">
                <Calendar className="w-3 h-3 text-amber-700" /> 
                <span>Mở cửa</span>
              </div>
              <div className="font-bold text-stone-800 text-[11px] truncate">
                {poi.opening_hours || 'Cả ngày'}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1.5 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-[#1C382B] uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#B85D3B]" /> 
              <span>Giới thiệu & Lịch sử</span>
            </span>
            <p className="text-stone-700 leading-relaxed text-xs">
              {poi.description || 'Địa danh du lịch và văn hóa tiêu biểu của Thủ đô Hà Nội.'}
            </p>
          </div>

          {/* Tips & Recommendations */}
          {poi.tips && (
            <div className="space-y-1.5 bg-[#FAF7F0] p-4 rounded-2xl border border-[#B85D3B]/30 shadow-2xs">
              <span className="text-[11px] font-bold text-[#B85D3B] uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> 
                <span>Mẹo & Kinh nghiệm tham quan</span>
              </span>
              <p className="text-stone-700 leading-relaxed text-xs italic">
                "{poi.tips}"
              </p>
            </div>
          )}
        </div>

        {/* 3. Footer Action Buttons */}
        <div className="p-4 border-t border-stone-200/80 bg-[#FAF7F0] shrink-0 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onTogglePoi(poi.id)}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98] cursor-pointer ${
              isSelected
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-[#1C382B] hover:bg-[#B85D3B] text-white shadow-[#1C382B]/10'
            }`}
          >
            {isSelected ? (
              <>
                <X className="w-4 h-4 text-rose-600" />
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
              type="button"
              onClick={handleFly}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 transition border border-stone-200/90 active:scale-[0.98] cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-[#B85D3B]" />
              <span>Xem trên bản đồ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
