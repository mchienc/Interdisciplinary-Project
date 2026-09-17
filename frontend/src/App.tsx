import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sidebar } from './components/workspace/Sidebar';
import { MapView, MapViewHandle } from './components/map/MapView';
import { AddPoiModal } from './components/common/AddPoiModal';
import { PoiDetailModal } from './components/common/PoiDetailModal';
import { LandingHero } from './components/landing/LandingHero';
import { GoogleMapsQrModal } from './components/common/GoogleMapsQrModal';
import { StoryCardModal } from './components/common/StoryCardModal';
import { POI, PlanResponse, PlanRequest, WeightsConfig } from './types';
import { exportItineraryToExcel } from './utils/excelExport';
import { FALLBACK_POIS } from './constants/mockData';
import { fetchPoisApi, optimizeItineraryApi } from './services/api';
import { 
  Compass, 
  Sparkles, 
  Maximize, 
  Minimize, 
  Share2, 
  FileSpreadsheet, 
  Edit3, 
  ArrowLeft 
} from 'lucide-react';

export const App: React.FC = () => {
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
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeDayTab, setActiveDayTab] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('offline');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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

  // 1. Tải danh sách POIs ban đầu
  useEffect(() => {
    const fetchPois = async () => {
      try {
        const data = await fetchPoisApi();
        setPois(data);
        setSelectedPoiIds(data.slice(0, 6).map((p: POI) => p.id));
        setApiStatus('online');
        return;
      } catch {
        setApiStatus('offline');
      }

      // Fallback cục bộ nếu backend chưa kết nối
      setPois(FALLBACK_POIS);
      setSelectedPoiIds(FALLBACK_POIS.slice(0, 6).map(p => p.id));
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
          // Tự động kích hoạt tính toán lộ trình ngay khi vừa chuyển màn hình nếu đã có presets
          if (presetPoiIds && presetPoiIds.length > 0) {
            handleRunOptimization(undefined, presetPoiIds);
          }
        }
      });

      // Bước 1: Trượt fade-up nhẹ toàn bộ nội dung Hero lên trên
      tl.to(landingHeroRef.current, {
        y: -40,
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

  // 5. Chức năng chạy Tối ưu hóa (Call FastAPI Endpoint qua Service)
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
      selected_hotel_id: typeof hotelIdToUse === 'number' ? hotelIdToUse : undefined
    };

    try {
      const data = await optimizeItineraryApi(payload);
      setPlan(data);
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

  // Chọn 6 điểm nổi tiếng
  const handleSelectPopularPois = () => {
    setSelectedPoiIds(pois.slice(0, 6).map(p => p.id));
  };

  // Bật chế độ Pick vị trí trên bản đồ
  const handleStartPickLocation = () => {
    setIsPickingLocation(true);
    setNotification('Click vào bất kỳ điểm nào trên bản đồ để chọn tọa độ!');
    setTimeout(() => setNotification(null), 4000);
  };

  // Nhận tọa độ đã pick từ MapView
  const handleLocationPicked = (lat: number, lon: number) => {
    setPickedCoords({ lat, lon });
    setIsPickingLocation(false);
    setIsAddModalOpen(true); // Tự động mở lại modal với tọa độ vừa chọn
    setNotification(`Đã chọn tọa độ: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Thêm POI mới vào state danh sách
  const handlePoiCreated = (newPoi: POI) => {
    setPois(prev => [newPoi, ...prev]);
    setSelectedPoiIds(prev => [newPoi.id, ...prev]);
    setPickedCoords(null);
    setNotification(`Đã thêm "${newPoi.name}" vào danh sách!`);
    setTimeout(() => setNotification(null), 3500);
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
    if (plan) {
      exportItineraryToExcel(plan);
      setNotification('Đã xuất file Excel kế hoạch du lịch thành công!');
      setTimeout(() => setNotification(null), 3500);
    } else {
      setNotification('Vui lòng bấm Tạo lộ trình trước khi xuất file!');
      setTimeout(() => setNotification(null), 3500);
    }
  };

  return (
    <div ref={appContainerRef} className="h-screen w-screen relative bg-[#F8F5EE] text-[#1F2421] overflow-hidden font-sans select-none">
      
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
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100/90 border border-stone-200 text-[11px] font-medium text-stone-600">
            <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{apiStatus === 'online' ? 'SDSS Engine Sẵn sàng' : 'Dữ liệu Nội bộ (Offline)'}</span>
          </div>
        </div>

        {/* PHẢI: Actions Bar & Công cụ Xuất dữ liệu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Nút Thêm POI tùy chỉnh */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-[#1C382B] text-xs font-semibold items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <span>✨</span>
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
              if (plan) {
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
            <span className="hidden md:inline">Google Maps</span>
          </button>

          {/* Nút Xuất Ảnh Thẻ Hành Trình (Story Card) */}
          <button
            onClick={() => {
              if (plan) {
                setIsStoryModalOpen(true);
              } else {
                setNotification('Vui lòng tạo lộ trình trước khi lưu ảnh kỷ niệm!');
                setTimeout(() => setNotification(null), 3000);
              }
            }}
            className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Tạo ảnh kỷ niệm hành trình đẹp để chia sẻ mạng xã hội"
          >
            <span>📸</span>
            <span className="hidden md:inline">Lưu ảnh</span>
          </button>

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
          plan={plan}
          loading={loading}
          selectedHotelId={selectedHotelId}
          onSelectHotel={handleSelectHotel}
          hoveredHotelId={hoveredHotelId}
          onHoverHotel={setHoveredHotelId}
          activeDayTab={activeDayTab}
          setActiveDayTab={setActiveDayTab}
          onOpenAddPoiModal={() => setIsAddModalOpen(true)}
          onOpenPoiDetail={(poi: POI) => setSelectedPoiForDetail(poi)}
        />
      </div>

      {/* 5. FLOATING NOTIFICATION TOAST (z-50) */}
      {notification && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#1C382B] text-white text-xs font-semibold rounded-2xl shadow-xl border border-[#B85D3B]/40 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#B85D3B]" />
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
      {plan && (
        <GoogleMapsQrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          plan={plan}
        />
      )}

      {/* 9. MODAL THẺ HÀNH TRÌNH ĐỂ LƯU ẢNH (Story Card Modal, z-50) */}
      {plan && (
        <StoryCardModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          plan={plan}
          tripTitle={itineraryTitle}
        />
      )}

    </div>
  );
};
