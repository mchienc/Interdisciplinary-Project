import { useState, useCallback, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { POI } from '../types';

export interface ContextMenuState {
  lat: number;
  lon: number;
  screenX: number;
  screenY: number;
  address: string;
  isGeocoding: boolean;
}

export const useCustomMapEvents = (
  onAddCustomPoi?: (poi: POI) => void
) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const geocodeAbortRef = useRef<AbortController | null>(null);

  /**
   * Gọi Reverse Geocoding qua OpenStreetMap Nominatim API (Miễn phí)
   */
  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<string> => {
    try {
      if (geocodeAbortRef.current) {
        geocodeAbortRef.current.abort();
      }
      geocodeAbortRef.current = new AbortController();

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'vi',
          'User-Agent': 'Hanoi-Tourism-SDSS-WebGIS'
        },
        signal: geocodeAbortRef.current.signal
      });

      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      
      const addr = data.address;
      if (addr) {
        const parts = [
          addr.house_number ? `Số ${addr.house_number}` : null,
          addr.road || addr.pedestrian || addr.suburb,
          addr.neighbourhood || addr.quarter,
          addr.city_district || addr.district || 'Hà Nội'
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(', ') : (data.display_name?.split(',').slice(0, 3).join(',') || 'Hà Nội');
      }

      return data.display_name?.split(',').slice(0, 3).join(',') || `Tọa độ: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch {
      return `Tọa độ: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  }, []);

  /**
   * Lắng nghe sự kiện click chuột phải (contextmenu) trên MapLibre
   */
  const handleMapContextMenu = useCallback(async (e: maplibregl.MapMouseEvent) => {
    // Ngăn chặn menu chuột phải mặc định của trình duyệt
    e.originalEvent.preventDefault();

    const { lng, lat } = e.lngLat;
    const { x, y } = e.point;

    setContextMenu({
      lat,
      lon: lng,
      screenX: x,
      screenY: y,
      address: 'Đang tra cứu địa chỉ...',
      isGeocoding: true
    });

    const resolvedAddress = await reverseGeocode(lat, lng);

    setContextMenu(prev => {
      if (!prev) return null;
      return {
        ...prev,
        address: resolvedAddress,
        isGeocoding: false
      };
    });
  }, [reverseGeocode]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  /**
   * Tạo POI tùy chỉnh và gửi lên hệ thống
   */
  const submitCustomPoi = useCallback((
    name: string,
    category: 'hotel' | 'food' | 'custom' = 'custom',
    estimatedDuration: number = 45
  ) => {
    if (!contextMenu) return null;

    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const newCustomPoi: POI = {
      id: Date.now(), // Unique ID
      name: trimmedName,
      category: category === 'food' ? 'food' : category === 'hotel' ? 'hotel' : 'entertainment',
      description: `Điểm dừng tùy chọn do bạn tạo tại ${contextMenu.address}`,
      lat: contextMenu.lat,
      lon: contextMenu.lon,
      estimated_duration_min: estimatedDuration,
      ticket_price: 0,
      venue_type: category === 'hotel' || category === 'food' ? 'indoor' : 'semi-indoor',
      ideal_time: 'any',
      address: contextMenu.address,
      is_custom: true
    };

    if (onAddCustomPoi) {
      onAddCustomPoi(newCustomPoi);
    }

    setContextMenu(null);
    return newCustomPoi;
  }, [contextMenu, onAddCustomPoi]);

  return {
    contextMenu,
    handleMapContextMenu,
    closeContextMenu,
    submitCustomPoi
  };
};
