import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  X, 
  MapPin, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Tag, 
  Info, 
  Navigation, 
  Check,
  Compass,
  Building
} from 'lucide-react';
import { POI } from '../../types';

gsap.registerPlugin(useGSAP);

interface AddPoiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPoi: POI) => void;
  pickedCoords: { lat: number; lon: number } | null;
  onStartPickOnMap: () => void;
}

const CATEGORIES = [
  { id: 'heritage', label: 'Di tích / Lịch sử', icon: '🏛️' },
  { id: 'beach', label: 'Cảnh quan sông / hồ', icon: '🏖️' },
  { id: 'nature', label: 'Thiên nhiên & Sinh thái', icon: '⛰️' },
  { id: 'bridge', label: 'Cầu & Biểu tượng', icon: '🌉' },
  { id: 'museum', label: 'Bảo tàng & Văn hóa', icon: '🎨' },
  { id: 'entertainment', label: 'Khu vui chơi / Giải trí', icon: '🎡' },
  { id: 'culinary', label: 'Ẩm thực & Chợ đêm', icon: '🍜' },
  { id: 'shopping', label: 'Mua sắm & TTTM', icon: '🛍️' }
];

const VENUE_TYPES = [
  { id: 'outdoor', label: '🌳 Ngoài trời' },
  { id: 'semi-indoor', label: '🏛️ Bán lộ thiên' },
  { id: 'indoor', label: '🏢 Trong nhà' }
];

