import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Key, 
  Bot, 
  Compass, 
  MessageSquare, 
  Check, 
  RotateCcw,
  BookOpen,
  Feather
} from 'lucide-react';
import { 
  askStoryteller, 
  ChatMessage, 
  StorytellerContext, 
  getStoredApiKey, 
  setStoredApiKey 
} from '../../services/aiService';

interface StorytellerChatProps {
  context: StorytellerContext;
  onOpenPoiDetail?: (poiName: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  '👶 Đi Hỏa Lò cùng trẻ nhỏ cần lưu ý gì?',
  '☕ Quán cà phê yên tĩnh gần Văn Miếu?',
  '🍜 Quanh lộ trình này ăn gì ngon nhất?',
  '🌅 Hoàng hôn Hồ Tây ngắm lúc mấy giờ?'
];

export const StorytellerChat: React.FC<StorytellerChatProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Khởi tạo tin nhắn chào mừng và kiểm tra API Key
  useEffect(() => {
    const existingKey = getStoredApiKey();
    setHasCustomKey(!!existingKey);
    setApiKeyInput(existingKey);

    const initialWelcome: ChatMessage = {
      id: 'welcome-msg',
      sender: 'assistant',
      text: 'Chào bạn, tôi là Hà Nội Storyteller. Bạn đang chuẩn bị cho chuyến tản bộ Thủ đô? Hãy để tôi chia sẻ đôi nét phong vị văn hóa, những quán xá ẩn mình trong ngõ nhỏ hay lưu ý thiết thực cho từng điểm dừng trong lịch trình nhé.',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: DEFAULT_SUGGESTIONS
    };
    setMessages([initialWelcome]);
  }, []);

  // Cuộn tin nhắn xuống đáy khi có phản hồi mới
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Lưu API Key
  const handleSaveApiKey = () => {
    setStoredApiKey(apiKeyInput);
    setHasCustomKey(!!apiKeyInput.trim());
    setShowKeyConfig(false);
  };

  // Xóa lịch sử trò chuyện
  const handleClearHistory = () => {
    const resetMsg: ChatMessage = {
      id: `reset-${Date.now()}`,
      sender: 'assistant',
      text: 'Đã làm mới cuộc trò chuyện. Hãy hỏi tôi bất cứ điều gì về ẩm thực, lịch sử hay mẹo du lịch quanh các điểm đến của bạn nhé!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: DEFAULT_SUGGESTIONS
    };
    setMessages([resetMsg]);
  };

  // Gửi câu hỏi
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const answer = await askStoryteller(query, context);

