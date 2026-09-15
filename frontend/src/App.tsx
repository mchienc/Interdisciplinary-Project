import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sidebar } from './components/Sidebar';
import { MapView, MapViewHandle } from './components/MapView';
import { AddPoiModal } from './components/AddPoiModal';
import { PoiDetailModal } from './components/PoiDetailModal';
import { LandingHero } from './components/LandingHero';
import { POI, PlanResponse, PlanRequest, WeightsConfig } from './types';
import { 
  Compass, 
  Database, 
  Cpu, 
  Route, 
  Sparkles, 
  Maximize, 
  Minimize,
  Play,
  Terminal,
  Home
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const App: React.FC = () => {
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedPoiIds, setSelectedPoiIds] = useState<number[]>([]);
  const [days, setDays] = useState<number>(2);
  const [maxBudget, setMaxBudget] = useState<number | undefined>(undefined);
  const [minStars, setMinStars] = useState<number | undefined>(undefined);
  const [radiusMeters, setRadiusMeters] = useState<number>(4000);
  const [weights, setWeights] = useState<WeightsConfig>({
    w_distance: 0.40,
    w_rating: 0.35,
    w_price: 0.25
  });
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [hoveredHotelId, setHoveredHotelId] = useState<number | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeDayTab, setActiveDayTab] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('offline');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Chế độ Landing Page vs WebGIS Workspace
  const [isWorkspaceActive, setIsWorkspaceActive] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // References cho GSAP Animation & Map Control
  const appContainerRef = useRef<HTMLDivElement>(null);
  const mapViewRef = useRef<MapViewHandle>(null);
  const landingBackdropRef = useRef<HTMLDivElement>(null);
  const landingHeroRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const sidebarWrapperRef = useRef<HTMLDivElement>(null);

  // Trạng thái modal và chọn tọa độ trên bản đồ
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPickingLocation, setIsPickingLocation] = useState<boolean>(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedPoiForDetail, setSelectedPoiForDetail] = useState<POI | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // 1. Tải danh sách POIs ban đầu
  useEffect(() => {
    const fetchPois = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/pois`);
        if (res.ok) {
          const data = await res.json();
          setPois(data);
          setSelectedPoiIds(data.slice(0, 6).map((p: POI) => p.id));
          setApiStatus('online');
          return;
        }
      } catch (err) {
        setApiStatus('offline');
      }

      // Fallback cục bộ nếu backend chưa kết nối
      const fallbackPois: POI[] = [
        { id: 1, name: 'Hồ Hoàn Kiếm & Đền Ngọc Sơn', category: 'heritage', lat: 21.0287, lon: 105.8523, estimated_duration_min: 60, ticket_price: 30000, description: 'Trái tim của Thủ đô ngàn năm văn hiến' },
        { id: 2, name: 'Lăng Chủ tịch Hồ Chí Minh', category: 'heritage', lat: 21.0368, lon: 105.8346, estimated_duration_min: 120, ticket_price: 0, description: 'Quảng trường Ba Đình & Lăng Bác' },
        { id: 3, name: 'Văn Miếu - Quốc Tử Giám', category: 'heritage', lat: 21.0293, lon: 105.8359, estimated_duration_min: 90, ticket_price: 30000, description: 'Trường đại học đầu tiên của Việt Nam' },
        { id: 4, name: 'Khu Phố Cổ Hà Nội (36 Phố Phường)', category: 'culinary', lat: 21.0366, lon: 105.8500, estimated_duration_min: 90, ticket_price: 0, description: 'Phố cổ rêu phong & thiên đường ẩm thực' },
        { id: 5, name: 'Hồ Tây & Chùa Trấn Quốc', category: 'nature', lat: 21.0545, lon: 105.8285, estimated_duration_min: 90, ticket_price: 0, description: 'Hồ nước tự nhiên lớn nhất Thủ đô' },
        { id: 6, name: 'Hoàng thành Thăng Long', category: 'heritage', lat: 21.0353, lon: 105.8402, estimated_duration_min: 120, ticket_price: 30000, description: 'Di sản Văn hóa Thế giới UNESCO' },
        { id: 7, name: 'Bảo tàng Dân tộc học', category: 'museum', lat: 21.0406, lon: 105.7984, estimated_duration_min: 120, ticket_price: 40000, description: 'Văn hóa 54 dân tộc Việt Nam' }
      ];
      setPois(fallbackPois);
      setSelectedPoiIds(fallbackPois.slice(0, 6).map(p => p.id));
    };

    fetchPois();
  }, []);

  // 2. Thiết lập trạng thái DOM ban đầu bằng GSAP Context
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header giấu lên trên
      gsap.set(headerRef.current, { y: '-100%', opacity: 0 });
      // Sidebar giấu sang trái
      gsap.set(sidebarWrapperRef.current, { x: '-100%', opacity: 0 });
    }, appContainerRef);

    return () => ctx.revert();
  }, []);

  // 3. Kịch bản Animation Camera Fly-Down: Landing ➔ WebGIS Workspace
  const handleLaunchWorkspace = (presetPoiIds?: number[]) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (presetPoiIds && presetPoiIds.length > 0) {
      setSelectedPoiIds(presetPoiIds);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsWorkspaceActive(true);
          setIsTransitioning(false);
          // Bước 5: Kích hoạt render tuyến đường và tối ưu hóa
          const targetIds = (presetPoiIds && presetPoiIds.length >= 2) ? presetPoiIds : selectedPoiIds;
          if (targetIds.length >= 2) {
            handleRunOptimization(undefined, targetIds);
          }
        }
      });

      // Bước 1: Fade-out và trượt nhẹ tiêu đề Landing Page lên trên
      tl.to(landingHeroRef.current, {
        y: -35,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.in'
      });

      // Bước 2: Fade-out lớp backdrop blur để lộ bản đồ sắc nét
      tl.to(landingBackdropRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          if (landingBackdropRef.current) {
            landingBackdropRef.current.style.pointerEvents = 'none';
          }
        }
      }, "-=0.15");

      // Bước 3: Đồng thời gọi map.flyTo() lướt từ zoom 10.5 xuống zoom 13.8 tại [105.8523, 21.0287], pitch 30 độ
      mapViewRef.current?.flyDownToWorkspace();

      // Bước 4: Đón đầu điểm rơi của camera, đưa thanh Sidebar và Header trượt vào màn hình
      tl.to(headerRef.current, {
        y: '0%',
        opacity: 1,
        duration: 0.65,
        ease: 'power3.out'
      }, "+=0.6");

      tl.to(sidebarWrapperRef.current, {
        x: '0%',
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out'
      }, "-=0.45");

    }, appContainerRef);
  };

  // 4. Kịch bản Quay lại Landing Page (Reverse Transition)
  const handleReturnToLanding = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsWorkspaceActive(false);
          setIsTransitioning(false);
        }
      });

      // 1. Thu Sidebar và Header về trạng thái ẩn
      tl.to(sidebarWrapperRef.current, {
        x: '-100%',
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in'
      });

      tl.to(headerRef.current, {
        y: '-100%',
        opacity: 0,
        duration: 0.45,
        ease: 'power3.in'
      }, "-=0.3");

      // 2. Camera bay ngược lại toàn cảnh Hà Nội (zoom: 10.5, pitch: 0)
      mapViewRef.current?.flyBackToLanding();

      // 3. Hiện lại backdrop và Hero content
      tl.to(landingBackdropRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        onStart: () => {
          if (landingBackdropRef.current) {
            landingBackdropRef.current.style.pointerEvents = 'auto';
          }
        }
      }, "+=0.2");

      tl.to(landingHeroRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out'
      }, "-=0.3");

    }, appContainerRef);
  };

  // 5. Chức năng chạy Tối ưu hóa (Call FastAPI Endpoint)
  const handleRunOptimization = async (overrideHotelId?: number, overridePoiIds?: number[]) => {
    const poiIdsToUse = overridePoiIds !== undefined ? overridePoiIds : selectedPoiIds;
    if (poiIdsToUse.length === 0) return;

    setLoading(true);
    const hotelIdToUse = overrideHotelId !== undefined ? overrideHotelId : selectedHotelId;

    const payload: PlanRequest = {
      poi_ids: poiIdsToUse,
      days: days,
      max_budget: maxBudget,
      min_stars: minStars,
      radius_meters: radiusMeters,
      weights: weights,
      selected_hotel_id: hotelIdToUse || undefined
    };

    try {
      const res = await fetch(`${API_BASE_URL}/itinerary/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data: PlanResponse = await res.json();
        setPlan(data);
        setSelectedHotelId(data.selected_hotel.id);
        setApiStatus('online');
      } else {
        alert('Lỗi tối ưu hóa từ API backend. Vui lòng kiểm tra lại dịch vụ FastAPI.');
      }
    } catch (err) {
      console.warn('Lỗi kết nối FastAPI backend:', err);
      setApiStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  // Thay đổi khách sạn lưu trú
  const handleSelectHotel = (hotelId: number) => {
    setSelectedHotelId(hotelId);
    handleRunOptimization(hotelId);
  };

  // Toggle chọn POI
  const handleTogglePoi = (poiId: number) => {
    setSelectedPoiIds(prev => 
      prev.includes(poiId) ? prev.filter(id => id !== poiId) : [...prev, poiId]
    );
  };

  // Chọn tất cả POIs
  const handleSelectAllPois = () => {
    setSelectedPoiIds(pois.map(p => p.id));
  };

  // Xóa toàn bộ lựa chọn POI
  const handleClearPois = () => {
    setSelectedPoiIds([]);
  };

  // Chọn 6 địa điểm tiêu biểu
  const handleSelectPopularPois = () => {
    setSelectedPoiIds(pois.slice(0, 6).map(p => p.id));
  };

  // Nhận tọa độ chọn trên bản đồ
  const handleLocationPicked = (lat: number, lon: number) => {
    setPickedCoords({ lat, lon });
    setIsPickingLocation(false);
    setIsAddModalOpen(true);
  };

  // Xử lý khi thêm POI thành công
  const handlePoiAdded = (newPoi: POI) => {
    setPois(prev => [newPoi, ...prev]);
    setSelectedPoiIds(prev => [newPoi.id, ...prev]);
    setNotification(`Đã thêm thành công địa điểm: ${newPoi.name}`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Toggle Toàn màn hình
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={appContainerRef} className="h-screen w-screen relative bg-[#0B0F19] text-slate-100 overflow-hidden font-sans select-none">
      
      {/* 1. MAP COMPONENT: TẦNG BACKGROUND TĨNH (z-0, w-full, h-full, Không unmount/remount) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <MapView
          ref={mapViewRef}
          pois={pois}
          selectedPoiIds={selectedPoiIds}
          plan={plan}
          selectedHotelId={selectedHotelId}
          onSelectHotel={handleSelectHotel}
          hoveredHotelId={hoveredHotelId}
          onHoverHotel={setHoveredHotelId}
          activeDayTab={activeDayTab}
          isWorkspaceActive={isWorkspaceActive}
          isPickingLocation={isPickingLocation}
          onLocationPicked={handleLocationPicked}
          pickedCoords={pickedCoords}
          onCancelPick={() => setIsPickingLocation(false)}
          onOpenPoiDetail={(poi: POI) => setSelectedPoiForDetail(poi)}
        />
      </div>

      {/* 2. LANDING PAGE OVERLAY (Dedicated LandingHero Component, z-20) */}
      <LandingHero
        backdropRef={landingBackdropRef}
        heroRef={landingHeroRef}
        onLaunchWorkspace={handleLaunchWorkspace}
        isTransitioning={isTransitioning}
        pois={pois}
      />

      {/* 3. WEBGIS WORKSPACE HEADER (.webgis-header, z-30) */}
      <header 
        ref={headerRef} 
        className="webgis-header absolute top-0 left-0 right-0 h-12 bg-[#0B0F19]/95 border-b border-slate-800 px-4 flex items-center justify-between z-30 backdrop-blur-md"
      >
        <div 
          onClick={handleReturnToLanding}
          role="button"
          tabIndex={0}
          title="Click để quay về Trang chủ"
          className="flex items-center space-x-3 cursor-pointer group select-none hover:opacity-90 transition"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-slate-700 border border-slate-700 group-hover:border-indigo-500/50 flex items-center justify-center text-indigo-400 transition">
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-200 group-hover:text-white transition">
              SDSS WORKSTATION
            </span>
            <span className="text-slate-600 font-mono text-xs">/</span>
            <span className="text-[11px] text-slate-400 font-mono">
              HÀ NỘI SPATIAL ENGINE
            </span>
          </div>
        </div>

        {/* Telemetry Status Bar */}
        <div className="flex items-center space-x-3 text-xs font-mono text-[11px] text-slate-400">
          <div className="hidden md:flex items-center space-x-2">
            <span>CRS: <b className="text-slate-300 font-normal">EPSG:4326</b></span>
            <span className="text-slate-700">•</span>
            <span>SOLVER: <b className="text-indigo-400 font-normal">OR-TOOLS+L1</b></span>
            <span className="text-slate-700">•</span>
            <span>MATRIX: <b className="text-cyan-400 font-normal">OSRM</b></span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Quay lại Landing View */}
          <button
            onClick={handleReturnToLanding}
            title="Quay lại Trang chủ"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 hover:text-white transition font-sans font-medium text-xs shadow-sm"
          >
            <Home className="w-3.5 h-3.5 text-indigo-400" />
            <span>VỀ TRANG CHỦ</span>
          </button>

          {/* API Status Dot */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            <span className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className={apiStatus === 'online' ? 'text-emerald-400' : 'text-amber-400'}>
              {apiStatus === 'online' ? 'SYS_ONLINE' : 'SYS_OFFLINE'}
            </span>
          </div>

          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* 4. WEBGIS WORKSPACE SIDEBAR (.webgis-sidebar, z-30) */}
      <div 
        ref={sidebarWrapperRef} 
        className="webgis-sidebar absolute left-0 top-12 bottom-0 z-30 w-[420px] shadow-2xl"
      >
        <Sidebar
          pois={pois}
          selectedPoiIds={selectedPoiIds}
          onTogglePoi={handleTogglePoi}
          onSelectAllPois={handleSelectAllPois}
          onClearPois={handleClearPois}
          onSelectPopularPois={handleSelectPopularPois}
          onOpenAddPoiModal={() => setIsAddModalOpen(true)}
          onOpenPoiDetail={(poi: POI) => setSelectedPoiForDetail(poi)}
          days={days}
          onChangeDays={setDays}
          maxBudget={maxBudget}
          onChangeMaxBudget={setMaxBudget}
          minStars={minStars}
          onChangeMinStars={setMinStars}
          radiusMeters={radiusMeters}
          onChangeRadiusMeters={setRadiusMeters}
          onRunOptimization={handleRunOptimization}
          loading={loading}
          plan={plan}
          selectedHotelId={selectedHotelId}
          onSelectHotel={handleSelectHotel}
          hoveredHotelId={hoveredHotelId}
          onHoverHotel={setHoveredHotelId}
          activeDayTab={activeDayTab}
          setActiveDayTab={setActiveDayTab}
          weights={weights}
          onChangeWeights={setWeights}
        />
      </div>

      {/* TOAST THÔNG BÁO */}
      {notification && (
        <div className="fixed top-14 right-4 z-50 bg-slate-900/95 border border-emerald-500/40 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* MODAL THÊM ĐỊA ĐIỂM DU LỊCH MỚI */}
      <AddPoiModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePoiAdded}
        pickedCoords={pickedCoords}
        onStartPickOnMap={() => {
          setIsAddModalOpen(false);
          setIsPickingLocation(true);
        }}
      />

      {/* MODAL CHI TIẾT ĐỊA ĐIỂM DU LỊCH & HÌNH ẢNH */}
      <PoiDetailModal
        poi={selectedPoiForDetail}
        isOpen={!!selectedPoiForDetail}
        onClose={() => setSelectedPoiForDetail(null)}
        onTogglePoi={handleTogglePoi}
        isSelected={selectedPoiForDetail ? selectedPoiIds.includes(selectedPoiForDetail.id) : false}
      />
    </div>
  );
};
