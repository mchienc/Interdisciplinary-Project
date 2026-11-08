import { POI, Accommodation, CurrentWeather, TrafficStatus } from '../types';
import { API_BASE_URL } from './api';
import { FALLBACK_POIS } from '../constants/mockData';

export interface StorytellerContext {
  pois: POI[];
  selectedHotel?: Accommodation | null;
  days: number;
  transportMode?: string;
  weather?: CurrentWeather | null;
  traffic?: TrafficStatus | null;
  itineraryTitle?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
}

const STORAGE_KEY_GEMINI = 'hanoi_storyteller_gemini_api_key';
const DEFAULT_GEMINI_B64 = 'QUl6YVN5QzVmTlFaTElJdm1mZHpqS1lLSE82ZG1CYnF2elBKZjg0';

export const getStoredApiKey = (): string => {
  const rawKey = (localStorage.getItem(STORAGE_KEY_GEMINI) || '').replace(/^["']|["']$/g, '').trim();
  if (rawKey.startsWith('AIza')) {
    return rawKey;
  }
  try {
    return atob(DEFAULT_GEMINI_B64);
  } catch {
    return rawKey;
  }
};

export const setStoredApiKey = (key: string): void => {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_GEMINI);
  }
};

/**
 * Danh sách model Gemini khả dụng theo thứ tự tốc độ phản hồi nhanh nhất (~0.7s)
 */
const GEMINI_CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash'
];

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 4500): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Helper gọi trực tiếp Google Gemini API từ trình duyệt với cơ chế xoay vòng model siêu tốc
 */
const callGeminiDirectFromBrowser = async (
  systemInstruction: string,
  contents: { role: string; parts: { text: string }[] }[],
  apiKey: string,
  temperature = 0.7
): Promise<string | null> => {
  if (!apiKey) return null;

  for (const model of GEMINI_CANDIDATE_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              temperature,
              maxOutputTokens: 2048,
              ...(model === 'gemini-3.5-flash' ? { thinkingConfig: { thinkingBudget: 0 } } : {})
            }
          })
        },
        4500
      );

      if (response.ok) {
        const data = await response.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const text = parts
          .filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought)
          .map((p: { text: string }) => p.text)
          .join('\n');
        if (text && text.trim()) {
          return text.trim();
        }
      } else if (response.status === 403 || response.status === 429) {
        // Nếu bị giới hạn quota key hoặc từ chối quyền, dừng thử để chuyển nhanh sang phương án dự phòng
        break;
      }
    } catch {
      // Thử model tiếp theo
    }
  }
  return null;
};

/**
 * Trình dệt truyện hành trình dự phòng (Curated Cultural Fallback Generator)
 * Sinh đoạn văn phong vị văn hóa Hà Nội sâu sắc khi chưa có API Key hoặc mạng yếu.
 */
export const generateFallbackNarrative = (pois: POI[]): string => {
  if (!pois || pois.length === 0) {
    return 'Hà Nội đón bạn bằng những ngõ nhỏ rêu phong, tiếng chuông chùa Trấn Quốc ngân vang mặt nước hồ Tây và hương cà phê trứng nồng nàn góc phố cũ. Hãy chọn những điểm dừng để chúng ta cùng dệt nên câu chuyện chuyến đi.';
  }

  const poiNames = pois.map(p => p.name);
  const firstName = poiNames[0];
  const lastName = poiNames[poiNames.length - 1];
  const middleNames = poiNames.slice(1, -1);

  if (pois.length === 1) {
    return `Hành trình mở ra tại ${firstName}. Giữa nhịp sống Thủ đô ngàn năm văn hiến, mỗi góc gạch, tán bàng nơi đây đều cất giấu một câu chuyện lịch sử trầm mặc. Hãy thong thả bước chậm, hít thở bầu không khí sớm mai thanh khiết của Hà Nội.`;
  }

  const middleStr = middleNames.length > 0 ? `rồi thong thả ghé qua ${middleNames.join(', ')}, ` : '';

  return `Hành trình mở đầu khi sớm mai vừa chớm tại ${firstName}, nơi sương thu bảng lảng vương trên những mái ngói rêu phong. Theo bước chân thong dong, bạn sẽ tiếp tục hành trình ${middleStr}để cảm nhận trọn vẹn sự giao thoa kỳ diệu giữa trầm tích lịch sử Thăng Long và nhịp thở đương đại. Buổi hoàng hôn khép lại đầy lắng đọng tại ${lastName}, khi ráng chiều buông đỏ mặt nước và phố thị lên đèn, để lại một phong vị Hà thành thanh tao khó phai.`;
};

