import { POI, Accommodation, CurrentWeather, TrafficStatus } from '../types';

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

export const getStoredApiKey = (): string => {
  return localStorage.getItem(STORAGE_KEY_GEMINI) || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
};

export const setStoredApiKey = (key: string): void => {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_GEMINI);
  }
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
 * Gọi API Gemini (gemini-1.5-flash) để dệt truyện hành trình
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
    `Hãy viết một đoạn dẫn chuyện ngắn (khoảng 150-200 từ), giọng văn thong dong, hoài niệm, giàu chất thơ và đậm chất văn học Tràng An. ` +
    `Kết nối các điểm đến sau thành một trải nghiệm liền mạch theo đúng thứ tự: ${poiListStr}. ` +
    `Hãy khéo léo lồng ghép cảm thức thời gian (sớm mai trong trẻo, bóng râm trưa hè hay ráng chiều tà) cùng phong vị ẩm thực đặc trưng quanh các điểm dừng. Tránh dùng từ ngữ sáo rỗng hoặc quá thị trường.`;

  if (!apiKey) {
    // Không có key -> dùng curated fallback phong phú
    return generateFallbackNarrative(pois);
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemInstruction }]
          }
        ],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 600
        }
      })
    });

    if (!response.ok) {
      console.warn('Gemini API narrative failed, falling back to local cultural narrative.');
      return generateFallbackNarrative(pois);
    }

    const data = await response.json();
    const narrativeText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (narrativeText && narrativeText.trim()) {
      return narrativeText.trim();
    }
    return generateFallbackNarrative(pois);
  } catch (err) {
    console.warn('Error calling Gemini API for narrative:', err);
    return generateFallbackNarrative(pois);
  }
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

  // Xây dựng ngữ cảnh hành trình cụ thể
  const poiNames = context.pois?.map(p => p.name).join(', ') || 'Chưa chọn điểm';
  const hotelName = context.selectedHotel?.name || 'Chưa chọn khách sạn';
  const weatherText = context.weather ? `${context.weather.temperature}°C, ${context.weather.conditionLabel}` : 'Thời tiết dễ chịu';
  const trafficText = context.traffic?.label || 'Bình thường';

  const contextPrompt = 
    `[NGỮ CẢNH HÀNH TRÌNH HIỆN TẠI CỦA DU KHÁCH]\n` +
    `- Các điểm tham quan: ${poiNames}\n` +
    `- Khách sạn lưu trú: ${hotelName}\n` +
    `- Số ngày khám phá: ${context.days} ngày\n` +
    `- Phương tiện di chuyển: ${context.transportMode || 'Xe máy / Ô tô'}\n` +
    `- Thời tiết Hà Nội: ${weatherText}\n` +
    `- Tình trạng giao thông: ${trafficText}\n\n` +
    `[VAI TRÒ VÀ NGUYÊN TẮC]\n` +
    `Bạn là "Hà Nội Storyteller" - chuyên gia văn hóa, ẩm thực và người bạn đồng hành tinh tế của du khách tại Thủ đô Hà Nội. ` +
    `Hãy trả lời câu hỏi của du khách một cách súc tích, ấm áp, đậm chất văn hóa Hà Nội (khoảng 2-3 đoạn ngắn, thực tế, hữu ích). ` +
    `Nếu câu hỏi liên quan đến trẻ nhỏ, người cao tuổi, quán xá ẩm thực hay góc chụp ảnh, hãy đưa ra chỉ dẫn cụ thể (ví dụ: tên món, khung giờ vàng, lưu ý tâm lý).`;

  if (!apiKey) {
    return generateLocalContextAnswer(question, context);
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Tạo payload contents chuẩn của Gemini
    const contents = [
      {
        role: 'user',
        parts: [{ text: `${contextPrompt}\n\nCâu hỏi của du khách: ${question}` }]
      }
    ];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600
        }
      })
    });

    if (!response.ok) {
      console.warn('Gemini chat request failed, using intelligent cultural heuristic.');
      return generateLocalContextAnswer(question, context);
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (answer && answer.trim()) {
      return answer.trim();
    }
    return generateLocalContextAnswer(question, context);
  } catch (err) {
    console.warn('Gemini chat error:', err);
    return generateLocalContextAnswer(question, context);
  }
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
