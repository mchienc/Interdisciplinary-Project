import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as maplibregl from 'maplibre-gl';
import gsap from 'gsap';
import { 
  Layers, 
  Maximize2, 
  Compass, 
  Target, 
  Info, 
  MapPin, 
  Navigation,
  Sparkles,
  ChevronDown,
  Clock,
  Ticket
} from 'lucide-react';
import { POI, Accommodation, PlanResponse } from '../../types';
import { DAY_COLORS, BASEMAP_STYLES, HANOI_LNG_LAT, MAP_DEFAULT_ZOOM } from '../../constants/map';
import { CATEGORY_ICONS, CATEGORY_NAMES } from '../../constants/categories';

export interface MapViewHandle {
  flyDownToWorkspace: (onArrival?: () => void) => void;
  flyBackToLanding: () => void;
  getMap: () => maplibregl.Map | null;
}

interface MapViewProps {
  pois: POI[];
  selectedPoiIds: number[];
  plan: PlanResponse | null;
  selectedHotelId: number | null;
  onSelectHotel: (hotelId: number) => void;
  hoveredHotelId?: number | null;
  onHoverHotel?: (id: number | null) => void;
  activeDayTab: number | null;
  isWorkspaceActive?: boolean;
  isPickingLocation?: boolean;
  onLocationPicked?: (lat: number, lon: number) => void;
  pickedCoords?: { lat: number; lon: number } | null;
  onCancelPick?: () => void;
  onOpenPoiDetail?: (poi: POI) => void;
}

// Màu sắc tươi sáng, hài hòa theo phong cách du lịch thảnh thơi
// DAY_COLORS imported from constants/map

// CATEGORY_ICONS imported from constants/categories

// CATEGORY_NAMES imported from constants/categories

// BASEMAP_STYLES imported from constants/map

// Helper tính toán vòng tròn địa lý 1km (~15 phút đi bộ) xung quanh khách sạn
const createCircleGeoJSON = (lon: number, lat: number, radiusMeters: number = 1000, points: number = 64) => {
  const coords: [number, number][] = [];
  const distanceX = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  const distanceY = radiusMeters / 110540;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lon + x, lat + y]);
  }
  coords.push(coords[0]); // Đóng vòng polygon

  return {
    type: 'Feature' as const,
    properties: {
      title: 'Vùng đi bộ 15 phút (~1.0 km)'
    },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords]
    }
  };
};

