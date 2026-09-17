import React, { useState, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  MapPin, 
  Hotel, 
  Calendar, 
  Navigation, 
  Compass, 
  Sparkles, 
  Clock, 
  Star, 
  PlusCircle, 
  Search, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Eye,
  FileSpreadsheet,
  RotateCcw,
  Check,
  Building2,
  DollarSign
} from 'lucide-react';
import { POI, Accommodation, PlanResponse, WeightsConfig } from '../../types';
import { DAY_COLORS } from '../../constants/map';
import { CATEGORY_META } from '../../constants/categories';
import { exportItineraryToExcel } from '../../utils/excelExport';

gsap.registerPlugin(useGSAP);

interface SidebarProps {
  pois: POI[];
  selectedPoiIds: number[];
  onTogglePoi: (poiId: number) => void;
  onSelectAllPois: () => void;
  onClearPois: () => void;
  onSelectPopularPois: () => void;
  onOpenAddPoiModal: () => void;
  onOpenPoiDetail: (poi: POI) => void;
  days: number;
  onChangeDays: (d: number) => void;
  transportMode?: 'walking' | 'bike' | 'driving';
  onChangeTransportMode?: (mode: 'walking' | 'bike' | 'driving') => void;
  maxBudget: number | undefined;
  onChangeMaxBudget: (b: number | undefined) => void;
  minStars: number | undefined;
  onChangeMinStars: (s: number | undefined) => void;
  radiusMeters: number;
  onChangeRadiusMeters: (r: number) => void;
  onRunOptimization: () => void;
  loading: boolean;
  plan: PlanResponse | null;
  selectedHotelId: number | null;
  onSelectHotel: (hotelId: number) => void;
  hoveredHotelId?: number | null;
  onHoverHotel?: (id: number | null) => void;
  activeDayTab: number | null;
  setActiveDayTab: (day: number | null) => void;
  weights?: WeightsConfig;
  onChangeWeights?: (w: WeightsConfig) => void;
  onOpenQrModal?: () => void;
  onOpenStoryModal?: () => void;
}

// CATEGORY_META imported from constants/categories

// DAY_COLORS imported from constants/map

