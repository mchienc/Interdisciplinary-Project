import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  BarChart3, 
  MapPin, 
  Users, 
  Calendar, 
  Trash2, 
  Search, 
  Compass, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  Tag,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getAdminStatsApi, 
  deletePoiAdminApi,
  getPendingPoisApi,
  approvePoiAdminApi,
  rejectPoiAdminApi,
  getAdminUsersApi
} from '../../services/authService';
import { AdminStats, POI, User } from '../../types';

interface AdminDashboardModalProps {
  pois: POI[];
  onPoiDeleted?: (poiId: number) => void;
  onPoiApproved?: (poi: POI) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ 
  pois, 
  onPoiDeleted,
  onPoiApproved 
}) => {
  const { isAdminModalOpen, setIsAdminModalOpen, token, user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'pois' | 'pending' | 'users'>('stats');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pendingPois, setPendingPois] = useState<POI[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    if (isAdminModalOpen && token) {
      loadStats();
      loadPending();
      loadUsers();
    }
  }, [isAdminModalOpen, token]);

  const loadUsers = async () => {
    if (!token) return;
    try {
      const uList = await getAdminUsersApi(token);
      setAdminUsers(uList);
    } catch (err) {
      console.warn('Lỗi tải danh sách người dùng:', err);
    }
  };

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

  const loadPending = async () => {
    if (!token) return;
    try {
      const list = await getPendingPoisApi(token);
      setPendingPois(list);
    } catch (err) {
      console.error('Lỗi khi tải danh sách chờ duyệt:', err);
    }
  };

  if (!isAdminModalOpen) return null;

  const filteredPois = pois.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePoi = async (poiId: number) => {
    if (!token || !window.confirm(`Bạn có chắc chắn muốn xóa điểm du lịch #${poiId} khỏi hệ thống không?`)) return;
    try {
      await deletePoiAdminApi(poiId, token);
      if (onPoiDeleted) onPoiDeleted(poiId);
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa điểm này.');
    }
  };

  const handleApprovePoi = async (poi: POI) => {
    if (!token) return;
    setActionLoadingId(poi.id);
    try {
      await approvePoiAdminApi(poi.id, token);
      setPendingPois(prev => prev.filter(p => p.id !== poi.id));
      if (onPoiApproved) {
        onPoiApproved({ ...poi, status: 'approved' });
      }
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Không thể duyệt điểm này');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectPoi = async (poiId: number) => {
    if (!token || !window.confirm(`Bạn có chắc muốn từ chối đề xuất điểm du lịch #${poiId}?`)) return;
    setActionLoadingId(poiId);
    try {
      await rejectPoiAdminApi(poiId, token);
      setPendingPois(prev => prev.filter(p => p.id !== poiId));
    } catch (err: any) {
      alert(err.message || 'Không thể từ chối điểm này');
    } finally {
      setActionLoadingId(null);
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
                <span>Thống kê</span>
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
                <span>Điểm trên bản đồ ({pois.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer relative ${
                  activeTab === 'pending'
                    ? 'bg-white text-[#1C382B] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Duyệt điểm mới</span>
                {pendingPois.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#B85D3B] text-white text-[9px] font-bold">
                    {pendingPois.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-white text-[#1C382B] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Thành viên ({adminUsers.length || stats?.total_users || 0})</span>
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
            /* TAB 1: THỐNG KÊ TỔNG THỂ */
            <div className="space-y-6">
              {/* 3 Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B85D3B]" />
                    Tổng Điểm Tham Quan
                  </div>
                  <div className="font-serif text-2xl font-bold text-[#1C382B]">
                    {stats?.total_pois || pois.length}
                  </div>
                  <div className="text-[10px] text-stone-400">Đã kiểm duyệt & lưu trữ</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Tổng Chuyến Đi Đã Lưu
                  </div>
                  <div className="font-serif text-2xl font-bold text-emerald-900">
                    {stats?.total_trips || 0}
                  </div>
                  <div className="text-[10px] text-stone-400">Từ cộng đồng du khách</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Du Khách Đã Đăng Ký
                  </div>
                  <div className="font-serif text-2xl font-bold text-blue-900">
                    {stats?.total_users || 1}
                  </div>
                  <div className="text-[10px] text-stone-400">Thành viên hệ thống</div>
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
          ) : activeTab === 'pois' ? (
            /* TAB 2: QUẢN LÝ POI TRÊN BẢN ĐỒ */
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
                        <th className="py-2.5 px-3">Không Gian</th>
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
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] text-stone-600">
                              {poi.venue_type === 'indoor' ? 'Trong nhà' : poi.venue_type === 'semi-indoor' ? 'Bán lộ thiên' : 'Ngoài trời'}
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
          ) : activeTab === 'pending' ? (
            /* TAB 3: DUYỆT ĐIỂM MỚI DO DU KHÁCH ĐÓNG GÓP (HƯỚNG 4) */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#1C382B] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Yêu cầu Đề xuất Điểm Tham quan Mới</span>
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Kiểm duyệt các địa điểm do du khách gửi lên trước khi chính thức hiển thị cho cộng đồng.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                  {pendingPois.length} địa điểm chờ duyệt
                </span>
              </div>

              {pendingPois.length === 0 ? (
                <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-serif text-base font-bold text-stone-800">
                    Tất cả địa điểm đã được kiểm duyệt!
                  </div>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Hiện không có yêu cầu nào đang chờ xử lý. Khi du khách bấm "Thêm điểm đến", yêu cầu mới sẽ xuất hiện tại đây.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPois.map(poi => (
                    <div 
                      key={poi.id}
                      className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif text-sm font-bold text-stone-900">
                              {poi.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryColor(poi.category)}`}>
                              {poi.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                              {poi.venue_type === 'indoor' ? 'Trong nhà' : 'Ngoài trời'}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-500 flex items-center gap-3">
                            <span>Người đề xuất: <b>{poi.submitted_by || 'Du khách'}</b></span>
                            <span>•</span>
                            <span className="font-mono text-stone-400">Tọa độ: {poi.lat.toFixed(4)}, {poi.lon.toFixed(4)}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleRejectPoi(poi.id)}
                            disabled={actionLoadingId === poi.id}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                            title="Từ chối đề xuất này"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Từ chối</span>
                          </button>

                          <button
                            onClick={() => handleApprovePoi(poi)}
                            disabled={actionLoadingId === poi.id}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                            title="Duyệt điểm này đưa lên bản đồ chính thức"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Phê duyệt lên bản đồ</span>
                          </button>
                        </div>
                      </div>

                      {/* Description & Tips */}
                      <p className="text-xs text-stone-600 bg-[#FAF7F0] p-2.5 rounded-xl border border-stone-200/60 leading-relaxed">
                        {poi.description || 'Không có mô tả chi tiết.'}
                        {poi.tips && <span className="block mt-1 text-[11px] text-[#B85D3B] font-medium">💡 Gợi ý: {poi.tips}</span>}
                      </p>

                      {/* Duration & Price footer */}
                      <div className="flex items-center gap-4 text-[11px] text-stone-500 pt-1 border-t border-stone-100 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#B85D3B]" />
                          Dự kiến: {poi.estimated_duration_min || 60} phút
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                          Giá vé: {poi.ticket_price ? `${poi.ticket_price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                        </span>
                        {poi.opening_hours && (
                          <span>Giờ mở cửa: {poi.opening_hours}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TAB 4: QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG & PHÂN QUYỀN TRONG CSDL */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>Cơ sở Dữ liệu Tài khoản (Bảng `users`)</span>
                  </h4>
                  <p className="text-xs text-emerald-800/80 mt-0.5">
                    Toàn bộ tài khoản du khách và quản trị viên được lưu trữ bền vững với mã hóa mật khẩu bcrypt và phân quyền RBAC.
                  </p>
                </div>
                <span className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 text-xs font-mono font-bold rounded-xl shadow-2xs">
                  {adminUsers.length} tài khoản
                </span>
              </div>

              <div className="overflow-hidden bg-white border border-stone-200 rounded-2xl shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Họ và Tên</th>
                      <th className="py-3 px-4">Địa chỉ Email</th>
                      <th className="py-3 px-4">Vai trò (Role)</th>
                      <th className="py-3 px-4 text-right">Trạng thái CSDL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50/50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-stone-400">
                          #{u.id}
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          {u.full_name || 'Chưa đặt tên'}
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-600">
                          {u.email}
                        </td>
                        <td className="py-3 px-4">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Quản Trị Viên (Admin)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Compass className="w-3 h-3 text-amber-600" />
                              Du Khách (Traveler)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-50 text-emerald-700 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đã đồng bộ CSDL
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
