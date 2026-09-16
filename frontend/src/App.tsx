import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sidebar } from './components/Sidebar';
import { MapView, MapViewHandle } from './components/MapView';
import { AddPoiModal } from './components/AddPoiModal';
import { PoiDetailModal } from './components/PoiDetailModal';
import { LandingHero } from './components/LandingHero';
import { GoogleMapsQrModal } from './components/editorial/GoogleMapsQrModal';
import { StoryCardModal } from './components/editorial/StoryCardModal';
import { POI, PlanResponse, PlanRequest, WeightsConfig } from './types';
import { exportItineraryToExcel } from './utils/excelExport';
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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

      // Fallback cục bộ nếu backend chưa kết nối (kèm ảnh chất lượng cao)
      const fallbackPois: POI[] = [
        { 
          id: 1, 
          name: 'Hồ Hoàn Kiếm & Đền Ngọc Sơn', 
          category: 'heritage', 
          lat: 21.0287, 
          lon: 105.8523, 
          estimated_duration_min: 60, 
          ticket_price: 30000, 
          description: 'Trái tim của Thủ đô ngàn năm văn hiến, cầu Thê Húc đỏ son và Tháp Rùa cổ kính.',
          image_url: '/ho-hoan-kiem.jpg'
        },
        { 
          id: 2, 
          name: 'Lăng Chủ tịch Hồ Chí Minh & Ba Đình', 
          category: 'heritage', 
          lat: 21.0368, 
          lon: 105.8346, 
          estimated_duration_min: 120, 
          ticket_price: 0, 
          description: 'Quảng trường Ba Đình lịch sử, Lăng Bác và chùa Một Cột ngàn năm tuổi.',
          image_url: '/lang-bac.jpg'
        },
        { 
          id: 3, 
          name: 'Văn Miếu - Quốc Tử Giám', 
          category: 'heritage', 
          lat: 21.0293, 
          lon: 105.8359, 
          estimated_duration_min: 90, 
          ticket_price: 30000, 
          description: 'Trường đại học đầu tiên của Việt Nam với Khuê Văn Các biểu tượng hiếu học.',
          image_url: '/landing-bg.webp'
        },
        { 
          id: 4, 
          name: 'Khu Phố Cổ Hà Nội (36 Phố Phường)', 
          category: 'culinary', 
          lat: 21.0366, 
          lon: 105.8500, 
          estimated_duration_min: 90, 
          ticket_price: 0, 
          description: 'Mái ngói rêu phong và thiên đường ẩm thực phở, bún chả, cà phê trứng trứ danh.',
          image_url: '/36-pho_phuong.jpg'
        },
        { 
          id: 5, 
          name: 'Hồ Tây & Chùa Trấn Quốc', 
          category: 'nature', 
          lat: 21.0545, 
          lon: 105.8285, 
          estimated_duration_min: 90, 
          ticket_price: 0, 
          description: 'Hồ nước tự nhiên lộng gió và ngôi cổ tự nghìn năm trên đảo cá.',
          image_url: '/chua-tran-quoc.jpg'
        },
        { 
          id: 6, 
          name: 'Hoàng thành Thăng Long', 
          category: 'heritage', 
          lat: 21.0353, 
          lon: 105.8402, 
          estimated_duration_min: 120, 
          ticket_price: 30000, 
          description: 'Quần thể di sản văn hóa thế giới nghìn năm lịch sử Thăng Long.',
          image_url: '/hoang-thanh.jpg'
        },
        { 
          id: 7, 
          name: 'Bảo tàng Dân tộc học Việt Nam', 
          category: 'museum', 
          lat: 21.0406, 
          lon: 105.7984, 
          estimated_duration_min: 120, 
          ticket_price: 40000, 
          description: 'Không gian văn hóa đặc sắc của 54 dân tộc anh em Việt Nam.',
          image_url: '/bao_tang_dan_toc.webp'
        },
        {
          id: 16,
          name: 'Lotte Mall West Lake Hanoi (Lotte Tây Hồ)',
          category: 'shopping',
          lat: 21.0754,
          lon: 105.8122,
          estimated_duration_min: 120,
          ticket_price: 0,
          description: 'Đại siêu thị và tổ hợp mua sắm, thủy cung và đại lộ thời trang view Hồ Tây tuyệt đẹp.',
          image_url: 'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 17,
          name: 'Tràng Tiền Plaza & Phố Đi Bộ Hồ Gươm',
          category: 'shopping',
          lat: 21.0258,
          lon: 105.8546,
          estimated_duration_min: 60,
          ticket_price: 0,
          description: 'Biểu tượng mua sắm xa xỉ và cổ kính nhất Thủ đô từ năm 1901 ngay sát bờ Hồ Gươm.',
          image_url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 18,
          name: 'Vincom Mega Mall Times City & Thủy Cung',
          category: 'shopping',
          lat: 20.9950,
          lon: 105.8677,
          estimated_duration_min: 120,
          ticket_price: 0,
          description: 'Đại TTTM ngầm khổng lồ với thủy cung Vinpearl Aquarium và quảng trường nhạc nước.',
          image_url: 'https://images.unsplash.com/photo-1567449303078-57ad995bd301?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 19,
          name: 'Aeon Mall Long Biên',
          category: 'shopping',
          lat: 21.0264,
          lon: 105.9015,
          estimated_duration_min: 120,
          ticket_price: 0,
          description: 'Đại siêu thị mua sắm và ẩm thực chuẩn phong cách Nhật Bản Omotenashi rộng rãi.',
          image_url: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 20,
          name: 'Lotte Center Hà Nội (Liễu Giai) & Sky Walk',
          category: 'shopping',
          lat: 21.0333,
          lon: 105.8130,
          estimated_duration_min: 90,
          ticket_price: 0,
          description: 'Tòa tháp 65 tầng biểu tượng với TTTM cao cấp và đài quan sát sàn kính Sky Walk tầng 65.',
          image_url: 'https://images.unsplash.com/photo-1561069489-c5c56c21e3f8?auto=format&fit=crop&w=800&q=80'
        }
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
  const handleRunOptimization = async (overrideHotelId?: number | unknown, overridePoiIds?: number[] | unknown) => {
    // Chỉ nhận ID số hợp lệ, tuyệt đối không nhận React MouseEvent object
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
        const errText = await res.text();
        console.error('FastAPI error response:', res.status, errText);
        setNotification('Không tìm thấy lộ trình phù hợp với bộ lọc hiện tại. Vui lòng mở rộng ngân sách hoặc bán kính!');
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.warn('Lỗi kết nối FastAPI backend:', err);
      setApiStatus('offline');
      setNotification('Không thể kết nối đến máy chủ tính toán. Vui lòng kiểm tra lại dịch vụ backend!');
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

  // Chia sẻ lộ trình
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setNotification('Đã sao chép liên kết chia sẻ lộ trình của bạn!');
      setTimeout(() => setNotification(null), 3500);
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
        </div>

        {/* PHẢI: Chia sẻ, Xuất Excel, Toàn màn hình & Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Nút Chia sẻ lộ trình */}
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Chia sẻ lộ trình"
          >
            <Share2 className="w-3.5 h-3.5 text-[#B85D3B]" />
            <span className="hidden md:inline">Chia sẻ</span>
          </button>

          {/* Nút Xuất Excel */}
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Xuất file Excel kế hoạch du lịch"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Xuất Excel</span>
          </button>

          <div className="h-4 w-px bg-stone-200 hidden sm:block" />

          {/* Toàn màn hình */}
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* User Avatar */}
          <div 
            title="Tài khoản du khách" 
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1C382B] to-[#B85D3B] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white cursor-pointer select-none"
          >
            HN
          </div>
        </div>
      </header>

      {/* 4. WEBGIS WORKSPACE SIDEBAR (.webgis-sidebar, z-30) */}
      <div 
        ref={sidebarWrapperRef} 
        className="webgis-sidebar absolute left-0 top-14 bottom-0 z-30 w-[420px] lg:w-[440px] shadow-2xl"
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
          transportMode={transportMode}
          onChangeTransportMode={setTransportMode}
          maxBudget={maxBudget}
          onChangeMaxBudget={setMaxBudget}
          minStars={minStars}
          onChangeMinStars={setMinStars}
          radiusMeters={radiusMeters}
          onChangeRadiusMeters={setRadiusMeters}
          onRunOptimization={() => handleRunOptimization()}
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
          onOpenQrModal={() => setIsQrModalOpen(true)}
          onOpenStoryModal={() => setIsStoryModalOpen(true)}
        />
      </div>

      {/* TOAST THÔNG BÁO LIGHT TRAVEL */}
      {notification && (
        <div className="fixed top-16 right-5 z-50 bg-[#1C382B] text-[#F8F5EE] font-medium text-xs py-3 px-4 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-[#B85D3B]" />
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

      {/* MODULE 1: MODAL DẪN ĐƯỜNG GOOGLE MAPS (QR CODE) */}
      <GoogleMapsQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        plan={plan}
        pois={pois}
      />

      {/* MODULE 1: MODAL XUẤT STORY CARD 9:16 */}
      <StoryCardModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        plan={plan}
        tripTitle={itineraryTitle}
      />
    </div>
  );
};
