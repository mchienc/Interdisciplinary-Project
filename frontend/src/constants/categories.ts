export interface CategoryMeta {
  label: string;
  icon: string;
  desc?: string;
  bg?: string;
  text?: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  heritage: { label: 'Di tích lịch sử', icon: '🏛️', desc: 'Di sản & Văn hóa Thăng Long', bg: 'bg-amber-50 border-amber-200/80', text: 'text-amber-800' },
  culinary: { label: 'Ẩm thực phố cổ', icon: '🍜', desc: 'Hương vị 36 phố phường', bg: 'bg-orange-50 border-orange-200/80', text: 'text-orange-800' },
  nature: { label: 'Thiên nhiên & Hồ', icon: '⛵', desc: 'Không gian xanh & Gió mát ven hồ', bg: 'bg-emerald-50 border-emerald-200/80', text: 'text-emerald-800' },
  museum: { label: 'Bảo tàng nghệ thuật', icon: '🎨', desc: 'Triển lãm & Trầm tích thời gian', bg: 'bg-purple-50 border-purple-200/80', text: 'text-purple-800' },
  bridge: { label: 'Cầu di sản', icon: '🌉', desc: 'Chứng nhân lịch sử bắc qua sông Hồng', bg: 'bg-blue-50 border-blue-200/80', text: 'text-blue-800' },
  entertainment: { label: 'Giải trí & Vui chơi', icon: '🎡', desc: 'Hoạt động sôi động cho gia đình', bg: 'bg-rose-50 border-rose-200/80', text: 'text-rose-800' },
  shopping: { label: 'Mua sắm & TTTM', icon: '🛍️', desc: 'Đại siêu thị & Trung tâm thương mại', bg: 'bg-fuchsia-50 border-fuchsia-200/80', text: 'text-fuchsia-800' }
};

export const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([k, v]) => [k, v.icon])
);

export const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([k, v]) => [k, v.label])
);
