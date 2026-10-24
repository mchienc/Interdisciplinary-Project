import React from 'react';

export const ItinerarySkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-5 space-y-5 animate-in fade-in duration-200 select-none">
      {/* Top Banner Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-[#B85D3B]/40 border-t-[#B85D3B] rounded-full animate-spin shrink-0" />
        <div className="space-y-1 w-full">
          <div className="text-xs font-bold text-[#1C382B]">Đang tìm cung đường êm ả nhất...</div>
          <div className="text-[11px] text-stone-500">Đang cân bằng cự ly, thời tiết và nơi dừng chân tối ưu</div>
        </div>
      </div>

      {/* Hotel Recommendation Skeleton */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded-full skeleton-shimmer" />
          <div className="h-4 w-14 rounded-full skeleton-shimmer" />
        </div>
        <div className="h-5 w-48 rounded-md skeleton-shimmer" />
        <div className="h-3 w-36 rounded-md skeleton-shimmer" />
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="h-4 w-24 rounded-md skeleton-shimmer" />
          <div className="h-6 w-20 rounded-xl skeleton-shimmer" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 rounded-xl skeleton-shimmer" />
        <div className="h-8 w-24 rounded-xl skeleton-shimmer" />
        <div className="h-8 w-24 rounded-xl skeleton-shimmer" />
      </div>

      {/* Timeline Steps Skeleton */}
      <div className="space-y-3 pt-2">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full skeleton-shimmer shrink-0" />
              <div className="h-4 w-40 rounded-md skeleton-shimmer" />
            </div>
            <div className="h-3 w-full rounded-md skeleton-shimmer" />
            <div className="h-3 w-3/4 rounded-md skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
};
