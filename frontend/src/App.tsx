import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sidebar } from './components/workspace/Sidebar';
import { MapView, MapViewHandle } from './components/map/MapView';
import { AddPoiModal } from './components/common/AddPoiModal';
import { PoiDetailModal } from './components/common/PoiDetailModal';
import { LandingHero } from './components/landing/LandingHero';
import { GoogleMapsQrModal } from './components/common/GoogleMapsQrModal';
import { StoryCardModal } from './components/common/StoryCardModal';
import { ContextStatusPill } from './components/common/ContextStatusPill';
import { SmartContextBanner } from './components/common/SmartContextBanner';
import { StorytellerChat } from './components/workspace/StorytellerChat';
import { ContextAwareProvider, useContextAwareness } from './context/ContextAwareContext';
import { POI, PlanResponse, PlanRequest, WeightsConfig } from './types';
import { exportItineraryToExcel } from './utils/excelExport';
import { FALLBACK_POIS } from './constants/mockData';
import { fetchPoisApi, optimizeItineraryApi } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { MyTripsModal } from './components/trips/MyTripsModal';
import { CommunityFeedModal } from './components/community/CommunityFeedModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { getTripByIdApi } from './services/authService';
import { SavedTrip } from './types';
import { 
  Compass, 
  Info, 
  Maximize, 
  Minimize, 
  Share2, 
  FileSpreadsheet, 
  Edit3, 
  ArrowLeft,
  User as UserIcon,
  Shield,
  LogOut,
  ChevronDown,
  Plus,
  Camera,
  Bookmark,
  Users
} from 'lucide-react';

