import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as maplibregl from 'maplibre-gl';
import gsap from 'gsap';
import { 
  Layers, 
  Maximize2, 
  Compass, 
  Target, 
  Eye, 
  Info, 
  MapPin, 
  Navigation,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { POI, Accommodation, PlanResponse } from '../types';

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

const DAY_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4'];

const BASEMAP_STYLES: Record<string, { label: string; icon: string; tileUrl: string; desc: string }> = {
  dark: {
    label: 'Esri Dark Canvas',
    icon: '🌓',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    desc: 'Bản đồ GIS Dark Slate chuyên sâu'
  },
  street: {
    label: 'Bản Đồ Phố Du Lịch',
    icon: '🗺️',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    desc: 'Màu sắc êm dịu, đầy đủ địa danh'
  },
  satellite: {
    label: 'Ảnh Vệ Tinh Trực Quan',
    icon: '🛰️',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    desc: 'Esri World Imagery chân thực'
  },
  osm: {
    label: 'OpenStreetMap Chuẩn',
    icon: '🏔️',
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    desc: 'Cộng đồng bản đồ mở quốc tế'
  }
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

  // State điều khiển bản đồ - mặc định dùng 'dark' chuẩn GIS Workstation
  const [currentBasemap, setCurrentBasemap] = useState<string>('dark');
  const [isBasemapDropdownOpen, setIsBasemapDropdownOpen] = useState<boolean>(false);
  const [is3D, setIs3D] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Expose camera fly methods ra bên ngoài component cho GSAP Landing Orchestrator
  useImperativeHandle(ref, () => ({
    flyDownToWorkspace: (onArrival?: () => void) => {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo({
        center: [105.8523, 21.0287],
        zoom: 13.8,
        pitch: 30,
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
        duration: 2000,
        essential: true
      });
    },
    getMap: () => mapRef.current
  }));

  // 1. Khởi tạo Bản đồ MapLibre GL tại tầm nhìn bao quát thành phố (zoom: 10.5)
  useEffect(() => {
    if (!mapContainer.current) return;

    const initialStyle = BASEMAP_STYLES[currentBasemap];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'basemap-source': {
            type: 'raster',
            tiles: [initialStyle.tileUrl],
            tileSize: 256,
            attribution: '&copy; Esri &copy; OpenStreetMap'
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
      if (map.getLayer('basemap-layer')) map.removeLayer('basemap-layer');
      if (map.getSource('basemap-source')) map.removeSource('basemap-source');

      map.addSource('basemap-source', {
        type: 'raster',
        tiles: [basemapConfig.tileUrl],
        tileSize: 256,
        attribution: '&copy; Esri &copy; OpenStreetMap'
      });

      // Thêm layer nền vào vị trí dưới cùng (trước các layer đường đi)
      const firstRouteLayer = map.getLayer('route-casing-day-1') ? 'route-casing-day-1' : undefined;
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
        // Nếu animate thì khởi tạo với 2 tọa độ đầu tiên, ngược lại set toàn bộ
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

        // Đường viền (Casing)
        map.addLayer({
          id: `route-casing-day-${day}`,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#020617',
            'line-width': 6,
            'line-opacity': isDimmed ? 0.15 : 0.65
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
            'line-opacity': isDimmed ? 0.2 : 0.95
          }
        });

        // GSAP Polyline interpolation vẽ mượt mà từ điểm đầu đến các điểm kế tiếp
        if (shouldAnimate && fullCoords.length > 2) {
          const tweenObj = { progress: 0 };
          const tween = gsap.to(tweenObj, {
            progress: 1,
            duration: 1.0,
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
        map.fitBounds(bounds, { padding: 90, maxZoom: 15, duration: 900 });
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

  // 4. Render Markers (POIs, Geometric Median Weiszfeld, Hotels)
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

    // A. Vẽ các Marker POI (Điểm du lịch)
    pois.forEach((poi) => {
      const isSelected = selectedPoiIds.includes(poi.id);
      const dayInfo = poiDayMap.get(poi.id);

      const el = document.createElement('div');
      el.className = 'cursor-pointer transition-transform duration-200 hover:scale-125 z-10';

      let bgColor = '#64748b';
      let badgeContent = '📍';

      if (dayInfo) {
        bgColor = DAY_COLORS[(dayInfo.day - 1) % DAY_COLORS.length];
        badgeContent = `${dayInfo.seq}`;
      } else if (isSelected) {
        bgColor = '#4f46e5';
        badgeContent = '✓';
      }

      el.innerHTML = `
        <div style="background-color: ${bgColor};" class="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-lg shadow-black/25">
          ${badgeContent}
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 20, closeButton: false }).setHTML(`
        <div class="space-y-2 max-w-xs p-1">
          ${poi.image_url ? `
            <div class="relative h-28 w-full rounded-xl overflow-hidden border border-slate-700/80 mb-1">
              <img src="${poi.image_url}" alt="${poi.name}" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              <span class="absolute bottom-1.5 left-2 text-[10px] bg-indigo-600/90 text-white font-semibold px-2 py-0.5 rounded-full shadow-sm">
                ${poi.category}
              </span>
            </div>
          ` : ''}
          <div class="font-bold text-sm text-white">${poi.name}</div>
          <p class="text-xs text-slate-300 leading-relaxed line-clamp-2">${poi.description || ''}</p>
          <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-700/60 flex items-center justify-between">
            <span>🎟️ Giá vé:</span>
            <b class="text-emerald-400 font-mono">${poi.ticket_price === 0 ? 'Miễn phí' : poi.ticket_price.toLocaleString() + ' đ'}</b>
          </div>
          ${dayInfo ? `
            <div class="bg-indigo-950/60 p-1.5 rounded-lg border border-indigo-500/30 text-[11px] font-bold text-indigo-300 mt-1 flex items-center gap-1.5">
              <span>🚀</span> Lịch trình Ngày ${dayInfo.day} - Điểm đến số #${dayInfo.seq}
            </div>` : ''}
          <button id="poi-detail-btn-${poi.id}" class="w-full mt-2 py-2 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-md active:scale-98 cursor-pointer">
            <span>👁️ Xem Chi Tiết & Hình Ảnh</span>
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

    // B. Vẽ Marker Trung vị Hình học (Geometric Median Weiszfeld) 🎯
    if (plan && plan.geometric_median) {
      const med = plan.geometric_median;
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center cursor-pointer z-30';
      el.innerHTML = `
        <div class="radar-ring-1"></div>
        <div class="radar-ring-2"></div>
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-red-500 text-white flex items-center justify-center border-2 border-white shadow-xl text-sm font-bold z-10 transition-transform hover:scale-125">
          🎯
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="space-y-2 max-w-sm p-0.5">
          <div class="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Trung Vị Hình Học (Geometric Median)
          </div>
          <div class="font-bold text-white text-sm">Điểm Lưu Trú Tối Ưu Toán Học (L1)</div>
          <div class="text-xs text-slate-300">
            Tọa độ cực tiểu hóa tổng khoảng cách tới toàn bộ các điểm tham quan đã chọn:
          </div>
          <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1 font-mono text-slate-300">
            <div>📍 Vĩ độ: <b class="text-white">${med.lat.toFixed(6)}</b>, Kinh độ: <b class="text-white">${med.lon.toFixed(6)}</b></div>
            <div>🔄 Vòng lặp Weiszfeld hội tụ: <b class="text-indigo-400">${med.iterations}</b></div>
            <div>📏 Cự ly trung bình đến POIs: <b class="text-white">${med.mean_distance_to_pois_km} km</b></div>
            <div class="text-emerald-400 font-bold">⚡ Tiết kiệm so với Centroid: +${med.centroid_comparison_gain_km} km</div>
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
        el.className = `cursor-pointer transition-all duration-200 ${isChosen ? 'scale-110 z-30' : 'z-15'}`;

        el.addEventListener('mouseenter', () => onHoverHotel?.(hotel.id));
        el.addEventListener('mouseleave', () => onHoverHotel?.(null));

        const rankStr = `0${idx + 1}`.slice(-2);

        el.innerHTML = `
          <div class="flex flex-col items-center">
            <div class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
              isChosen 
                ? 'bg-emerald-500 text-slate-950 border border-emerald-300 font-black shadow-md' 
                : 'bg-[#0B0F19] text-slate-300 border border-slate-700'
            } shadow mb-0.5 whitespace-nowrap">
              ${isChosen ? '★ CHỌN' : `#${rankStr}`}
            </div>
            <div class="w-7 h-7 rounded-lg ${
              isChosen 
                ? 'bg-emerald-600 ring-2 ring-emerald-400/80 text-white' 
                : 'bg-slate-800 border border-slate-700 text-indigo-400'
            } flex items-center justify-center shadow-lg text-xs">
              🏨
            </div>
          </div>
        `;

        hotelMarkerElementsRef.current.set(hotel.id, el);

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div class="space-y-2 min-w-[240px] p-0.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md uppercase font-bold">
                Xếp hạng #${idx + 1} &bull; ${hotel.stars}⭐
              </span>
              <span class="text-xs text-amber-400 font-bold">★ ${hotel.rating}</span>
            </div>
            <div class="font-bold text-white text-sm">${hotel.name}</div>
            <div class="text-[11px] text-slate-400">📍 ${hotel.address || ''}</div>
            <div class="text-xs text-emerald-400 font-bold font-mono">
              💰 ${(hotel.price_per_night / 1000).toLocaleString()}k đ / đêm
            </div>
            ${hotel.distance_to_median_m ? `<div class="text-[11px] text-slate-300">📏 Cách trung vị: <b class="text-cyan-400 font-mono">${hotel.distance_to_median_m.toLocaleString()} m</b></div>` : ''}
            
            <button 
              id="select-hotel-btn-${hotel.id}" 
              class="w-full mt-2 py-2 px-3 rounded-lg text-xs font-bold transition text-center ${
                isChosen 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
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
      el.className = 'w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-2xl text-base font-bold animate-bounce z-40 ring-4 ring-emerald-500/30';
      el.innerHTML = '📍';
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pickedCoords.lon, pickedCoords.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [pois, selectedPoiIds, plan, selectedHotelId, onSelectHotel, pickedCoords]);

  // 4b. Đồng bộ hiệu ứng Hover hai chiều (Bi-directional Highlight)
  useEffect(() => {
    hotelMarkerElementsRef.current.forEach((el, id) => {
      const isHovered = hoveredHotelId === id;
      const isChosen = (selectedHotelId === id);

      if (isHovered) {
        el.style.transform = 'scale(1.28)';
        el.style.zIndex = '60';
        el.style.filter = 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.85))';
      } else if (isChosen) {
        el.style.transform = 'scale(1.1)';
        el.style.zIndex = '30';
        el.style.filter = '';
      } else {
        el.style.transform = 'scale(1.0)';
        el.style.zIndex = '15';
        el.style.filter = '';
      }
    });
  }, [hoveredHotelId, selectedHotelId]);

  // 5. Bắt sự kiện click trên map để chọn tọa độ
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isPickingLocation) {
      map.getCanvas().style.cursor = 'crosshair';
      const handleClick = (e: maplibregl.MapMouseEvent) => {
        if (onLocationPicked) {
          onLocationPicked(e.lngLat.lat, e.lngLat.lng);
        }
      };
      map.on('click', handleClick);
      return () => {
        map.off('click', handleClick);
        map.getCanvas().style.cursor = '';
      };
    } else {
      map.getCanvas().style.cursor = '';
    }
  }, [isPickingLocation, onLocationPicked]);

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

  // Map Controls: Fly to Weiszfeld Median
  const handleFlyToMedian = () => {
    const map = mapRef.current;
    if (!map || !plan || !plan.geometric_median) return;
    map.flyTo({
      center: [plan.geometric_median.lon, plan.geometric_median.lat],
      zoom: 14.5,
      pitch: 35,
      duration: 1500
    });
  };

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden">
      {/* Banner thông báo chế độ chọn tọa độ */}
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 glass-panel border-indigo-500/50 text-white px-5 py-3 rounded-2xl text-xs flex items-center gap-3 shadow-2xl">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <b className="text-emerald-400">Chế độ Chọn Tọa độ:</b> Nhấp vào bất kỳ điểm nào trên bản đồ để ghim vị trí du lịch mới
          </span>
          {onCancelPick && (
            <button
              onClick={onCancelPick}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-xs font-bold border border-slate-700 transition"
            >
              Hủy
            </button>
          )}
        </div>
      )}

      {/* FLOATING TOOLBAR: BASEMAP SWITCHER & CONTROLS */}
      <div className={`absolute top-4 left-4 md:left-[436px] z-30 flex items-center gap-2 transition-all duration-700 ease-out ${
        isWorkspaceActive ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4'
      }`}>
        {/* Basemap Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsBasemapDropdownOpen(!isBasemapDropdownOpen)}
            className="glass-panel px-3.5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 hover:bg-slate-800 transition shadow-lg"
          >
            <span>{BASEMAP_STYLES[currentBasemap]?.icon}</span>
            <span>{BASEMAP_STYLES[currentBasemap]?.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isBasemapDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-52 glass-panel rounded-2xl p-1.5 shadow-2xl border border-white/10 space-y-1 z-40 animate-in fade-in zoom-in-95 duration-150">
              {Object.entries(BASEMAP_STYLES).map(([key, style]) => (
                <button
                  key={key}
                  onClick={() => switchBasemap(key)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition ${
                    currentBasemap === key
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">{style.icon}</span>
                  <div>
                    <div className="leading-tight">{style.label}</div>
                    <div className="text-[10px] text-slate-400 opacity-80">{style.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick View Action Buttons */}
        <div className="glass-panel p-1 rounded-xl flex items-center gap-1 shadow-lg">
          <button
            onClick={handleFitBounds}
            title="Căn vừa toàn bộ các điểm (Fit Bounds)"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggle3D}
            title={is3D ? 'Chuyển về góc nhìn 2D' : 'Góc nghiêng 3D (45° Pitch)'}
            className={`p-2 rounded-lg transition ${
              is3D ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <span className="text-xs font-bold font-mono">3D</span>
          </button>

          {plan && (
            <button
              onClick={handleFlyToMedian}
              title="Bay tới Trung vị Weiszfeld (Fly to Median)"
              className="p-2 rounded-lg hover:bg-slate-800 text-rose-400 hover:text-rose-300 transition"
            >
              <Target className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* FLOATING BOTTOM-RIGHT: INTERACTIVE LEGEND WIDGET */}
      {isWorkspaceActive && showLegend && (
        <div className="absolute bottom-6 right-4 z-30 glass-panel p-3.5 rounded-2xl shadow-2xl border border-white/10 text-xs max-w-xs space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/60">
            <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Chú Giải Bản Đồ
            </span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ×
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold">
                🎯
              </span>
              <span>Trung vị Hình học Weiszfeld (Tối ưu L1)</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-4 h-4 rounded-md bg-emerald-600 flex items-center justify-center text-[10px] text-white">
                🏨
              </span>
              <span>Khách sạn Được Chọn / Gợi Ý</span>
            </div>

            {DAY_COLORS.map((color, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300">
                <span 
                  style={{ backgroundColor: color }} 
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                >
                  {idx + 1}
                </span>
                <span>Lộ trình & Điểm tham quan Ngày {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nút mở lại chú giải nếu bị ẩn */}
      {isWorkspaceActive && !showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-6 right-4 z-30 glass-panel px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white shadow-lg flex items-center gap-1.5"
        >
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Chú Giải</span>
        </button>
      )}

      {/* Container bản đồ */}
      <div ref={mapContainer} className={`w-full h-full ${!isWorkspaceActive ? 'hide-map-controls' : ''}`} />
    </div>
  );
});


