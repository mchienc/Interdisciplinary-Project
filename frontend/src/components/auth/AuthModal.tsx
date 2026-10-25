import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, loginWithGoogle, isLoading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal chọn tài khoản Google (khi chưa cấu hình Google Client ID trên GCP hoặc test nhanh)
  const [isGoogleSelectorOpen, setIsGoogleSelectorOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Tự động khởi tạo Google Identity Services (GIS) nếu có Client ID
  useEffect(() => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (clientId && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google) {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (response.credential) {
                try {
                  await loginWithGoogle({ credential: response.credential });
                } catch (err: any) {
                  setError(err.message || 'Đăng nhập Google thất bại');
                }
              }
            }
          });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

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

  const handleGoogleBtnClick = () => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (clientId && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt();
    } else {
      setIsGoogleSelectorOpen(true);
    }
  };

  const handleSelectGoogleAccount = async (account: { email: string; name: string; avatar: string }) => {
    setError(null);
    setIsGoogleSelectorOpen(false);
    try {
      await loginWithGoogle({
        email: account.email,
        full_name: account.name,
        avatar_url: account.avatar
      });
    } catch (err: any) {
      setError(err.message || 'Đăng nhập Google không thành công.');
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    setError(null);
    setIsGoogleSelectorOpen(false);
    try {
      await loginWithGoogle({
        email: customGoogleEmail.trim().toLowerCase(),
        full_name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(customGoogleName || customGoogleEmail)}&background=0D8ABC&color=fff`
      });
    } catch (err: any) {
      setError(err.message || 'Đăng nhập Google không thành công.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#FDFCF7] border border-stone-200/90 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 select-text relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-[#F4EFE6]/80 to-transparent border-b border-stone-200/70">
          <button
            onClick={() => { setIsAuthModalOpen(false); setIsGoogleSelectorOpen(false); }}
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

          {/* Nút Đăng nhập Liên kết Google */}
          <div>
            <button
              type="button"
              onClick={handleGoogleBtnClick}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-semibold shadow-2xs flex items-center justify-center gap-2.5 transition cursor-pointer hover:border-stone-400 active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            <div className="relative flex items-center justify-center my-3.5">
              <div className="w-full border-t border-stone-200"></div>
              <span className="bg-[#FDFCF7] px-2.5 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                hoặc dùng email &amp; mật khẩu
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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
          <div className="pt-2 border-t border-stone-200/80 text-center text-xs text-stone-500">
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

        {/* Modal Chọn Tài khoản Google (Google Account Selector) */}
        {isGoogleSelectorOpen && (
          <div className="absolute inset-0 z-20 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full bg-white rounded-2xl shadow-2xl border border-stone-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="font-semibold text-xs text-stone-800">Đăng nhập bằng Google</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGoogleSelectorOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] text-stone-500">
                  Chọn một tài khoản Google để tiếp tục đến <b>Hà Nội WebGIS</b>:
                </p>

                {/* Tài khoản mẫu 1: dangchien2005@gmail.com */}
                <button
                  type="button"
                  onClick={() => handleSelectGoogleAccount({
                    email: 'dangchien2005@gmail.com',
                    name: 'Đặng Chiến',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                  })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 hover:border-[#4285F4] hover:bg-blue-50/40 flex items-center gap-3 transition text-left cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                    alt="Đặng Chiến"
                    className="w-8 h-8 rounded-full object-cover border border-stone-200 group-hover:border-[#4285F4]"
                  />
                  <div className="flex-1 truncate">
                    <div className="text-xs font-bold text-stone-800 truncate">Đặng Chiến</div>
                    <div className="text-[11px] text-stone-500 font-mono truncate">dangchien2005@gmail.com</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition shrink-0" />
                </button>

                {/* Tài khoản mẫu 2: tourist.google@gmail.com */}
                <button
                  type="button"
                  onClick={() => handleSelectGoogleAccount({
                    email: 'tourist.google@gmail.com',
                    name: 'Nguyễn Văn Du Khách (Google)',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
                  })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 hover:border-[#4285F4] hover:bg-blue-50/40 flex items-center gap-3 transition text-left cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                    alt="Du Khách"
                    className="w-8 h-8 rounded-full object-cover border border-stone-200 group-hover:border-[#4285F4]"
                  />
                  <div className="flex-1 truncate">
                    <div className="text-xs font-bold text-stone-800 truncate">Nguyễn Văn Du Khách</div>
                    <div className="text-[11px] text-stone-500 font-mono truncate">tourist.google@gmail.com</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition shrink-0" />
                </button>
              </div>

              {/* Tùy chọn nhập tài khoản Google khác */}
              <form onSubmit={handleCustomGoogleSubmit} className="pt-2 border-t border-stone-100 space-y-2">
                <span className="text-[10px] text-stone-500 font-medium">Hoặc dùng tài khoản Google khác của bạn:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Tên của bạn"
                    className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#4285F4]"
                  />
                  <input
                    type="email"
                    required
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#4285F4]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-1.5 rounded-lg bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Tiếp tục với tài khoản này
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
