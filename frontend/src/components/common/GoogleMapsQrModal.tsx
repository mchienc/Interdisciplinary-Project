import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ExternalLink, Copy, Check, Navigation, Smartphone, Sparkles, MapPin } from 'lucide-react';
import { PlanResponse, POI } from '../../types';

interface GoogleMapsQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanResponse | null;
  pois?: POI[];
}

export const GoogleMapsQrModal: React.FC<GoogleMapsQrModalProps> = ({
  isOpen,
  onClose,
  plan
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Sinh URL Google Maps Directions theo chuẩn Google Maps API URL scheme
  const currentMapsUrl = useMemo(() => {
    if (!plan || !plan.daily_itineraries || plan.daily_itineraries.length === 0) {
      return 'https://maps.google.com';
    }

    const currentDayItin = plan.daily_itineraries.find(d => d.day === selectedDay) || plan.daily_itineraries[0];
    const hotel = plan.selected_hotel;

    const origin = `${hotel.lat},${hotel.lon}`;
    const destination = `${hotel.lat},${hotel.lon}`; // Vòng kín về lại khách sạn

    // Các điểm dừng trung gian (Waypoints)
    const waypoints = currentDayItin.visit_sequence
      .map(p => `${p.lat},${p.lon}`)
      .join('|');

    // Chế độ di chuyển cho Google Maps
    let travelMode = 'driving';
    if (plan.transport_mode === 'walking') travelMode = 'walking';
    if (plan.transport_mode === 'bike') travelMode = 'two_wheeler';

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${encodeURIComponent(waypoints)}`;
    }
    url += `&travelmode=${travelMode}`;

    return url;
  }, [plan, selectedDay]);

  if (!isOpen || !plan) return null;

  const currentDayItin = plan.daily_itineraries.find(d => d.day === selectedDay) || plan.daily_itineraries[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMapsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#FDFCF7] border border-stone-200 rounded-[2rem] w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-[#1F2421]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#B85D3B]/10 text-[#B85D3B] flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C382B]">
                Đồng Bộ Sang Google Maps
              </h3>
              <p className="text-[11px] text-stone-500 font-sans">
                Quét bằng camera điện thoại để dẫn đường tức thì
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Day Selector Tabs */}
        {plan.daily_itineraries.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-2xl">
            {plan.daily_itineraries.map((d) => (
              <button
                key={d.day}
                onClick={() => setSelectedDay(d.day)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedDay === d.day
                    ? 'bg-[#1C382B] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Ngày {d.day}
              </button>
            ))}
          </div>
        )}

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-white border border-stone-200/80 rounded-2xl shadow-xs space-y-3">
          <div className="p-3 bg-white rounded-xl shadow-2xs border border-stone-100">
            <QRCodeSVG 
              value={currentMapsUrl} 
              size={180}
              level="M"
              fgColor="#1C382B"
              bgColor="#ffffff"
            />
          </div>
          <div className="text-center space-y-0.5">
            <div className="text-xs font-bold text-[#1C382B]">
              Lộ trình Ngày {selectedDay} ({currentDayItin?.visit_sequence.length || 0} chặng dừng)
            </div>
            <div className="text-[11px] text-stone-500">
              Xuất phát từ {plan.selected_hotel.name}
            </div>
          </div>
        </div>

        {/* Route Preview Strip */}
        <div className="space-y-1.5 p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#B85D3B]" />
            Thứ tự các chặng dẫn đường:
          </div>
          <div className="text-[11px] text-stone-700 font-medium truncate">
            {plan.selected_hotel.name} &rarr; {currentDayItin?.visit_sequence.map(p => p.name).join(' &rarr; ')} &rarr; Khách sạn
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleCopy}
            className="py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã chép link!' : 'Sao chép link'}</span>
          </button>

          <a
            href={currentMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 rounded-xl bg-[#1C382B] hover:bg-[#B85D3B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
};
