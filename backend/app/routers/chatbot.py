import os
import re
import logging
from typing import List, Optional, Dict, Any
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/chat", tags=["Hà Nội Storyteller AI Chatbot"])

# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class ChatContext(BaseModel):
    pois: List[Dict[str, Any]] = Field(default_factory=list, description="Danh sách các POI du khách đã chọn")
    selectedHotel: Optional[Dict[str, Any]] = Field(default=None, description="Khách sạn / điểm lưu trú đã chọn")
    days: int = Field(default=1, description="Số ngày khám phá")
    transportMode: Optional[str] = Field(default="Xe máy / Ô tô", description="Phương tiện di chuyển")
    weather: Optional[Dict[str, Any]] = Field(default=None, description="Thông tin thời tiết hiện tại")
    traffic: Optional[Dict[str, Any]] = Field(default=None, description="Tình trạng giao thông")
    itineraryTitle: Optional[str] = Field(default=None, description="Tên chuyến đi")


class ChatHistoryItem(BaseModel):
    role: str = Field(..., description="'user' hoặc 'model'/'assistant'")
    text: str = Field(..., description="Nội dung tin nhắn")


class StorytellerRequest(BaseModel):
    message: str = Field(..., description="Câu hỏi hoặc yêu cầu của du khách")
    context: Optional[ChatContext] = Field(default=None, description="Ngữ cảnh chuyến đi")
    history: Optional[List[ChatHistoryItem]] = Field(default_factory=list, description="Lịch sử hội thoại gần đây")
    apiKey: Optional[str] = Field(default=None, description="API Key người dùng cung cấp tùy chọn")


class StorytellerResponse(BaseModel):
    text: str
    source: str = Field(..., description="'gemini' hoặc 'fallback'")
    model: Optional[str] = None


class NarrativeRequest(BaseModel):
    pois: List[Dict[str, Any]] = Field(..., description="Danh sách POI theo thứ tự lộ trình")
    apiKey: Optional[str] = Field(default=None, description="API Key người dùng tùy chọn")


class NarrativeResponse(BaseModel):
    narrative: str
    source: str = Field(..., description="'gemini' hoặc 'fallback'")


class PromptToItineraryRequest(BaseModel):
    prompt: str = Field(..., description="Câu lệnh tự nhiên hoặc mô tả mong muốn của người dùng")
    days: Optional[int] = Field(default=None, description="Gợi ý số ngày nếu có (1, 2, 3)")
    travel_group: Optional[str] = Field(default=None, description="Nhóm đi: 'solo', 'couple', 'family', 'friends'")
    pace: Optional[str] = Field(default=None, description="Nhịp độ: 'relaxed', 'balanced', 'packed'")
    interests: Optional[List[str]] = Field(default=None, description="Danh mục sở thích: 'culinary', 'heritage', 'photography', 'relaxation'")
    budget_tier: Optional[str] = Field(default=None, description="Mức chi phí: 'budget', 'standard', 'luxury'")
    apiKey: Optional[str] = Field(default=None, description="API Key tùy chọn")


class PromptToItineraryResponse(BaseModel):
    title: str
    summary: str
    days: int
    recommended_poi_ids: List[int]
    vibes: List[str]
    advice: str
    source: str = Field(default="gemini", description="'gemini' hoặc 'fallback'")
    companions: Optional[str] = Field(default="2 người", description="Đối tượng/Số lượng du khách phù hợp")
    people_count: Optional[int] = Field(default=2, description="Số người ước tính")


# ---------------------------------------------------------------------------
# Fallback Generators
# ---------------------------------------------------------------------------