      const aiMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Có chút gián đoạn kết nối, nhưng phong vị Hà Nội vẫn đang chờ bạn. Bạn có thể thử hỏi lại hoặc bấm vào các câu hỏi gợi ý bên dưới nhé.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON (Góc phải dưới) */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        className={`fixed bottom-6 right-6 z-40 p-3.5 rounded-full border shadow-2xl transition-all duration-300 flex items-center gap-2.5 cursor-pointer group ${
          isOpen
            ? 'bg-[#1C382B] text-[#F8F5EE] border-[#1C382B] scale-95'
            : 'bg-[#FDFCF7]/95 text-[#1C382B] border-stone-300/90 hover:border-[#B85D3B] hover:shadow-[#B85D3B]/20 hover:scale-105 backdrop-blur-md'
        }`}
        title="Mở Trợ lý Văn hóa Hà Nội Storyteller"
      >
        <div className="relative">
          <Feather className="w-5 h-5 text-[#B85D3B] group-hover:rotate-12 transition-transform duration-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-[#B85D3B] text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="hidden sm:inline font-serif text-xs font-bold text-[#1C382B] group-hover:text-[#B85D3B] transition-colors">
          Hà Nội Storyteller
        </span>
      </button>

      {/* 2. CHATBOX MODAL (WARM EDITORIAL DRAWER) */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[530px] rounded-3xl overflow-hidden flex flex-col bg-[#FDFCF7] border border-stone-300/80 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-250 select-text">
          
          {/* A. Header */}
          <div className="px-4 py-3.5 bg-[#FAF7F0] border-b border-stone-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1C382B] text-[#F8F5EE] flex items-center justify-center text-xs shadow-xs">
                <Feather className="w-4 h-4 text-[#B85D3B]" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-[#1C382B]">
                  Hà Nội Storyteller
                </h3>
                <div className="text-[10px] text-stone-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Am hiểu văn hóa &amp; ẩm thực Thủ đô</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                title={hasCustomKey ? 'API Key đang hoạt động' : 'Cấu hình Gemini API Key cá nhân'}
                className={`p-1.5 rounded-xl transition ${
                  hasCustomKey ? 'text-emerald-700 bg-emerald-50' : 'text-stone-400 hover:text-[#B85D3B]'
                }`}
              >
                <Key className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleClearHistory}
                title="Làm mới cuộc trò chuyện"
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng chatbox"
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* B. Bảng cấu hình API Key (nếu người dùng bấm vào icon chìa khóa) */}
          {showKeyConfig && (
            <div className="p-3 bg-stone-100/90 border-b border-stone-200 text-xs space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-stone-700 font-semibold text-[11px]">
                <span>Cấu hình Google Gemini API Key</span>
                <span className="text-[10px] text-stone-500">(Tùy chọn)</span>
              </div>
              <input
                type="password"
                placeholder="Dán AIzaSy... (Để trống để dùng AI Cục bộ)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#B85D3B]"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-500">
                  {hasCustomKey ? '✓ Đang dùng Gemini AI' : 'Đang dùng dữ liệu sẵn có'}
                </span>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-2.5 py-1 rounded-md bg-[#1C382B] text-white text-[11px] font-semibold hover:bg-[#B85D3B] transition"
                >
                  Lưu
                </button>
              </div>
            </div>
          )}

          {/* C. Dải Tóm Tắt Ngữ Cảnh Hành Trình */}
          <div className="px-3.5 py-1.5 bg-[#F2EDE2]/60 border-b border-stone-200/60 text-[10px] text-stone-600 flex items-center justify-between truncate">
            <span className="truncate flex items-center gap-1">
              <span>📍</span>
              <b>{context.pois?.length || 0} điểm đến</b>: {context.pois?.slice(0, 2).map(p => p.name).join(', ')}...
            </span>
            <span className="shrink-0 text-stone-500">
              {context.weather ? `${context.weather.temperature}°C` : 'Hà Nội'}
            </span>
          </div>

          {/* D. Danh Sách Tin Nhắn */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-sans">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1C382B] text-[#F8F5EE] rounded-tr-xs shadow-xs'
                      : 'bg-[#F2EDE2] text-[#1C382B] rounded-tl-xs border border-stone-200/80 shadow-2xs whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>

                <span className="text-[9px] text-stone-400 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Các câu hỏi gợi ý nhanh */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-2 space-y-1.5 w-full">
                    <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider block">
                      Gợi ý câu hỏi:
                    </span>
                    <div className="flex flex-col gap-1">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(q)}
                          className="text-left text-[11px] px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F0] border border-stone-200/90 text-stone-700 hover:text-[#B85D3B] hover:border-[#B85D3B]/50 transition cursor-pointer shadow-2xs truncate"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-stone-500 text-xs italic bg-[#F2EDE2]/80 px-3 py-2 rounded-2xl rounded-tl-xs border border-stone-200/80 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[#B85D3B] animate-spin" />
                <span>Đang soạn câu trả lời...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* E. Khung Nhập Liệu */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-[#FAF7F0] border-t border-stone-200/90 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Hỏi về góc phố, quán ngon, lưu ý..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-full focus:outline-none focus:border-[#B85D3B] text-stone-800 placeholder-stone-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 rounded-full bg-[#1C382B] hover:bg-[#B85D3B] disabled:opacity-40 text-white transition cursor-pointer shadow-xs"
              title="Gửi câu hỏi"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