const WebGisApp: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, setIsAuthModalOpen, setIsMyTripsOpen, setIsAdminModalOpen, savedTripsCount } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedPoiIds, setSelectedPoiIds] = useState<number[]>([]);
  const [days, setDays] = useState<number>(2);
  const [transportMode, setTransportMode] = useState<'walking' | 'bike' | 'driving'>('driving');
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
  const [hoveredPoiId, setHoveredPoiId] = useState<number | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeDayTab, setActiveDayTab] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('offline');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Context-Aware Engine Hooks
  const { setBasePlan, effectivePlan, traffic, weather } = useContextAwareness();
  const activePlan = effectivePlan || plan;

  // Modal Lịch trình Cộng đồng
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState<boolean>(false);

  // Modal Dẫn đường Google Maps & Xuất Story
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);

  // Chế độ Tên kế hoạch có thể đổi tên trực tiếp
  const [itineraryTitle, setItineraryTitle] = useState<string>('Kế hoạch khám phá Thủ đô');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);

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

  // 1. Tải danh sách POIs ban đầu & Tự động kết nối lại khi Backend khởi động
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchPois = async () => {
      try {
        const data = await fetchPoisApi();
        setPois(data);
        setSelectedPoiIds(prev => (prev.length > 0 ? prev : data.slice(0, 6).map((p: POI) => p.id)));
        setApiStatus('online');
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return;
      } catch {
        setApiStatus('offline');
      }

      // Fallback cục bộ nếu backend chưa kết nối
      setPois(FALLBACK_POIS);
      setSelectedPoiIds(prev => (prev.length > 0 ? prev : FALLBACK_POIS.slice(0, 6).map(p => p.id)));
    };

    fetchPois();

    // Tự động kiểm tra kết nối định kỳ để chuyển ngay sang Online khi bật backend
    intervalId = setInterval(() => {
      fetchPois();
    }, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Nạp chuyến đi từ danh sách đã lưu lên bản đồ
  const handleLoadSavedTrip = (savedTrip: SavedTrip) => {
    if (savedTrip.plan_data) {
      setPlan(savedTrip.plan_data);
      setDays(savedTrip.days);
      setItineraryTitle(savedTrip.title);
      if (savedTrip.selected_poi_ids && savedTrip.selected_poi_ids.length > 0) {
        setSelectedPoiIds(savedTrip.selected_poi_ids);
      }
      if (savedTrip.plan_data.selected_hotel) {
        setSelectedHotelId(savedTrip.plan_data.selected_hotel.id);
      }
      setNotification(`Đã tải thành công chuyến đi "${savedTrip.title}" lên bản đồ!`);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // Kiểm tra tham số ?trip_id= trên URL để nạp link chia sẻ
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('trip_id');
    if (tripId) {
      getTripByIdApi(tripId).then(savedTrip => {
        handleLoadSavedTrip(savedTrip);
        setIsWorkspaceActive(true);
      }).catch(err => {
        console.warn('Không thể mở liên kết chuyến đi:', err);
      });
    }
  }, []);

  // 2. Thiết lập trạng thái DOM ban đầu bằng GSAP Context
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header giấu lên trên
      gsap.set(headerRef.current, { y: '-100%', opacity: 0 });
      // Sidebar giấu sang trái
      gsap.set(sidebarWrapperRef.current, { x: '-100%', opacity: 0 });
      // Backdrop che mờ bản đồ
      gsap.set(landingBackdropRef.current, { opacity: 1 });
      // Nội dung Landing Hero nằm ở vị trí tự nhiên
      gsap.set(landingHeroRef.current, { y: 0, opacity: 1 });
    }, appContainerRef);

    return () => ctx.revert();
  }, []);

  // 3. Kịch bản: Chuyển trực tiếp từ Landing Page vào Không gian Làm việc WebGIS
  const handleLaunchWorkspace = (presetPoiIds?: number[]) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Nếu người dùng chọn một Preset Lịch trình mẫu từ Landing Page
    if (presetPoiIds && presetPoiIds.length > 0) {
      setSelectedPoiIds(presetPoiIds);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsWorkspaceActive(true);
          setIsTransitioning(false);
          mapViewRef.current?.getMap()?.resize();
          // Tự động kích hoạt tính toán lộ trình ngay khi vừa chuyển màn hình nếu đã có presets
          if (presetPoiIds && presetPoiIds.length > 0) {
            handleRunOptimization(undefined, presetPoiIds);
          }
        }
      });

      // Bước 1: Trượt fade-up nhẹ toàn bộ nội dung Hero lên trên
      tl.to(landingHeroRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      });

      // Bước 2: Fade-out lớp backdrop để lộ bản đồ trực tiếp
      tl.to(landingBackdropRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          if (landingBackdropRef.current) {
            landingBackdropRef.current.style.pointerEvents = 'none';
          }
        }
      }, "-=0.15");

      // Căn chỉnh trực tiếp góc nhìn bản đồ làm việc (không zoom lượn từ trên cao xuống)
      mapViewRef.current?.flyDownToWorkspace();

      // Bước 3: Đưa thanh Sidebar và Header trượt vào ngay cùng lúc bản đồ xuất hiện
      tl.to(headerRef.current, {
        y: '0%',
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out'
      }, "-=0.2");

      tl.to(sidebarWrapperRef.current, {
        x: '0%',
        opacity: 1,
        duration: 0.45,
        ease: 'power3.out'
      }, "-=0.3");

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

      // Header và Sidebar thu hồi ra khỏi màn hình
      tl.to(headerRef.current, {
        y: '-100%',
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in'
      });

      tl.to(sidebarWrapperRef.current, {
        x: '-100%',
        opacity: 0,
        duration: 0.35,
        ease: 'power3.in'
      }, "-=0.2");

      // Đặt lại góc nhìn bản đồ
      mapViewRef.current?.flyBackToLanding();

      // Hiện lại lớp phủ Landing Page
      tl.to(landingBackdropRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
        onStart: () => {
          if (landingBackdropRef.current) {
            landingBackdropRef.current.style.pointerEvents = 'auto';
          }
        }
      }, "-=0.15");

      tl.to(landingHeroRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out'
      }, "-=0.25");

    }, appContainerRef);
  };

  // 5. Chức năng chạy Tối ưu hóa (Call FastAPI Endpoint qua Service kèm tham số ngữ cảnh)
  const handleRunOptimization = async (overrideHotelId?: number | unknown, overridePoiIds?: number[] | unknown) => {
    const validHotelId = typeof overrideHotelId === 'number' ? overrideHotelId : undefined;
    const hotelIdToUse = validHotelId !== undefined ? validHotelId : selectedHotelId;

    const validPoiIds = Array.isArray(overridePoiIds) && overridePoiIds.length > 0 
      ? overridePoiIds 
      : (selectedPoiIds.length > 0 ? selectedPoiIds : pois.slice(0, 6).map(p => p.id));

    if (validPoiIds.length === 0) {
      setNotification('Vui lòng chọn tối thiểu 2 điểm tham quan để tối ưu hóa lộ trình!');
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    setLoading(true);

    const payload: PlanRequest = {
      poi_ids: validPoiIds,
      days: days,
      transport_mode: transportMode,
      max_budget: maxBudget,
      min_stars: minStars,
      radius_meters: radiusMeters,
      weights: weights,
      selected_hotel_id: typeof hotelIdToUse === 'number' ? hotelIdToUse : undefined,
      traffic_multiplier: traffic?.multiplier || 1.0,
      weather_condition: weather?.condition || 'FAVORABLE'
    };

    try {
      const data = await optimizeItineraryApi(payload);
      setPlan(data);
      setBasePlan(data);
      setSelectedHotelId(data.selected_hotel.id);
      setApiStatus('online');
    } catch {
      setApiStatus('offline');
      setNotification('Không tìm thấy lộ trình phù hợp với bộ lọc hoặc máy chủ đang ngoại tuyến. Vui lòng thử lại!');
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Áp dụng kế hoạch sinh ra từ AI Prompt-to-Itinerary
  const handleApplyAiPlan = async (poiIds: number[], newDays: number, title: string) => {
    setSelectedPoiIds(poiIds);
    setDays(newDays);
    setItineraryTitle(title);
    setNotification(`AI đã lập thành công kế hoạch: "${title}"`);
    setTimeout(() => setNotification(null), 4000);

    const payload: PlanRequest = {
      poi_ids: poiIds,
      days: newDays,
      transport_mode: transportMode,
      max_budget: maxBudget,
      min_stars: minStars,
      radius_meters: radiusMeters,
      weights: weights,
      traffic_multiplier: traffic?.multiplier || 1.0,
      weather_condition: weather?.condition || 'FAVORABLE'
    };

    setLoading(true);
    try {
      const data = await optimizeItineraryApi(payload);
      setPlan(data);
      setBasePlan(data);
      setSelectedHotelId(data.selected_hotel.id);
      setApiStatus('online');
    } catch {
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

  // Bỏ chọn tất cả
  const handleClearPois = () => {
    setSelectedPoiIds([]);
  };

  // Chọn 6 điểm nổi tiếng nhất
  const handleSelectPopularPois = () => {
    const defaultIds = [1, 2, 3, 4, 5, 6];
    setSelectedPoiIds(defaultIds);
  };

  // Kích hoạt chế độ chọn tọa độ trên bản đồ
  const handleStartPickLocation = () => {
    setIsAddModalOpen(false); // Tạm ẩn modal thêm POI
    setIsPickingLocation(true); // Bật cờ chọn tọa độ trên MapView
    setNotification('Nhấp chuột vào một vị trí trên bản đồ để lấy tọa độ...');
    setTimeout(() => setNotification(null), 4000);
  };

  // Callback nhận tọa độ sau khi người dùng nhấp trên bản đồ
  const handleLocationPicked = (lat: number, lon: number) => {
    setPickedCoords({ lat, lon });
    setIsPickingLocation(false);
    setIsAddModalOpen(true); // Tự động mở lại modal với tọa độ vừa chọn
    setNotification(`Đã chọn tọa độ: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Thêm POI mới vào state danh sách và kích hoạt tính toán tối ưu lại lộ trình
  const handlePoiCreated = (newPoi: POI) => {
    setPois(prev => [newPoi, ...prev]);
    const updatedIds = [newPoi.id, ...selectedPoiIds];
    setSelectedPoiIds(updatedIds);
    setPickedCoords(null);
    setNotification(`Đã thêm "${newPoi.name}" và đang cập nhật tối ưu lộ trình...`);
    setTimeout(() => setNotification(null), 3500);

    // Tự động kích hoạt lại hàm tính toán tâm lưu trú Weiszfeld và OR-Tools TSP
    handleRunOptimization(undefined, updatedIds);
  };

  // Bật/tắt Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Xuất file Excel
  const handleExportExcel = () => {
    if (activePlan) {
      exportItineraryToExcel(activePlan);
      setNotification('Đã xuất file Excel kế hoạch du lịch thành công!');
      setTimeout(() => setNotification(null), 3500);
    } else {
      setNotification('Vui lòng bấm Tạo lộ trình trước khi xuất file!');
      setTimeout(() => setNotification(null), 3500);
    }
  };

  // Ngữ cảnh hành trình cung cấp cho Hà Nội Storyteller (AI)
  const storytellerContext = {
    pois: pois.filter(p => selectedPoiIds.includes(p.id)),
    selectedHotel: activePlan?.selected_hotel || null,
    days: days,
    transportMode: transportMode,
    weather: weather,
    traffic: traffic,
    itineraryTitle: itineraryTitle
  };

  return (
    <div ref={appContainerRef} className="h-screen w-screen relative bg-[#F8F5EE] text-[#1F2421] overflow-hidden font-sans select-none">
      
      {/* 1. MAP COMPONENT: TẦNG BACKGROUND TĨNH (z-0, w-full, h-full, Không unmount/remount) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <MapView
          ref={mapViewRef}
          pois={pois}
          selectedPoiIds={selectedPoiIds}
          plan={activePlan}
          selectedHotelId={selectedHotelId}
          onSelectHotel={handleSelectHotel}
          hoveredHotelId={hoveredHotelId}
          onHoverHotel={setHoveredHotelId}
          hoveredPoiId={hoveredPoiId}
          onHoverPoi={setHoveredPoiId}
          activeDayTab={activeDayTab}
          isWorkspaceActive={isWorkspaceActive}
          isPickingLocation={isPickingLocation}
          onLocationPicked={handleLocationPicked}
          pickedCoords={pickedCoords}
          onCancelPick={() => setIsPickingLocation(false)}
          onOpenPoiDetail={(poi: POI) => setSelectedPoiForDetail(poi)}
          onAddCustomPoi={handlePoiCreated}
        />

        {/* Real-time Context Adaptation Floating Banner */}
        {isWorkspaceActive && <SmartContextBanner />}
      </div>

      {/* 2. LANDING PAGE OVERLAY (Dedicated LandingHero Component, z-20) */}
      <LandingHero
        backdropRef={landingBackdropRef}
        heroRef={landingHeroRef}
        onLaunchWorkspace={handleLaunchWorkspace}
        isTransitioning={isTransitioning}
        pois={pois}
      />

      {/* 3. LIGHT TRAVEL WORKSPACE TOPBAR (.webgis-header, z-30) */}
      <header 
        ref={headerRef} 
        className="webgis-header absolute top-0 left-0 right-0 h-14 bg-[#FDFCF7]/95 border-b border-stone-200/90 px-4 sm:px-6 flex items-center justify-between z-30 backdrop-blur-md shadow-xs text-stone-800"
      >
        {/* TRÁI: Nút ← Trang chủ + Tên hành trình có thể đổi tên */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReturnToLanding}
            title="Quay về Trang chủ"
            className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-[#1C382B] hover:text-[#F8F5EE] border border-stone-200 text-[#1C382B] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </button>

          <div className="h-4 w-px bg-stone-300 hidden sm:block" />

          {/* Tên hành trình có thể sửa trực tiếp */}
          {isEditingTitle ? (
            <input
              type="text"
              value={itineraryTitle}
              onChange={(e) => setItineraryTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
              className="font-serif text-sm sm:text-base font-bold text-[#1C382B] bg-white border border-[#B85D3B] px-2.5 py-1 rounded-xl focus:outline-none shadow-xs"
            />
          ) : (
            <div 
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-2 font-serif text-sm sm:text-base font-bold text-[#1C382B] hover:text-[#B85D3B] cursor-pointer transition group select-none"
              title="Bấm để đổi tên hành trình"
            >
              <span>{itineraryTitle} ({days} Ngày)</span>
              <Edit3 className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#B85D3B] transition" />
            </div>
          )}

          {/* Badge Trạng thái Máy chủ API */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100/90 border border-stone-200 text-[11px] font-medium text-stone-600">
            <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{apiStatus === 'online' ? 'Hệ thống trực tuyến' : 'Chế độ ngoại tuyến'}</span>
          </div>
        </div>

        {/* PHẢI: Actions Bar & Công cụ Xuất dữ liệu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Nút Khám phá Lịch trình Cộng đồng */}
          <button
            onClick={() => setIsCommunityModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-[#1C382B] hover:text-[#F8F5EE] border border-amber-200/90 text-[#1C382B] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group"
            title="Khám phá các lịch trình do cộng đồng du khách chia sẻ"
          >
            <Users className="w-3.5 h-3.5 text-amber-700 group-hover:text-amber-300 transition" />
            <span className="font-bold">Cộng đồng</span>
          </button>

          {/* Real-time Context Status Pill (Weather & Traffic) */}
          <ContextStatusPill />

          {/* Nút Thêm POI tùy chỉnh */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-[#1C382B] text-xs font-semibold items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#1C382B]" />
            <span>Thêm điểm đến</span>
          </button>

          {/* Nút Xuất file Excel Kế hoạch chi tiết */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Xuất kế hoạch chi tiết ra file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          {/* Nút Quét QR Google Maps trên điện thoại */}
          <button
            onClick={() => {
              if (activePlan) {
                setIsQrModalOpen(true);
              } else {
                setNotification('Vui lòng tạo lộ trình trước khi mở bản đồ di động!');
                setTimeout(() => setNotification(null), 3000);
              }
            }}
            className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Quét mã QR mở lộ trình trực tiếp trên Google Maps điện thoại"
          >
            <Share2 className="w-3.5 h-3.5 text-[#B85D3B]" />
            <span className="hidden sm:inline">Google Maps</span>
          </button>

          {/* Nút Xuất thẻ ảnh Story Card 9:16 */}
          <button
            onClick={() => {
              if (activePlan) {
                setIsStoryModalOpen(true);
              } else {
                setNotification('Vui lòng tạo lộ trình trước khi xuất ảnh thẻ hành trình!');
                setTimeout(() => setNotification(null), 3000);
              }
            }}
            className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-[#B85D3B]/10 hover:text-[#B85D3B] border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Xuất thẻ ảnh hành trình tỉ lệ 9:16 chia sẻ Instagram/Story"
          >
            <Camera className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Xuất ảnh Story</span>
          </button>

          {/* Nút Người Dùng / Đăng Nhập & Phân Quyền RBAC */}
          {!isAuthenticated ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#1C382B] hover:bg-[#B85D3B] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Đăng nhập hoặc đăng ký tài khoản"
            >
              <UserIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>Đăng nhập</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs"
                title="Tài khoản cá nhân"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-6 h-6 rounded-full object-cover border border-stone-200" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#1C382B] text-white text-[10px] flex items-center justify-center font-bold">
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="hidden md:inline max-w-[110px] truncate">{user?.full_name}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isAdmin ? 'Admin' : 'Du khách'}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-stone-100 flex items-center gap-2.5">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover border border-stone-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1C382B] text-white text-xs flex items-center justify-center font-bold">
                        {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="truncate flex-1">
                      <div className="font-bold text-xs text-stone-900 truncate">{user?.full_name}</div>
                      <div className="text-[10px] text-stone-400 truncate flex items-center gap-1">
                        <span>{user?.email}</span>
                        {user?.auth_provider === 'google' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-50 text-blue-600 font-bold font-mono">Google</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setIsMyTripsOpen(true); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 hover:bg-stone-100 flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-stone-600" />
                        <span>Hành trình của tôi</span>
                      </span>
                      {savedTripsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#B85D3B] text-white text-[9px] font-bold">
                          {savedTripsCount}
                        </span>
                      )}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => { setIsAdminModalOpen(true); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2 transition cursor-pointer font-semibold"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                        <span>Bảng quản trị Admin</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-stone-100">
                    <button
                      onClick={() => { logout(); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nút Toàn màn hình */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 transition cursor-pointer shadow-2xs"
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Bật toàn màn hình'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* 4. WORKSPACE SIDEBAR WRAPPER (.webgis-sidebar, z-25) */}
      <div 
        ref={sidebarWrapperRef} 
        className="webgis-sidebar absolute top-14 left-0 bottom-0 w-full sm:w-[460px] lg:w-[480px] z-25 transition-transform"
      >
        <Sidebar
          pois={pois}
          selectedPoiIds={selectedPoiIds}
          onTogglePoi={handleTogglePoi}
          onSelectAllPois={handleSelectAllPois}
          onClearPois={handleClearPois}
          onSelectPopularPois={handleSelectPopularPois}
          days={days}
          onChangeDays={setDays}
          transportMode={transportMode}
          onChangeTransportMode={setTransportMode}
          maxBudget={maxBudget}
          onChangeMaxBudget={setMaxBudget}
          minStars={minStars}
          onChangeMinStars={setMinStars}
          radiusMeters={radiusMeters}
          onChangeRadiusMeters={setRadiusMeters}
          weights={weights}
          onChangeWeights={setWeights}
          onRunOptimization={handleRunOptimization}
          onApplyAiPlan={handleApplyAiPlan}
          plan={activePlan}
          loading={loading}
          selectedHotelId={selectedHotelId}
          onSelectHotel={handleSelectHotel}
          hoveredHotelId={hoveredHotelId}
          onHoverHotel={setHoveredHotelId}
          hoveredPoiId={hoveredPoiId}
          onHoverPoi={setHoveredPoiId}
          activeDayTab={activeDayTab}
          setActiveDayTab={setActiveDayTab}
          onOpenAddPoiModal={() => setIsAddModalOpen(true)}
          onOpenPoiDetail={(poi: POI) => setSelectedPoiForDetail(poi)}
          onOpenQrModal={() => setIsQrModalOpen(true)}
          onOpenStoryModal={() => setIsStoryModalOpen(true)}
          itineraryTitle={itineraryTitle}
        />
      </div>

      {/* 5. FLOATING NOTIFICATION TOAST (z-50) */}
      {notification && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#1C382B] text-white text-xs font-semibold rounded-2xl shadow-xl border border-[#B85D3B]/40 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <Info className="w-4 h-4 text-amber-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* 6. MODAL THÊM POI TÙY BIẾN (z-50) */}
      <AddPoiModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsPickingLocation(false);
        }}
        onSuccess={handlePoiCreated}
        onStartPickOnMap={handleStartPickLocation}
        pickedCoords={pickedCoords}
      />

      {/* 7. MODAL CHI TIẾT ĐỊA ĐIỂM (z-50) */}
      <PoiDetailModal
        poi={selectedPoiForDetail}
        isOpen={selectedPoiForDetail !== null}
        onClose={() => setSelectedPoiForDetail(null)}
        onTogglePoi={handleTogglePoi}
        isSelected={selectedPoiForDetail ? selectedPoiIds.includes(selectedPoiForDetail.id) : false}
      />

      {/* 8. MODAL DẪN ĐƯỜNG GOOGLE MAPS (QR Code, z-50) */}
      {activePlan && (
        <GoogleMapsQrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          plan={activePlan}
        />
      )}

      {/* 9. MODAL THẺ HÀNH TRÌNH ĐỂ LƯU ẢNH (Story Card Modal, z-50) */}
      {activePlan && (
        <StoryCardModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          plan={activePlan}
          tripTitle={itineraryTitle}
        />
      )}

      {/* 10. TRỢ LÝ VĂN HÓA HÀ NỘI STORYTELLER (AI FAB & CHATBOX) */}
      <StorytellerChat 
        context={storytellerContext} 
      />

      {/* 11. MODAL XÁC THỰC (Auth Modal, z-50) */}
      <AuthModal />

      {/* 12. MODAL HÀNH TRÌNH CỦA TÔI (My Trips Modal, z-50) */}
      <MyTripsModal onLoadTrip={handleLoadSavedTrip} />

      {/* 13. MODAL LỊCH TRÌNH CỘNG ĐỒNG (Community Feed Modal, z-50) */}
      <CommunityFeedModal 
        isOpen={isCommunityModalOpen} 
        onClose={() => setIsCommunityModalOpen(false)} 
        onLoadTrip={handleLoadSavedTrip} 
        allPois={pois} 
      />

      {/* 14. MODAL BẢNG QUẢN TRỊ ADMIN (Admin Panel, z-50) */}
      <AdminDashboardModal 
        pois={pois} 
        onPoiDeleted={(id) => setPois(prev => prev.filter(p => p.id !== id))} 
        onPoiApproved={(newPoi) => {
          setPois(prev => [newPoi, ...prev]);
          setNotification(`Đã duyệt điểm "${newPoi.name}" lên bản đồ!`);
          setTimeout(() => setNotification(null), 3500);
        }}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ContextAwareProvider>
        <WebGisApp />
      </ContextAwareProvider>
    </AuthProvider>
  );
};
export default App;