def generate_local_storyteller_fallback(message: str, context: Optional[ChatContext]) -> str:
    q = message.lower()

    if any(k in q for k in ['hỏa lò', 'hoa lo', 'trẻ', 'con nít', 'em bé']):
        return (
            "Khi tham quan **Di tích Nhà tù Hỏa Lò** cùng trẻ nhỏ, bạn nên lưu ý:\n"
            "1. **Không gian & Ánh sáng:** Không gian trưng bày tái hiện lịch sử hào hùng nhưng có những khu xà lim khá tối và âm thanh tái hiện chân thực, các bé dưới 10 tuổi có thể cảm thấy hơi e sợ. Bạn nên nắm tay và giải thích nhẹ nhàng cho con.\n"
            "2. **Thuyết minh tự động (Audio Guide):** Rất nên thuê thiết bị Audio Guide tại quầy vé (khoảng 50.000đ). Giọng đọc truyền cảm sẽ giúp các con tiếp thu lịch sử như một câu chuyện kể hấp dẫn.\n"
            "3. **Trang phục & Thái độ:** Đây là di tích lịch sử thiêng liêng, hãy dặn các bé giữ trật tự và mặc trang phục lịch sự."
        )

    if any(k in q for k in ['văn miếu', 'cà phê', 'cafe', 'yên tĩnh']):
        return (
            "Ngay gần **Văn Miếu - Quốc Tử Giám**, nếu muốn tìm một góc cà phê tĩnh lặng để đọc sách hoặc thư giãn sau khi tản bộ, bạn có thể ghé:\n"
            "- **Cà phê Sách Tràng An (Đoàn Thị Điểm / Nguyễn Thái Học):** Góc quán nhỏ phủ đầy cây xanh, rất yên tĩnh và đậm chất trí thức Hà thành.\n"
            "- **Loading T (phố Chân Cầm):** Căn biệt thự Pháp cổ phục vụ cà phê trứng và trà hoa cúc cực kỳ thanh tao.\n"
            "- **All Day Coffee (Quang Trung):** Không gian ấm áp tông nâu gỗ, đồ uống phong phú và góc ban công ngắm phố rất thảnh thơi."
        )

    if any(k in q for k in ['ăn trưa', 'ăn tối', 'ẩm thực', 'món ngon', 'phở', 'quán ăn', 'đặc sản']):
        return (
            "Theo phong vị ẩm thực đặc sắc Hà Nội quanh khu vực trung tâm:\n"
            "- **Buổi sáng/trưa:** Thưởng thức **Phở Bát Đàn** (Phố Cổ) thơm nồng mùi gừng tươi và nước dùng trong vắt, hoặc **Bún chả Hương Liên / Bún chả Hàng Quạt** dậy mùi than hoa.\n"
            "- **Buổi xế chiều:** Thử một bát **Chè sen long nhãn** Hàng Bạc thanh mát hoặc **Bánh gối, Bánh rán mặn Lý Quốc Sư**.\n"
            "- **Buổi tối:** Sau khi dạo phố, hãy ghé phố ẩm thực **Tống Duy Tân** hoặc thưởng thức **Chả cá Lã Vọng / Thăng Long** thơm phức thì là và mắm tôm đánh sủi bọt."
        )

    if any(k in q for k in ['hồ tây', 'hoàng hôn', 'chiều']):
        return (
            "**Hồ Tây** lúc ráng chiều luôn là khoảnh khắc quyến rũ nhất của Thủ đô.\n"
            "- Bạn nên có mặt tại đường Thanh Niên hoặc dạo quanh bán đảo Quảng Bá tầm **16:45 – 17:30**.\n"
            "- Ghé **Chùa Trấn Quốc** ngắm bóng tháp cổ nghiêng bóng xuống mặt nước dát vàng.\n"
            "- Đừng quên nhâm nhi một que **Kem Hồ Tây** mát lạnh hoặc ghé một quán cà phê ven hồ ngắm sóng nước lăn tăn."
        )

    # Tổng quát theo context
    poi_names = [p.get("name", "") for p in (context.pois if context else []) if p.get("name")]
    poi_str = ", ".join(poi_names[:3]) if poi_names else "các di tích Thủ đô"
    weather_str = ""
    if context and context.weather:
        weather_str = f"Hiện thời tiết đang khoảng {context.weather.get('temperature', 28)}°C, "

    return (
        f"Với lộ trình ghé thăm **{poi_str}**, bạn đang có một hành trình giàu trải nghiệm văn hóa và nhịp sống Hà Nội.\n"
        f"- {weather_str}bạn nên mang theo nước suối nhỏ và giày êm để thong thả tản bộ qua các con phố rợp bóng xà cừ.\n"
        "- Mỗi điểm dừng lớn nên dành khoảng 1 – 1.5 tiếng để cảm nhận trọn vẹn không gian.\n"
        "Bạn cần thêm gợi ý về quán ăn ngon gần điểm đến tiếp theo hay góc chụp ảnh đẹp không?"
    )