/**
 * Gọi API Gemini (trực tiếp hoặc qua Backend Proxy) để dệt truyện hành trình
 */
export const generateItineraryNarrative = async (
  pois: POI[],
  apiKeyOverride?: string
): Promise<string> => {
  if (!pois || pois.length === 0) return generateFallbackNarrative([]);

  const apiKey = (apiKeyOverride || getStoredApiKey()).trim();
  const poiListStr = pois.map((p, idx) => `${idx + 1}. ${p.name} (${p.category})`).join(', ');
  const systemInstruction =
    `Bạn là một người Hà Nội am hiểu sâu sắc văn hóa, lịch sử và phong vị ẩm thực Thủ đô. ` +
    `Hãy viết một đoạn dẫn chuyện ngắn (khoảng 140-180 từ), giọng văn thong dong, hoài niệm, giàu chất thơ và đậm chất văn học Tràng An. ` +
    `Kết nối các điểm đến sau thành một trải nghiệm liền mạch theo đúng thứ tự: ${poiListStr}. ` +
    `Hãy khéo léo lồng ghép cảm thức thời gian (sớm mai trong trẻo, bóng râm trưa hè hay ráng chiều tà) cùng phong vị ẩm thực đặc trưng quanh các điểm dừng. Tránh dùng từ ngữ sáo rỗng hoặc quá thị trường.`;

  // 1. Ưu tiên gọi trực tiếp Gemini API tốc độ cao (~0.8s, không bị nghẽn khi Cloud Backend ngủ)
  if (apiKey) {
    const directText = await callGeminiDirectFromBrowser(
      systemInstruction,
      [{ role: 'user', parts: [{ text: `Dệt câu chuyện cho lịch trình: ${poiListStr}` }] }],
      apiKey,
      0.75
    );
    if (directText) return directText;
  }

  // 2. Dự phòng gọi qua Backend API Proxy (với timeout 2.5s)
  try {
    const backendRes = await fetchWithTimeout(
      `${API_BASE_URL}/chat/narrative`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pois,
          apiKey: apiKey || undefined
        })
      },
      2500
    );

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.narrative && data.narrative.trim()) {
        return data.narrative.trim();
      }
    }
  } catch {
    // Chuyển sang fallback cục bộ
  }

  // 3. Fallback cục bộ
  return generateFallbackNarrative(pois);
};

/**
 * Trả lời câu hỏi có ngữ cảnh hành trình từ Hà Nội Storyteller
 */
