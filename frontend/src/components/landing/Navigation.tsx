import React from 'react';
import { ArrowRight, User as UserIcon, LogOut } from 'lucide-react';
import { ContextStatusPill } from '../common/ContextStatusPill';
import { useAuth } from '../../context/AuthContext';

interface NavigationProps {
  onLaunch?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLaunch }) => {
  const { user, isAuthenticated, setIsAuthModalOpen, logout } = useAuth();

  return (
    <nav className="w-full flex items-center justify-between z-20 pb-4 md:pb-6 border-b border-stone-300/40 select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#B85D3B] shadow-sm shadow-[#B85D3B]/30" />
        <span className="font-serif text-sm sm:text-base font-bold tracking-wider text-[#1C382B]">
          HÀ NỘI THONG DONG
        </span>
        <span className="hidden sm:inline-block text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-stone-200/70 text-stone-700 font-medium">
          Cẩm nang Thủ đô
        </span>
      </div>

      {/* User-friendly Navigation Links + Context Status */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="hidden lg:flex items-center space-x-6 text-xs text-[#6E6A63] font-sans tracking-wide mr-2">
          <a href="#thau-hieu" className="hover:text-[#1C382B] transition font-medium">Thấu hiểu</a>
          <a href="#cach-hoat-dong" className="hover:text-[#1C382B] transition font-medium">Cách hoạt động</a>
          <a href="#lich-trinh-mau" className="hover:text-[#1C382B] transition font-medium">Lịch trình mẫu</a>
        </div>

        {/* Real-time Weather & Traffic Status Pill */}
        <ContextStatusPill />

        {/* Trạng thái Đăng nhập / Tài khoản ngay trên Landing Page */}
        {isAuthenticated && user ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-stone-200 text-xs font-semibold text-[#1C382B] shadow-2xs">
            <UserIcon className="w-3.5 h-3.5 text-[#B85D3B]" />
            <span className="max-w-[110px] truncate">{user.full_name}</span>
            <button
              type="button"
              onClick={logout}
              title="Đăng xuất tài khoản"
              className="ml-1 p-1 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 hover:bg-stone-100 border border-stone-300/80 text-[#1C382B] text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#B85D3B]" />
            <span>Đăng nhập</span>
          </button>
        )}

        {/* Start Button */}
        {onLaunch && (
          <button
            onClick={onLaunch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C382B] hover:bg-[#B85D3B] text-[#F8F5EE] text-xs font-medium transition active:scale-95 shadow-sm cursor-pointer shrink-0"
          >
            <span>Tự tạo lịch trình ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </nav>
  );
};