def generate_local_narrative_fallback(pois: List[Dict[str, Any]]) -> str:
    if not pois:
        return "Hà Nội đón bạn bằng những ngõ nhỏ rêu phong, tiếng chuông chùa Trấn Quốc ngân vang mặt nước hồ Tây và hương cà phê trứng nồng nàn góc phố cũ. Hãy chọn những điểm dừng để chúng ta cùng dệt nên câu chuyện chuyến đi."

    names = [p.get("name", "") for p in pois if p.get("name")]
    if not names:
        return "Hành trình đưa bạn qua những không gian lắng đọng trầm tích nghìn năm Thăng Long - Hà Nội."

    if len(names) == 1:
        return f"Hành trình mở ra tại {names[0]}. Giữa nhịp sống Thủ đô ngàn năm văn hiến, mỗi góc gạch, tán bàng nơi đây đều cất giấu một câu chuyện lịch sử trầm mặc. Hãy thong thả bước chậm, hít thở bầu không khí sớm mai thanh khiết của Hà Nội."

    middle_str = f"rồi thong thả ghé qua {', '.join(names[1:-1])}, " if len(names) > 2 else ""
    return (
        f"Hành trình mở đầu khi sớm mai vừa chớm tại {names[0]}, nơi sương thu bảng lảng vương trên những mái ngói rêu phong. "
        f"Theo bước chân thong dong, bạn sẽ tiếp tục hành trình {middle_str}để cảm nhận trọn vẹn sự giao thoa kỳ diệu giữa trầm tích lịch sử Thăng Long và nhịp thở đương đại. "
        f"Buổi hoàng hôn khép lại đầy lắng đọng tại {names[-1]}, khi ráng chiều buông đỏ mặt nước và phố thị lên đèn, để lại một phong vị Hà thành thanh tao khó phai."
    )


# ---------------------------------------------------------------------------
# Helper gọi Google Gemini API
# ---------------------------------------------------------------------------

async def call_gemini_api(
    prompt_or_contents: List[Dict[str, Any]],
    system_instruction: str,
    api_key: str,
    model_name: str = "gemini-3.1-flash-lite"
) -> Optional[str]:
    """
    Gọi Google Gemini API (v1beta) với danh sách model khả dụng: gemini-3.1-flash-lite, gemini-3.5-flash, gemini-flash-latest.
    """
    models_to_try = [model_name, "gemini-3.5-flash", "gemini-flash-latest", "gemini-3.8-flash"]
    # Tránh trùng lặp
    models_to_try = list(dict.fromkeys(models_to_try))

    payload = {
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": prompt_or_contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 800
        }
    }

    async with httpx.AsyncClient(timeout=25.0) as client:
        for m in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
            try:
                res = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
                else:
                    logger.warning(f"Gemini API model {m} returned {res.status_code}: {res.text[:200]}")
            except Exception as e:
                logger.warning(f"Error calling Gemini model {m}: {e}")

    return None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/storyteller", response_model=StorytellerResponse)