export const askStoryteller = async (
  question: string,
  context: StorytellerContext,
  chatHistory: { role: 'user' | 'model'; text: string }[] = [],
  apiKeyOverride?: string
): Promise<string> => {
  const apiKey = (apiKeyOverride || getStoredApiKey()).trim();

  const poiNames = context.pois?.map(p => p.name).join(', ') || 'Chưa chọn điểm';
  const hotelName = context.selectedHotel?.name || 'Chưa chọn khách sạn';
  const weatherText = context.weather ? `${context.weather.temperature}°C, ${context.weather.conditionLabel}` : 'Thời tiết dễ chịu';
  const trafficText = context.traffic?.label || 'Bình thường';

  const systemInstruction =
    `Bạn là 'Hà Nội Storyteller' - chuyên gia văn hóa, ẩm thực và người bạn đồng hành tinh tế của du khách tại Thủ đô Hà Nội.\n` +
    `[Ngữ cảnh du khách]: Các điểm đến: ${poiNames} | Khách sạn: ${hotelName} | Số ngày: ${context.days} | Phương tiện: ${context.transportMode || 'Xe máy'} | Thời tiết: ${weatherText} | Giao thông: ${trafficText}.\n` +
    `Trả lời súc tích (2-3 đoạn ngắn), ấm áp, giàu phong vị Tràng An, chỉ dẫn thực tế cụ thể (gợi ý tên món ăn, địa chỉ, khung giờ đẹp).`;

  const contents: { role: string; parts: { text: string }[] }[] = [];
  const recentHistory = chatHistory.slice(-6);
  recentHistory.forEach(item => {
    contents.push({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    });
  });
  contents.push({ role: 'user', parts: [{ text: question }] });

  // 1. Ưu tiên gọi trực tiếp Google Gemini API từ trình duyệt (~0.8s)
  if (apiKey) {
    const directAnswer = await callGeminiDirectFromBrowser(systemInstruction, contents, apiKey, 0.7);
    if (directAnswer) return directAnswer;
  }

  // 2. Dự phòng gọi qua Backend API Proxy (timeout 2.5s)
  try {
    const backendRes = await fetchWithTimeout(
      `${API_BASE_URL}/chat/storyteller`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          context,
          history: chatHistory,
          apiKey: apiKey || undefined
        })
      },
      2500
    );

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.text && data.text.trim()) {
        return data.text.trim();
      }
    }
  } catch {
    // Chuyển sang fallback cục bộ
  }

  // 3. Fallback cục bộ thông minh
  return generateLocalContextAnswer(question, context);
};

/**
 * Bộ suy luận cục bộ thông minh trả lời các câu hỏi phổ biến về văn hóa & du lịch Hà Nội
 */
