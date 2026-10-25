import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User as UserIcon, Mail, Lock, ArrowRight, 
  AlertCircle, CheckCircle2, KeyRound, ShieldCheck, 
  Settings, ChevronLeft 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { forgotPasswordApi, resetPasswordApi } from '../../services/authService';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, loginWithGoogle, isLoading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login / Register states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Forgot password states
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Google OAuth Client ID state
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return localStorage.getItem('custom_google_client_id') || 
           (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  });
  const [showGcpConfig, setShowGcpConfig] = useState(false);
  const [tempClientId, setTempClientId] = useState(googleClientId);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const isLikelyApiKey = Boolean(googleClientId && (googleClientId.startsWith('AIza') || !googleClientId.includes('apps.googleusercontent.com')));

  // Khởi tạo Google Identity Services (GIS)
  useEffect(() => {
    const initGIS = () => {
      if ((window as any).google?.accounts?.id && googleClientId && !isLikelyApiKey) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              if (response.credential) {
                try {
                  setIsGoogleSigningIn(true);
                  await loginWithGoogle({ credential: response.credential });
                  setSuccessNotice('Đăng nhập Google thành công!');
                } catch (err: any) {
                  setError(err.message || 'Đăng nhập Google không thành công.');
                } finally {
                  setIsGoogleSigningIn(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            (window as any).google.accounts.id.renderButton(
              googleBtnContainerRef.current,
              {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'pill',
                logo_alignment: 'left',
                width: 380
              }
            );
          }
        } catch (e) {
          console.warn('GIS Init warning:', e);
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGIS();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGIS;
      document.body.appendChild(script);
    }
  }, [googleClientId, isAuthModalOpen, tab, isLikelyApiKey]);

  if (!isAuthModalOpen) return null;

  // Xử lý bật Popup Đăng nhập Google thật sự
  const triggerRealGooglePopup = () => {
    setError(null);
    setSuccessNotice(null);

    const activeClientId = googleClientId.trim() || 
                           localStorage.getItem('custom_google_client_id') || 
                           (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

    if (!activeClientId) {
      setShowGcpConfig(true);
      setError('Vui lòng nhập Google OAuth Client ID của bạn để mở cửa sổ Google thật.');
      return;
    }

    if (activeClientId.startsWith('AIza') || !activeClientId.includes('apps.googleusercontent.com')) {
      setShowGcpConfig(true);
      setError('Mã hiện tại là API Key. Vui lòng nhập OAuth 2.0 Client ID (đuôi .apps.googleusercontent.com) để Google mở cửa sổ xác thực.');
      return;
    }

    // Sử dụng OAuth 2.0 Token Client chính hãng của Google GIS
    if ((window as any).google?.accounts?.oauth2) {
      try {
        setIsGoogleSigningIn(true);
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: activeClientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setIsGoogleSigningIn(false);
              setError(`Google thông báo: ${tokenResponse.error_description || tokenResponse.error}`);
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                // Gọi Google UserInfo API thật
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await res.json();
                if (profile?.email) {
                  await loginWithGoogle({
                    email: profile.email,
                    full_name: profile.name || profile.email.split('@')[0],
                    avatar_url: profile.picture,
                    credential: tokenResponse.access_token
                  });
                  setSuccessNotice(`Đăng nhập Google thành công (${profile.email})`);
                } else {
                  setError('Không nhận được email từ tài khoản Google.');
                }
              } catch (err: any) {
                setError(err.message || 'Lỗi khi đồng bộ tài khoản Google với máy chủ.');
              } finally {
                setIsGoogleSigningIn(false);
              }
            }
          }
        });

        // BẬT CỬA SỔ POPUP THẬT CỦA GOOGLE (accounts.google.com)
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (e: any) {
        setIsGoogleSigningIn(false);
        console.error('Error triggering Google popup:', e);
        setError(`Không thể mở cửa sổ Google: ${e?.message || e}`);
      }
    } else {
      setError('Thư viện Google Identity Services đang tải, vui lòng thử lại sau vài giây.');
    }
  };

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

  // Xử lý gửi OTP khôi phục mật khẩu
  const handleForgotRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setIsForgotLoading(true);
    try {
      const res = await forgotPasswordApi(forgotEmail);
      setForgotStep('reset');
      setSuccessNotice(res.message);
      if (res.simulated_otp) {
        setSimulatedOtpNotice(res.simulated_otp);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể gửi yêu cầu khôi phục mật khẩu.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Xử lý đặt lại mật khẩu mới
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng nhập lại.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const res = await resetPasswordApi(forgotEmail, otpCode, newPassword);
      setSuccessNotice(res.message);
      setEmail(forgotEmail);
      setPassword(newPassword);
      setTimeout(() => {
        setTab('login');
        setForgotStep('request');
        setOtpCode('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Lưu Google Client ID tuỳ chỉnh và kích hoạt popup ngay
  const handleSaveClientId = () => {
    const trimmed = tempClientId.trim();
    setGoogleClientId(trimmed);
    localStorage.setItem('custom_google_client_id', trimmed);
    setShowGcpConfig(false);
    if (trimmed && trimmed.includes('apps.googleusercontent.com')) {
      setSuccessNotice('Đã lưu Client ID! Đang chuẩn bị mở cửa sổ Google...');
      setTimeout(() => {
        triggerRealGooglePopup();
      }, 300);
    } else {
      setError('Mã phải kết thúc bằng .apps.googleusercontent.com');
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
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="pr-8">
            <h3 className="font-serif text-xl font-bold text-[#1C382B] leading-tight">
              {tab === 'login' ? 'Đăng Nhập Tài Khoản' : tab === 'register' ? 'Tạo Tài Khoản Mới' : 'Khôi Phục Mật Khẩu'}
            </h3>
            <p className="text-xs text-stone-500 font-sans mt-1">
              Hệ thống Du lịch Thông minh &amp; WebGIS Hà Nội
            </p>
          </div>

          {/* Switch Tab (Đăng nhập / Đăng ký) */}
          {tab !== 'forgot' ? (
            <div className="grid grid-cols-2 gap-1 p-1 mt-4 bg-stone-200/60 rounded-xl">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); setSuccessNotice(null); }}
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
                onClick={() => { setTab('register'); setError(null); setSuccessNotice(null); }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  tab === 'register'
                    ? 'bg-white text-[#1C382B] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Đăng ký mới
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); setSuccessNotice(null); }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C382B] hover:text-[#B85D3B] transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại Đăng nhập</span>
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* TAB 1 & 2: ĐĂNG NHẬP HOẶC ĐĂNG KÝ */}
          {tab !== 'forgot' && (
            <>
              {/* Nút Đăng nhập Liên kết Google THẬT SỰ */}
              <div className="space-y-2">
                {isLikelyApiKey && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] space-y-1">
                    <div className="font-bold flex items-center gap-1 text-amber-900">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Đang dùng API Key thay vì OAuth Client ID</span>
                    </div>
                    <p className="leading-relaxed">
                      Mã bạn nhập bắt đầu bằng <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">AIzaSy...</code> là API Key (Gemini/Maps). Để đăng nhập Google thật, bạn cần tạo <b>OAuth 2.0 Client ID</b> (kết thúc bằng <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">.apps.googleusercontent.com</code>) trong Google Cloud Console.
                    </p>
                  </div>
                )}

                {/* Nút Google thật sự (Gọi popup Google accounts.google.com) */}
                <button
                  type="button"
                  onClick={triggerRealGooglePopup}
                  disabled={isLoading || isGoogleSigningIn}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-semibold shadow-2xs flex items-center justify-center gap-2.5 transition cursor-pointer hover:border-stone-400 active:scale-[0.99] disabled:opacity-50"
                  title="Mở cửa sổ đăng nhập chính thức của Google"
                >
                  {isGoogleSigningIn ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  )}
                  <span>{isGoogleSigningIn ? 'Đang mở cửa sổ Google...' : 'Tiếp tục với Google'}</span>
                </button>

                {/* Nút official của Google GIS nếu Client ID hợp lệ */}
                {googleClientId && !isLikelyApiKey && (
                  <div className="flex flex-col items-center pt-1">
                    <div ref={googleBtnContainerRef} className="w-full flex justify-center min-h-[40px]"></div>
                    <span className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Google Identity Services chính thức (Popup tài khoản thật)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowGcpConfig(!showGcpConfig)}
                    className="hover:text-stone-700 flex items-center gap-1 cursor-pointer transition text-[11px]"
                  >
                    <Settings className="w-3 h-3 text-stone-400" />
                    <span>{googleClientId ? 'Thay đổi Google Client ID' : 'Nhập Google OAuth Client ID thật'}</span>
                  </button>
                  <span className="text-[10px] text-stone-400">Popup accounts.google.com</span>
                </div>

                {/* Box cấu hình Client ID cho người dùng / dev */}
                {showGcpConfig && (
                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-200/90 text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-700 text-[11px]">Dán mã OAuth 2.0 Client ID:</span>
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4285F4] hover:underline text-[10px]"
                      >
                        Mở Google Cloud Console ↗
                      </a>
                    </div>
                    <input
                      type="text"
                      value={tempClientId}
                      onChange={(e) => setTempClientId(e.target.value)}
                      placeholder="123456789-xxx.apps.googleusercontent.com"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-mono"
                    />
                    <p className="text-[10px] text-stone-500 leading-tight">
                      Mã lấy từ Google Cloud Console &gt; Credentials &gt; OAuth 2.0 Client IDs (loại Web Application).
                    </p>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowGcpConfig(false)}
                        className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                      >
                        Đóng
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveClientId}
                        className="px-3 py-1 bg-[#1C382B] text-white text-xs font-semibold rounded-lg hover:bg-[#14291F] cursor-pointer"
                      >
                        Lưu &amp; Mở Google
                      </button>
                    </div>
                  </div>
                )}

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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                      Mật khẩu
                    </label>
                    {tab === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setTab('forgot');
                          setForgotEmail(email);
                          setError(null);
                          setSuccessNotice(null);
                        }}
                        className="text-[11px] font-semibold text-[#B85D3B] hover:underline cursor-pointer"
                      >
                        Quên mật khẩu?
                      </button>
                    )}
                  </div>
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
            </>
          )}

          {/* TAB 3: QUÊN MẬT KHẨU (FORGOT PASSWORD / PASSWORD RESET) */}
          {tab === 'forgot' && (
            <div className="space-y-4">
              {/* Option 1: Đăng nhập tức thì bằng Google thật */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Khôi phục tức thì qua Google (Không cần mật khẩu cũ)</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Nếu bạn dùng Gmail, bạn có thể xác thực chính chủ qua Google để truy cập tài khoản ngay lập tức.
                </p>
                <button
                  type="button"
                  onClick={triggerRealGooglePopup}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-blue-100/60 border border-blue-300 text-blue-800 text-xs font-semibold shadow-2xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Mở Google để xác thực</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="w-full border-t border-stone-200"></div>
                <span className="bg-[#FDFCF7] px-2.5 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  hoặc đặt lại mật khẩu bằng mã OTP Email
                </span>
              </div>

              {/* BƯỚC 1: NHẬP EMAIL ĐỂ GỬI MÃ OTP */}
              {forgotStep === 'request' && (
                <form onSubmit={handleForgotRequestSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Nhập địa chỉ Email tài khoản của bạn
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="ten-ban@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B85D3B]/40 focus:border-[#B85D3B]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full py-2.5 rounded-xl bg-[#1C382B] hover:bg-[#14291F] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isForgotLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Gửi mã xác thực OTP về Email</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* BƯỚC 2: NHẬP MÃ OTP VÀ MẬT KHẨU MỚI */}
              {forgotStep === 'reset' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-3 bg-stone-100 rounded-xl text-xs space-y-1">
                    <div className="text-stone-600 font-medium">Mã OTP gửi đến: <b>{forgotEmail}</b></div>
                    {simulatedOtpNotice && (
                      <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/80">
                        🔑 <b>Mã OTP mẫu thử nghiệm:</b> <span className="font-mono font-bold tracking-widest text-[#B85D3B]">{simulatedOtpNotice}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Mã xác thực OTP (6 chữ số)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="vd: 849201"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-center font-mono font-bold tracking-widest text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B85D3B]/40 focus:border-[#B85D3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Mật khẩu mới (Tối thiểu 6 ký tự)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B85D3B]/40 focus:border-[#B85D3B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Nhập lại mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B85D3B]/40 focus:border-[#B85D3B]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold transition cursor-pointer"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="flex-1 py-2.5 rounded-xl bg-[#1C382B] hover:bg-[#14291F] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      {isForgotLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cập nhật Mật khẩu Mới</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