async def chat_storyteller(req: StorytellerRequest):
    """
    Endpoint Chatbot Hà Nội Storyteller:
    Tích hợp trực tiếp Google Gemini API (gemini-2.0-flash / gemini-1.5-flash)
    với đầy đủ ngữ cảnh không gian SDSS (POIs, thời tiết, giao thông, khách sạn).
    """
    api_key = (req.apiKey or os.getenv("GEMINI_API_KEY", "")).strip()

    # Xây dựng System Instruction giàu ngữ cảnh
    context = req.context
    poi_names = [p.get("name", "") for p in (context.pois if context else []) if p.get("name")]
    poi_str = ", ".join(poi_names) if poi_names else "Chưa chọn điểm cụ thể"
    hotel_str = context.selectedHotel.get("name", "Chưa chọn") if (context and context.selectedHotel) else "Chưa chọn"
    weather_str = (
        f"{context.weather.get('temperature', 28)}°C, {context.weather.get('conditionLabel', 'Dễ chịu')}"
        if (context and context.weather) else "Thời tiết mát mẻ"
    )
    traffic_str = context.traffic.get("label", "Bình thường") if (context and context.traffic) else "Thông thoáng"
    days = context.days if context else 1
    transport = context.transportMode if (context and context.transportMode) else "Xe máy / Ô tô"

    system_instruction = (
        "Bạn là 'Hà Nội Storyteller' - một người bạn đồng hành tinh tế, am hiểu sâu sắc lịch sử, văn hóa, ngõ phố "
        "và ẩm thực của Thủ đô Hà Nội ngàn năm văn hiến.\n\n"
        "[NGỮ CẢNH HÀNH TRÌNH CỦA DU KHÁCH]:\n"
        f"- Các điểm tham quan du khách quan tâm: {poi_str}\n"
        f"- Khách sạn / Điểm lưu trú: {hotel_str}\n"
        f"- Số ngày chuyến đi: {days} ngày\n"
        f"- Phương tiện di chuyển: {transport}\n"
        f"- Thời tiết hiện tại tại Hà Nội: {weather_str}\n"
        f"- Tình trạng giao thông: {traffic_str}\n\n"
        "[NGUYÊN TẮC TRẢ LỜI]:\n"
        "1. Trả lời bằng tiếng Việt với giọng văn thong dong, ấm áp, văn minh, mang nét thanh lịch Tràng An.\n"
        "2. Đưa ra lời khuyên thực tế, cụ thể (tên món ăn kèm địa chỉ/con phố nổi tiếng, khung giờ đẹp nhất để ghé, lưu ý trẻ em/người cao tuổi nếu được hỏi).\n"
        "3. Tận dụng ngữ cảnh hành trình hiện tại của du khách để câu trả lời mang tính cá nhân hóa cao.\n"
        "4. Độ dài vừa phải (khoảng 2 - 3 đoạn ngắn, định dạng Markdown rõ ràng, dễ đọc trên di động)."
    )

    # Chuẩn bị contents bao gồm lịch sử hội thoại
    contents: List[Dict[str, Any]] = []

    # Thêm lịch sử hội thoại gần nhất (tối đa 6 lượt tin nhắn gần nhất)
    if req.history:
        recent_history = req.history[-6:]
        for item in recent_history:
            role = "user" if item.role in ["user", "Du khách"] else "model"
            contents.append({
                "role": role,
                "parts": [{"text": item.text}]
            })

    # Thêm câu hỏi hiện tại
    contents.append({
        "role": "user",
        "parts": [{"text": req.message}]
    })

    if api_key:
        answer = await call_gemini_api(
            prompt_or_contents=contents,
            system_instruction=system_instruction,
            api_key=api_key,
            model_name="gemini-3.1-flash-lite"
        )
        if answer:
            return StorytellerResponse(
                text=answer.strip(),
                source="gemini",
                model="gemini-3.1-flash-lite"
            )

    # Nếu không có key hoặc API gặp sự cố -> Fallback dữ liệu văn hóa cục bộ
    fallback_text = generate_local_storyteller_fallback(req.message, context)
    return StorytellerResponse(
        text=fallback_text,
        source="fallback"
    )


@router.post("/narrative", response_model=NarrativeResponse)
async def generate_narrative(req: NarrativeRequest):
    """
    Sinh đoạn văn dẫn chuyện nghệ thuật kết nối toàn bộ các điểm đến trong lịch trình.
    """
    api_key = (req.apiKey or os.getenv("GEMINI_API_KEY", "")).strip()

    names = [p.get("name", "") for p in req.pois if p.get("name")]
    if not names:
        return NarrativeResponse(
            narrative=generate_local_narrative_fallback([]),
            source="fallback"
        )

    poi_list_str = ", ".join([f"{idx + 1}. {name}" for idx, name in enumerate(names)])

    system_instruction = (
        "Bạn là một người Hà Nội am hiểu sâu sắc văn hóa, lịch sử và phong vị ẩm thực Thủ đô. "
        "Hãy viết một đoạn dẫn chuyện ngắn (khoảng 130-180 từ), giọng văn thong dong, hoài niệm, giàu chất thơ và đậm chất văn học Tràng An. "
        f"Kết nối các điểm đến sau thành một trải nghiệm liền mạch theo đúng thứ tự: {poi_list_str}. "
        "Hãy khéo léo lồng ghép cảm thức thời gian (sớm mai trong trẻo, bóng râm trưa hè hay ráng chiều tà) "
        "cùng phong vị ẩm thực đặc trưng quanh các điểm dừng. Tránh dùng từ ngữ sáo rỗng hoặc quá thị trường."
    )

    contents = [
        {
            "role": "user",
            "parts": [{"text": f"Hãy dệt câu chuyện kết nối các điểm đến sau: {poi_list_str}"}]
        }
    ]

    if api_key:
        narrative = await call_gemini_api(
            prompt_or_contents=contents,
            system_instruction=system_instruction,
            api_key=api_key,
            model_name="gemini-3.1-flash-lite"
        )
        if narrative:
            return NarrativeResponse(
                narrative=narrative.strip(),
                source="gemini"
            )

    return NarrativeResponse(
        narrative=generate_local_narrative_fallback(req.pois),
        source="fallback"
    )


