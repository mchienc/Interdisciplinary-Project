import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Share2, Trash2, ArrowUpRight, Compass, Check, Clock, Bookmark, Hotel, Globe, Lock, Heart, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyTripsApi, deleteTripApi, toggleTripVisibilityApi } from '../../services/authService';
import { SavedTrip } from '../../types';

interface MyTripsModalProps {
  onLoadTrip: (trip: SavedTrip) => void;
}

export const MyTripsModal: React.FC<MyTripsModalProps> = ({ onLoadTrip }) => {
  const { isMyTripsOpen, setIsMyTripsOpen, token, user, refreshMyTripsCount } = useAuth();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isMyTripsOpen && token) {
      loadTrips();
    }
  }, [isMyTripsOpen, token]);

  const loadTrips = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getMyTripsApi(token);
      setTrips(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách chuyến đi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMyTripsOpen) return null;

  const handleCopyLink = (tripId: string) => {
    const url = `${window.location.origin}?trip_id=${tripId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(tripId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleVisibility = async (tripId: string) => {
    if (!token) return;
    try {
      const res = await toggleTripVisibilityApi(tripId, token);
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, is_public: res.is_public } : t));
    } catch (err) {
      alert('Không thể cập nhật quyền riêng tư của chuyến đi.');
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!token || !window.confirm('Bạn có chắc chắn muốn xóa chuyến đi này khỏi danh sách?')) return;
    setDeletingId(tripId);
    try {
      await deleteTripApi(tripId, token);
      setTrips(prev => prev.filter(t => t.id !== tripId));
      refreshMyTripsCount();
    } catch (err) {
      alert('Không thể xóa chuyến đi. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectTrip = (trip: SavedTrip) => {
    onLoadTrip(trip);
    setIsMyTripsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#FDFCF7] border border-stone-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF7F0] border-b border-stone-200/80 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1C382B]">
              Hành Trình Của Tôi
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Tài khoản: <b className="text-stone-700">{user?.full_name}</b> ({trips.length} chuyến đi đã lưu)
            </p>
          </div>

          <button
            onClick={() => setIsMyTripsOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center text-stone-500 space-y-3">
              <div className="w-6 h-6 border-2 border-[#B85D3B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Đang tải các chuyến đi đã lưu...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Bookmark className="w-6 h-6 text-stone-400" />
              </div>
              <h4 className="font-serif text-base font-bold text-stone-800">
                Chưa có hành trình nào được lưu
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Hãy chọn các điểm đến yêu thích trên bản đồ và nhấn <b>"Lưu vào Chuyến đi của tôi"</b> ở thanh lập kế hoạch để lưu lại nhé!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {trips.map(trip => {
                const totalPois = trip.plan_data?.total_pois || trip.selected_poi_ids?.length || 0;
                const hotelName = trip.plan_data?.selected_hotel?.name;
                const formattedDate = trip.created_at ? new Date(trip.created_at).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric'
                }) : '';

                return (
                  <div
                    key={trip.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-[#B85D3B]/40 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      {/* Badges & Date */}
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#1C382B]/10 text-[#1C382B] font-bold">
                            {trip.days} Ngày
                          </span>
                          <button
                            onClick={() => handleToggleVisibility(trip.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border transition cursor-pointer ${
                              trip.is_public 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                            }`}
                            title={trip.is_public ? 'Đang công khai trên Cộng đồng. Bấm để chuyển sang Riêng tư' : 'Đang riêng tư. Bấm để công khai lên Cộng đồng'}
                          >
                            {trip.is_public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                            <span>{trip.is_public ? 'Công khai' : 'Riêng tư'}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400">
                          {trip.is_public && (
                            <div className="flex items-center gap-1.5 text-stone-500 font-medium">
                              <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5 text-rose-500" /> {trip.likes_count || 0}</span>
                              <span className="flex items-center gap-0.5"><Copy className="w-2.5 h-2.5 text-stone-400" /> {trip.clones_count || 0}</span>
                            </div>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="font-serif text-sm font-bold text-stone-900 line-clamp-1">
                        {trip.title}
                      </h4>

                      {/* Info highlights */}
                      <div className="text-[11px] text-stone-600 space-y-1 mt-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#B85D3B] shrink-0" />
                          <span><b>{totalPois}</b> điểm tham quan</span>
                        </div>
                        {hotelName && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Hotel className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span className="truncate">{hotelName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5">
                      <button
                        onClick={() => handleSelectTrip(trip)}
                        className="px-3 py-1.5 rounded-xl bg-[#1C382B] hover:bg-[#B85D3B] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                        title="Tải hành trình này lên bản đồ để tiếp tục xem"
                      >
                        <span>Nạp lên bản đồ</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyLink(trip.id)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition cursor-pointer"
                          title="Sao chép link chia sẻ"
                        >
                          {copiedId === trip.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          disabled={deletingId === trip.id}
                          onClick={() => handleDelete(trip.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition cursor-pointer disabled:opacity-50"
                          title="Xóa chuyến đi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
