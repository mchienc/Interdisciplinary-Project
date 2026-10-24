import React, { useState } from 'react';
import { X, User as UserIcon, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, isLoading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (!fullName.trim()) {
          setError('Vui lòng nhập họ và tên của bạn.');
          return;
        }
        await register(email, password, fullName);
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#FDFCF7] border border-stone-200/90 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-[#F4EFE6]/80 to-transparent border-b border-stone-200/70">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="pr-8">
            <h3 className="font-serif text-xl font-bold text-[#1C382B] leading-tight">
              {tab === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
            </h3>
            <p className="text-xs text-stone-500 font-sans mt-1">
              Hệ thống Du lịch Thông minh &amp; WebGIS Hà Nội
            </p>
          </div>

          {/* Switch Tab (Đăng nhập / Đăng ký) */}
          <div className="grid grid-cols-2 gap-1 p-1 mt-4 bg-stone-200/60 rounded-xl">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                tab === 'login'
                  ? 'bg-white text-[#1C382B] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                tab === 'register'
                  ? 'bg-white text-[#1C382B] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Đăng ký mới
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Họ và Tên
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn Du Khách"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B85D3B]/40 focus:border-[#B85D3B]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B85D3B]/40 focus:border-[#B85D3B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B85D3B]/40 focus:border-[#B85D3B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#1C382B] hover:bg-[#14291F] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{tab === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill / Demo Credentials */}
          {tab === 'login' && (
            <div className="p-3 bg-stone-100/90 rounded-2xl border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <span>Tài khoản mẫu thử nghiệm</span>
                <span className="text-[10px] text-stone-400 font-normal">Bấm để điền nhanh</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@example.com');
                    setPassword('admin123');
                    setError(null);
                  }}
                  className="px-2.5 py-2 text-left bg-white border border-stone-200/90 hover:border-[#1C382B] rounded-xl text-xs transition cursor-pointer group shadow-2xs"
                >
                  <div className="font-semibold text-[#1C382B] flex items-center justify-between">
                    <span>Quản trị viên</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">Admin</span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono truncate mt-0.5">admin@example.com</div>
                  <div className="text-[10px] text-stone-400 font-mono">pass: admin123</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('tourist@hanoitravel.vn');
                    setPassword('tourist123');
                    setError(null);
                  }}
                  className="px-2.5 py-2 text-left bg-white border border-stone-200/90 hover:border-[#B85D3B] rounded-xl text-xs transition cursor-pointer group shadow-2xs"
                >
                  <div className="font-semibold text-stone-800 flex items-center justify-between">
                    <span>Du khách mẫu</span>
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1 py-0.5 rounded">User</span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono truncate mt-0.5">tourist@hanoitravel.vn</div>
                  <div className="text-[10px] text-stone-400 font-mono">pass: tourist123</div>
                </button>
              </div>
            </div>
          )}

          {/* Chuyển đổi nhanh Đăng nhập / Đăng ký */}
          <div className="pt-3 border-t border-stone-200/80 text-center text-xs text-stone-500">
            {tab === 'login' ? (
              <p>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('register'); setError(null); }}
                  className="font-semibold text-[#B85D3B] hover:underline cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </p>
            ) : (
              <p>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(null); }}
                  className="font-semibold text-[#1C382B] hover:underline cursor-pointer"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
