import React, { useState, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  MapPin, 
  Hotel, 
  Calendar, 
  Navigation, 
  Compass, 
  Layers, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Star, 
  Award, 
  PlusCircle, 
  Search, 
  Sliders, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  ArrowRight,
  TrendingUp,
  Info,
  FileSpreadsheet,
  Share2
} from 'lucide-react';
import { POI, Accommodation, PlanResponse, WeightsConfig } from '../types';
import { exportItineraryToExcel } from '../utils/excelExport';

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
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  heritage: { label: 'Di tích', icon: '🏛️', color: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
  beach: { label: 'Biển đảo', icon: '🏖️', color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20' },
  nature: { label: 'Thiên nhiên', icon: '⛰️', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
  bridge: { label: 'Cầu biểu tượng', icon: '🌉', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' },
  museum: { label: 'Bảo tàng', icon: '🎨', color: 'text-purple-300 bg-purple-500/10 border-purple-500/20' },
  entertainment: { label: 'Giải trí', icon: '🎡', color: 'text-pink-300 bg-pink-500/10 border-pink-500/20' },
  culinary: { label: 'Ẩm thực', icon: '🍜', color: 'text-orange-300 bg-orange-500/10 border-orange-500/20' }
};

const DAY_BADGE_COLORS = [
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
];

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
  hoveredHotelId,
  onHoverHotel,
  activeDayTab,
  setActiveDayTab,
  weights = { w_distance: 0.4, w_rating: 0.35, w_price: 0.25 },
  onChangeWeights
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'results'>('config');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAdvancedWeights, setShowAdvancedWeights] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExported, setIsExported] = useState<boolean>(false);

  // References for GSAP animations
  const sidebarContainerRef = useRef<HTMLDivElement>(null);
  const distNumRef = useRef<HTMLSpanElement>(null);
  const durNumRef = useRef<HTMLSpanElement>(null);
  const poisNumRef = useRef<HTMLSpanElement>(null);

  // Đếm số lượng theo danh mục
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: pois.length };
    pois.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [pois]);

  // Danh sách POI đã lọc theo Tìm kiếm và Danh mục
  const filteredPois = useMemo(() => {
    return pois.filter(p => {
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery = !query || 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query)) ||
        (CATEGORY_META[p.category]?.label.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });
  }, [pois, categoryFilter, searchQuery]);

  // GSAP: Stagger entrance của POI list
  useGSAP(() => {
    if (activeTab === 'config') {
      gsap.from('.poi-card-item', {
        y: 10,
        autoAlpha: 0,
        stagger: 0.02,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  }, { scope: sidebarContainerRef, dependencies: [categoryFilter, searchQuery, activeTab] });

  // GSAP: Number Rollup & Stagger Entrance khi có plan kết quả mới
  useGSAP(() => {
    if (!plan) return;

    // 1. Rollup Cự ly (km)
    if (distNumRef.current) {
      const targetDist = plan.total_trip_distance_km;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetDist,
        duration: 0.55,
        ease: 'power3.out',
        onUpdate: () => {
          if (distNumRef.current) distNumRef.current.innerText = obj.val.toFixed(1);
        }
      });
    }

    // 2. Rollup Thời gian lái xe (phút)
    if (durNumRef.current) {
      const targetDur = Math.round(plan.total_trip_duration_min);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetDur,
        duration: 0.55,
        ease: 'power3.out',
        onUpdate: () => {
          if (durNumRef.current) durNumRef.current.innerText = Math.round(obj.val).toString();
        }
      });
    }

    // 3. Rollup Số điểm dừng
    if (poisNumRef.current) {
      const targetPois = plan.total_pois;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetPois,
        duration: 0.5,
        ease: 'power3.out',
        onUpdate: () => {
          if (poisNumRef.current) poisNumRef.current.innerText = Math.round(obj.val).toString();
        }
      });
    }

    // 4. Stagger Entrance cho danh sách khách sạn đề xuất
    gsap.fromTo('.hotel-card-item', 
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, stagger: 0.04, duration: 0.35, ease: 'power2.out', clearProps: 'transform,opacity' }
    );

    // 5. Stagger Timeline theo ngày
    gsap.fromTo('.timeline-day-card',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, stagger: 0.05, duration: 0.35, ease: 'power2.out', clearProps: 'transform,opacity' }
    );
  }, { scope: sidebarContainerRef, dependencies: [plan] });

  // Sao chép lịch trình vào clipboard
  const handleCopyItinerary = () => {
    if (!plan) return;
    let text = `=== LỊCH TRÌNH DU LỊCH HÀ NỘI (SDSS) ===\n`;
    text += `🏨 Khách sạn: ${plan.selected_hotel.name} (${plan.selected_hotel.rating}⭐)\n`;
    text += `📍 Địa chỉ: ${plan.selected_hotel.address}\n`;
    text += `⚡ Tổng cự ly: ${plan.total_trip_distance_km} km | Thời gian di chuyển: ${Math.round(plan.total_trip_duration_min)} phút\n\n`;

    plan.daily_itineraries.forEach(d => {
      text += `--- NGÀY ${d.day} (${d.total_distance_km} km) ---\n`;
      d.visit_sequence.forEach((p, idx) => {
        text += `  ${idx + 1}. ${p.name} (~${p.estimated_duration_min} phút)\n`;
      });
    });

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Xuất kế hoạch sang file Excel (.xlsx)
  const handleExportExcel = () => {
    if (!plan) return;
    try {
      exportItineraryToExcel(plan);
      setIsExported(true);
      setTimeout(() => setIsExported(false), 2500);
    } catch (err) {
      console.error('Lỗi khi xuất file Excel:', err);
      alert('Có lỗi khi tạo file Excel. Vui lòng thử lại.');
    }
  };

  return (
    <aside 
      ref={sidebarContainerRef}
      className="w-[420px] max-w-[420px] bg-slate-900/90 border-r border-slate-800/70 flex flex-col h-full shrink-0 z-30 select-none shadow-2xl backdrop-blur-xl overflow-x-hidden"
    >
      {/* 1. Header & Branding */}
      <div className="p-4 border-b border-slate-800/70 bg-slate-900/80 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-white leading-tight">Lập Lịch Trình Du Lịch Hà Nội</h1>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0">
                SDSS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tối ưu hóa vị trí lưu trú & lập kế hoạch đa điểm
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-950/70 p-1 border border-slate-800 mt-3.5 text-xs">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cấu hình ({selectedPoiIds.length})</span>
          </button>

          <button
            onClick={() => {
              if (plan) setActiveTab('results');
            }}
            disabled={!plan}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'results'
                ? 'bg-emerald-600 text-white shadow-sm'
                : plan
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lộ trình {plan ? '✓' : ''}</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3.5 scrollbar-thin">
        {activeTab === 'config' ? (
          <>
            {/* Box 1: Chọn số ngày du lịch (K-Means) */}
            <div className="glass-card p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Số ngày khám phá
                </span>
                <span className="text-indigo-400 font-bold font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  {days} Ngày
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-xs">
                {[1, 2, 3, 4, 5].map((d) => (
                  <button
                    key={d}
                    onClick={() => onChangeDays(d)}
                    className={`py-2 rounded-xl font-semibold transition-all text-center ${
                      days === d
                        ? 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20'
                        : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                    }`}
                  >
                    {d} ngày
                  </button>
                ))}
              </div>
            </div>

            {/* Box 2: Tiêu chí Cơ sở Lưu trú */}
            <div className="glass-card p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-emerald-400" />
                  Tiêu chí khách sạn & lưu trú
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Bán kính {(radiusMeters / 1000).toFixed(1)} km</span>
              </div>

              {/* Hạng sao */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Hạng sao tối thiểu:</span>
                  <span className="text-amber-400 font-semibold">
                    {minStars ? `${minStars} Sao trở lên` : 'Tất cả'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                  {[undefined, 3, 4, 5].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => onChangeMinStars(s)}
                      className={`py-1.5 rounded-xl font-medium transition-all ${
                        minStars === s
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold shadow-sm'
                          : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      {s ? `${s}⭐` : 'Tất cả'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ngân sách phòng */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Ngân sách mỗi đêm:</span>
                  <span className="text-emerald-400 font-semibold">
                    {maxBudget ? `< ${(maxBudget / 1000).toLocaleString()}k đ` : 'Không giới hạn'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { label: 'Tất cả', val: undefined },
                    { label: '< 1.5 triệu', val: 1500000 },
                    { label: '< 3.0 triệu', val: 3000000 }
                  ].map((b, idx) => (
                    <button
                      key={idx}
                      onClick={() => onChangeMaxBudget(b.val)}
                      className={`py-1.5 rounded-xl font-medium transition-all ${
                        maxBudget === b.val
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold shadow-sm'
                          : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bán kính quét R */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Bán kính tìm kiếm quanh trung vị:</span>
                  <span className="text-cyan-400 font-mono font-semibold">{(radiusMeters / 1000).toFixed(1)} km</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="8000"
                  step="500"
                  value={radiusMeters}
                  onChange={(e) => onChangeRadiusMeters(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Tinh chỉnh Trọng số Đa tiêu chí (Accordion) */}
              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => setShowAdvancedWeights(!showAdvancedWeights)}
                  className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 transition py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-indigo-400" />
                    Tùy chỉnh tỷ trọng đánh giá (Cự ly / Sao / Giá)
                  </span>
                  {showAdvancedWeights ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvancedWeights && (
                  <div className="space-y-2.5 pt-2 text-[11px] bg-slate-950/60 p-3 rounded-xl border border-slate-800 mt-1">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Trọng số Cự ly ($w_1$):</span>
                        <span className="text-cyan-400 font-mono font-bold">{(weights.w_distance * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.8"
                        step="0.05"
                        value={weights.w_distance}
                        onChange={(e) => onChangeWeights && onChangeWeights({ ...weights, w_distance: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Trọng số Hạng sao ($w_2$):</span>
                        <span className="text-amber-400 font-mono font-bold">{(weights.w_rating * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.8"
                        step="0.05"
                        value={weights.w_rating}
                        onChange={(e) => onChangeWeights && onChangeWeights({ ...weights, w_rating: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Trọng số Tiết kiệm Giá ($w_3$):</span>
                        <span className="text-emerald-400 font-mono font-bold">{(weights.w_price * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.8"
                        step="0.05"
                        value={weights.w_price}
                        onChange={(e) => onChangeWeights && onChangeWeights({ ...weights, w_price: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Box 3: Danh sách Điểm Tham Quan (POIs) */}
            <div className="glass-card p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  Chọn điểm tham quan
                </span>
                <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  {selectedPoiIds.length} / {pois.length} đã chọn
                </span>
              </div>

              {/* Ô tìm kiếm tức thì */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm điểm du lịch theo tên hoặc danh mục..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full glass-input rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Nút chọn nhanh */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-0.5">
                <button
                  onClick={onSelectPopularPois}
                  className="text-indigo-400 hover:text-indigo-300 transition font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Chọn 6 điểm nổi tiếng
                </button>
                <div className="flex items-center gap-1.5">
                  <button onClick={onSelectAllPois} className="px-2 py-0.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-700/50">Tất cả</button>
                  <button onClick={onClearPois} className="px-2 py-0.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-700/50">Bỏ chọn</button>
                </div>
              </div>

              {/* Nút Đóng góp điểm du lịch mới */}
              <button
                onClick={onOpenAddPoiModal}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>+ Đóng góp điểm du lịch mới vào bản đồ</span>
              </button>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                {['all', 'heritage', 'beach', 'nature', 'bridge', 'entertainment', 'culinary'].map((cat) => {
                  const isActive = categoryFilter === cat;
                  const label = cat === 'all' ? 'Tất cả' : (CATEGORY_META[cat]?.icon + ' ' + CATEGORY_META[cat]?.label);
                  const count = categoryCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-sm'
                          : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-900 text-white' : 'bg-slate-750 text-slate-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Danh sách cuộn POI */}
              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredPois.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Không tìm thấy địa điểm nào khớp với "{searchQuery}"
                  </div>
                ) : (
                  filteredPois.map((poi) => {
                    const isChecked = selectedPoiIds.includes(poi.id);
                    const meta = CATEGORY_META[poi.category];
                    return (
                      <div
                        key={poi.id}
                        onClick={() => onOpenPoiDetail(poi)}
                        className={`poi-card-item p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                          isChecked
                            ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/20'
                            : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/70 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              onTogglePoi(poi.id);
                            }}
                            className="w-4 h-4 rounded-md text-indigo-500 bg-slate-800/80 border-slate-700 focus:ring-0 cursor-pointer accent-indigo-500 shrink-0"
                          />
                          {poi.image_url ? (
                            <img
                              src={poi.image_url}
                              alt={poi.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700/70 group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">
                              {meta?.icon || '📍'}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className={`text-xs font-semibold leading-tight truncate group-hover:text-indigo-300 transition ${isChecked ? 'text-white' : 'text-slate-200'}`}>
                              {poi.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                              <span className={`px-1.5 py-0.2 rounded border text-[9px] ${meta?.color || 'text-slate-400 border-slate-700'}`}>
                                {meta ? `${meta.icon} ${meta.label}` : poi.category}
                              </span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 text-slate-500" /> {poi.estimated_duration_min}p
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-1.5 ml-2">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                            poi.ticket_price === 0
                              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                              : 'text-slate-300 bg-slate-850 border border-slate-750'
                          }`}>
                            {poi.ticket_price === 0 ? 'FREE' : `${(poi.ticket_price / 1000).toLocaleString()}k`}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPoiDetail(poi);
                            }}
                            title="Xem chi tiết & ảnh"
                            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition border border-slate-750"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          /* TAB KẾT QUẢ TỐI ƯU HÓA (RESULTS VIEW) */
          plan && (
            <div className="space-y-3.5">
              {/* 1. Telemetry HUD Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-center">
                  <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500">CỰ LY TỔNG</div>
                  <div className="text-base font-semibold text-emerald-400 font-mono mt-0.5 flex items-baseline justify-center gap-1">
                    <span ref={distNumRef}>{plan.total_trip_distance_km}</span>
                    <span className="text-[10px] font-normal text-slate-500">km</span>
                  </div>
                </div>

                <div className="bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-center">
                  <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500">THỜI GIAN LÁI</div>
                  <div className="text-base font-semibold text-indigo-400 font-mono mt-0.5 flex items-baseline justify-center gap-1">
                    <span ref={durNumRef}>{Math.round(plan.total_trip_duration_min)}</span>
                    <span className="text-[10px] font-normal text-slate-500">phút</span>
                  </div>
                </div>

                <div className="bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-center">
                  <div className="text-[10px] font-mono tracking-wider uppercase text-slate-500">ĐIỂM DỪNG</div>
                  <div className="text-base font-semibold text-slate-200 font-mono mt-0.5 flex items-baseline justify-center gap-1">
                    <span ref={poisNumRef}>{plan.total_pois}</span>
                    <span className="text-[10px] font-normal text-slate-500">điểm</span>
                  </div>
                </div>
              </div>

              {/* 2. Thẻ Khách sạn Lưu trú Tối ưu Đã Chọn */}
              <div className="bg-slate-900/90 border border-slate-800 border-l-2 border-l-emerald-500 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> ĐIỂM LƯU TRÚ TỐI ƯU
                  </span>
                  <span className="text-xs font-mono font-semibold text-amber-400 flex items-center gap-1">
                    ★ {plan.selected_hotel.rating} <span className="text-slate-500">({plan.selected_hotel.stars}⭐)</span>
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-xs text-white tracking-wide">{plan.selected_hotel.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate font-mono">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{plan.selected_hotel.address}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80 font-mono">
                  <span className="text-slate-400 text-[11px]">
                    Giá: <b className="text-emerald-400 font-semibold">{plan.selected_hotel.price_per_night.toLocaleString('vi-VN')} đ</b> / đêm
                  </span>
                  <span className="text-[11px] text-slate-400">
                    MCDA: <b className="text-indigo-400">{plan.selected_hotel.multi_criteria_score || 95}đ</b>
                  </span>
                </div>

                {/* Telemetry Weiszfeld Median */}
                <div className="bg-[#0B0F19] p-2 rounded border border-slate-800/80 text-[10px] font-mono space-y-0.5 text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>L1-MEDIAN COORDS:</span>
                    <span className="text-rose-400">
                      {plan.geometric_median.lat.toFixed(4)}, {plan.geometric_median.lon.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>GAIN VS CENTROID:</span>
                    <span className="font-semibold">
                      +{plan.geometric_median.centroid_comparison_gain_km} km
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Danh sách Top 5 Khách sạn Gợi Ý với Hover Sync */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5 font-mono uppercase text-[11px] text-slate-300">
                    <Hotel className="w-3.5 h-3.5 text-indigo-400" />
                    TOP 5 KHÁCH SẠN GẦN TRUNG VỊ
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">WEISZFELD L1</span>
                </div>

                <div className="space-y-1.5">
                  {plan.recommended_accommodations.map((hotel, idx) => {
                    const isSelected = (selectedHotelId === hotel.id) || (!selectedHotelId && idx === 0);
                    const isHovered = hoveredHotelId === hotel.id;
                    const rankStr = `0${idx + 1}`.slice(-2);

                    return (
                      <div
                        key={hotel.id}
                        onClick={() => onSelectHotel(hotel.id)}
                        onMouseEnter={() => onHoverHotel?.(hotel.id)}
                        onMouseLeave={() => onHoverHotel?.(null)}
                        className={`hotel-card-item p-2.5 rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-slate-850 border-l-2 border-l-emerald-500 border-slate-700 text-white shadow-sm'
                            : isHovered
                            ? 'bg-slate-800/90 border-l-2 border-l-indigo-400 border-slate-700 text-white translate-x-1'
                            : 'bg-[#0B0F19]/60 border-slate-800/80 hover:border-slate-700 hover:translate-x-1 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded font-mono text-[10px] flex items-center justify-center font-bold shrink-0 ${
                            isSelected 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-slate-800 text-slate-400 border border-slate-750'
                          }`}>
                            {rankStr}
                          </span>
                          <div className="min-w-0">
                            <div className="font-medium text-xs truncate flex items-center gap-1.5">
                              <span className="truncate">{hotel.name}</span>
                              <span className="text-[10px] text-amber-400 font-mono shrink-0">★{hotel.rating}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                              {(hotel.price_per_night / 1000).toLocaleString()}k đ &bull; Cách L1: {hotel.distance_to_median_m ? `${hotel.distance_to_median_m}m` : '<500m'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-indigo-400'
                          }`}>
                            {hotel.multi_criteria_score ? `${hotel.multi_criteria_score}đ` : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lộ Trình Theo Ngày (Timeline) */}
              <div className="glass-card p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    Lộ trình chi tiết từng ngày
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    OR-Tools TSP
                  </span>
                </div>

                {/* Thanh công cụ: Xuất Excel (.xlsx) & Chia sẻ tóm tắt */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExportExcel}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-semibold text-xs transition border shadow-sm ${
                      isExported
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/25 shadow-emerald-950/40 active:scale-[0.98]'
                    }`}
                  >
                    {isExported ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Đã tải Excel</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Xuất File Excel</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyItinerary}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-semibold text-xs transition border ${
                      isCopied
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border-slate-700 active:scale-[0.98]'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-indigo-300" />
                        <span>Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Chia sẻ tóm tắt</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tab chuyển đổi ngày */}
                <div className="flex gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveDayTab(null)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeDayTab === null
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Toàn bộ
                  </button>
                  {plan.daily_itineraries.map((dayItin) => (
                    <button
                      key={dayItin.day}
                      onClick={() => setActiveDayTab(dayItin.day)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                        activeDayTab === dayItin.day
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Ngày {dayItin.day}
                    </button>
                  ))}
                </div>

                {/* Danh sách các chặng timeline */}
                <div className="space-y-2.5">
                  {plan.daily_itineraries
                    .filter(d => activeDayTab === null || d.day === activeDayTab)
                    .map((dayItin) => (
                      <div 
                        key={dayItin.day} 
                        className="timeline-day-card bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
                          <span className={`px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] border ${
                            DAY_BADGE_COLORS[(dayItin.day - 1) % DAY_BADGE_COLORS.length]
                          }`}>
                            NGÀY {dayItin.day}
                          </span>
                          <span className="text-[11px] text-slate-300 font-mono">
                            {dayItin.total_distance_km} km &bull; ~{Math.round(dayItin.total_duration_min)} phút lái xe
                          </span>
                        </div>

                        {/* Timeline thứ tự di chuyển */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center space-x-2 text-emerald-400 font-medium">
                            <span className="text-base">🏨</span>
                            <span className="truncate">Xuất phát: {dayItin.hotel.name}</span>
                          </div>

                          {dayItin.legs.map((leg, idx) => (
                            <div key={idx} className="pl-3 border-l-2 border-indigo-500/30 ml-2 py-0.5 space-y-0.5">
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <ArrowRight className="w-2.5 h-2.5 text-cyan-400" />
                                <span>{leg.distance_km} km &bull; {Math.round(leg.duration_min)} phút di chuyển</span>
                              </div>
                              <div className="text-white font-medium flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="truncate">{leg.to_name}</span>
                              </div>
                            </div>
                          ))}

                          <div className="flex items-center space-x-2 text-slate-400 pt-1">
                            <span className="text-base">🏁</span>
                            <span className="truncate">Về lại: {dayItin.hotel.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* 3. Footer Action Button */}
      <div className="p-4 border-t border-slate-800/70 bg-slate-900/90 shrink-0">
        <button
          onClick={() => {
            setActiveTab('results');
            onRunOptimization();
          }}
          disabled={loading || selectedPoiIds.length === 0}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl ${
            loading
              ? 'bg-slate-800/80 text-slate-500 cursor-wait border border-slate-700/50'
              : selectedPoiIds.length === 0
              ? 'bg-slate-800/60 text-slate-600 cursor-not-allowed border border-slate-800'
              : 'bg-gradient-to-r from-indigo-500 via-blue-600 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 active:scale-[0.98] text-white shadow-indigo-600/25 border border-white/15'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              <span>Đang tính toán Weiszfeld & OR-Tools...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>TỐI ƯU HÓA LỊCH TRÌNH & LƯU TRÚ</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};


