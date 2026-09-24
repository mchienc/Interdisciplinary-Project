import { CurrentWeather, HourlyForecastItem, WeatherConditionType, SimulationScenario } from '../types';

const OPEN_METEO_URL = 
  'https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,uv_index&hourly=precipitation_probability,weather_code,temperature_2m&timezone=Asia%2FBangkok';

/**
 * Bảng ánh xạ mã thời tiết WMO tiêu chuẩn quốc tế sang tiếng Việt và biểu tượng
 */
export const WMO_CODE_INFO: Record<number, { label: string; icon: string }> = {
  0: { label: 'Trời quang, nắng nhẹ', icon: '☀️' },
  1: { label: 'Ít mây, trời trong', icon: '🌤️' },
  2: { label: 'Mây rải rác', icon: '⛅' },
  3: { label: 'Nhiều mây, dịu mát', icon: '☁️' },
  45: { label: 'Sương mù nhẹ', icon: '🌫️' },
  48: { label: 'Sương mù dày đặc', icon: '🌫️' },
  51: { label: 'Mưa phùn bay', icon: '🌦️' },
  53: { label: 'Mưa phùn vừa', icon: '🌦️' },
  55: { label: 'Mưa phùn hạt nặng', icon: '🌧️' },
  61: { label: 'Mưa rào nhẹ', icon: '🌧️' },
  63: { label: 'Mưa rào ngắt quãng', icon: '🌧️' },
  65: { label: 'Mưa to nặng hạt', icon: '🌧️' },
  71: { label: 'Mưa tuyết nhẹ', icon: '🌨️' },
  73: { label: 'Mưa tuyết vừa', icon: '🌨️' },
  75: { label: 'Mưa tuyết dày', icon: '🌨️' },
  80: { label: 'Mưa rào bất chợt', icon: '🌦️' },
  81: { label: 'Mưa rào lớn', icon: '🌧️' },
  82: { label: 'Mưa dông dồn dập', icon: '⛈️' },
  95: { label: 'Dông bão nhiệt đới', icon: '🌩️' },
  96: { label: 'Dông kèm mưa đá nhẹ', icon: '⛈️' },
  99: { label: 'Dông kèm mưa đá to', icon: '⛈️' },
};

export const classifyWeatherCondition = (
  temp: number,
  precip: number,
  code: number,
  uv: number
): WeatherConditionType => {
  if (code >= 51 || precip > 0.5) {
    return 'RAIN';
  }
  if (temp > 36 || uv >= 8) {
    return 'HEAT_PEAK';
  }
  return 'FAVORABLE';
};

export const getWeatherAdvice = (condition: WeatherConditionType, temp: number): string => {
  switch (condition) {
    case 'RAIN':
      return 'Mưa rào xuất hiện tại nội thành. Hệ thống đề xuất ưu tiên các bảo tàng, không gian triển lãm trong nhà để hành trình luôn thư thái.';
    case 'HEAT_PEAK':
      return `Nhiệt độ ngoài trời chạm ngưỡng ${temp.toFixed(1)}°C kèm chỉ số UV cao. Nên dạo phố vào sáng sớm hoặc sau 16:30; trưa ghé tổ hợp máy lạnh nghỉ ngơi.`;
    case 'FAVORABLE':
    default:
      return 'Tiết trời Hà Nội trong trẻo, nhiệt độ dịu mát. Thời điểm hoàn hảo cho các hoạt động tản bộ di sản, khám phá ngõ phố cổ và ngắm hoàng hôn Hồ Tây.';
  }
};

/**
 * Tải dữ liệu thời tiết trực tiếp từ Open-Meteo API
 */
