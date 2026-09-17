/**
 * Định dạng tiền tệ Việt Nam Đồng (VNĐ)
 * @param amount Số tiền (ví dụ: 30000 -> "30.000 đ")
 */
export const formatCurrency = (amount: number, suffix: string = ' đ'): string => {
  if (amount === 0) return 'Miễn phí';
  return `${amount.toLocaleString('vi-VN')}${suffix}`;
};

/**
 * Định dạng khoảng cách từ mét sang mét hoặc kilomet
 * @param meters Khoảng cách tính bằng mét
 */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

/**
 * Định dạng thời gian từ giây sang chuỗi hiển thị thân thiện
 * @param seconds Thời gian tính bằng giây
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}p` : `${hours} giờ`;
};