export const Sidebar: React.FC<SidebarProps> = ({
  pois,
  selectedPoiIds,
  onTogglePoi,
  onSelectAllPois,
  onClearPois,
  onSelectPopularPois,
  onOpenAddPoiModal,
  onOpenPoiDetail,
  days,
  onChangeDays,
  transportMode = 'driving',
  onChangeTransportMode,
  maxBudget,
  onChangeMaxBudget,
  minStars,
  onChangeMinStars,
  radiusMeters,
  onChangeRadiusMeters,
  onRunOptimization,
  loading,
  plan,
  selectedHotelId,
  onSelectHotel,
  onHoverHotel,
  activeDayTab,
  setActiveDayTab,
  weights,
  onChangeWeights,
  onOpenQrModal,
  onOpenStoryModal
}) => {
  // State quản lý tab hiển thị: 'setup' (Cài đặt & chọn điểm) vs 'itinerary' (Lộ trình chi tiết)
  const [sidebarTab, setSidebarTab] = useState<'setup' | 'itinerary'>('setup');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHotelPicker, setShowHotelPicker] = useState(false);

  // Module 4: State chia tiền nhóm (1, 2, 4 người)
  const [splitPeople, setSplitPeople] = useState<number>(1);

  // Module 4: Tính toán dự toán chi phí thông minh
  const budgetBreakdown = useMemo(() => {
    if (!plan) return null;
    const nights = Math.max(1, days - 1);
    const hotelCost = plan.selected_hotel ? plan.selected_hotel.price_per_night * nights : 0;
    
    let ticketCost = 0;
    plan.daily_itineraries?.forEach(d => {
      d.visit_sequence?.forEach(p => {
        ticketCost += (p.ticket_price || 0);
      });
    });

    const dist = plan.total_trip_distance_km || 0;
    let transportCost = 0;
    const mode = plan.transport_mode || transportMode || 'driving';
    if (mode === 'bike') {
      transportCost = Math.round(10000 + dist * 5000);
    } else if (mode === 'driving') {
      transportCost = Math.round(12000 + dist * 11000);
    } else {
      transportCost = 0; // Đi bộ
    }

    const totalCost = hotelCost + ticketCost + transportCost;
    const costPerPerson = Math.round(totalCost / splitPeople);

    return {
      hotelCost,
      ticketCost,
      transportCost,
      totalCost,
      costPerPerson,
      nights,
      mode
    };
  }, [plan, days, splitPeople, transportMode]);

  // Module 3: Cảnh báo giờ mở cửa & ngày đóng cửa thông minh
  const smartWarnings = useMemo(() => {
    const warnings: string[] = [];
    const selectedObjects = pois.filter(p => selectedPoiIds.includes(p.id));
    
    const langBac = selectedObjects.find(p => p.name.includes('Lăng') || (p.closed_days && p.closed_days.length > 0));
    if (langBac) {
      warnings.push('Lăng Bác đóng cửa viếng vào Thứ Hai & Thứ Sáu hàng tuần. Hãy lưu ý chọn ngày khởi hành phù hợp!');
    }

    const museums = selectedObjects.filter(p => p.closed_time === '17:00' || p.category === 'museum');
    if (museums.length > 0) {
      const names = museums.map(m => m.name).join(', ');
      warnings.push(`${names} thường đóng cửa sau 17:00 chiều.`);
    }

    return warnings;
  }, [pois, selectedPoiIds]);

  // Tự động chuyển sang tab 'itinerary' khi vừa tính toán xong plan mới
  React.useEffect(() => {
    if (plan) {
      setSidebarTab('itinerary');
    }
  }, [plan]);

  // Lọc danh sách POIs theo từ khóa và danh mục
  const filteredPois = useMemo(() => {
    return pois.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [pois, searchQuery, selectedCategory]);

  // GSAP micro-interaction khi chọn POI
  const handleCardClick = (poiId: number, e: React.MouseEvent<HTMLDivElement>) => {
    gsap.fromTo(e.currentTarget, 
      { x: 0 }, 
      { x: 4, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' }
    );
    onTogglePoi(poiId);
  };

  return (
    <aside className="w-full h-full bg-[#FDFCF7] border-r border-stone-200/90 text-[#1F2421] flex flex-col justify-between shadow-xl overflow-hidden select-none">
      
      {/* ========================================================
          SIDEBAR HEADER & MODE SWITCHER
          ======================================================== */}
      <div className="p-4 sm:p-5 border-b border-stone-200/80 bg-white/60">
        {plan ? (
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl gap-1">
            <button
              onClick={() => setSidebarTab('itinerary')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                sidebarTab === 'itinerary' 
                  ? 'bg-white text-[#1C382B] shadow-xs' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#B85D3B]" />
              <span>Lộ Trình Du Lịch</span>
            </button>
            <button
              onClick={() => setSidebarTab('setup')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                sidebarTab === 'setup' 
                  ? 'bg-white text-[#1C382B] shadow-xs' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-stone-500" />
              <span>Điểm Đến &amp; Gu</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B85D3B]/10 text-[#B85D3B] text-[10px] font-mono uppercase font-semibold">
                <span>HANOI TRAVEL ASSISTANT</span>
              </div>
              <h2 className="font-serif text-lg text-[#1C382B] font-bold mt-1">
                Lập Kế Hoạch Thong Dong
              </h2>
            </div>
            <button
              onClick={onOpenAddPoiModal}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#1C382B] hover:text-white text-stone-700 text-xs font-semibold border border-stone-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#B85D3B]" />
              <span>Thêm điểm</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          SIDEBAR SCROLLABLE CONTENT BODY
          ======================================================== */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-6">
        
        {/* ========================================================
            TAB 1: SETUP MODE (3 Bước Thảnh Thơi)
            ======================================================== */}
        {sidebarTab === 'setup' && (
          <>
            {/* ----------------------------------------------------
                BƯỚC 1: THỜI GIAN & PHONG CÁCH
                ---------------------------------------------------- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1C382B] text-white text-xs font-serif font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-serif text-sm font-bold text-[#1C382B]">
                  Thời gian &amp; Phong cách lưu trú
                </h3>
              </div>

              {/* Số ngày: Smooth Rounded Pills */}
              <div className="space-y-1.5">
                <label className="text-xs text-stone-500 font-medium">Thời lượng chuyến đi:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(d => (
                    <button
                      key={d}
                      onClick={() => onChangeDays(d)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        days === d
                          ? 'bg-[#1C382B] text-white shadow-xs'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      <Calendar className="w-3 h-3 opacity-70" />
                      <span>{d} Ngày</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Module 5: Phương tiện di chuyển: 🚶 Đi bộ | 🛵 Xe máy | 🚗 Ô tô */}
              {onChangeTransportMode && (
                <div className="space-y-1.5">
                  <label className="text-xs text-stone-500 font-medium">Phương tiện di chuyển chính:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'walking', label: 'Đi bộ', icon: '🚶', speed: '5 km/h' },
                      { id: 'bike', label: 'Xe máy', icon: '🛵', speed: '28 km/h' },
                      { id: 'driving', label: 'Ô tô', icon: '🚗', speed: '35 km/h' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onChangeTransportMode(m.id as any)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          transportMode === m.id
                            ? 'bg-[#1C382B] text-white shadow-xs'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span>{m.icon}</span>
                          <span>{m.label}</span>
                        </div>
                        <span className={`text-[9px] ${transportMode === m.id ? 'text-stone-300' : 'text-stone-400'}`}>
                          {m.speed}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lựa chọn khách sạn cơ bản */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Hạng sao tối thiểu */}
                <div className="space-y-1.5">
                  <label className="text-xs text-stone-500 font-medium">Tiêu chuẩn chỗ ở:</label>
                  <select
                    value={minStars || ''}
                    onChange={(e) => onChangeMinStars(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#B85D3B] transition"
                  >
                    <option value="">Tất cả hạng sao</option>
                    <option value="3">Từ 3 sao trở lên ⭐⭐⭐</option>
                    <option value="4">Từ 4 sao cao cấp ⭐⭐⭐⭐</option>
                    <option value="5">Khách sạn 5 sao sang trọng ⭐⭐⭐⭐⭐</option>
                  </select>
                </div>

                {/* Ngân sách phòng */}
                <div className="space-y-1.5">
                  <label className="text-xs text-stone-500 font-medium">Ngân sách mỗi đêm:</label>
                  <select
                    value={maxBudget || ''}
                    onChange={(e) => onChangeMaxBudget(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#B85D3B] transition"
                  >
                    <option value="">Không giới hạn</option>
                    <option value="1500000">Dưới 1.5 triệu đ</option>
                    <option value="3000000">Dưới 3.0 triệu đ</option>
                    <option value="5000000">Dưới 5.0 triệu đ</option>
                  </select>
                </div>
              </div>

              {/* Accordion: Tùy chỉnh nâng cao (Dành cho chuyên gia) */}
              <div className="border border-stone-200/80 rounded-2xl bg-white overflow-hidden">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-stone-600 hover:text-[#1C382B] transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sliders className="w-3.5 h-3.5 text-stone-400" />
                    Tùy chỉnh nâng cao (dành cho chuyên gia)
                  </span>
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvanced && (
                  <div className="p-4 border-t border-stone-100 space-y-4 text-xs bg-stone-50/50">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-stone-600">
                        <span>Bán kính quét khách sạn:</span>
                        <b className="text-[#1C382B]">{(radiusMeters / 1000).toFixed(1)} km</b>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="8000"
                        step="500"
                        value={radiusMeters}
                        onChange={(e) => onChangeRadiusMeters(Number(e.target.value))}
                        className="w-full accent-[#B85D3B] cursor-pointer"
                      />
                    </div>

                    {weights && onChangeWeights && (
                      <div className="space-y-2 pt-1 border-t border-stone-200/60">
                        <span className="font-semibold text-stone-700 block">Ưu tiên lựa chọn chỗ ở:</span>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-stone-600">
                            <span>Gần điểm tham quan (Khoảng cách):</span>
                            <b>{Math.round(weights.w_distance * 100)}%</b>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="0.8"
                            step="0.05"
                            value={weights.w_distance}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const rem = (1 - val) / 2;
                              onChangeWeights({ w_distance: val, w_rating: rem, w_price: rem });
                            }}
                            className="w-full accent-[#1C382B] cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-stone-600">
                            <span>Đánh giá sao &amp; dịch vụ:</span>
                            <b>{Math.round(weights.w_rating * 100)}%</b>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="0.8"
                            step="0.05"
                            value={weights.w_rating}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const rem = (1 - val) / 2;
                              onChangeWeights({ w_distance: rem, w_rating: val, w_price: rem });
                            }}
                            className="w-full accent-[#D97706] cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ----------------------------------------------------
                BƯỚC 2: DANH SÁCH ĐIỂM MUỐN ĐI (POI List)
                ---------------------------------------------------- */}
            <div className="space-y-3.5 pt-2 border-t border-stone-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1C382B] text-white text-xs font-serif font-bold flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-[#1C382B]">
                      Chọn điểm đến bạn yêu thích
                    </h3>
                    <div className="text-[11px] text-stone-500">
                      Đã chọn <b className="text-[#B85D3B]">{selectedPoiIds.length}</b> / {pois.length} địa điểm
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    onClick={onSelectPopularPois}
                    className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium cursor-pointer transition"
                  >
                    Gợi ý 6 điểm
                  </button>
                  <button
                    onClick={onClearPois}
                    className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-500 font-medium cursor-pointer transition"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              {/* Module 3: Cảnh báo Giờ mở cửa & Ngày đóng cửa thông minh */}
              {smartWarnings.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-900 space-y-1 animate-in fade-in duration-200">
                  <div className="font-semibold text-[11px] uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <span>💡</span> Gợi ý lịch trình &amp; giờ mở cửa
                  </div>
                  {smartWarnings.map((warning, idx) => (
                    <div key={idx} className="text-[11px] leading-relaxed text-amber-900/90">
                      • {warning}
                    </div>
                  ))}
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên di tích, quán ngon, địa chỉ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#B85D3B] shadow-2xs transition"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#1C382B] text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Tất cả
                </button>
                {Object.entries(CATEGORY_META).map(([cat, meta]: [string, any]) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                      selectedCategory === cat
                        ? 'bg-[#1C382B] text-white font-semibold'
                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                ))}
              </div>

              {/* POI Cards List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredPois.map((poi) => {
                  const isSelected = selectedPoiIds.includes(poi.id);
                  const meta = CATEGORY_META[poi.category] || CATEGORY_META.heritage;

                  return (
                    <div
                      key={poi.id}
                      onClick={(e) => handleCardClick(poi.id, e)}
                      className={`p-2.5 rounded-2xl border transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-[#FDFBF7] border-[#B85D3B]/70 shadow-xs'
                          : 'bg-white border-stone-200/90 hover:border-stone-300 hover:shadow-2xs'
                      }`}
                    >
                      {/* Thumbnail Image (56x56) */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-200/80 bg-stone-100">
                        {poi.image_url ? (
                          <img
                            src={poi.image_url}
                            alt={poi.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            {meta.icon}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-[#1C382B] truncate">
                            {poi.name}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPoiDetail(poi);
                            }}
                            title="Xem chi tiết"
                            className="text-stone-400 hover:text-[#B85D3B] p-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${meta.bg} ${meta.text}`}>
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-stone-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-[#B85D3B]" />
                            <span>~{poi.estimated_duration_min}p</span>
                          </span>
                          <span className="text-[10px] text-stone-500 font-medium">
                            {poi.ticket_price === 0 ? 'Miễn phí' : `${(poi.ticket_price / 1000)}k`}
                          </span>

                          {/* Module 3: Khung giờ vàng lý tưởng */}
                          {poi.ideal_time && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100/80 text-amber-800 border border-amber-200/70 font-medium">
                              {poi.ideal_time === 'morning' ? '🌅 Sáng' : poi.ideal_time === 'afternoon' ? '☀️ Chiều' : '🌙 Tối'}
                            </span>
                          )}

                          {/* Module 3: Giờ đóng cửa nếu có */}
                          {poi.closed_time && (
                            <span className="text-[9px] text-stone-400">
                              Đóng {poi.closed_time}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Circular Checkbox */}
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isSelected 
                          ? 'bg-[#B85D3B] border-[#B85D3B] text-white shadow-xs' 
                          : 'border-stone-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ========================================================
            TAB 2: ITINERARY MODE (Khi đã có kết quả tối ưu)
            ======================================================== */}
        {sidebarTab === 'itinerary' && plan && (
          <div className="space-y-5">
            {/* Quick Trip Metrics Strip */}
            <div className="p-3.5 rounded-2xl bg-stone-100/80 border border-stone-200/80 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Toàn chuyến</div>
                <div className="font-serif text-base font-bold text-[#1C382B] mt-0.5">
                  {plan.total_trip_distance_km} km
                </div>
              </div>
              <div className="border-x border-stone-200">
                <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Ngồi xe</div>
                <div className="font-serif text-base font-bold text-[#1C382B] mt-0.5">
                  ~{Math.round(plan.total_trip_duration_min)} p
                </div>
              </div>
              <div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Điểm đến</div>
                <div className="font-serif text-base font-bold text-[#B85D3B] mt-0.5">
                  {plan.total_pois} chặng
                </div>
              </div>
            </div>

            {/* Module 4: Reactive Budget Widget & Split Bill */}
            {budgetBreakdown && (
              <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#1C382B] uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#B85D3B]" />
                    Dự toán chi phí &amp; Chia tiền
                  </span>
                  
                  {/* Segmented control chia tiền nhóm */}
                  <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200/70 text-[10px] font-semibold">
                    {[1, 2, 4].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSplitPeople(num)}
                        className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                          splitPeople === num 
                            ? 'bg-[#1C382B] text-white shadow-xs' 
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {num} người
                      </button>
                    ))}
                  </div>
                </div>

                {/* Số tiền trung bình mỗi người */}
                <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider font-medium">
                      Dự tính / {splitPeople === 1 ? 'chuyến đi' : 'mỗi người'}
                    </div>
                    <div className="font-serif text-lg font-bold text-[#B85D3B]">
                      {budgetBreakdown.costPerPerson.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-stone-500">
                    <div>Tổng nhóm ({splitPeople} người):</div>
                    <div className="font-semibold text-stone-800">
                      {budgetBreakdown.totalCost.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </div>

                {/* Chi tiết từng mục */}
                <div className="space-y-1.5 text-xs pt-1 border-t border-stone-100">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <span>🏨</span> Chỗ ở ({budgetBreakdown.nights} đêm):
                    </span>
                    <span className="font-medium text-stone-800">
                      {budgetBreakdown.hotelCost.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <span>🎟️</span> Vé tham quan ({plan.total_pois} điểm):
                    </span>
                    <span className="font-medium text-stone-800">
                      {budgetBreakdown.ticketCost.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <span>{budgetBreakdown.mode === 'walking' ? '🚶' : budgetBreakdown.mode === 'bike' ? '🛵' : '🚗'}</span>
                      <span>
                        {budgetBreakdown.mode === 'walking' ? 'Tản bộ' : budgetBreakdown.mode === 'bike' ? 'GrabBike ước tính' : 'Taxi/GrabCar ước tính'}:
                      </span>
                    </span>
                    <span className="font-medium text-stone-800">
                      {budgetBreakdown.transportCost === 0 ? 'Miễn phí' : `${budgetBreakdown.transportCost.toLocaleString('vi-VN')} đ`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Optimal Hotel Card */}
            <div className="p-4 rounded-2xl bg-white border border-[#B85D3B]/40 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#B85D3B] uppercase tracking-wider flex items-center gap-1.5">
                  <Hotel className="w-3.5 h-3.5" />
                  Điểm lưu trú lý tưởng nhất
                </span>
                <span className="text-xs text-amber-500 font-bold">★ {plan.selected_hotel.rating}</span>
              </div>

              <div>
                <h4 className="font-serif text-base font-bold text-[#1C382B]">
                  {plan.selected_hotel.name}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  {plan.selected_hotel.address || 'Hà Nội'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                <div>
                  <span className="text-stone-500">Giá phòng: </span>
                  <b className="text-[#B85D3B] font-bold">
                    {plan.selected_hotel.price_per_night.toLocaleString('vi-VN')} đ
                  </b>
                  <span className="text-stone-400">/đêm</span>
                </div>
                {plan.selected_hotel.distance_to_median_m && (
                  <span className="text-[11px] text-[#0F766E] font-medium">
                    Cách tâm: {plan.selected_hotel.distance_to_median_m}m
                  </span>
                )}
              </div>

              {/* Đổi khách sạn khác */}
              <button
                onClick={() => setShowHotelPicker(!showHotelPicker)}
                className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{showHotelPicker ? 'Thu gọn danh sách gợi ý' : 'Đổi sang khách sạn khác'}</span>
                {showHotelPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {/* Danh sách các khách sạn ứng viên */}
              {showHotelPicker && plan.recommended_accommodations && (
                <div className="space-y-2 pt-2 border-t border-stone-100 max-h-48 overflow-y-auto">
                  {plan.recommended_accommodations.map((hotel, idx) => (
                    <div
                      key={hotel.id}
                      onClick={() => onSelectHotel(hotel.id)}
                      onMouseEnter={() => onHoverHotel?.(hotel.id)}
                      onMouseLeave={() => onHoverHotel?.(null)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        selectedHotelId === hotel.id
                          ? 'bg-[#1C382B] text-white border-[#1C382B]'
                          : 'bg-stone-50 hover:bg-white border-stone-200 text-stone-800'
                      }`}
                    >
                      <div className="pr-2">
                        <div className="font-semibold">{hotel.name}</div>
                        <div className={`text-[11px] ${selectedHotelId === hotel.id ? 'text-stone-300' : 'text-stone-500'}`}>
                          {hotel.stars}★ • {(hotel.price_per_night / 1000).toLocaleString()}k đ
                        </div>
                      </div>
                      <span className="text-[11px] font-bold">
                        {selectedHotelId === hotel.id ? '✓ Đang chọn' : 'Chọn'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Day Tabs */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveDayTab(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    activeDayTab === null
                      ? 'bg-[#1C382B] text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Tất cả các ngày
                </button>
                {plan.daily_itineraries.map((d, idx) => (
                  <button
                    key={d.day}
                    onClick={() => setActiveDayTab(d.day)}
                    style={{
                      backgroundColor: activeDayTab === d.day ? DAY_COLORS[idx % DAY_COLORS.length] : undefined
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      activeDayTab === d.day
                        ? 'text-white shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Ngày {d.day} ({d.visit_sequence.length} điểm)
                  </button>
                ))}
              </div>

              {/* Day Timeline */}
              <div className="space-y-3">
                {plan.daily_itineraries
                  .filter(d => activeDayTab === null || activeDayTab === d.day)
                  .map((dayItin, dIdx) => (
                    <div key={dayItin.day} className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span className="font-serif text-xs font-bold text-[#1C382B] flex items-center gap-1.5">
                          <span 
                            style={{ backgroundColor: DAY_COLORS[(dayItin.day - 1) % DAY_COLORS.length] }} 
                            className="w-2.5 h-2.5 rounded-full inline-block"
                          />
                          Lịch trình Ngày {dayItin.day}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {dayItin.total_distance_km} km • ~{Math.round(dayItin.total_duration_min)} phút
                        </span>
                      </div>

                      {/* Stops list */}
                      <div className="space-y-2">
                        {/* Start at hotel */}
                        <div className="flex items-start gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                            🏨
                          </span>
                          <div>
                            <div className="font-medium text-stone-800">Khởi hành từ chỗ nghỉ</div>
                            <div className="text-[11px] text-stone-500">{plan.selected_hotel.name}</div>
                          </div>
                        </div>

                        {/* POIs */}
                        {dayItin.visit_sequence.map((poi, pIdx) => (
                          <div key={poi.id} className="flex items-start gap-2 text-xs pl-0.5">
                            <span 
                              style={{ backgroundColor: DAY_COLORS[(dayItin.day - 1) % DAY_COLORS.length] }} 
                              className="w-5 h-5 rounded-full text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs"
                            >
                              {pIdx + 1}
                            </span>
                            <div className="flex-1">
                              <div className="font-bold text-[#1C382B] flex items-center gap-1.5 flex-wrap">
                                <span>{poi.name}</span>
                                {poi.ideal_time && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                                    {poi.ideal_time === 'morning' ? '🌅 Sáng' : poi.ideal_time === 'afternoon' ? '☀️ Chiều' : '🌙 Tối'}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-stone-500 flex items-center gap-2 mt-0.5">
                                <span>~{poi.estimated_duration_min} phút</span>
                                <span>•</span>
                                <span>{poi.ticket_price === 0 ? 'Miễn phí' : `${poi.ticket_price.toLocaleString('vi-VN')} đ`}</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Return to hotel */}
                        <div className="flex items-start gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                            🏁
                          </span>
                          <div>
                            <div className="font-medium text-stone-800">Nghỉ ngơi tại khách sạn</div>
                            <div className="text-[11px] text-stone-500">Hoàn thành cung đường 1 chiều khép kín</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Action Buttons: Mobile Handoff & Xuất file */}
            <div className="space-y-2 pt-2">
              {/* Module 1: Dẫn đường QR & Xuất Story */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onOpenQrModal}
                  className="py-2.5 px-3 rounded-2xl bg-[#1C382B] hover:bg-[#2A4D3B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#B85D3B]" />
                  <span>Dẫn đường QR</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenStoryModal}
                  className="py-2.5 px-3 rounded-2xl bg-gradient-to-tr from-[#B85D3B] to-[#D97706] hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Xuất Story 9:16</span>
                </button>
              </div>

              <button
                onClick={() => exportItineraryToExcel(plan)}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Xuất file Excel đầy đủ lịch trình</span>
              </button>

              <button
                onClick={() => setSidebarTab('setup')}
                className="w-full py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Chỉnh sửa lại danh sách điểm &amp; thời gian</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          STICKY BOTTOM CTA BUTTON
          ======================================================== */}
      <div className="p-4 sm:p-5 border-t border-stone-200/90 bg-gradient-to-t from-[#FDFCF7] via-[#FDFCF7] to-white/80">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (loading) return;
            if (selectedPoiIds.length < 2) {
              onSelectPopularPois();
              return;
            }
            onRunOptimization();
          }}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-lg ${
            loading
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
              : selectedPoiIds.length < 2
                ? 'bg-[#1C382B] hover:bg-[#2A4D3B] active:scale-[0.98] text-white shadow-md'
                : 'bg-[#B85D3B] hover:bg-[#9E4C2E] active:scale-[0.98] text-white shadow-[#B85D3B]/25 hover:shadow-xl'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Đang tính toán tối ưu không gian...</span>
            </>
          ) : selectedPoiIds.length < 2 ? (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>✨ Chọn nhanh 6 điểm &amp; Tạo lộ trình</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>✨ Tạo lộ trình &amp; Tìm chỗ ở tối ưu</span>
            </>
          )}
        </button>

        {selectedPoiIds.length < 2 && (
          <div className="text-[11px] text-center text-stone-500 mt-1.5 font-medium">
            💡 Nhấp nút trên để hệ thống tự chọn 6 điểm tiêu biểu Hà Nội
          </div>
        )}
      </div>

    </aside>
  );
};