const generateLocalContextAnswer = (question: string, context: StorytellerContext): string => {
  const q = question.toLowerCase().trim();
  const currentPoiNames = context.pois?.map(p => p.name).slice(0, 4).join(', ') || 'Hồ Hoàn Kiếm, Văn Miếu và Khu Phố Cổ';

  if (/^(hello|hi|hey|xin chào|chào|chào bạn|alo|good morning|good afternoon)\b/i.test(q)) {
    return `Chào bạn! Rất vui được đồng hành cùng bạn trong hành trình khám phá Thủ đô ngàn năm văn hiến.\n\nHiện tại lộ trình của bạn đang có **${context.pois?.length || 0} điểm đến** (${currentPoiNames}) trong **${context.days || 2} ngày**. Bạn muốn mình gợi ý quán ăn ngon quanh lộ trình, góc cà phê trứng chuẩn vị hay điều chỉnh lịch trình cho gia đình không?`;
  }

  if (q.includes('hỏa lò') || q.includes('hoa lo') || q.includes('trẻ') || q.includes('con nít') || q.includes('em bé')) {
    return `Khi tham quan **Di tích Nhà tù Hỏa Lò** cùng trẻ nhỏ, bạn nên lưu ý:
1. **Không gian & Ánh sáng:** Không gian trưng bày tái hiện lịch sử hào hùng nhưng có những khu xà lim khá tối và âm thanh tái hiện chân thực, các bé dưới 10 tuổi có thể cảm thấy hơi e sợ. Bạn nên nắm tay và giải thích nhẹ nhàng cho con.
2. **Thuyết minh tự động (Audio Guide):** Rất nên thuê thiết bị Audio Guide tại quầy vé (khoảng 50.000đ). Giọng đọc truyền cảm sẽ giúp các con tiếp thu lịch sử như một câu chuyện kể hấp dẫn.
3. **Trang phục & Thái độ:** Đây là di tích lịch sử thiêng liêng, hãy dặn các bé giữ trật tự và mặc trang phục lịch sự.`;
  }

  if (q.includes('văn miếu') || q.includes('cà phê') || q.includes('cafe') || q.includes('yên tĩnh')) {
    return `Ngay gần **Văn Miếu - Quốc Tử Giám**, nếu muốn tìm một góc cà phê tĩnh lặng để đọc sách hoặc thư giãn sau khi tản bộ, bạn có thể ghé:
- **Cà phê Sách Tràng An (Đoàn Thị Điểm / Nguyễn Thái Học):** Góc quán nhỏ phủ đầy cây xanh, rất yên tĩnh và đậm chất trí thức Hà thành.
- **Loading T (phố Chân Cầm):** Tuy cách một đoạn ngắn đi bộ về phía Phố Cổ, nhưng căn biệt thự Pháp cổ này phục vụ cà phê trứng và trà hoa cúc cực kỳ thanh tao.
- **All Day Coffee (Quang Trung):** Không gian ấm áp tông nâu gỗ, đồ uống phong phú và góc ban công ngắm phố rất thảnh thơi.`;
  }

  if (q.includes('ăn trưa') || q.includes('ăn tối') || q.includes('ẩm thực') || q.includes('món ngon') || q.includes('phở') || q.includes('ăn gì')) {
    return `Theo lộ trình bạn đang chọn quanh khu vực trung tâm, phong vị ẩm thực đặc sắc không thể bỏ qua gồm:
- **Buổi sáng/trưa:** Thưởng thức **Phở Bát Đàn** (49 Bát Đàn) thơm nồng mùi gừng tươi và nước dùng trong vắt, hoặc **Bún chả Hương Liên / Bún chả Hàng Quạt** dậy mùi than hoa.
- **Buổi xế chiều:** Thử một bát **Chè sen long nhãn** Hàng Bạc thanh mát hoặc **Bánh gối, Bánh rán mặn Lý Quốc Sư**.
- **Buổi tối:** Sau khi dạo phố, hãy ghé phố ẩm thực **Tống Duy Tân** hoặc thưởng thức **Chả cá Thăng Long (Đường Thành)** thơm phức thì là.`;
  }

  if (q.includes('hồ tây') || q.includes('hoàng hôn') || q.includes('chiều')) {
    return `**Hồ Tây** lúc ráng chiều luôn là khoảnh khắc quyến rũ nhất của Thủ đô.
- Bạn nên có mặt tại đường Thanh Niên hoặc dạo quanh bán đảo Quảng Bá tầm **16:45 – 17:30**.
- Ghé **Chùa Trấn Quốc** ngắm bóng tháp cổ nghiêng bóng xuống mặt nước dát vàng.
- Đừng quên nhâm nhi một que **Kem Hồ Tây** mát lạnh hoặc ghé một quán cà phê ven hồ ngắm sóng nước lăn tăn.`;
  }

  return `Với lộ trình hiện tại ghé thăm **${currentPoiNames}**, bạn đang có một hành trình rất cân bằng giữa chiều sâu lịch sử và hơi thở phố thị.
- **Về nhịp độ:** Bạn nên dành khoảng 1.5 – 2 tiếng cho mỗi điểm di tích lớn để không bị vội vã.
- **Thời tiết:** Hiện tại ${context.weather ? `${context.weather.temperature}°C (${context.weather.conditionLabel})` : 'thời tiết rất thuận lợi'}, hãy chuẩn bị thêm một chiếc ô nhỏ hoặc bình nước khi dạo bộ ngoài trời.
- Bạn cần thêm gợi ý về góc chụp ảnh đẹp hay quán đặc sản gần chặng nào không?`;
};


// ---------------------------------------------------------------------------
// AI Prompt-to-Itinerary Engine (Language to Route)
// ---------------------------------------------------------------------------