export const MapView = forwardRef<MapViewHandle, MapViewProps>(({
  pois,
  selectedPoiIds,
  plan,
  selectedHotelId,
  onSelectHotel,
  hoveredHotelId,
  onHoverHotel,
  activeDayTab,
  isWorkspaceActive = false,
  isPickingLocation = false,
  onLocationPicked,
  pickedCoords,
  onCancelPick,
  onOpenPoiDetail
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const hotelMarkerElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const routeTweensRef = useRef<gsap.core.Tween[]>([]);

  // State điều khiển bản đồ - Mặc định là 'voyager' (Carto Voyager Light Travel)
  const [currentBasemap, setCurrentBasemap] = useState<string>('voyager');
  const [isBasemapDropdownOpen, setIsBasemapDropdownOpen] = useState<boolean>(false);
  const [is3D, setIs3D] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Module 2: State cho 3D Cinematic Fly-Through & Walking Isochrone
  const [isCinematicPlaying, setIsCinematicPlaying] = useState<boolean>(false);
  const [cinematicStop, setCinematicStop] = useState<{
    name: string;
    stage: string;
    icon: string;
    desc?: string;
  } | null>(null);
  const cinematicTimeoutRef = useRef<number | null>(null);
  const [showIsochrone, setShowIsochrone] = useState<boolean>(false);

  // Expose camera fly methods ra bên ngoài component cho Landing Hero Orchestrator
  useImperativeHandle(ref, () => ({
    flyDownToWorkspace: (onArrival?: () => void) => {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo({
        center: [105.8523, 21.0287], // Hồ Hoàn Kiếm
        zoom: 13.6,
        pitch: 30,
        bearing: -12,
        duration: 2200,
        essential: true,
        curve: 1.42,
        speed: 0.8
      });
      if (onArrival) {
        map.once('moveend', onArrival);
      }
    },
    flyBackToLanding: () => {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo({
        center: [105.8523, 21.0287],
        zoom: 10.5,
        pitch: 0,
        bearing: 0,
        duration: 1800,
        essential: true
      });
    },
    getMap: () => mapRef.current
  }));

  // 1. Khởi tạo Bản đồ MapLibre GL với basemap Voyager nhẹ nhàng
  useEffect(() => {
    if (!mapContainer.current) return;

    const initialStyle = BASEMAP_STYLES.voyager;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'basemap-source': {
            type: 'raster',
            tiles: [initialStyle.tileUrl],
            tileSize: 256,
            attribution: '&copy; CartoDB &copy; OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'basemap-layer',
            type: 'raster',
            source: 'basemap-source',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: [105.8523, 21.0287], // Tọa độ trung tâm Hà Nội
      zoom: 10.5, // Zoom bao quát toàn cảnh thành phố cho Landing Page
      pitch: 0
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // 2. Chuyển đổi Bản đồ nền (Basemap Switcher)
  const switchBasemap = (key: string) => {
    setCurrentBasemap(key);
    setIsBasemapDropdownOpen(false);

    const map = mapRef.current;
    if (!map) return;

    const basemapConfig = BASEMAP_STYLES[key];
    if (!basemapConfig) return;

    try {
      if (map.getLayer('basemap-layer')) {
        map.removeLayer('basemap-layer');
      }
      if (map.getSource('basemap-source')) {
        map.removeSource('basemap-source');
      }

      map.addSource('basemap-source', {
        type: 'raster',
        tiles: [basemapConfig.tileUrl],
        tileSize: 256,
        attribution: '&copy; CartoDB &copy; OpenStreetMap'
      });

      // Đặt layer nền bên dưới các layer route
      const layers = map.getStyle().layers;
      let firstRouteLayer = undefined;
      if (layers) {
        for (const l of layers) {
          if (l.id.startsWith('route-')) {
            firstRouteLayer = l.id;
            break;
          }
        }
      }

      map.addLayer(
        {
          id: 'basemap-layer',
          type: 'raster',
          source: 'basemap-source',
          minzoom: 0,
          maxzoom: 20
        },
        firstRouteLayer
      );
    } catch (e) {
      console.warn('Error switching basemap layer:', e);
    }
  };

  // 3. Render Tuyến đường Lộ trình với GSAP Polyline Drawing Animation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateRoutes = () => {
      // Dọn dẹp các tween vẽ đường đang chạy
      routeTweensRef.current.forEach(t => t.kill());
      routeTweensRef.current = [];

      // Xóa các layer route cũ
      for (let d = 1; d <= 7; d++) {
        if (map.getLayer(`route-casing-day-${d}`)) map.removeLayer(`route-casing-day-${d}`);
        if (map.getLayer(`route-line-day-${d}`)) map.removeLayer(`route-line-day-${d}`);
        if (map.getSource(`route-source-day-${d}`)) map.removeSource(`route-source-day-${d}`);
      }

      if (!plan || !plan.daily_itineraries) return;

      const bounds = new maplibregl.LngLatBounds();

      plan.daily_itineraries.forEach((dayItinerary) => {
        const day = dayItinerary.day;
        const color = DAY_COLORS[(day - 1) % DAY_COLORS.length];
        const isDimmed = activeDayTab !== null && activeDayTab !== day;
        const shouldAnimate = activeDayTab === null || activeDayTab === day;
        const fullCoords = dayItinerary.route_geojson?.geometry?.coordinates || [];

        const sourceId = `route-source-day-${day}`;
        const initialCoords = (shouldAnimate && fullCoords.length >= 2) ? [fullCoords[0], fullCoords[1]] : fullCoords;

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: initialCoords
            }
          }
        });

        // Đường viền Halo trắng tinh tế (White Casing) cho bản đồ sáng
        map.addLayer({
          id: `route-casing-day-${day}`,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 7,
            'line-opacity': isDimmed ? 0.3 : 0.85
          }
        });

        // Tuyến đường chính với màu sắc theo ngày
        map.addLayer({
          id: `route-line-day-${day}`,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': color,
            'line-width': isDimmed ? 2.5 : 4.5,
            'line-opacity': isDimmed ? 0.25 : 0.95
          }
        });

        // GSAP Polyline interpolation vẽ mượt mà từ điểm đầu đến các điểm kế tiếp
        if (shouldAnimate && fullCoords.length > 2) {
          const tweenObj = { progress: 0 };
          const tween = gsap.to(tweenObj, {
            progress: 1,
            duration: 1.1,
            ease: 'power2.out',
            onUpdate: () => {
              const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
              if (!src) return;
              const count = Math.max(2, Math.floor(tweenObj.progress * fullCoords.length));
              src.setData({
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: fullCoords.slice(0, count)
                }
              });
            }
          });
          routeTweensRef.current.push(tween);
        }

        // Mở rộng bounds theo tab ngày được chọn
        if (activeDayTab === null || activeDayTab === day) {
          fullCoords.forEach((pt: [number, number]) => {
            bounds.extend([pt[0], pt[1]]);
          });
        }
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 900 });
      }
    };

    if (map.isStyleLoaded()) {
      updateRoutes();
    } else {
      map.once('load', updateRoutes);
    }

    return () => {
      routeTweensRef.current.forEach(t => t.kill());
      routeTweensRef.current = [];
    };
  }, [plan, activeDayTab]);

  // 4. Render Markers (POIs giọt nước, Điểm lưu trú đề xuất, Tâm lý tưởng)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Xóa toàn bộ marker cũ
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Từ điển tra cứu POI theo ngày và số thứ tự ghé thăm
    const poiDayMap = new Map<number, { day: number; seq: number }>();
    if (plan && plan.daily_itineraries) {
      plan.daily_itineraries.forEach((dayItin) => {
        dayItin.visit_sequence.forEach((p, idx) => {
          poiDayMap.set(p.id, { day: dayItin.day, seq: idx + 1 });
        });
      });
    }

    // A. Vẽ các Marker POI (Điểm du lịch dạng giọt nước tinh tế)
    pois.forEach((poi) => {
      const isSelected = selectedPoiIds.includes(poi.id);
      const dayInfo = poiDayMap.get(poi.id);

      const el = document.createElement('div');
      el.className = 'cursor-pointer transition-transform duration-200 hover:scale-125 z-10';

      let bgColor = '#78716c';
      let badgeText = CATEGORY_ICONS[poi.category] || '📍';

      if (dayInfo) {
        bgColor = DAY_COLORS[(dayInfo.day - 1) % DAY_COLORS.length];
        badgeText = `${dayInfo.seq}`;
      } else if (isSelected) {
        bgColor = '#1C382B'; // Forest green
        badgeText = '✓';
      }

      el.innerHTML = `
        <div class="group relative flex flex-col items-center">
          <div style="background-color: ${bgColor};" class="w-8 h-8 rounded-full rounded-br-none -rotate-45 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-md shadow-stone-900/20 transition-transform duration-200 group-hover:scale-115">
            <span class="rotate-45 select-none">${badgeText}</span>
          </div>
          ${dayInfo ? `<div class="mt-0.5 px-1.5 py-0.2 rounded-full bg-white/95 border border-stone-200 text-[9px] font-bold text-stone-800 shadow-xs whitespace-nowrap">Chặng #${dayInfo.seq}</div>` : ''}
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 20, closeButton: true }).setHTML(`
        <div class="space-y-2.5 max-w-xs p-1 text-stone-800">
          ${poi.image_url ? `
            <div class="relative h-28 w-full rounded-2xl overflow-hidden border border-stone-200 shadow-xs mb-1">
              <img src="${poi.image_url}" alt="${poi.name}" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <span class="absolute bottom-2 left-2 text-[10px] bg-[#B85D3B] text-white font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                ${CATEGORY_NAMES[poi.category] || poi.category}
              </span>
            </div>
          ` : ''}
          <div class="font-serif text-sm font-bold text-[#1C382B] leading-snug">${poi.name}</div>
          <p class="text-xs text-stone-600 leading-relaxed line-clamp-2">${poi.description || ''}</p>
          <div class="text-[11px] text-stone-500 pt-1.5 border-t border-stone-200 flex items-center justify-between">
            <span>🎟️ Giá vé:</span>
            <b class="text-[#B85D3B] font-medium">${poi.ticket_price === 0 ? 'Miễn phí' : poi.ticket_price.toLocaleString('vi-VN') + ' đ'}</b>
          </div>
          ${dayInfo ? `
            <div class="bg-stone-100 p-2 rounded-xl border border-stone-200 text-[11px] font-medium text-[#1C382B] flex items-center gap-1.5">
              <span>✨</span> Lộ trình Ngày ${dayInfo.day} • Chặng ghé thăm #${dayInfo.seq}
            </div>` : ''}
          <button id="poi-detail-btn-${poi.id}" class="w-full mt-1.5 py-2 px-3 bg-[#1C382B] hover:bg-[#B85D3B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer">
            <span>Xem chi tiết & gợi ý</span>
          </button>
        </div>
      `);

      popup.on('open', () => {
        const btn = document.getElementById(`poi-detail-btn-${poi.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onOpenPoiDetail) onOpenPoiDetail(poi);
          };
        }
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([poi.lon, poi.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // B. Vẽ Marker Trung vị Hình học (Tâm Không Gian Lý Tưởng) 🎯
    if (plan && plan.geometric_median) {
      const med = plan.geometric_median;
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center cursor-pointer z-25';
      el.innerHTML = `
        <div class="radar-ring-1"></div>
        <div class="radar-ring-2"></div>
        <div class="w-7 h-7 rounded-full bg-[#1C382B] text-white flex items-center justify-center border-2 border-white shadow-lg text-xs font-bold z-10 transition-transform hover:scale-125">
          🎯
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="space-y-2 max-w-sm p-1 text-stone-800">
          <div class="flex items-center gap-1.5 text-[#B85D3B] font-bold text-xs uppercase tracking-wider">
            <span>🎯</span>
            Tọa Độ Trung Tâm Lý Tưởng
          </div>
          <div class="font-serif text-sm font-bold text-[#1C382B]">Điểm Lưu Trú Thuận Tiện Nhất (L1-Median)</div>
          <div class="text-xs text-stone-600">
            Tọa độ toán học giúp tổng quãng đường di chuyển tới các điểm tham quan là ngắn nhất.
          </div>
          <div class="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-[11px] space-y-1 text-stone-700">
            <div>📍 Vĩ độ: <b class="font-mono text-stone-900">${med.lat.toFixed(4)}</b>, Kinh độ: <b class="font-mono text-stone-900">${med.lon.toFixed(4)}</b></div>
            <div>📏 Khoảng cách trung bình tới các điểm: <b class="text-[#1C382B]">${med.mean_distance_to_pois_km} km</b></div>
            <div class="text-[#0F766E] font-semibold">⚡ Tiết kiệm so với chọn tự phát: +${med.centroid_comparison_gain_km} km</div>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([med.lon, med.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    }

    // C. Vẽ Marker Khách sạn Đề xuất (Accommodations) 🏨
    hotelMarkerElementsRef.current.clear();
    if (plan && plan.recommended_accommodations) {
      plan.recommended_accommodations.forEach((hotel, idx) => {
        const isChosen = (selectedHotelId === hotel.id) || (!selectedHotelId && idx === 0);

        const el = document.createElement('div');
        el.className = `cursor-pointer transition-all duration-200 ${isChosen ? 'scale-115 z-30' : 'z-20'}`;

        el.addEventListener('mouseenter', () => onHoverHotel?.(hotel.id));
        el.addEventListener('mouseleave', () => onHoverHotel?.(null));

        const rankStr = `0${idx + 1}`.slice(-2);

        el.innerHTML = `
          <div class="relative flex flex-col items-center">
            ${isChosen ? `
              <div class="radar-hotel-1"></div>
              <div class="radar-hotel-2"></div>
            ` : ''}
            <div class="px-2 py-0.5 rounded-full text-[9px] font-bold ${
              isChosen 
                ? 'bg-[#B85D3B] text-white shadow-md ring-2 ring-white' 
                : 'bg-white text-stone-700 border border-stone-200 shadow-xs'
            } mb-1 whitespace-nowrap z-10">
              ${isChosen ? '★ ĐIỂM NGHỈ TỐI ƯU' : `#${rankStr}`}
            </div>
            <div class="w-8 h-8 rounded-2xl ${
              isChosen 
                ? 'bg-gradient-to-tr from-[#B85D3B] to-[#D97706] text-white ring-2 ring-white shadow-xl' 
                : 'bg-white border border-stone-200 text-[#B85D3B] shadow-md'
            } flex items-center justify-center text-sm z-10">
              🏨
            </div>
          </div>
        `;

        hotelMarkerElementsRef.current.set(hotel.id, el);

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div class="space-y-2.5 min-w-[240px] p-1 text-stone-800">
            <div class="flex items-center justify-between">
              <span class="text-[10px] bg-[#B85D3B]/10 text-[#B85D3B] font-semibold px-2 py-0.5 rounded-full uppercase">
                Gợi ý #${idx + 1} &bull; ${hotel.stars}★
              </span>
              <span class="text-xs text-amber-500 font-bold">★ ${hotel.rating}</span>
            </div>
            <div class="font-serif text-sm font-bold text-[#1C382B]">${hotel.name}</div>
            <div class="text-[11px] text-stone-500">📍 ${hotel.address || 'Hà Nội'}</div>
            <div class="text-xs text-[#B85D3B] font-bold">
              💰 ${(hotel.price_per_night / 1000).toLocaleString()}k đ / đêm
            </div>
            ${hotel.distance_to_median_m ? `<div class="text-[11px] text-stone-600">📏 Cách tâm lý tưởng: <b class="text-[#0F766E] font-medium">${hotel.distance_to_median_m.toLocaleString()} m</b></div>` : ''}
            
            <button 
              id="select-hotel-btn-${hotel.id}" 
              class="w-full mt-2 py-2 px-3 rounded-xl text-xs font-semibold transition text-center cursor-pointer ${
                isChosen 
                  ? 'bg-[#1C382B] text-white shadow-sm' 
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
              }"
            >
              ${isChosen ? '✓ Đang chọn làm điểm lưu trú' : '👉 Chọn khách sạn này & tính lại'}
            </button>
          </div>
        `);

        popup.on('open', () => {
          setTimeout(() => {
            const btn = document.getElementById(`select-hotel-btn-${hotel.id}`);
            if (btn) {
              btn.onclick = () => {
                onSelectHotel(hotel.id);
                popup.remove();
              };
            }
          }, 100);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([hotel.lon, hotel.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // D. Marker xem trước tọa độ đang chọn (Picked Coords)
    if (pickedCoords) {
      const el = document.createElement('div');
      el.className = 'w-9 h-9 rounded-full bg-[#B85D3B] text-white flex items-center justify-center border-2 border-white shadow-2xl text-base font-bold animate-bounce z-40 ring-4 ring-[#B85D3B]/30';
      el.innerHTML = '📍';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pickedCoords.lon, pickedCoords.lat])
        .addTo(map);

      markersRef.current.push(marker);
    }
  }, [pois, selectedPoiIds, plan, selectedHotelId, pickedCoords]);

  // 5. Đồng bộ hiệu ứng hover khách sạn từ Sidebar
  useEffect(() => {
    hotelMarkerElementsRef.current.forEach((el, id) => {
      if (id === hoveredHotelId) {
        el.classList.add('scale-125', 'z-40');
      } else {
        el.classList.remove('scale-125', 'z-40');
      }
    });
  }, [hoveredHotelId]);

  // 6. Xử lý sự kiện click chọn tọa độ trên bản đồ
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      if (isPickingLocation && onLocationPicked) {
        onLocationPicked(e.lngLat.lat, e.lngLat.lng);
      }
    };

    if (isPickingLocation) {
      map.getCanvas().style.cursor = 'crosshair';
      map.on('click', handleMapClick);
    } else {
      map.getCanvas().style.cursor = '';
      map.off('click', handleMapClick);
    }

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPickingLocation, onLocationPicked]);

  // Quản lý Layer Vùng Tản Bộ 15 Phút (Walking Isochrone)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = 'hotel-isochrone-source';
    const fillLayerId = 'hotel-isochrone-fill';
    const lineLayerId = 'hotel-isochrone-line';

    const updateIsochrone = () => {
      if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      if (!showIsochrone || !plan || !plan.selected_hotel) return;

      const geojsonData = createCircleGeoJSON(plan.selected_hotel.lon, plan.selected_hotel.lat, 1000);

      map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData
      });

      // Chèn phía dưới các layer route
      const layers = map.getStyle().layers;
      let beforeId: string | undefined = undefined;
      if (layers) {
        for (const l of layers) {
          if (l.id.startsWith('route-')) {
            beforeId = l.id;
            break;
          }
        }
      }

      map.addLayer(
        {
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#D97706',
            'fill-opacity': 0.14
          }
        },
        beforeId
      );

      map.addLayer(
        {
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#D97706',
            'line-width': 2,
            'line-dasharray': [2, 2],
            'line-opacity': 0.8
          }
        },
        beforeId
      );
    };

    if (map.isStyleLoaded()) {
      updateIsochrone();
    } else {
      map.once('load', updateIsochrone);
    }
  }, [showIsochrone, plan?.selected_hotel, currentBasemap]);

  // Module 2: 3D Cinematic Route Fly-Through
  const stopCinematicFlyThrough = () => {
    if (cinematicTimeoutRef.current) {
      window.clearTimeout(cinematicTimeoutRef.current);
      cinematicTimeoutRef.current = null;
    }
    setIsCinematicPlaying(false);
    setCinematicStop(null);
    handleFitBounds();
  };

  const startCinematicFlyThrough = () => {
    const map = mapRef.current;
    if (!map || !plan || !plan.daily_itineraries || plan.daily_itineraries.length === 0) return;

    if (cinematicTimeoutRef.current) {
      window.clearTimeout(cinematicTimeoutRef.current);
    }

    setIsCinematicPlaying(true);

    const stopsToFly: Array<{
      lon: number;
      lat: number;
      name: string;
      stage: string;
      icon: string;
      desc?: string;
    }> = [];

    const itineraries = activeDayTab !== null
      ? plan.daily_itineraries.filter(d => d.day === activeDayTab)
      : plan.daily_itineraries;

    itineraries.forEach(d => {
      // Khởi hành từ khách sạn
      stopsToFly.push({
        lon: plan.selected_hotel.lon,
        lat: plan.selected_hotel.lat,
        name: plan.selected_hotel.name,
        stage: `Ngày ${d.day} • Khởi hành`,
        icon: '🏨',
        desc: 'Điểm lưu trú tối ưu thuận tiện di chuyển'
      });

      // Các điểm đến trong ngày
      d.visit_sequence.forEach((p, pIdx) => {
        stopsToFly.push({
          lon: p.lon,
          lat: p.lat,
          name: p.name,
          stage: `Ngày ${d.day} • Chặng #${pIdx + 1}`,
          icon: CATEGORY_ICONS[p.category] || '📍',
          desc: p.description
        });
      });

      // Quay về khách sạn
      stopsToFly.push({
        lon: plan.selected_hotel.lon,
        lat: plan.selected_hotel.lat,
        name: plan.selected_hotel.name,
        stage: `Ngày ${d.day} • Nghỉ ngơi`,
        icon: '🏁',
        desc: 'Khép kín hành trình thư thái'
      });
    });

    let currentIdx = 0;

    const flyToNext = () => {
      if (currentIdx >= stopsToFly.length) {
        stopCinematicFlyThrough();
        return;
      }

      const stop = stopsToFly[currentIdx];
      setCinematicStop(stop);

      map.flyTo({
        center: [stop.lon, stop.lat],
        zoom: 15.6,
        pitch: 52,
        bearing: ((currentIdx * 45) % 360) - 20,
        duration: 2500,
        essential: true
      });

      currentIdx++;

      cinematicTimeoutRef.current = window.setTimeout(() => {
        flyToNext();
      }, 4600);
    };

    flyToNext();
  };

  useEffect(() => {
    return () => {
      if (cinematicTimeoutRef.current) {
        window.clearTimeout(cinematicTimeoutRef.current);
      }
    };
  }, []);

  // Map Controls: Fit Bounds
  const handleFitBounds = () => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = new maplibregl.LngLatBounds();
    pois.forEach(p => bounds.extend([p.lon, p.lat]));
    if (plan && plan.selected_hotel) {
      bounds.extend([plan.selected_hotel.lon, plan.selected_hotel.lat]);
    }
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 80, duration: 1000 });
    }
  };

  // Map Controls: Toggle 3D Pitch
  const handleToggle3D = () => {
    const map = mapRef.current;
    if (!map) return;
    const newPitch = is3D ? 0 : 45;
    map.easeTo({ pitch: newPitch, duration: 800 });
    setIs3D(!is3D);
  };

  // Map Controls: Fly to Optimal Accommodation
  const handleFlyToHotel = () => {
    const map = mapRef.current;
    if (!map || !plan || !plan.selected_hotel) return;
    map.flyTo({
      center: [plan.selected_hotel.lon, plan.selected_hotel.lat],
      zoom: 15,
      pitch: 35,
      duration: 1500
    });
  };

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-[#F8F5EE]">
      {/* Banner thông báo chế độ chọn tọa độ */}
      {isPickingLocation && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-[#B85D3B]/40 text-stone-800 px-5 py-3 rounded-2xl text-xs flex items-center gap-3 shadow-2xl">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B85D3B] animate-ping" />
            <b className="text-[#B85D3B]">Chế độ Chọn Tọa độ:</b> Nhấp vào bất kỳ điểm nào trên bản đồ để ghim vị trí du lịch mới
          </span>
          {onCancelPick && (
            <button
              onClick={onCancelPick}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1 rounded-lg text-xs font-semibold border border-stone-200 transition cursor-pointer"
            >
              Hủy
            </button>
          )}
        </div>
      )}

      {/* FLOATING HUD: CINEMATIC 3D ROUTE FLY-THROUGH */}
      {isCinematicPlaying && cinematicStop && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-stone-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl border border-stone-700 shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 max-w-md">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#B85D3B] to-[#D97706] flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
            {cinematicStop.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-amber-300 uppercase tracking-wider font-bold">
              🎬 {cinematicStop.stage}
            </div>
            <div className="font-serif text-sm font-bold text-white truncate">
              {cinematicStop.name}
            </div>
            {cinematicStop.desc && (
              <p className="text-[11px] text-stone-300 truncate mt-0.5">{cinematicStop.desc}</p>
            )}
          </div>
          <button
            onClick={stopCinematicFlyThrough}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
          >
            ⏹ Dừng bay
          </button>
        </div>
      )}

      {/* FLOATING TOOLBAR: BASEMAP SWITCHER & CONTROLS */}
      <div className={`absolute top-20 left-4 md:left-[460px] z-30 flex flex-wrap items-center gap-2 transition-all duration-700 ease-out ${
        isWorkspaceActive ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4'
      }`}>
        {/* Basemap Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsBasemapDropdownOpen(!isBasemapDropdownOpen)}
            className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl text-xs font-semibold text-[#1C382B] flex items-center gap-2 hover:bg-white border border-stone-200/90 shadow-sm transition cursor-pointer"
          >
            <span>{BASEMAP_STYLES[currentBasemap]?.icon}</span>
            <span>{BASEMAP_STYLES[currentBasemap]?.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          </button>

          {isBasemapDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-xl border border-stone-200/90 space-y-1 z-40 animate-in fade-in zoom-in-95 duration-150">
              {Object.entries(BASEMAP_STYLES).map(([key, style]: [string, any]) => (
                <button
                  key={key}
                  onClick={() => switchBasemap(key)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition cursor-pointer ${
                    currentBasemap === key
                      ? 'bg-[#1C382B] text-white font-semibold shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-base">{style.icon}</span>
                  <div>
                    <div className="leading-tight">{style.label}</div>
                    <div className="text-[10px] opacity-75">{style.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick View Action Buttons */}
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-stone-200/90 flex items-center gap-1 shadow-sm">
          <button
            onClick={handleFitBounds}
            title="Căn vừa toàn bộ các điểm (Fit Bounds)"
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-700 hover:text-[#1C382B] transition cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggle3D}
            title={is3D ? 'Chuyển về góc nhìn 2D' : 'Góc nghiêng 3D (45° Pitch)'}
            className={`p-2 rounded-xl transition cursor-pointer ${
              is3D ? 'bg-[#1C382B] text-white font-bold' : 'hover:bg-stone-100 text-stone-700'
            }`}
          >
            <span className="text-xs font-bold font-mono">3D</span>
          </button>

          {plan && (
            <button
              onClick={handleFlyToHotel}
              title="Bay tới khách sạn đề xuất (Fly to Hotel)"
              className="p-2 rounded-xl hover:bg-[#B85D3B]/10 text-[#B85D3B] transition cursor-pointer"
            >
              <Target className="w-4 h-4" />
            </button>
          )}

          {/* Module 2: Vùng đi bộ 15 phút (Isochrone) */}
          {plan && plan.selected_hotel && (
            <button
              onClick={() => setShowIsochrone(!showIsochrone)}
              title="Bật/tắt vùng tản bộ 15 phút quanh khách sạn (~1.0 km)"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                showIsochrone 
                  ? 'bg-amber-600 text-white shadow-xs ring-1 ring-amber-400' 
                  : 'hover:bg-stone-100 text-stone-700'
              }`}
            >
              <span>🚶</span>
              <span className="hidden sm:inline">Đi bộ 15p</span>
            </button>
          )}

          {/* Module 2: 3D Cinematic Fly-Through */}
          {plan && (
            <button
              onClick={isCinematicPlaying ? stopCinematicFlyThrough : startCinematicFlyThrough}
              title={isCinematicPlaying ? 'Dừng bay mô phỏng' : 'Chuyến bay 3D mô phỏng hành trình'}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isCinematicPlaying 
                  ? 'bg-rose-600 text-white animate-pulse shadow-xs' 
                  : 'bg-[#1C382B] hover:bg-[#B85D3B] text-white shadow-xs'
              }`}
            >
              <span>{isCinematicPlaying ? '⏹' : '🎬'}</span>
              <span className="hidden sm:inline">{isCinematicPlaying ? 'Dừng bay' : 'Xem trước 3D'}</span>
            </button>
          )}
        </div>
      </div>

      {/* FLOATING BOTTOM-RIGHT: INTERACTIVE LEGEND WIDGET */}
      {isWorkspaceActive && showLegend && (
        <div className="absolute bottom-6 right-4 z-30 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-200/90 text-xs max-w-xs space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 text-stone-800">
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
            <span className="font-serif font-bold text-xs text-[#1C382B] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#B85D3B]" />
              Chú Giải Bản Đồ
            </span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-stone-400 hover:text-stone-700 text-xs px-1 cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#B85D3B] to-[#D97706] flex items-center justify-center text-[10px] text-white shadow-xs">
                🏨
              </span>
              <span className="font-medium text-stone-700">Điểm lưu trú lý tưởng nhất</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#1C382B] flex items-center justify-center text-[10px] text-white">
                🎯
              </span>
              <span className="text-stone-600">Tọa độ trung tâm tối ưu (L1)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full rounded-br-none -rotate-45 bg-[#78716c] flex items-center justify-center text-[9px] text-white">
                <span className="rotate-45">📍</span>
              </span>
              <span className="text-stone-600">Điểm tham quan du lịch</span>
            </div>

            {plan && plan.daily_itineraries && plan.daily_itineraries.map((itinerary, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <span 
                  style={{ backgroundColor: DAY_COLORS[idx % DAY_COLORS.length] }} 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-xs"
                >
                  {itinerary.day}
                </span>
                <span className="text-stone-700 font-medium">
                  Tuyến đường Ngày {itinerary.day} ({itinerary.visit_sequence.length} chặng)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nút mở lại chú giải nếu bị ẩn */}
      {isWorkspaceActive && !showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-6 right-4 z-30 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl text-[11px] font-semibold text-stone-700 hover:text-[#1C382B] border border-stone-200/80 shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-[#B85D3B]" />
          <span>Chú Giải</span>
        </button>
      )}

      {/* Container bản đồ */}
      <div ref={mapContainer} className={`w-full h-full ${!isWorkspaceActive ? 'hide-map-controls' : ''}`} />
    </div>
  );
});