def generate_local_prompt_to_itinerary_fallback(
    prompt: str, 
    days_hint: Optional[int] = None,
    travel_group: Optional[str] = None,
    pace: Optional[str] = None,
    interests: Optional[List[str]] = None
) -> Dict[str, Any]:
    q = prompt.lower()
    
    # Xác định số ngày
    days = days_hint or 2
    if any(k in q for k in ['1 ngày', '1ngay', 'trong ngày', 'một ngày', '24h']):
        days = 1
    elif any(k in q for k in ['3 ngày', '3ngay', 'ba ngày', 'dài ngày']):
        days = 3
    elif any(k in q for k in ['2 ngày', '2ngay', 'hai ngày', 'cuối tuần', '2n1d']):
        days = 2

    # Nhánh 1: Gia đình có người lớn tuổi hoặc trẻ nhỏ
    if travel_group == 'family' or any(k in q for k in ['gia đình', 'gia dinh', 'trẻ em', 'tre nhỏ', 'bố mẹ', 'lớn tuổi', 'người già', 'bác lớn']):
        return {
            "title": f"Hà Nội Thảnh Thơi Cho Cả Gia Đình ({days} Ngày)",
            "summary": "Lộ trình khuôn viên rợp bóng mát cây xanh, đường đi bằng phẳng và nghỉ chân thuận tiện cho cả ông bà và các bé.",
            "days": days,
            "recommended_poi_ids": [2, 3, 10, 11] if days == 1 else [2, 3, 9, 5, 10, 11, 4, 1],
            "vibes": ["gia đình", "thảnh thơi", "râm mát", "di sản"],
            "advice": "Các di tích Văn Miếu và Bảo tàng Dân tộc học có nhiều bóng cây và lối đi dễ di chuyển; hãy chuẩn bị thêm bình nước ấm và xe đẩy em bé nếu cần.",
            "source": "fallback"
        }

    # Nhánh 2: Cặp đôi lãng mạn / Đi 2 người
    if travel_group == 'couple' or any(k in q for k in ['cặp đôi', 'người yêu', 'hẹn hò', 'lãng mạn', 'romantic']):
        return {
            "title": f"Hà Nội Lãng Mạn & Hẹn Hò Phố Cổ ({days} Ngày)",
            "summary": "Ngắm hoàng hôn Hồ Tây dát vàng, nhâm nhi cà phê trứng Giảng cổ kính và dạo bộ bên hồ Gươm lung linh ánh đèn.",
            "days": days,
            "recommended_poi_ids": [1, 4, 7, 13] if days == 1 else [1, 4, 5, 7, 8, 9, 11, 13],
            "vibes": ["lãng mạn", "cà phê", "hoàng hôn", "phố cổ"],
            "advice": "Thời điểm đẹp nhất trong ngày là 16:30 tại cầu Long Biên hoặc đường Thanh Niên để cùng nhau lưu lại những bức ảnh kỷ niệm.",
            "source": "fallback"
        }

    # Phân loại theo chủ đề
    if any(k in q for k in ['phở', 'ăn', 'ẩm thực', 'bún chả', 'cà phê', 'food', 'món ngon', 'trứng']):
        return {
            "title": f"Foodtour Hà Nội 36 Phố Phường Trọn Vị ({days} Ngày)",
            "summary": "Hành trình trải nghiệm tinh hoa ẩm thực từ phở Bát Đàn, bún chả que tre đến cà phê trứng Giảng cổ kính.",
            "days": days,
            "recommended_poi_ids": [1, 4, 11, 13, 15] if days == 1 else [1, 3, 4, 5, 11, 13, 14, 15],
            "vibes": ["ẩm thực", "phố cổ", "đường phố", "cà phê"],
            "advice": "Hãy để bụng thật đói và mang theo giày đi bộ thoải mái để len lỏi trong các ngõ nhỏ phố cổ nhé!",
            "source": "fallback"
        }

    if any(k in q for k in ['ảnh', 'chụp', 'vintage', 'sống ảo', 'check-in', 'nghệ thuật', 'bảo tàng', 'hoài cổ']):
        return {
            "title": f"Hà Nội Hoài Cổ & Góc Sống Ảo Vintage ({days} Ngày)",
            "summary": "Tuyển chọn những khung hình đẹp nhất của Thủ đô: cầu Long Biên rêu phong, Văn Miếu cổ kính và Bảo tàng Mỹ thuật.",
            "days": days,
            "recommended_poi_ids": [1, 3, 7, 8] if days == 1 else [1, 3, 7, 8, 9, 12, 13],
            "vibes": ["vintage", "chụp ảnh", "nghệ thuật", "hoài cổ"],
            "advice": "Khung giờ vàng hoàng hôn trên cầu Long Biên hoặc Hồ Tây (16:30 - 17:30) cho ánh sáng chụp ảnh vintage đẹp nhất.",
            "source": "fallback"
        }

    if any(k in q for k in ['hồ tây', 'hoàng hôn', 'thư giãn', 'chill', 'nghỉ dưỡng', 'gió mát', 'hồ']):
        return {
            "title": f"Hành Trình Gió Hồ Tây & Thư Thái Tâm Hồn ({days} Ngày)",
            "summary": "Thong dong quanh mặt nước mênh mang, viếng chùa Trấn Quốc thanh tịnh và ngắm hoàng hôn đỏ ối.",
            "days": days,
            "recommended_poi_ids": [1, 5, 8, 13] if days == 1 else [1, 2, 5, 7, 8, 9, 10, 13],
            "vibes": ["thư giãn", "hồ tây", "hoàng hôn", "an yên"],
            "advice": "Hãy chọn một quán cà phê ven hồ trên đường Thanh Niên hoặc Quảng An lúc xế chiều để tận hưởng làn gió mát lành.",
            "source": "fallback"
        }

    # Mặc định: Hành trình tinh hoa văn hóa Thăng Long
    return {
        "title": f"Hành Trình Di Sản Thăng Long Ngàn Năm ({days} Ngày)",
        "summary": "Khám phá trọn vẹn những biểu tượng văn hóa lịch sử tiêu biểu nhất của Thủ đô Hà Nội.",
        "days": days,
        "recommended_poi_ids": [1, 2, 3, 4] if days == 1 else [1, 2, 3, 4, 5, 7, 8, 9],
        "vibes": ["di sản", "lịch sử", "văn hóa", "trải nghiệm"],
        "advice": "Các di tích lịch sử như Lăng Bác và Văn Miếu yêu cầu trang phục lịch sự; nhớ mang theo ô che nắng nhẹ.",
        "source": "fallback"
    }


