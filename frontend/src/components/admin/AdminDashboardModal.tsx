import React, { useState, useEffect } from 'react';
import { X, Shield, BarChart3, MapPin, Users, Calendar, Trash2, Search, Compass, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminStatsApi, deletePoiAdminApi } from '../../services/authService';
import { AdminStats, POI } from '../../types';

interface AdminDashboardModalProps {
  pois: POI[];
  onPoiDeleted?: (poiId: number) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ pois, onPoiDeleted }) => {
  const { isAdminModalOpen, setIsAdminModalOpen, token, user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'pois'>('stats');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (isAdminModalOpen && token) {
      loadStats();
    }
  }, [isAdminModalOpen, token]);

  const loadStats = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getAdminStatsApi(token);
      setStats(data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdminModalOpen) return null;

  const filteredPois = pois.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePoi = async (poiId: number) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa POI #${poiId} khỏi hệ thống không?`)) return;
    try {
      await deletePoiAdminApi(poiId, token);
      if (onPoiDeleted) onPoiDeleted(poiId);
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa điểm này.');
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'heritage': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'culinary': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'nature': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'museum': return 'bg-stone-100 text-[#1C382B] border-stone-300';
      case 'bridge': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-[#FDFCF7] border border-stone-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF7F0] border-b border-stone-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-serif text-xl font-bold text-[#1C382B]">
                Bảng Điều Khiển Quản Trị Hệ Thống
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-600/10 text-amber-800 text-[10px] font-sans font-bold">
                Quyền Admin
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Quản trị viên: <b>{user?.full_name}</b> ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex bg-stone-200/70 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'stats'
                    ? 'bg-white text-[#1C382B] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#B85D3B]" />
                <span>Thống kê DSS</span>
              </button>
              <button
                onClick={() => setActiveTab('pois')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'pois'
                    ? 'bg-white text-[#1C382B] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#B85D3B]" />
                <span>Quản lý POI ({pois.length})</span>
              </button>
            </div>

            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center text-stone-500 space-y-3">
              <div className="w-6 h-6 border-2 border-[#B85D3B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Đang nạp dữ liệu thống kê quản trị...</p>
            </div>
          ) : activeTab === 'stats' ? (
            <div className="space-y-6">
              {/* 4 Stat Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B85D3B]" />
                    Tổng số POI
                  </div>
                  <div className="font-serif text-2xl font-bold text-[#1C382B]">
                    {stats?.total_pois || pois.length}
                  </div>
                  <div className="text-[10px] text-stone-400">Điểm di tích &amp; thắng cảnh</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Chuyến đi đã tạo
                  </div>
                  <div className="font-serif text-2xl font-bold text-emerald-800">
                    {stats?.total_trips || 0}
                  </div>
                  <div className="text-[10px] text-stone-400">Được tối ưu hóa &amp; lưu trữ</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Tài khoản du khách
                  </div>
                  <div className="font-serif text-2xl font-bold text-blue-900">
                    {stats?.total_users || 0}
                  </div>
                  <div className="text-[10px] text-stone-400">Đã đăng ký tài khoản</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-600" />
                    Cơ chế gợi ý
                  </div>
                  <div className="font-serif text-base font-bold text-amber-900 mt-1">
                    Tối ưu vị trí & Lộ trình
                  </div>
                  <div className="text-[10px] text-stone-400">Xử lý tức thì</div>
                </div>
              </div>

              {/* Category Breakdown & Distribution */}
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#1C382B] flex items-center gap-2">
                  <span>Phân bổ Điểm tham quan theo Thể loại</span>
                </h4>
                <div className="space-y-2.5">
                  {stats?.category_breakdown && Object.entries(stats.category_breakdown).map(([cat, count]) => {
                    const percentage = Math.round((count / (stats.total_pois || 1)) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-stone-700">
                          <span className="font-semibold capitalize">{cat}</span>
                          <span className="text-stone-500 font-mono text-[11px]">{count} điểm ({percentage}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#B85D3B] to-[#D97706] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Selected POIs list */}
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#1C382B]">
                  Điểm đến Tiêu biểu trong Cơ sở Dữ liệu
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stats?.popular_pois.map(poi => (
                    <div key={poi.id} className="p-2.5 rounded-xl border border-stone-100 bg-[#FDFCF7] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-6 h-6 rounded-lg bg-[#1C382B]/10 text-[#1C382B] font-bold text-[10px] flex items-center justify-center shrink-0">
                          #{poi.id}
                        </span>
                        <span className="font-semibold text-stone-800 truncate">{poi.name}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 shrink-0 font-mono">
                        {poi.ticket_price ? `${poi.ticket_price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Tab POI Table Management */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm theo tên hoặc danh mục..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B85D3B]/40"
                  />
                </div>
                <div className="text-xs text-stone-500">
                  Hiển thị <b>{filteredPois.length}</b> / {pois.length} điểm
                </div>
              </div>

              <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">Tên Điểm Đến</th>
                        <th className="py-2.5 px-3">Danh Mục</th>
                        <th className="py-2.5 px-3">Giá Vé</th>
                        <th className="py-2.5 px-3">Tọa Độ (Lat, Lon)</th>
                        <th className="py-2.5 px-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredPois.map(poi => (
                        <tr key={poi.id} className="hover:bg-stone-50/70 transition">
                          <td className="py-2.5 px-3 font-mono text-stone-500 text-[11px]">#{poi.id}</td>
                          <td className="py-2.5 px-3 font-semibold text-stone-800">{poi.name}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryColor(poi.category)}`}>
                              {poi.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-stone-600 font-mono text-[11px]">
                            {poi.ticket_price ? `${poi.ticket_price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                          </td>
                          <td className="py-2.5 px-3 text-stone-400 font-mono text-[10px]">
                            {poi.lat.toFixed(4)}, {poi.lon.toFixed(4)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDeletePoi(poi.id)}
                              className="p-1 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                              title="Xóa POI khỏi bản đồ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
