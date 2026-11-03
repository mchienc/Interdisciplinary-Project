import { POI, Accommodation, CurrentWeather, TrafficStatus } from '../types';
import { API_BASE_URL } from './api';

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
 * Danh sách model Gemini đang khả dụng (2026: gemini-3.5-flash, gemini-3.5-flash-lite, gemini-flash-lite-latest)
 */
const GEMINI_CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite'
];

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
 * Gọi API Gemini (qua Backend Proxy hoặc trực tiếp) để dệt truyện hành trình
 */
export const generateItineraryNarrative = async (
  pois: POI[],
  apiKeyOverride?: string
): Promise<string> => {
  if (!pois || pois.length === 0) return generateFallbackNarrative([]);

  const apiKey = (apiKeyOverride || getStoredApiKey()).trim();

  // 1. Ưu tiên gọi qua Backend API Proxy (FastAPI Router)
  try {
    const backendRes = await fetch(`${API_BASE_URL}/chat/narrative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pois,
        apiKey: apiKey || undefined
      })
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.source === 'gemini' && data.narrative && data.narrative.trim()) {
        return data.narrative.trim();
      }
    }
  } catch (err) {
    console.warn('Backend narrative proxy unreachable, trying direct Gemini or fallback:', err);
  }

  // 2. Dự phòng: Gọi trực tiếp Google Gemini API từ client nếu có key
  if (apiKey) {
    const poiListStr = pois.map((p, idx) => `${idx + 1}. ${p.name} (${p.category})`).join(', ');
    const systemInstruction = 
      `Bạn là một người Hà Nội am hiểu sâu sắc văn hóa, lịch sử và phong vị ẩm thực Thủ đô. ` +
      `Hãy viết một đoạn dẫn chuyện ngắn (khoảng 150-200 từ), giọng văn thong dong, hoài niệm, giàu chất thơ và đậm chất văn học Tràng An. ` +
      `Kết nối các điểm đến sau thành một trải nghiệm liền mạch theo đúng thứ tự: ${poiListStr}. ` +
      `Hãy khéo léo lồng ghép cảm thức thời gian (sớm mai trong trẻo, bóng râm trưa hè hay ráng chiều tà) cùng phong vị ẩm thực đặc trưng quanh các điểm dừng. Tránh dùng từ ngữ sáo rỗng hoặc quá thị trường.`;

    for (const model of GEMINI_CANDIDATE_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: `Dệt câu chuyện cho lịch trình: ${poiListStr}` }] }],
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 2048,
              ...(model === 'gemini-3.5-flash' ? { thinkingConfig: { thinkingBudget: 0 } } : {})
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const text = parts.filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought).map((p: { text: string }) => p.text).join('\n');
          if (text && text.trim()) return text.trim();
        }
      } catch {
        // Thử model tiếp theo
      }
    }
  }

  // 3. Fallback cục bộ
  return generateFallbackNarrative(pois);
};

/**
 * Trả lời câu hỏi có ngữ cảnh hành trình từ Hà Nội Storyteller
 * Sử dụng Gemini 3.1 Flash qua Backend Proxy hoặc trực tiếp
 */
export const askStoryteller = async (
  question: string,
  context: StorytellerContext,
  chatHistory: { role: 'user' | 'model'; text: string }[] = [],
  apiKeyOverride?: string
): Promise<string> => {
  const apiKey = (apiKeyOverride || getStoredApiKey()).trim();

  // 1. Ưu tiên gọi qua Backend API Proxy (FastAPI Router)
  try {
    const backendRes = await fetch(`${API_BASE_URL}/chat/storyteller`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        context,
        history: chatHistory,
        apiKey: apiKey || undefined
      })
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.source === 'gemini' && data.text && data.text.trim()) {
        return data.text.trim();
      }
    }
  } catch (err) {
    console.warn('Backend storyteller proxy unreachable, trying direct Gemini or fallback:', err);
  }

  // 2. Dự phòng: Gọi trực tiếp Google Gemini API nếu có key
  if (apiKey) {
    try {
      const poiNames = context.pois?.map(p => p.name).join(', ') || 'Chưa chọn điểm';
      const hotelName = context.selectedHotel?.name || 'Chưa chọn khách sạn';
      const weatherText = context.weather ? `${context.weather.temperature}°C, ${context.weather.conditionLabel}` : 'Thời tiết dễ chịu';
      const trafficText = context.traffic?.label || 'Bình thường';

      const systemInstruction = 
        `Bạn là 'Hà Nội Storyteller' - chuyên gia văn hóa, ẩm thực và người bạn đồng hành tinh tế của du khách tại Thủ đô Hà Nội.\n` +
        `[Ngữ cảnh du khách]: Các điểm đến: ${poiNames} | Khách sạn: ${hotelName} | Số ngày: ${context.days} | Phương tiện: ${context.transportMode || 'Xe máy'} | Thời tiết: ${weatherText} | Giao thông: ${trafficText}.\n` +
        `Trả lời súc tích (2-3 đoạn ngắn), ấm áp, giàu phong vị Tràng An, chỉ dẫn thực tế cụ thể.`;

      // Chuẩn bị contents với lịch sử hội thoại
      const contents: { role: string; parts: { text: string }[] }[] = [];
      const recentHistory = chatHistory.slice(-6);
      recentHistory.forEach(item => {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      });
      contents.push({ role: 'user', parts: [{ text: question }] });

      for (const model of GEMINI_CANDIDATE_MODELS) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                ...(model === 'gemini-3.5-flash' ? { thinkingConfig: { thinkingBudget: 0 } } : {})
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const parts = data?.candidates?.[0]?.content?.parts || [];
            const answer = parts.filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought).map((p: { text: string }) => p.text).join('\n');
            if (answer && answer.trim()) {
              return answer.trim();
            }
          }
        } catch {
          // Thử model tiếp theo
        }
      }
    } catch (err) {
      console.warn('Direct Gemini chat request failed:', err);
    }
  }

  // 3. Fallback cục bộ thông minh
  return generateLocalContextAnswer(question, context);
};

/**
 * Bộ suy luận cục bộ thông minh trả lời các câu hỏi phổ biến về văn hóa & du lịch Hà Nội
 */
const generateLocalContextAnswer = (question: string, context: StorytellerContext): string => {
  const q = question.toLowerCase();

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

  if (q.includes('ăn trưa') || q.includes('ăn tối') || q.includes('ẩm thực') || q.includes('món ngon') || q.includes('phở')) {
    return `Theo lộ trình bạn đang chọn quanh khu vực trung tâm, phong vị ẩm thực đặc sắc không thể bỏ qua gồm:
- **Buổi sáng/trưa:** Thưởng thức **Phở Bát Đàn** (Phố Cổ) thơm nồng mùi gừng tươi và nước dùng trong vắt, hoặc **Bún chả Hương Liên / Bún chả Hàng Quạt** dậy mùi than hoa.
- **Buổi xế chiều:** Thử một bát **Chè sen long nhãn** Hàng Bạc thanh mát hoặc **Bánh gối, Bánh rán mặn Lý Quốc Sư**.
- **Buổi tối:** Sau khi dạo phố, hãy ghé phố ẩm thực **Tống Duy Tân** hoặc thưởng thức **Chả cá Lã Vọng / Thăng Long** thơm phức thì là và mắm tôm đánh sủi bọt.`;
  }

  if (q.includes('hồ tây') || q.includes('hoàng hôn') || q.includes('chiều')) {
    return `**Hồ Tây** lúc ráng chiều luôn là khoảnh khắc quyến rũ nhất của Thủ đô.
- Bạn nên có mặt tại đường Thanh Niên hoặc dạo quanh bán đảo Quảng Bá tầm **16:45 – 17:30**. 
- Ghé **Chùa Trấn Quốc** ngắm bóng tháp cổ nghiêng bóng xuống mặt nước dát vàng.
- Đừng quên nhâm nhi một que **Kem Hồ Tây** mát lạnh hoặc ghé một quán cà phê ven hồ ngắm sóng nước lăn tăn.`;
  }

  // Phản hồi tổng quát dựa trên danh sách POI hiện tại
  const currentPoiNames = context.pois?.map(p => p.name).slice(0, 3).join(', ') || 'các địa danh Thủ đô';
  return `Với lộ trình hiện tại ghé thăm **${currentPoiNames}**, bạn đang có một hành trình rất cân bằng giữa chiều sâu lịch sử và hơi thở phố thị.
- **Về nhịp độ:** Bạn nên dành khoảng 1.5 – 2 tiếng cho mỗi điểm di tích lớn để không bị vội vã.
- **Thời tiết:** Hiện tại ${context.weather ? `${context.weather.temperature}°C (${context.weather.conditionLabel})` : 'thời tiết rất thuận lợi'}, hãy chuẩn bị thêm một chiếc quạt tay hoặc bình nước nhỏ khi dạo bộ ngoài trời.
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

export const getLocalPromptToItineraryFallback = (
  input: string | PromptToItineraryParams,
  daysHint?: number
): PromptToItineraryResult => {
  const params: PromptToItineraryParams = typeof input === 'string'
    ? { prompt: input, days: daysHint }
    : input;

  const q = params.prompt.toLowerCase();
  let days = params.days || 2;
  if (q.includes('1 ngày') || q.includes('1ngay') || q.includes('trong ngày') || q.includes('24h')) {
    days = 1;
  } else if (q.includes('3 ngày') || q.includes('3ngay') || q.includes('ba ngày')) {
    days = 3;
  } else if (q.includes('2 ngày') || q.includes('2ngay') || q.includes('hai ngày') || q.includes('cuối tuần')) {
    days = 2;
  }

  // Nhánh 1: Gia đình (có trẻ nhỏ hoặc người lớn tuổi)
  if (params.travel_group === 'family' || q.includes('gia đình') || q.includes('trẻ em') || q.includes('bố mẹ') || q.includes('lớn tuổi') || q.includes('người già')) {
    return {
      title: `Hà Nội Thảnh Thơi Cho Cả Gia Đình (${days} Ngày)`,
      summary: 'Lộ trình rợp bóng cây xanh, đường đi bằng phẳng và chỗ dừng chân thoáng đãng cho cả ông bà và các bé.',
      days,
      recommended_poi_ids: days === 1 ? [2, 3, 10, 11] : [2, 3, 9, 5, 10, 11, 4, 1],
      vibes: ['gia đình', 'thảnh thơi', 'râm mát', 'di sản'],
      advice: 'Văn Miếu và Bảo tàng Dân tộc học có nhiều bóng cây râm mát; hãy chuẩn bị bình nước cá nhân và giày thể thao êm chân.',
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

  const apiKey = getStoredApiKey();
  try {
    const res = await fetch(`${API_BASE_URL}/chat/prompt-to-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, apiKey: apiKey || undefined })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.source === 'gemini') {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend prompt-to-itinerary proxy unreachable, trying direct Gemini:', err);
  }

  // Dự phòng: Gọi trực tiếp Google Gemini API từ trình duyệt nếu có apiKey
  if (apiKey) {
    const poiCatalog =
      '1: Hồ Hoàn Kiếm & Đền Ngọc Sơn (di sản, hồ, đi bộ)\n' +
      '2: Lăng Chủ tịch Hồ Chí Minh & Ba Đình (di sản, lịch sử)\n' +
      '3: Văn Miếu - Quốc Tử Giám (di sản, trường đại học đầu tiên)\n' +
      '4: Khu Phố Cổ Hà Nội 36 Phố Phường (ẩm thực, mua sắm, văn hóa)\n' +
      '5: Chùa Trấn Quốc & Hồ Tây (tâm linh, hồ, hoàng hôn)\n' +
      '6: Di tích Nhà tù Hỏa Lò (lịch sử, giáo dục)\n' +
      '7: Nhà thờ Lớn Hà Nội (kiến trúc Pháp, check-in, cà phê)\n' +
      '8: Cầu Long Biên (di sản lịch sử, vintage, hoàng hôn)\n' +
      '9: Hoàng thành Thăng Long (di sản thế giới UNESCO)\n' +
      '10: Bảo tàng Dân tộc học Việt Nam (văn hóa, kiến trúc dân gian)\n' +
      '11: Phở Gia Truyền Bát Đàn (ẩm thực nổi tiếng)\n' +
      '12: Bảo tàng Mỹ thuật Việt Nam (nghệ thuật, hội họa)\n' +
      '13: Cà phê Trứng Giảng (đặc sản đồ uống lâu đời)\n' +
      '14: Chợ Đồng Xuân (mua sắm truyền thống, quà lưu niệm)\n' +
      '15: Bún chả Hương Liên (ẩm thực Obama trứ danh)\n' +
      '16: Làng gốm Bát Tràng (làng nghề thủ công truyền thống)';

    const systemInstruction =
      'Bạn là Trợ lý Chuyên gia Lập Lịch trình Du lịch Hà Nội am hiểu sâu sắc văn hóa, ẩm thực và đường phố Thủ đô. ' +
      'Hãy phân tích yêu cầu của du khách, xác định số ngày (days: 1, 2, hoặc 3), chọn 4 đến 8 POI IDs phù hợp nhất từ danh mục dưới đây, đặt tên chuyến đi hấp dẫn và tóm tắt trải nghiệm.\n\n' +
      `[DANH MỤC POI HỢP LỆ]:\n${poiCatalog}\n\n` +
      'Chỉ trả về DUY NHẤT một đối tượng JSON thuần túy với cấu trúc:\n' +
      '{"title": "...", "summary": "...", "days": 2, "recommended_poi_ids": [1, 3, 4, 7], "vibes": ["..."], "advice": "..."}';

    for (const model of GEMINI_CANDIDATE_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{
              role: 'user',
              parts: [{ text: `Yêu cầu của tôi: ${params.prompt}` + (params.days ? ` (Ưu tiên ${params.days} ngày)` : '') }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              ...(model === 'gemini-3.5-flash' ? { thinkingConfig: { thinkingBudget: 0 } } : {})
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          const rawText = parts.filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought).map((p: { text: string }) => p.text).join('\n');
          if (rawText) {
            const match = rawText.match(/\{[\s\S]*\}/);
            const cleanJson = match ? match[0] : rawText.trim();
            const parsed = JSON.parse(cleanJson);
            return {
              title: parsed.title || `Chuyến đi Hà Nội (${parsed.days || params.days || 2} Ngày)`,
              summary: parsed.summary || 'Lịch trình do Gemini AI đề xuất theo mong muốn của bạn.',
              days: Number(parsed.days || params.days || 2),
              recommended_poi_ids: Array.isArray(parsed.recommended_poi_ids) ? parsed.recommended_poi_ids : [1, 2, 3, 4],
              vibes: Array.isArray(parsed.vibes) ? parsed.vibes : ['khám phá', 'hà nội'],
              advice: parsed.advice || 'Hãy mang theo trang phục thoải mái để tận hưởng chuyến đi!',
              source: 'gemini'
            };
          }
        }
      } catch {
        // Thử model tiếp theo
      }
    }
  }

  return getLocalPromptToItineraryFallback(params);
};