export interface PromptToItineraryParams {
  prompt: string;
  days?: number;
  travel_group?: 'solo' | 'couple' | 'family' | 'friends';
  pace?: 'relaxed' | 'balanced' | 'packed';
  interests?: string[];
  budget_tier?: 'budget' | 'standard' | 'luxury';
}

export interface PromptToItineraryResult {
  title: string;
  summary: string;
  days: number;
  recommended_poi_ids: number[];
  vibes: string[];
  advice: string;
  source: 'gemini' | 'fallback';
}

/**
 * Phát hiện số ngày người dùng gõ trực tiếp trong câu lệnh tự nhiên (VD: "3 ngày 2 đêm", "1 ngày", "4 ngày")
 */
export const extractExplicitDaysFromPrompt = (prompt: string, fallbackDays = 2): number => {
  const q = prompt.toLowerCase();
  if (/(4\s*ngày|4ngay|bốn\s*ngày|4n3d|4n3đ)/.test(q)) return 4;
  if (/(3\s*ngày|3ngay|ba\s*ngày|3n2d|3n2đ)/.test(q)) return 3;
  if (/(1\s*ngày|1ngay|một\s*ngày|trong\s*ngày|24h)/.test(q)) return 1;
  if (/(2\s*ngày|2ngay|hai\s*ngày|cuối\s*tuần|2n1d|2n1đ)/.test(q)) return 2;
  return fallbackDays;
};

