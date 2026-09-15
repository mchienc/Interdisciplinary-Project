import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { X, MapPin, Sparkles, Clock, DollarSign, Tag, Info, Navigation, Check } from 'lucide-react';
import { POI } from '../types';

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
  { id: 'beach', label: 'Biển & Bãi tắm', icon: '🏖️' },
  { id: 'nature', label: 'Thiên nhiên & Sinh thái', icon: '⛰️' },
  { id: 'bridge', label: 'Cầu & Biểu tượng', icon: '🌉' },
  { id: 'museum', label: 'Bảo tàng & Văn hóa', icon: '🎨' },
  { id: 'entertainment', label: 'Khu vui chơi / Giải trí', icon: '🎡' },
  { id: 'culinary', label: 'Ẩm thực & Chợ đêm', icon: '🍜' }
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
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<string>('21.0287');
  const [lon, setLon] = useState<string>('105.8523');
  const [duration, setDuration] = useState<number>(90);
  const [ticketPrice, setTicketPrice] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const modalOverlayRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // GSAP: Spring popup entrance
  useGSAP(() => {
    if (isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.88, autoAlpha: 0, y: 30 },
        { scale: 1, autoAlpha: 1, y: 0, duration: 0.45, ease: 'back.out(1.5)' }
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
      description: description.trim(),
      lat: latNum,
      lon: lonNum,
      estimated_duration_min: Number(duration) || 90,
      opening_hours: '07:30 - 21:00',
      ticket_price: Number(ticketPrice) || 0
    };

    try {
      const res = await fetch('http://localhost:8000/api/v1/pois', {
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
        alert('Có lỗi xảy ra khi lưu địa điểm. Vui lòng kiểm tra lại backend.');
      }
    } catch (err) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div 
        ref={modalBoxRef}
        className="glass-panel border border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl glow-border-indigo"
      >
        {/* Modal Header */}
        <div className="h-16 bg-slate-900/90 px-6 flex items-center justify-between border-b border-slate-800/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">Đóng Góp Điểm Du Lịch Mới</h2>
              <p className="text-[10px] text-slate-400">Tích hợp vào CSDL không gian GIS và mạng lưới tuyến đường</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Tên địa điểm */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" /> Tên Địa Điểm Tham Quan *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Chùa Một Cột, Làng cổ Đường Lâm, Hồ Trúc Bạch..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Phân loại & Thời lượng */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Thể loại</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Dự kiến tham quan (phút)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                step="15"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full glass-input rounded-xl px-3 py-2 text-white outline-none font-mono"
              />
            </div>
          </div>

          {/* Tọa độ Không gian WGS84 */}
          <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Tọa Độ Địa Lý (EPSG:4326) *
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartPickOnMap();
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
              >
                <Navigation className="w-3 h-3 text-cyan-400" /> Chọn trên bản đồ
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">Vĩ độ (Latitude)</span>
                <input
                  type="text"
                  required
                  placeholder="21.0287"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-1.5 text-white font-mono text-xs outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">Kinh độ (Longitude)</span>
                <input
                  type="text"
                  required
                  placeholder="105.8523"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-1.5 text-white font-mono text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Giá vé tham quan */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> Giá vé tham quan (VND, 0 = Miễn phí)
            </label>
            <input
              type="number"
              min="0"
              step="10000"
              placeholder="0"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(Number(e.target.value))}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-white font-mono outline-none"
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" /> Mô tả ngắn gọn về trải nghiệm
            </label>
            <textarea
              rows={2}
              placeholder="Đặc điểm cảnh quan, ẩm thực, góc chụp ảnh đẹp..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input rounded-xl p-3 text-white placeholder-slate-500 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 active:scale-98 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu & Tích Hợp Vào CSDL</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