export const fetchLiveWeather = async (): Promise<{
  weather: CurrentWeather;
  forecast: HourlyForecastItem[];
}> => {
  try {
    const res = await fetch(OPEN_METEO_URL);
    if (!res.ok) throw new Error('Open-Meteo API response not ok');
    const data = await res.json();

    const curr = data.current;
    const temp = curr.temperature_2m;
    const apparentTemp = curr.apparent_temperature;
    const humidity = curr.relative_humidity_2m;
    const precip = curr.precipitation || 0;
    const code = curr.weather_code || 0;
    const uv = curr.uv_index || 0;

    const condition = classifyWeatherCondition(temp, precip, code, uv);
    const codeInfo = WMO_CODE_INFO[code] || { label: 'Thời tiết Hà Nội', icon: '🌤️' };

    const weather: CurrentWeather = {
      temperature: temp,
      apparentTemperature: apparentTemp,
      humidity,
      precipitation: precip,
      weatherCode: code,
      uvIndex: uv,
      condition,
      conditionLabel: codeInfo.label,
      conditionIcon: codeInfo.icon,
      advice: getWeatherAdvice(condition, temp),
      updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    // Lấy dự báo 6 giờ tới từ data.hourly
    const hourlyTimes = data.hourly?.time || [];
    const hourlyPrecipProb = data.hourly?.precipitation_probability || [];
    const hourlyCodes = data.hourly?.weather_code || [];
    const hourlyTemps = data.hourly?.temperature_2m || [];

    const now = new Date();
    const currentHourStr = now.toISOString().slice(0, 13); // 'YYYY-MM-DDTHH'
    let startIndex = hourlyTimes.findIndex((t: string) => t.startsWith(currentHourStr));
    if (startIndex === -1) startIndex = 0;

    const forecast: HourlyForecastItem[] = [];
    for (let i = 0; i < 6; i++) {
      const idx = startIndex + i;
      if (idx < hourlyTimes.length) {
        const rawTime = hourlyTimes[idx];
        const hour = new Date(rawTime).getHours();
        forecast.push({
          time: `${hour}:00`,
          hour,
          rainProb: hourlyPrecipProb[idx] ?? 0,
          weatherCode: hourlyCodes[idx] ?? 0,
          temp: hourlyTemps[idx] ?? temp
        });
      }
    }

    return { weather, forecast };
  } catch (error) {
    // Trả về dữ liệu mùa thu chuẩn Hà Nội nếu offline hoặc lỗi mạng
    return getSimulatedWeather('AUTUMN_PERFECT');
  }
};

/**
 * Sinh dữ liệu giả lập cho các kịch bản thời tiết để thuyết minh & kiểm thử đồ án
 */
export const getSimulatedWeather = (
  scenario: SimulationScenario
): { weather: CurrentWeather; forecast: HourlyForecastItem[] } => {
  const now = new Date();
  const baseHour = now.getHours();

  if (scenario === 'RAIN_STORM') {
    return {
      weather: {
        temperature: 24.2,
        apparentTemperature: 25.8,
        humidity: 93,
        precipitation: 4.8,
        weatherCode: 63,
        uvIndex: 1.2,
        condition: 'RAIN',
        conditionLabel: 'Mưa rào ngắt quãng',
        conditionIcon: '🌧️',
        advice: 'Dự báo có mưa rào trong 45 phút tới. Hệ thống tự động đẩy các điểm tham quan trong nhà lên trước để chuyến đi trọn vẹn.',
        updatedAt: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      },
      forecast: [
        { time: `${(baseHour) % 24}:00`, hour: baseHour % 24, rainProb: 85, weatherCode: 63, temp: 24 },
        { time: `${(baseHour + 1) % 24}:00`, hour: (baseHour + 1) % 24, rainProb: 90, weatherCode: 65, temp: 23.5 },
        { time: `${(baseHour + 2) % 24}:00`, hour: (baseHour + 2) % 24, rainProb: 75, weatherCode: 61, temp: 24 },
        { time: `${(baseHour + 3) % 24}:00`, hour: (baseHour + 3) % 24, rainProb: 50, weatherCode: 51, temp: 24.5 },
        { time: `${(baseHour + 4) % 24}:00`, hour: (baseHour + 4) % 24, rainProb: 25, weatherCode: 3, temp: 25 },
        { time: `${(baseHour + 5) % 24}:00`, hour: (baseHour + 5) % 24, rainProb: 10, weatherCode: 1, temp: 25.5 }
      ]
    };
  }

  if (scenario === 'HEAT_WAVE') {
    return {
      weather: {
        temperature: 38.4,
        apparentTemperature: 43.2,
        humidity: 56,
        precipitation: 0,
        weatherCode: 0,
        uvIndex: 10.4,
        condition: 'HEAT_PEAK',
        conditionLabel: 'Nắng gắt gay gắt',
        conditionIcon: '☀️',
        advice: 'Nhiệt độ ngoài trời lên tới 38.4°C kèm chỉ số UV cực đại. Đề xuất dời điểm ngoài trời về chiều muộn, ưu tiên không gian máy lạnh.',
        updatedAt: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      },
      forecast: [
        { time: `${(baseHour) % 24}:00`, hour: baseHour % 24, rainProb: 0, weatherCode: 0, temp: 38.4 },
        { time: `${(baseHour + 1) % 24}:00`, hour: (baseHour + 1) % 24, rainProb: 0, weatherCode: 0, temp: 38.8 },
        { time: `${(baseHour + 2) % 24}:00`, hour: (baseHour + 2) % 24, rainProb: 5, weatherCode: 1, temp: 37.5 },
        { time: `${(baseHour + 3) % 24}:00`, hour: (baseHour + 3) % 24, rainProb: 5, weatherCode: 1, temp: 36.0 },
        { time: `${(baseHour + 4) % 24}:00`, hour: (baseHour + 4) % 24, rainProb: 0, weatherCode: 1, temp: 34.0 },
        { time: `${(baseHour + 5) % 24}:00`, hour: (baseHour + 5) % 24, rainProb: 0, weatherCode: 0, temp: 31.5 }
      ]
    };
  }

  if (scenario === 'PEAK_EVENING') {
    return {
      weather: {
        temperature: 28.5,
        apparentTemperature: 30.1,
        humidity: 74,
        precipitation: 0,
        weatherCode: 2,
        uvIndex: 2.1,
        condition: 'FAVORABLE',
        conditionLabel: 'Trời dịu mát, nhiều mây',
        conditionIcon: '⛅',
        advice: 'Tiết trời buổi chiều tan tầm mát mẻ. Lưu ý tình trạng ùn tắc giao thông trên các trục đường huyết mạch.',
        updatedAt: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      },
      forecast: [
        { time: `${(baseHour) % 24}:00`, hour: baseHour % 24, rainProb: 10, weatherCode: 2, temp: 28.5 },
        { time: `${(baseHour + 1) % 24}:00`, hour: (baseHour + 1) % 24, rainProb: 15, weatherCode: 2, temp: 28.0 },
        { time: `${(baseHour + 2) % 24}:00`, hour: (baseHour + 2) % 24, rainProb: 20, weatherCode: 3, temp: 27.5 },
        { time: `${(baseHour + 3) % 24}:00`, hour: (baseHour + 3) % 24, rainProb: 15, weatherCode: 2, temp: 27.0 },
        { time: `${(baseHour + 4) % 24}:00`, hour: (baseHour + 4) % 24, rainProb: 10, weatherCode: 1, temp: 26.5 },
        { time: `${(baseHour + 5) % 24}:00`, hour: (baseHour + 5) % 24, rainProb: 5, weatherCode: 0, temp: 26.0 }
      ]
    };
  }

  // Mặc định: AUTUMN_PERFECT
  return {
    weather: {
      temperature: 25.5,
      apparentTemperature: 25.0,
      humidity: 55,
      precipitation: 0,
      weatherCode: 0,
      uvIndex: 4.5,
      condition: 'FAVORABLE',
      conditionLabel: 'Nắng thu trong trẻo',
      conditionIcon: '🌤️',
      advice: 'Tiết trời mùa thu Hà Nội lý tưởng. Nhiệt độ dịu mát hoàn hảo để tản bộ quanh Hồ Gươm và thưởng lãm di sản ngàn năm.',
      updatedAt: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    },
    forecast: [
      { time: `${(baseHour) % 24}:00`, hour: baseHour % 24, rainProb: 0, weatherCode: 0, temp: 25.5 },
      { time: `${(baseHour + 1) % 24}:00`, hour: (baseHour + 1) % 24, rainProb: 0, weatherCode: 0, temp: 26.0 },
      { time: `${(baseHour + 2) % 24}:00`, hour: (baseHour + 2) % 24, rainProb: 0, weatherCode: 1, temp: 26.5 },
      { time: `${(baseHour + 3) % 24}:00`, hour: (baseHour + 3) % 24, rainProb: 5, weatherCode: 1, temp: 25.5 },
      { time: `${(baseHour + 4) % 24}:00`, hour: (baseHour + 4) % 24, rainProb: 5, weatherCode: 1, temp: 24.5 },
      { time: `${(baseHour + 5) % 24}:00`, hour: (baseHour + 5) % 24, rainProb: 0, weatherCode: 0, temp: 23.5 }
    ]
  };
};