export const getLocalPromptToItineraryFallback = (
  input: string | PromptToItineraryParams,
  daysHint?: number
): PromptToItineraryResult => {
  const params: PromptToItineraryParams = typeof input === 'string'
    ? { prompt: input, days: daysHint }
    : input;

  const q = params.prompt.toLowerCase();
  const days = extractExplicitDaysFromPrompt(params.prompt, params.days || 2);

  // Nhánh 1: Gia đình (có trẻ nhỏ hoặc người lớn tuổi)
  if (params.travel_group === 'family' || q.includes('gia đình') || q.includes('trẻ em') || q.includes('bố mẹ') || q.includes('lớn tuổi') || q.includes('người già')) {
    return {
      title: `Hà Nội Thảnh Thơi Cho Cả Gia Đình (${days} Ngày)`,
      summary: 'Lộ trình rợp bóng cây xanh, đường đi bằng phẳng và chỗ dừng chân thoáng đãng cho cả gia đình.',
      days,
      recommended_poi_ids: days === 1 ? [2, 3, 10, 11] : days === 2 ? [1, 2, 3, 9, 10, 11] : [1, 2, 3, 4, 5, 9, 10, 11, 16],
      vibes: ['gia đình', 'thảnh thơi', 'râm mát', 'di sản'],
      advice: 'Văn Miếu, Hoàng thành Thăng Long và Bảo tàng Dân tộc học có nhiều bóng cây râm mát; rất phù hợp cho gia đình đi thong thả.',
      source: 'fallback'
    };
  }

  // Nhánh 2: Cặp đôi lãng mạn
  if (params.travel_group === 'couple' || q.includes('cặp đôi') || q.includes('người yêu') || q.includes('hẹn hò') || q.includes('lãng mạn')) {
    return {
      title: `Hà Nội Lãng Mạn & Hẹn Hò Phố Cổ (${days} Ngày)`,
      summary: 'Ngắm hoàng hôn Hồ Tây dát vàng, nhâm nhi cà phê trứng Giảng và dạo bộ bên bờ hồ Gươm lộng gió.',
      days,
      recommended_poi_ids: days === 1 ? [1, 4, 7, 13] : [1, 4, 5, 7, 8, 9, 11, 13],
      vibes: ['lãng mạn', 'cà phê', 'hoàng hôn', 'phố cổ'],
      advice: 'Khung giờ đẹp nhất là 16:30 tại cầu Long Biên hoặc ngắm hoàng hôn đỏ ối từ đường Thanh Niên.',
      source: 'fallback'
    };
  }

  // Nhánh 3: Ẩm thực & Foodtour
  if (params.interests?.includes('culinary') || q.includes('phở') || q.includes('ăn') || q.includes('ẩm thực') || q.includes('bún chả') || q.includes('cà phê') || q.includes('food')) {
    return {
      title: `Foodtour Hà Nội 36 Phố Phường Trọn Vị (${days} Ngày)`,
      summary: 'Khám phá trọn vẹn ẩm thực Hà thành từ phở Bát Đàn, bún chả Hương Liên đến cà phê trứng Giảng.',
      days,
      recommended_poi_ids: days === 1 ? [1, 4, 11, 13, 15] : [1, 3, 4, 5, 11, 13, 14, 15],
      vibes: ['ẩm thực', 'phố cổ', 'đường phố', 'cà phê'],
      advice: 'Hãy để bụng thật đói và mang theo giày đi bộ thoải mái để len lỏi trong các ngõ nhỏ phố cổ nhé!',
      source: 'fallback'
    };
  }

  // Nhánh 4: Chụp ảnh & Sống ảo Vintage
  if (params.interests?.includes('photography') || q.includes('ảnh') || q.includes('chụp') || q.includes('vintage') || q.includes('sống ảo') || q.includes('check-in') || q.includes('bảo tàng')) {
    return {
      title: `Hà Nội Hoài Cổ & Góc Sống Ảo Vintage (${days} Ngày)`,
      summary: 'Tuyển chọn những khung hình đẹp nhất của Thủ đô: cầu Long Biên rêu phong, Văn Miếu và Bảo tàng Mỹ thuật.',
      days,
      recommended_poi_ids: days === 1 ? [1, 3, 7, 8] : [1, 3, 7, 8, 9, 12, 13],
      vibes: ['vintage', 'chụp ảnh', 'nghệ thuật', 'hoài cổ'],
      advice: 'Khung giờ vàng hoàng hôn trên cầu Long Biên hoặc Hồ Tây (16:30 - 17:30) cho ánh sáng vintage đẹp nhất.',
      source: 'fallback'
    };
  }

  // Nhánh 5: Thư giãn Hồ Tây
  if (params.interests?.includes('relaxation') || q.includes('hồ tây') || q.includes('hoàng hôn') || q.includes('thư giãn') || q.includes('chill') || q.includes('nghỉ dưỡng')) {
    return {
      title: `Gió Mát Hồ Tây & Thư Thái Tâm Hồn (${days} Ngày)`,
      summary: 'Thong dong quanh mặt nước mênh mang, viếng chùa Trấn Quốc thanh tịnh và ngắm ráng chiều đỏ ối.',
      days,
      recommended_poi_ids: days === 1 ? [1, 5, 8, 13] : [1, 2, 5, 7, 8, 9, 10, 13],
      vibes: ['thư giãn', 'hồ tây', 'hoàng hôn', 'an yên'],
      advice: 'Hãy chọn một quán cà phê ven hồ trên đường Thanh Niên lúc xế chiều để tận hưởng làn gió mát lành.',
      source: 'fallback'
    };
  }

  return {
    title: `Hành Trình Di Sản Thăng Long Ngàn Năm (${days} Ngày)`,
    summary: 'Khám phá trọn vẹn những biểu tượng văn hóa lịch sử tiêu biểu nhất của Thủ đô Hà Nội.',
    days,
    recommended_poi_ids: days === 1 ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 7, 8, 9],
    vibes: ['di sản', 'lịch sử', 'văn hóa', 'trải nghiệm'],
    advice: 'Các di tích lịch sử yêu cầu trang phục lịch sự; nhớ mang theo ô che nắng nhẹ.',
    source: 'fallback'
  };
};

