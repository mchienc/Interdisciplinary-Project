import React, { useState } from 'react';
import { 
  Send, 
  ArrowRight, 
  Check, 
  Sliders, 
  Edit3, 
  Users, 
  Heart, 
  Compass, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Coffee,
  Camera,
  Utensils,
  Landmark,
  Smile
} from 'lucide-react';
import { POI } from '../../types';
import { generatePromptToItineraryApi, PromptToItineraryResult, PromptToItineraryParams } from '../../services/aiService';

interface AiTripPlannerCardProps {
  currentDays: number;
  allPois: POI[];
  onApplyPlan: (poiIds: number[], days: number, title: string) => void;
  onViewItineraryTab: () => void;
}

export const AiTripPlannerCard: React.FC<AiTripPlannerCardProps> = ({
  currentDays,
  allPois,
  onApplyPlan,
  onViewItineraryTab
}) => {
  // Mode: 'prompt' (Gõ tự do) vs 'wizard' (Chọn theo Gu)
  const [activeMode, setActiveMode] = useState<'prompt' | 'wizard'>('prompt');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Prompt Mode State
  const [promptText, setPromptText] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<number>(currentDays || 2);

  // Wizard Mode State
  const [wizardGroup, setWizardGroup] = useState<'solo' | 'couple' | 'family' | 'friends'>('family');
  const [wizardPace, setWizardPace] = useState<'relaxed' | 'balanced' | 'packed'>('relaxed');
  const [wizardInterests, setWizardInterests] = useState<string[]>(['culinary', 'heritage']);

  // Loading & Result States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(1);
  const [result, setResult] = useState<PromptToItineraryResult | null>(null);

  // Quick prompt keyword tags
  const QUICK_TAGS = [
    { label: '#GiaĐình', text: 'cho gia đình có người lớn tuổi và trẻ nhỏ' },
    { label: '#ĐiBộÍt', text: 'hạn chế đi bộ nhiều, ưu tiên râm mát' },
    { label: '#ẨmThựcPhốCổ', text: 'thích ăn phở Bát Đàn, bún chả và cà phê trứng' },
    { label: '#HoàngHônHồTây', text: 'ngắm hoàng hôn Hồ Tây lúc xế chiều' },
    { label: '#CheckinVintage', text: 'thích chụp ảnh vintage cầu Long Biên và Văn Miếu' },
    { label: '#DiSản', text: 'khám phá lịch sử và di sản ngàn năm' }
  ];

  const handleAppendTag = (tagText: string) => {
    if (!promptText.trim()) {
      setPromptText(`Chuyến đi ${selectedDays} ngày ${tagText}`);
    } else if (!promptText.includes(tagText)) {
      setPromptText(`${promptText.trim()}, ${tagText}`);
    }
  };

  const handleToggleInterest = (key: string) => {
    setWizardInterests(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const executeGeneration = async (params: PromptToItineraryParams) => {
    setIsGenerating(true);
    setResult(null);
    setGenerationStep(1);

    // Simulated progress steps for better transparency & UX
    const stepTimer1 = setTimeout(() => setGenerationStep(2), 500);
    const stepTimer2 = setTimeout(() => setGenerationStep(3), 1100);

    try {
      const res = await generatePromptToItineraryApi(params);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setResult(res);
      // Áp dụng ngay vào lộ trình
      onApplyPlan(res.recommended_poi_ids, res.days, res.title);
    } catch (err) {
      console.error('Lỗi khi sinh lịch trình AI:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit từ ô Gõ tự do
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    executeGeneration({
      prompt: promptText,
      days: selectedDays
    });
  };

  // Submit từ bộ chọn theo Gu (Wizard)
  const handleWizardSubmit = () => {
    const groupDesc = {
      solo: 'đi 1 mình thong dong',
      couple: 'cặp đôi hẹn hò lãng mạn',
      family: 'gia đình có trẻ nhỏ hoặc người lớn tuổi, ưu tiên râm mát',
      friends: 'nhóm bạn thân trẻ trung thích khám phá'
    }[wizardGroup];

    const paceDesc = {
      relaxed: 'nhịp độ thong dong thư thái (ít điểm, chill cà phê)',
      balanced: 'nhịp độ hài hòa cân bằng',
      packed: 'khám phá tối đa nhiều điểm đến nhất có thể'
    }[wizardPace];

    const interestLabels: Record<string, string> = {
      culinary: 'ẩm thực đường phố phố cổ',
      heritage: 'di sản văn hóa lịch sử',
      photography: 'chụp ảnh vintage sống ảo',
      relaxation: 'gió mát hồ Tây và cà phê thư giãn'
    };
    const interestDesc = wizardInterests.map(k => interestLabels[k] || k).join(', ');

    const prompt = `Chuyến đi ${selectedDays} ngày tại Hà Nội dành cho ${groupDesc}, theo ${paceDesc}, ưu tiên trải nghiệm: ${interestDesc}.`;

    executeGeneration({
      prompt,
      days: selectedDays,
      travel_group: wizardGroup,
      pace: wizardPace,
      interests: wizardInterests
    });
  };

  const getPoiNames = (poiIds: number[]): string[] => {
    return poiIds.map(id => {
      const found = allPois.find(p => p.id === id);
      return found ? found.name : `Địa điểm #${id}`;
    });
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#FAF7F0] via-white to-[#F5EFE6] border border-amber-200/90 shadow-sm overflow-hidden transition-all duration-200">
      {/* 1. Header Card */}
      <div className="p-3.5 bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-transparent border-b border-amber-200/60 flex items-center justify-between">
        <div>
          <h4 className="font-serif text-xs font-bold text-[#1C382B]">
            Tự Động Lập Lịch Trình
          </h4>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Nhập mong muốn hoặc chọn gu du lịch để sắp xếp chuyến đi lý tưởng
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition cursor-pointer"
          title={isCollapsed ? 'Mở rộng khung trợ lý' : 'Thu gọn khung'}
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Main Body (Collapsible) */}
      {!isCollapsed && (
        <div className="p-3.5 sm:p-4 space-y-3.5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-stone-100/90 rounded-xl text-xs font-semibold text-stone-600 gap-1 border border-stone-200/70">
            <button
              type="button"
              onClick={() => setActiveMode('prompt')}
              className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'prompt' 
                  ? 'bg-white text-[#1C382B] shadow-2xs font-bold' 
                  : 'hover:text-stone-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-[#B85D3B]" />
              <span>Gõ mong muốn tự do</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('wizard')}
              className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'wizard' 
                  ? 'bg-white text-[#1C382B] shadow-2xs font-bold' 
                  : 'hover:text-stone-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#1C382B]" />
              <span>Chọn theo Gu (1-Click)</span>
            </button>
          </div>

          {/* ========================================================
              MODE A: GÕ TỰ DO (SMART TEXTAREA - NO BUTTON OVERLAP)
              ======================================================== */}
          {activeMode === 'prompt' && (
            <form onSubmit={handlePromptSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span>Bạn muốn chuyến đi Hà Nội lần này như thế nào?</span>
                  <span className="text-[10px] text-stone-400">{promptText.length}/200</span>
                </div>
                
                {/* Textarea rộng rãi, rõ ràng, không bị nút đè */}
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value.slice(0, 200))}
                  placeholder="Ví dụ: Lập chuyến 2 ngày cho gia đình có người lớn tuổi, thích ăn phở, ngắm hồ Tây lúc hoàng hôn và đi bộ ít..."
                  disabled={isGenerating}
                  className="w-full p-3 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#B85D3B] focus:ring-1 focus:ring-[#B85D3B]/20 text-stone-800 placeholder:text-stone-400 shadow-2xs transition leading-relaxed resize-none"
                />
              </div>

              {/* Tag gợi ý nhanh click để chèn */}
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 font-medium">Bấm để thêm nhanh vào mô tả:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUICK_TAGS.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleAppendTag(tag.text)}
                      className="text-[10.5px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100/70 border border-stone-200/90 text-stone-600 hover:text-stone-900 transition cursor-pointer font-medium"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar: Số ngày + Nút Tạo */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-stone-500 font-medium mr-1 hidden sm:inline">Số ngày:</span>
                  {[1, 2, 3].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDays(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedDays === d
                          ? 'bg-[#1C382B] text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {d}N
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !promptText.trim()}
                  className="px-4 py-2 bg-[#1C382B] hover:bg-[#B85D3B] disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-98"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang phân tích...</span>
                    </>
                  ) : (
                    <>
                      <span>Tạo Lịch Trình</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              MODE B: CHỌN THEO GU (WIZARD 1-CLICK)
              ======================================================== */}
          {activeMode === 'wizard' && (
            <div className="space-y-3.5 text-xs">
              {/* 1. Đi cùng ai? */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-700" />
                  <span>Chuyến đi dành cho ai?</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'family', label: 'Gia đình', sub: 'Trẻ nhỏ & Bố mẹ' },
                    { id: 'couple', label: 'Cặp đôi', sub: 'Lãng mạn' },
                    { id: 'solo', label: '1 Mình / Bạn bè', sub: 'Tự do chill' }
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setWizardGroup(g.id as any)}
                      className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        wizardGroup === g.id
                          ? 'bg-[#1C382B] text-white border-[#1C382B] shadow-2xs'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="font-bold text-[11px]">{g.label}</span>
                      <span className={`text-[9.5px] mt-0.5 ${wizardGroup === g.id ? 'text-amber-200' : 'text-stone-400'}`}>
                        {g.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Nhịp độ chuyến đi? */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Nhịp độ di chuyển bạn thích?</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWizardPace('relaxed')}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                      wizardPace === 'relaxed'
                        ? 'bg-amber-100/80 border-amber-300 text-amber-950 font-bold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Thong dong (Khuyên dùng)</div>
                    <div className="text-[10px] text-stone-500">3–4 điểm/ngày, nhiều thời gian cà phê</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardPace('packed')}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                      wizardPace === 'packed'
                        ? 'bg-amber-100/80 border-amber-300 text-amber-950 font-bold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Khám phá tối đa</div>
                    <div className="text-[10px] text-stone-500">5–6 điểm/ngày, đi trọn vẹn điểm hot</div>
                  </button>
                </div>
              </div>

              {/* 3. Trải nghiệm trọng tâm (Chọn nhiều) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Trải nghiệm bạn muốn ưu tiên:</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'culinary', label: 'Ẩm thực & Phố Cổ', icon: Utensils },
                    { id: 'heritage', label: 'Di sản & Văn hóa', icon: Landmark },
                    { id: 'photography', label: 'Chụp ảnh & Vintage', icon: Camera },
                    { id: 'relaxation', label: 'Hoàng hôn & Cà phê chill', icon: Coffee }
                  ].map(item => {
                    const active = wizardInterests.includes(item.id);
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleInterest(item.id)}
                        className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                          active
                            ? 'bg-[#1C382B] text-white border-[#1C382B] shadow-2xs font-semibold'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <IconComponent className={`w-3.5 h-3.5 ${active ? 'text-amber-300' : 'text-stone-400'}`} />
                        <span className="text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wizard Bottom Bar */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-stone-500 font-medium mr-1 hidden sm:inline">Thời gian:</span>
                  {[1, 2, 3].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDays(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedDays === d
                          ? 'bg-[#1C382B] text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {d}N
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleWizardSubmit}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-[#1C382B] hover:bg-[#B85D3B] disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-98"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang tổng hợp...</span>
                    </>
                  ) : (
                    <>
                      <span>Tạo Lịch Trình</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              LIVE PROGRESS INDICATION (Khi AI đang xử lý)
              ======================================================== */}
          {isGenerating && (
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="font-bold text-[#1C382B] flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#B85D3B] border-t-transparent rounded-full animate-spin" />
                <span>Đang tìm kiếm và sắp xếp lộ trình tốt nhất cho bạn...</span>
              </div>
              <div className="space-y-1 text-[11px] text-stone-600 pl-6">
                <div className={`flex items-center gap-1.5 ${generationStep >= 1 ? 'text-[#1C382B] font-bold' : 'text-stone-400'}`}>
                  <span>{generationStep > 1 ? '✓' : '•'}</span>
                  <span>1. Lắng nghe sở thích & phong cách chuyến đi</span>
                </div>
                <div className={`flex items-center gap-1.5 ${generationStep >= 2 ? 'text-[#1C382B] font-bold' : 'text-stone-400'}`}>
                  <span>{generationStep > 2 ? '✓' : '•'}</span>
                  <span>2. Chọn lọc danh sách điểm đến đặc sắc tại Hà Nội</span>
                </div>
                <div className={`flex items-center gap-1.5 ${generationStep >= 3 ? 'text-[#1C382B] font-bold' : 'text-stone-400'}`}>
                  <span>{generationStep >= 3 ? '•' : '○'}</span>
                  <span>3. Sắp xếp cung đường ngắn nhất, tránh kẹt xe</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              RESULT BLUEPRINT PREVIEW (Sau khi tạo thành công)
              ======================================================== */}
          {result && !isGenerating && (
            <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-300 text-xs space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                      ✓
                    </span>
                    <h5 className="font-serif text-xs sm:text-sm font-bold text-emerald-950">
                      {result.title}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pl-6 text-[10px] text-emerald-800 font-semibold">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-200">
                      {result.days} Ngày
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-200">
                      {result.recommended_poi_ids.length} Điểm đến lý tưởng
                    </span>
                  </div>
                </div>

                <span className="text-[10px] text-emerald-700 font-medium">
                  {result.source === 'gemini' ? 'Trợ lý du lịch' : 'Gợi ý thông minh'}
                </span>
              </div>

              {/* Gợi ý trải nghiệm */}
              <p className="text-[11px] text-emerald-900 bg-white/70 p-2.5 rounded-lg border border-emerald-200/80 leading-relaxed">
                💡 <b>Gợi ý trải nghiệm:</b> {result.advice}
              </p>

              {/* Danh sách điểm được chọn */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Điểm đến trong hành trình:
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {getPoiNames(result.recommended_poi_ids).map((name, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white text-stone-700 border border-emerald-200 font-medium flex items-center gap-1"
                    >
                      <MapPin className="w-2.5 h-2.5 text-[#B85D3B]" />
                      <span>{name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Hành động */}
              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-2.5 py-1 text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Tùy chỉnh lại</span>
                </button>

                <button
                  type="button"
                  onClick={onViewItineraryTab}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1C382B] hover:bg-[#B85D3B] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <span>Xem Lộ Trình Chi Tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
