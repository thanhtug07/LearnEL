import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AIMessage } from '../../types';
import { speakEnglish } from '../../utils/speech';
import {
  Bot,
  Send,
  Sparkles,
  Volume2,
  Trash2,
  RotateCcw,
  Loader2,
  Bookmark,
  CheckCircle2,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

export const AITutorView: React.FC = () => {
  const { user, addCustomVocabulary, language } = useApp();

  const [tutorMode, setTutorMode] = useState<string>('conversation');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init-msg',
      role: 'model',
      content: `Hello ${user.name}! I am your AI English Tutor on LingoPeak. How can I assist your English journey today? We can chat freely, analyze grammar, upgrade your vocabulary, or practice for your ${user.targetExam} exam!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [providerInfo, setProviderInfo] = useState<string>('gemini-3.8-flash');
  const [isFallbackNotice, setIsFallbackNotice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/ai/status', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.configured) {
          setProviderInfo(data.model || 'gemini-3.8-flash');
          setIsFallbackNotice(false);
        } else {
          setProviderInfo('offline-rule-based');
          setIsFallbackNotice(true);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setIsFallbackNotice(true);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  const tutorModes = [
    { id: 'conversation', label: 'Conversation Partner', labelVi: 'Đối Thoại Tự Nhiên', desc: 'Trò chuyện tiếng Anh, sửa lỗi phản xạ tức thì' },
    { id: 'grammar', label: 'Grammar Teacher', labelVi: 'Giáo Viên Ngữ Pháp', desc: 'Giải thích cấu trúc câu, phân tích lỗi sai' },
    { id: 'vocabulary', label: 'Vocabulary Coach', labelVi: 'Huấn Luyện Từ Vựng', desc: 'Cung cấp collocation, IPA và từ đồng nghĩa' },
    { id: 'writing', label: 'Writing Assistant', labelVi: 'Cố Vấn Luyện Viết', desc: 'Nâng cấp câu văn, gợi ý từ học thuật C1' },
    { id: 'speaking', label: 'Speaking Coach', labelVi: 'Luyện Phản Xạ Nói', desc: 'Gợi ý ý tưởng và phát âm tự nhiên' },
    { id: 'ielts', label: 'IELTS Coach', labelVi: 'Chuyên Gia IELTS', desc: 'Hướng dẫn tiêu chí Band 7.5+ TR/CC/LR/GRA' },
    { id: 'toeic', label: 'TOEIC Coach', labelVi: 'Chuyên Gia TOEIC', desc: 'Mẹo bẫy ETS và từ vựng công sở 850+' },
    { id: 'advisor', label: 'Study Plan Advisor', labelVi: 'Tư Vấn Lộ Trình', desc: 'Lên lịch học tối ưu theo thời gian rảnh' }
  ];

  const quickPrompts: Record<string, string[]> = {
    conversation: [
      'What are some effective daily habits to become fluent in English?',
      'Let\'s talk about how artificial intelligence is changing education.',
      'Could you ask me a question about my hobbies and correct my answer?'
    ],
    grammar: [
      'Giải thích sự khác nhau giữa "Since" và "For" trong thì Hiện Tại Hoàn Thành.',
      'Cấu trúc Đảo Ngữ (Inversion) dùng khi nào để ghi điểm IELTS?',
      'Tại sao câu "If I was you, I will buy it" lại chưa chuẩn?'
    ],
    vocabulary: [
      'Gợi ý 5 từ vựng học thuật C1 thay thế cho từ "important".',
      'Collocations thông dụng nhất với từ "decision"?',
      'Phân biệt giữa "economic" và "economical".'
    ],
    ielts: [
      'Làm thế nào để phát triển ý cho bài IELTS Writing Task 2 theo mô hình PEEL?',
      'Cho tôi một câu mở bài (Introduction) mẫu cho chủ đề môi trường.',
      'Các cụm từ liên kết giúp đạt 7.5+ tiêu chí Coherence and Cohesion?'
    ],
    toeic: [
      'Những đuôi từ tính từ (adjective suffixes) hay bẫy nhất trong TOEIC Part 5?',
      'Cách phân biệt "by Friday" và "until Friday"?',
      'Chiến thuật làm Part 7 đoạn kép không bị thiếu giờ?'
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          mode: tutorMode,
          // Send only the most recent turns: the server rejects payloads over 25
          // messages, and Gemini only needs recent context anyway.
          messages: newMessages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
          userLevel: user.level,
          targetExam: user.targetExam
        })
      });

      if (!response.ok) {
        throw new Error('Server response error');
      }

      const data = await response.json();
      setIsFallbackNotice(Boolean(data.isFallback));
      setProviderInfo(data.provider || 'gemini-3.8-flash');

      const botMsg: AIMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Component unmounted or request superseded
      }
      console.error('AI Tutor error:', err);
      const fallbackMsg: AIMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `I'm here to support your English learning! For your question "${text.slice(0, 50)}", always remember to organize your ideas clearly and verify subject-verb agreement. *(Offline fallback mode)*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setIsFallbackNotice(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'model',
        content: `Conversation reset. I am ready in ${tutorModes.find((m) => m.id === tutorMode)?.label} mode. How can I help you right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              AI English Tutor
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
              GEMINI PRO TIER
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'vi'
              ? 'Gia sư tiếng Anh thông minh: 8 chế độ chuyên sâu, sửa lỗi cá nhân hóa và giải thích tiếng Việt rõ ràng.'
              : 'Interactive personal AI tutor tailored to your CEFR proficiency level.'}
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Làm mới hội thoại</span>
        </button>
      </div>

      {/* 8 Modes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {tutorModes.map((mode) => {
          const isSelected = tutorMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setTutorMode(mode.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 ring-1 ring-blue-500'
                  : 'bg-white border-slate-200/80 text-slate-700 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs truncate">{mode.label}</div>
              <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                {mode.labelVi}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs flex flex-col h-[560px] overflow-hidden">
        {/* Chat top status bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isFallbackNotice ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="font-bold text-slate-800">
              Đang trò chuyện với: {tutorModes.find((m) => m.id === tutorMode)?.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isFallbackNotice ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Demo Fallback
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Live Gemini 3.8 Flash
              </span>
            )}
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              ({providerInfo})
            </span>
          </div>
        </div>

        {/* Message stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scroll">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs whitespace-pre-line'
                  }`}
                >
                  <p>{msg.content}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 text-[10px] opacity-70">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => speakEnglish(msg.content)}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Nghe câu trả lời"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>AI Tutor đang suy nghĩ và chuẩn bị câu trả lời...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        {quickPrompts[tutorMode] && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              GỢI Ý:
            </span>
            {quickPrompts[tutorMode].map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 rounded-full text-[11px] truncate max-w-xs transition-colors shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Chat input box */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập câu hỏi tiếng Anh hoặc thắc mắc ngữ pháp của bạn..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