export const generatePromptToItineraryApi = async (
  input: string | PromptToItineraryParams,
  daysParam?: number
): Promise<PromptToItineraryResult> => {
  const params: PromptToItineraryParams = typeof input === 'string'
    ? { prompt: input, days: daysParam }
    : input;

  // Ưu tiên số ngày người dùng gõ rõ trong câu lệnh (VD: "3 ngày 2 đêm")
  const inferredDays = extractExplicitDaysFromPrompt(params.prompt, params.days || 2);
  const apiKey = getStoredApiKey();

  // Xây dựng danh mục POI từ FALLBACK_POIS (lấy 30 điểm tiêu biểu nhất để prompt gọn và nhanh)
  const poiCatalog = FALLBACK_POIS.slice(0, 30)
    .map(p => `${p.id}: ${p.name} (${p.category})`)
    .join('\n');

  const minPois = inferredDays === 1 ? 4 : inferredDays === 2 ? 6 : 8;
  const maxPois = inferredDays === 1 ? 5 : inferredDays === 2 ? 8 : 11;

  const systemInstruction =
    'Bạn là Trợ lý Chuyên gia Lập Lịch trình Du lịch Hà Nội am hiểu sâu sắc văn hóa, ẩm thực và đường phố Thủ đô. ' +
    `Hãy phân tích yêu cầu của du khách, sử dụng số ngày days = ${inferredDays}, chọn từ ${minPois} đến ${maxPois} POI IDs phù hợp nhất từ danh mục dưới đây, đặt tên chuyến đi hấp dẫn và đưa ra lời khuyên thiết thực.\n\n` +
    `[DANH MỤC POI HỢP LỆ]:\n${poiCatalog}\n\n` +
    'Chỉ trả về DUY NHẤT một đối tượng JSON thuần túy với cấu trúc:\n' +
    `{"title": "...", "summary": "...", "days": ${inferredDays}, "recommended_poi_ids": [1, 2, 3, 4, 5, 9], "vibes": ["..."], "advice": "..."}`;

  // 1. Ưu tiên gọi trực tiếp Google Gemini API từ trình duyệt (~0.8s)
  if (apiKey) {
    const rawText = await callGeminiDirectFromBrowser(
      systemInstruction,
      [
        {
          role: 'user',
          parts: [{ text: `Yêu cầu của tôi: ${params.prompt} (Số ngày: ${inferredDays} ngày)` }]
        }
      ],
      apiKey,
      0.65
    );

    if (rawText) {
      try {
        const match = rawText.match(/\{[\s\S]*\}/);
        const cleanJson = match ? match[0] : rawText.trim();
        const parsed = JSON.parse(cleanJson);
        const validIds = Array.isArray(parsed.recommended_poi_ids)
          ? parsed.recommended_poi_ids.map(Number).filter((id: number) => id >= 1 && id <= 66)
          : [];
        return {
          title: parsed.title || `Chuyến đi Hà Nội (${inferredDays} Ngày)`,
          summary: parsed.summary || 'Lịch trình do Gemini AI đề xuất theo mong muốn của bạn.',
          days: Number(parsed.days || inferredDays),
          recommended_poi_ids: validIds.length >= 2 ? validIds : [1, 2, 3, 4, 5, 9],
          vibes: Array.isArray(parsed.vibes) ? parsed.vibes : ['khám phá', 'hà nội'],
          advice: parsed.advice || 'Hãy mang theo trang phục thoải mái để tận hưởng chuyến đi!',
          source: 'gemini'
        };
      } catch {
        // Nếu JSON lỗi, chuyển sang bước tiếp theo
      }
    }
  }

  // 2. Dự phòng gọi qua Backend Proxy (timeout 2.5s)
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/chat/prompt-to-itinerary`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, days: inferredDays, apiKey: apiKey || undefined })
      },
      2500
    );
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.recommended_poi_ids)) {
        return data;
      }
    }
  } catch {
    // Chuyển sang fallback cục bộ
  }

  return getLocalPromptToItineraryFallback({ ...params, days: inferredDays });
};
