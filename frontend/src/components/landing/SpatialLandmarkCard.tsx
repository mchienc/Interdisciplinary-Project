import React from 'react';

interface SpatialLandmarkCardProps {
  onSelectPreset?: (poiIds: number[]) => void;
}

export const SpatialLandmarkCard: React.FC<SpatialLandmarkCardProps> = ({
  onSelectPreset
}) => {
  return (
    <div 
      className="visual-showcase-main relative w-full h-[520px] lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-stone-900/15 ring-1 ring-black/5 group cursor-pointer select-none transition-all duration-500"
      onClick={() => onSelectPreset && onSelectPreset([3, 1, 4])}
      role="button"
      tabIndex={0}
      title="Khám phá du lịch Hà Nội"
    >
      {/* Pure Heritage Photo */}
      <img
        src="/landing-bg.webp"
        alt="Khuê Văn Các — Văn Miếu Quốc Tử Giám Hà Nội"
        className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105 filter brightness-100 contrast-[1.02]"
      />

      {/* Very subtle bottom vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
