import React from 'react';
import { ArrowRight } from 'lucide-react';

interface NavigationProps {
  onLaunch?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLaunch }) => {
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

      {/* User-friendly Navigation Links */}
      <div className="flex items-center gap-6 sm:gap-8">
        <div className="hidden md:flex items-center space-x-7 text-xs text-[#6E6A63] font-sans tracking-wide">
          <a href="#thau-hieu" className="hover:text-[#1C382B] transition font-medium">Thấu hiểu</a>
          <a href="#cach-hoat-dong" className="hover:text-[#1C382B] transition font-medium">Cách hoạt động</a>
          <a href="#lich-trinh-mau" className="hover:text-[#1C382B] transition font-medium">Lịch trình mẫu</a>
        </div>

        {/* Start Button */}
        {onLaunch && (
          <button
            onClick={onLaunch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C382B] hover:bg-[#B85D3B] text-[#F8F5EE] text-xs font-medium transition active:scale-95 shadow-sm cursor-pointer"
          >
            <span>Tự tạo lịch trình ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </nav>
  );
};
