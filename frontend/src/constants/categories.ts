export interface CategoryMeta {
  label: string;
  icon: string;
  desc?: string;
  bg?: string;
  text?: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  heritage: { label: 'Di tích lịch sử', icon: '', desc: 'Di sản & Văn hóa Thăng Long', bg: 'bg-amber-50 border-amber-200/80', text: 'text-amber-800' },
  culinary: { label: 'Ẩm thực phố cổ', icon: '', desc: 'Hương vị 36 phố phường', bg: 'bg-[#B85D3B]/10 border-[#B85D3B]/30', text: 'text-[#B85D3B]' },
  nature: { label: 'Thiên nhiên & Hồ', icon: '', desc: 'Không gian xanh & Gió mát ven hồ', bg: 'bg-emerald-50 border-emerald-200/80', text: 'text-emerald-800' },
  museum: { label: 'Bảo tàng nghệ thuật', icon: '', desc: 'Triển lãm & Trầm tích thời gian', bg: 'bg-stone-100 border-stone-200', text: 'text-[#1C382B]' },
  bridge: { label: 'Cầu di sản', icon: '', desc: 'Chứng nhân lịch sử bắc qua sông Hồng', bg: 'bg-teal-50 border-teal-200/80', text: 'text-teal-800' },
  entertainment: { label: 'Giải trí & Vui chơi', icon: '', desc: 'Hoạt động sôi động cho gia đình', bg: 'bg-amber-100/70 border-amber-300/80', text: 'text-amber-900' },
  shopping: { label: 'Mua sắm & TTTM', icon: '', desc: 'Đại siêu thị & Trung tâm thương mại', bg: 'bg-stone-100 border-stone-300/80', text: 'text-stone-800' }
};

export const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([k, v]) => [k, v.icon])
);

export const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([k, v]) => [k, v.label])
);