@router.post("/prompt-to-itinerary", response_model=PromptToItineraryResponse)
async def prompt_to_itinerary(req: PromptToItineraryRequest):
    """
    AI Prompt-to-Itinerary: Phân tích câu lệnh ngôn ngữ tự nhiên của người dùng,
    tự động suy luận số ngày, phong cách du lịch, và chọn lọc danh sách POI tối ưu nhất.
    """
    import json
    api_key = (req.apiKey or os.getenv("GEMINI_API_KEY", "")).strip()

    poi_catalog = (
        "1: Hồ Hoàn Kiếm & Đền Ngọc Sơn (di sản, hồ, đi bộ)\n"
        "2: Lăng Chủ tịch Hồ Chí Minh & Ba Đình (di sản, lịch sử)\n"
        "3: Văn Miếu - Quốc Tử Giám (di sản, trường đại học đầu tiên)\n"
        "4: Khu Phố Cổ Hà Nội 36 Phố Phường (ẩm thực, mua sắm, văn hóa)\n"
        "5: Chùa Trấn Quốc & Hồ Tây (tâm linh, hồ, hoàng hôn)\n"
        "6: Di tích Nhà tù Hỏa Lò (lịch sử, giáo dục)\n"
        "7: Nhà thờ Lớn Hà Nội (kiến trúc Pháp, check-in, cà phê)\n"
        "8: Cầu Long Biên (di sản lịch sử, vintage, hoàng hôn)\n"
        "9: Hoàng thành Thăng Long (di sản thế giới UNESCO)\n"
        "10: Bảo tàng Dân tộc học Việt Nam (văn hóa, kiến trúc dân gian)\n"
        "11: Phở Gia Truyền Bát Đàn (ẩm thực nổi tiếng)\n"
        "12: Bảo tàng Mỹ thuật Việt Nam (nghệ thuật, hội họa)\n"
        "13: Cà phê Trứng Giảng (đặc sản đồ uống lâu đời)\n"
        "14: Chợ Đồng Xuân (mua sắm truyền thống, quà lưu niệm)\n"
        "15: Bún chả Hương Liên (ẩm thực Obama trứ danh)\n"
        "16: Làng gốm Bát Tràng (làng nghề thủ công truyền thống)"
    )

    system_instruction = (
        "Bạn là Trợ lý Chuyên gia Lập Lịch trình Du lịch Hà Nội am hiểu sâu sắc văn hóa, ẩm thực và đường phố Thủ đô. TUYỆT ĐỐI KHÔNG dùng các thuật ngữ hàn lâm kỹ thuật như SDSS, TSP, Weiszfeld... Hãy dùng ngôn từ tự nhiên, ấm áp.\n"
        "Nhiệm vụ: Phân tích yêu cầu tự nhiên của du khách, xác định số ngày (days: 1, 2, hoặc 3), "
        "chọn ra 4 đến 8 POI IDs phù hợp nhất từ danh mục dưới đây, đặt tên chuyến đi hấp dẫn và tóm tắt trải nghiệm.\n\n"
        f"[DANH MỤC POI HỢP LỆ]:\n{poi_catalog}\n\n"
        "[QUY TẮC BẮT BUỘC]:\n"
        "Chỉ trả về DUY NHẤT một đối tượng JSON thuần túy (không bọc trong markdown codeblock nếu có thể, hoặc bọc trong ```json) với cấu trúc:\n"
        "{\n"
        '  "title": "Tên chuyến đi giàu cảm xúc (dưới 60 ký tự)",\n'
        '  "summary": "Mô tả 1-2 câu ngắn gọn về điểm nhấn trải nghiệm",\n'
        '  "days": 1 hoặc 2 hoặc 3,\n'
        '  "recommended_poi_ids": [danh sách số nguyên id như 1, 3, 4, 7...],\n'
        '  "vibes": ["từ_khóa_1", "từ_khóa_2"],\n'
        '  "advice": "Lời khuyên ngắn gọn thực tế"\n'
        "}"
    )

    if api_key:
        contents = [{
            "role": "user",
            "parts": [{"text": f"Yêu cầu của tôi: {req.prompt}" + (f" (Ưu tiên {req.days} ngày)" if req.days else "")}]
        }]
        raw_response = await call_gemini_api(
            prompt_or_contents=contents,
            system_instruction=system_instruction,
            api_key=api_key,
            model_name="gemini-3.1-flash-lite"
        )

        if raw_response:
            try:
                # Làm sạch markdown nếu có
                clean_json = raw_response.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                if clean_json.startswith("```"):
                    clean_json = clean_json[3:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                clean_json = clean_json.strip()

                parsed = json.loads(clean_json)
                return PromptToItineraryResponse(
                    title=parsed.get("title", f"Chuyến đi Hà Nội ({parsed.get('days', 2)} Ngày)"),
                    summary=parsed.get("summary", "Lịch trình do AI đề xuất theo sở thích của bạn."),
                    days=int(parsed.get("days", req.days or 2)),
                    recommended_poi_ids=list(parsed.get("recommended_poi_ids", [1, 2, 3, 4])),
                    vibes=list(parsed.get("vibes", ["khám phá", "hà nội"])),
                    advice=parsed.get("advice", "Hãy mang theo trang phục thoải mái để tận hưởng chuyến đi!"),
                    source="gemini"
                )
            except Exception as parse_err:
                logger.warning(f"Failed to parse Gemini JSON output ({parse_err}). Falling back to local heuristic.")

    fallback_data = generate_local_prompt_to_itinerary_fallback(req.prompt, req.days, req.travel_group, req.pace, req.interests)
    return PromptToItineraryResponse(**fallback_data)
