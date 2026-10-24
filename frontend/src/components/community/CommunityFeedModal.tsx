import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Heart, 
  Copy, 
  MapPin, 
  Calendar, 
  Hotel, 
  ArrowUpRight, 
  Share2, 
  Check, 
  Compass, 
  Filter,
  Users
} from 'lucide-react';
import { SavedTrip, POI } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getCommunityFeedApi, likeTripApi, cloneTripApi } from '../../services/authService';

interface CommunityFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTrip: (trip: SavedTrip) => void;
  allPois: POI[];
}

export const CommunityFeedModal: React.FC<CommunityFeedModalProps> = ({
  isOpen,
  onClose,
  onLoadTrip,
  allPois
}) => {
  const { user, token, isAuthenticated, setIsAuthModalOpen, refreshMyTripsCount } = useAuth();
  
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'clones'>('popular');
  
  const [likedTripIds, setLikedTripIds] = useState<Set<string>>(new Set());
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFeed();
    }
  }, [isOpen, selectedDayFilter, sortBy]);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const data = await getCommunityFeedApi({
        q: searchQuery.trim() || undefined,
        days: selectedDayFilter || undefined,
        sort_by: sortBy,
        limit: 24
      });
      setTrips(data);
    } catch (err) {
      console.error('Lỗi khi tải bảng tin cộng đồng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFeed();
  };

  const handleLike = async (trip: SavedTrip) => {
    // Optimistic UI update
    const alreadyLiked = likedTripIds.has(trip.id);
    const newLiked = new Set(likedTripIds);
    if (alreadyLiked) {
      newLiked.delete(trip.id);
    } else {
      newLiked.add(trip.id);
    }
    setLikedTripIds(newLiked);

    setTrips(prev => prev.map(t => {
      if (t.id === trip.id) {
        return {
          ...t,
          likes_count: (t.likes_count || 0) + (alreadyLiked ? -1 : 1)
        };
      }
      return t;
    }));

    try {
      await likeTripApi(trip.id);
    } catch {
      // Revert if API fails
    }
  };

  const handleClone = async (trip: SavedTrip) => {
    if (!isAuthenticated || !token) {
      setToastMessage('Vui lòng đăng nhập để sao chép lịch trình về tài khoản!');
      setTimeout(() => setToastMessage(null), 3000);
      setIsAuthModalOpen(true);
      return;
    }

    setCloningId(trip.id);
    try {
      await cloneTripApi(trip.id, token);
      refreshMyTripsCount();
      // Tăng số lượt clone hiển thị
      setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, clones_count: (t.clones_count || 0) + 1 } : t));
      setToastMessage(`Đã sao chép "${trip.title}" vào Hành trình của bạn!`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setToastMessage(err.message || 'Không thể sao chép lịch trình');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setCloningId(null);
    }
  };

  const handleSelectTrip = (trip: SavedTrip) => {
    onLoadTrip(trip);
    onClose();
  };

  const handleCopyLink = (tripId: string) => {
    const url = `${window.location.origin}?trip_id=${tripId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(tripId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl bg-[#FDFCF7] border border-stone-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[850px] animate-in zoom-in-95 duration-200 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast thông báo nhanh */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-60 px-4 py-2 bg-[#1C382B] text-white text-xs font-semibold rounded-full shadow-lg border border-amber-300/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="w-3.5 h-3.5 text-amber-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Top Header */}
        <div className="px-6 py-4.5 bg-[#FAF7F0] border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1C382B] text-amber-300 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1C382B]">
                  Khám Phá Lịch Trình Cộng Đồng
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200">
                  Thủ Đô Hà Nội
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Các chuyến đi do cộng đồng du khách chia sẻ và tinh tuyển
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3.5 bg-white border-b border-stone-200/70 flex flex-wrap items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo chủ đề (foodtour, hoài cổ, hồ tây, 2 ngày...)"
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-[#B85D3B] focus:bg-white text-stone-800 transition"
            />
          </form>

          {/* Lọc theo số ngày & Sắp xếp */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Lọc số ngày */}
            <div className="flex items-center bg-stone-100 p-1 rounded-full text-xs font-semibold text-stone-600 border border-stone-200/80">
              <button
                onClick={() => setSelectedDayFilter(null)}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  selectedDayFilter === null ? 'bg-white text-[#1C382B] shadow-2xs font-bold' : 'hover:text-stone-900'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSelectedDayFilter(1)}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  selectedDayFilter === 1 ? 'bg-white text-[#1C382B] shadow-2xs font-bold' : 'hover:text-stone-900'
                }`}
              >
                1 Ngày
              </button>
              <button
                onClick={() => setSelectedDayFilter(2)}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  selectedDayFilter === 2 ? 'bg-white text-[#1C382B] shadow-2xs font-bold' : 'hover:text-stone-900'
                }`}
              >
                2 Ngày
              </button>
              <button
                onClick={() => setSelectedDayFilter(3)}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  selectedDayFilter === 3 ? 'bg-white text-[#1C382B] shadow-2xs font-bold' : 'hover:text-stone-900'
                }`}
              >
                3+ Ngày
              </button>
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-1.5 text-xs text-stone-600 pl-1 border-l border-stone-200">
              <span className="text-[11px] text-stone-400 hidden sm:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs text-stone-800 font-medium focus:outline-none focus:border-[#B85D3B] cursor-pointer"
              >
                <option value="popular">Yêu thích nhất</option>
                <option value="clones">Được sao chép nhiều</option>
                <option value="newest">Mới cập nhật</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F5EE]/40">
          {isLoading ? (
            <div className="py-24 text-center text-stone-500 space-y-3">
              <div className="w-8 h-8 border-3 border-[#B85D3B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium">Đang tải những hành trình đặc sắc từ cộng đồng...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Compass className="w-8 h-8 text-stone-400" />
              </div>
              <h4 className="font-serif text-base font-bold text-stone-800">
                Không tìm thấy hành trình phù hợp
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Thử tìm với từ khóa khác hoặc bỏ chọn bộ lọc để xem toàn bộ danh sách nhé.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {trips.map(trip => {
                const totalPois = trip.plan_data?.total_pois || trip.selected_poi_ids?.length || 0;
                const hotel = trip.plan_data?.selected_hotel;
                const formattedDate = trip.created_at ? new Date(trip.created_at).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric'
                }) : '';
                const isLiked = likedTripIds.has(trip.id);
                const tagList = (trip.tags || 'Hà Nội').split(',').map(t => t.trim()).filter(Boolean);

                return (
                  <div
                    key={trip.id}
                    className="p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#B85D3B]/40 hover:shadow-lg transition-all space-y-3.5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Tác giả & Ngày đăng */}
                      <div className="flex items-center justify-between text-xs mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1C382B] text-amber-300 font-bold text-[11px] flex items-center justify-center shadow-2xs">
                            {trip.author_name ? trip.author_name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-xs flex items-center gap-1">
                              <span>{trip.author_name || 'Du khách Hà Nội'}</span>
                            </div>
                            <div className="text-[10px] text-stone-400">{formattedDate}</div>
                          </div>
                        </div>

                        {/* Badge ngày */}
                        <span className="px-2.5 py-1 rounded-full bg-[#1C382B]/10 text-[#1C382B] font-bold text-xs">
                          {trip.days} Ngày
                        </span>
                      </div>

                      {/* Tiêu đề & Tóm tắt */}
                      <h4 className="font-serif text-base font-bold text-stone-900 group-hover:text-[#B85D3B] transition-colors line-clamp-1">
                        {trip.title}
                      </h4>

                      {trip.summary && (
                        <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                          {trip.summary}
                        </p>
                      )}

                      {/* Thẻ tags */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                        {tagList.map((tag, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Thông số lộ trình */}
                      <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-[11px] text-stone-700">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#B85D3B] shrink-0" />
                          <span><b>{totalPois}</b> điểm tham quan</span>
                        </div>
                        {hotel ? (
                          <div className="flex items-center gap-1.5 truncate" title={hotel.name}>
                            <Hotel className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="truncate">{hotel.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-stone-400">
                            <Hotel className="w-3.5 h-3.5" />
                            <span>Tối ưu lưu trú</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thanh hành động tương tác */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      {/* Thả tim & Sao chép counters */}
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleLike(trip)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                            isLiked 
                              ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                              : 'hover:bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                          title="Thả tim yêu thích hành trình"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-stone-500'}`} />
                          <span>{trip.likes_count || 0}</span>
                        </button>

                        <button
                          onClick={() => handleClone(trip)}
                          disabled={cloningId === trip.id}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-stone-100 text-stone-600 border border-stone-200 transition cursor-pointer"
                          title="Sao chép hành trình về tài khoản của bạn để chỉnh sửa"
                        >
                          <Copy className="w-3.5 h-3.5 text-stone-500" />
                          <span>{trip.clones_count || 0}</span>
                        </button>

                        <button
                          onClick={() => handleCopyLink(trip.id)}
                          className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition cursor-pointer"
                          title="Sao chép liên kết chia sẻ"
                        >
                          {copiedId === trip.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Nút Xem & Tải lên bản đồ */}
                      <button
                        onClick={() => handleSelectTrip(trip)}
                        className="px-3.5 py-1.5 rounded-full bg-[#1C382B] hover:bg-[#B85D3B] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        title="Tải toàn bộ lộ trình này lên bản đồ WebGIS"
                      >
                        <span>Xem trên bản đồ</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
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