export const AddPoiModal: React.FC<AddPoiModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  pickedCoords,
  onStartPickOnMap
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('heritage');
  const [venueType, setVenueType] = useState<'indoor' | 'outdoor' | 'semi-indoor'>('outdoor');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<string>('21.0287');
  const [lon, setLon] = useState<string>('105.8523');
  const [duration, setDuration] = useState<number>(90);
  const [ticketPrice, setTicketPrice] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const modalOverlayRef = useRef<HTMLDivElement>(null);
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
  }, { scope: modalOverlayRef, dependencies: [isOpen] });

  // Đồng bộ tọa độ khi người dùng nhấp trên bản đồ
  useEffect(() => {
    if (pickedCoords) {
      setLat(pickedCoords.lat.toFixed(6));
      setLon(pickedCoords.lon.toFixed(6));
    }
  }, [pickedCoords]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên địa điểm du lịch!');
      return;
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      alert('Vui lòng nhập tọa độ hợp lệ!');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      category,
      venue_type: venueType,
      description: description.trim(),
      lat: latNum,
      lon: lonNum,
      estimated_duration_min: Number(duration) || 90,
      opening_hours: '07:30 - 21:00',
      ticket_price: Number(ticketPrice) || 0
    };

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${apiBaseUrl}/pois`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data: POI = await res.json();
        onSuccess(data);
        onClose();
        setName('');
        setDescription('');
      } else {
        // Fallback lưu local nếu backend trả về lỗi
        const localId = Date.now();
        const fallbackPoi: POI = {
          id: localId,
          ...payload
        };
        onSuccess(fallbackPoi);
        onClose();
      }
    } catch {
      // Fallback lưu local nếu backend offline
      const localId = Date.now();
      const fallbackPoi: POI = {
        id: localId,
        ...payload
      };
      onSuccess(fallbackPoi);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      ref={modalOverlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === modalOverlayRef.current) onClose();
      }}
    >
      <div 
        ref={modalBoxRef}
        className="bg-[#FDFCF7] border border-stone-200 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl text-[#1F2421] animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#FAF7F0] border-b border-stone-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B85D3B]/10 text-[#B85D3B] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#B85D3B]" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#1C382B]">
                Đóng Góp Điểm Du Lịch Mới
              </h2>
              <p className="text-[11px] text-stone-500 font-sans">
                Thêm điểm đến vào bản đồ du lịch Hà Nội
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-800 transition cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans overflow-y-auto flex-1">
          {/* Tên địa điểm */}
          <div className="space-y-1.5">
            <label className="font-semibold text-xs text-[#1C382B] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#B85D3B]" /> 
              <span>Tên Địa Điểm Tham Quan *</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Chùa Một Cột, Làng cổ Đường Lâm, Hồ Trúc Bạch..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-[#1C382B] placeholder-stone-400 focus:outline-none focus:border-[#B85D3B] focus:ring-2 focus:ring-[#B85D3B]/10 transition shadow-2xs"
            />
          </div>

          {/* Phân loại & Không gian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-[#1C382B]">Thể loại</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-[#1C382B] outline-none cursor-pointer focus:border-[#B85D3B] focus:ring-2 focus:ring-[#B85D3B]/10 transition shadow-2xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-[#1C382B] flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-stone-400" />
                <span>Loại không gian</span>
              </label>
              <select
                value={venueType}
                onChange={(e) => setVenueType(e.target.value as any)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-[#1C382B] outline-none cursor-pointer focus:border-[#B85D3B] focus:ring-2 focus:ring-[#B85D3B]/10 transition shadow-2xs"
              >
                {VENUE_TYPES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Thời lượng dự kiến */}
          <div className="space-y-1.5">
            <label className="font-semibold text-xs text-[#1C382B] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#B85D3B]" /> 
              <span>Dự kiến tham quan (phút)</span>
            </label>
            <input
              type="number"
              min="15"
              max="480"
              step="15"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-[#1C382B] outline-none font-mono focus:border-[#B85D3B] focus:ring-2 focus:ring-[#B85D3B]/10 transition shadow-2xs"
            />
          </div>

          {/* Tọa độ Không gian WGS84 */}
          <div className="space-y-2.5 bg-[#FAF7F0] p-4 rounded-2xl border border-stone-200/80">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-xs text-[#1C382B] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B85D3B]" /> 
                <span>Tọa độ vị trí *</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartPickOnMap();
                }}
                className="text-xs text-[#B85D3B] hover:text-[#9C4B2E] font-semibold flex items-center gap-1.5 transition bg-white px-3 py-1.5 rounded-xl border border-stone-200/90 shadow-2xs hover:border-[#B85D3B]/40 cursor-pointer"
              >
                <Navigation className="w-3 h-3 text-[#B85D3B]" /> 
                <span>Chọn trên bản đồ</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-stone-500 block mb-1 font-mono">Vĩ độ (Latitude)</span>
                <input
                  type="text"
                  required
                  placeholder="21.0287"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-[#1C382B] font-mono outline-none focus:border-[#B85D3B]"
                />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block mb-1 font-mono">Kinh độ (Longitude)</span>
                <input
                  type="text"
                  required
                  placeholder="105.8523"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-[#1C382B] font-mono outline-none focus:border-[#B85D3B]"
                />
              </div>
            </div>
          </div>

          {/* Giá vé tham quan */}
          <div className="space-y-1.5">
            <label className="font-semibold text-xs text-[#1C382B] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#B85D3B]" /> 
              <span>Giá vé tham quan (VND, 0 = Miễn phí)</span>
            </label>
            <input
              type="number"
              min="0"
              step="10000"
              placeholder="0"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(Number(e.target.value))}
              className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-[#1C382B] font-mono outline-none focus:border-[#B85D3B] focus:ring-2 focus:ring-[#B85D3B]/10 transition shadow-2xs"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <label className="font-semibold text-xs text-[#1C382B] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-stone-400" /> 
              <span>Mô tả ngắn gọn về trải nghiệm</span>
            </label>
            <textarea
              rows={2}
              placeholder="Đặc điểm cảnh quan, ẩm thực, góc chụp ảnh đẹp..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-[#1C382B] placeholder-stone-400 focus:outline-none focus:border-[#B85D3B] focus:ring-2 focus:ring-[#B85D3B]/10 transition shadow-2xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200/80 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition font-medium text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1C382B] hover:bg-[#B85D3B] active:scale-98 text-[#F8F5EE] px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-[#1C382B]/10 flex items-center gap-2 transition cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu địa điểm</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
