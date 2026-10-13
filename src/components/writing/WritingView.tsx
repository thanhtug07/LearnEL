import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_WRITING_PROMPTS } from '../../data/seedData';
import {
  PenTool,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Send,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

export const WritingView: React.FC = () => {
  const { addXP, addMinutesStudied, language, logSkillActivity } = useApp();

  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{
    estimatedScore: string;
    wordCount: number;
    summary: string;
    grammarFeedback: string[];
    vocabularyFeedback: string[];
    coherenceFeedback: string;
    improvedExcerpt?: string;
    isFallback?: boolean;
  } | null>(null);

  const currentPrompt = INITIAL_WRITING_PROMPTS[activePromptIndex] || INITIAL_WRITING_PROMPTS[0];

  const [essayText, setEssayText] = useState<string>(() => {
    try {
      return localStorage.getItem(`lingopeak_writing_draft_${INITIAL_WRITING_PROMPTS[0]?.id}`) || '';
    } catch {}
    return '';
  });

  // Restore draft when active prompt changes
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(`lingopeak_writing_draft_${currentPrompt.id}`);
      setEssayText(saved || '');
    } catch {}
  }, [currentPrompt.id]);

  // Autosave draft on text edit with debounce (400ms) to prevent keystroke lag
  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (essayText) {
          localStorage.setItem(`lingopeak_writing_draft_${currentPrompt.id}`, essayText);
        } else {
          localStorage.removeItem(`lingopeak_writing_draft_${currentPrompt.id}`);
        }
      } catch {}
    }, 400);

    return () => clearTimeout(timer);
  }, [essayText, currentPrompt.id]);

  // Flush pending draft immediately on page exit or unmount
  React.useEffect(() => {
    const flushDraft = () => {
      try {
        if (essayText) {
          localStorage.setItem(`lingopeak_writing_draft_${currentPrompt.id}`, essayText);
        }
      } catch {}
    };
    window.addEventListener('beforeunload', flushDraft);
    return () => {
      window.removeEventListener('beforeunload', flushDraft);
      flushDraft();
    };
  }, [essayText, currentPrompt.id]);

  const currentWordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const targetWords = currentPrompt.category === 'IELTS_TASK_2' ? 250 : 150;

  const handleSubmitWriting = async () => {
    if (!essayText.trim()) return;
    setIsLoadingFeedback(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/ai/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: essayText,
          prompt: currentPrompt.promptEn,
          taskType: currentPrompt.category,
          targetBand: '7.0'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate writing');
      }

      const data = await response.json();
      setFeedback(data);
      addXP(60);
      addMinutesStudied(15);
      logSkillActivity('writing', currentPrompt.title, 15, 60);
    } catch (err) {
      console.error(err);
      // Client-side fallback if network or server fails
      setFeedback({
        estimatedScore: currentWordCount >= targetWords ? '6.5 (Ước tính offline)' : '5.5 (Ước tính offline)',
        wordCount: currentWordCount,
        summary: 'Bài viết có ý tưởng phát triển tốt. Cần lưu ý bổ sung từ vựng chuyên sâu và câu phức ghép.',
        grammarFeedback: [
          'Kiểm tra lại cấu trúc câu ghép với liên từ phụ thuộc (although, whereas, in order that).',
          'Chú ý dùng dạng bị động để tăng tính khách quan cho bài viết học thuật.'
        ],
        vocabularyFeedback: [
          'Thay thế các từ quen thuộc như "important" bằng "paramount" hoặc "crucial".',
          'Sử dụng các cụm collocation học thuật: "exert a profound influence", "bear resemblance".'
        ],
        coherenceFeedback: 'Mạch lạc ổn định. Hãy đảm bảo mỗi đoạn văn có câu chủ đề và câu kết nối logic.',
        improvedExcerpt: essayText.slice(0, 100) + '...',
        isFallback: true
      });
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {language === 'vi' ? 'Không Gian Luyện Viết (Writing Workspace)' : 'Writing Workspace & Evaluation'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {language === 'vi'
            ? 'Luyện viết IELTS Task 1 & 2, thư tín thương mại TOEIC với trợ lý AI phân tích ngữ pháp và từ vựng.'
            : 'Structured essay prompts, real-time word counting, sample band answers, and AI-assisted feedback.'}
        </p>
      </div>

      {/* Prompt Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {INITIAL_WRITING_PROMPTS.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePromptIndex(idx);
              setEssayText('');
              setFeedback(null);
              setShowSampleAnswer(false);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              activePromptIndex === idx
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        {/* Prompt Information Box */}
        <div className="p-5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded-md uppercase">
              {currentPrompt.category.replace('_', ' ')} • {currentPrompt.bandOrLevel}
            </span>
            <button
              onClick={() => setShowSampleAnswer(!showSampleAnswer)}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
            >
              {showSampleAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showSampleAnswer ? 'Ẩn bài mẫu Band 8+' : 'Xem bài mẫu Band 8+'}</span>
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {currentPrompt.promptEn}
          </h2>
          <div className="text-xs text-slate-600 italic">{currentPrompt.promptVi}</div>

          {/* Tips in Vietnamese */}
          <div className="pt-2 border-t border-blue-200/60 space-y-1">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
              GỢI Ý CHIẾN THUẬT:
            </span>
            <ul className="text-xs text-slate-700 space-y-1">
              {currentPrompt.tipsVi.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sample Answer Box */}
        {showSampleAnswer && (
          <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 animate-fadeIn text-xs leading-relaxed">
            <div className="font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>BÀI VIẾT MẪU ĐẠT CHUẨN CAO (SAMPLE ESSAY)</span>
            </div>
            <p className="whitespace-pre-line text-slate-800 font-serif leading-relaxed">
              {currentPrompt.sampleAnswerEn}
            </p>
          </div>
        )}

        {/* Essay Textarea Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Bài viết của bạn (Your Submission):</span>
            <span className={currentWordCount >= targetWords ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
              Số từ: {currentWordCount} / tối thiểu {targetWords} từ
            </span>
          </div>

          <textarea
            rows={12}
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            placeholder="Write your response in English here... Focus on clear paragraph transitions, formal academic vocabulary, and precise grammar structures."
            className="w-full p-4 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 font-sans leading-relaxed focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 custom-scroll"
          />
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setEssayText('')}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Xóa bài viết
          </button>

          <button
            disabled={!essayText.trim() || isLoadingFeedback}
            onClick={handleSubmitWriting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            {isLoadingFeedback ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang chấm bài...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Chấm điểm & Nhận xét</span>
              </>
            )}
          </button>
        </div>

        {/* Structured AI Feedback Section */}
        {feedback && (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    KẾT QUẢ ĐÁNH GIÁ CHI TIẾT
                  </span>
                  {feedback.isFallback ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Đánh Giá Mẫu / Dự Phòng
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Gemini Live (gemini-3.8-flash)
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  Điểm ước tính: {feedback.estimatedScore}
                </h3>
                <p className="text-xs text-slate-500">
                  *Điểm số mang tính tham khảo nhằm hỗ trợ rèn luyện, không thay thế chứng chỉ chính thức.
                </p>
              </div>
              <div className="px-3.5 py-1.5 bg-blue-100 text-blue-800 rounded-xl font-bold text-xs self-start sm:self-auto">
                {feedback.wordCount} từ
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">Tổng quan bài viết:</span>
              <p>{feedback.summary}</p>
            </div>

            {/* Grammar and Lexical points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Grammar */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px] text-blue-700">
                  ĐIỂM NGỮ PHÁP (GRAMMAR RANGE & ACCURACY)
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  {feedback.grammarFeedback.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vocabulary */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px] text-emerald-700">
                  TỪ VỰNG NÂNG CẤP (LEXICAL RESOURCE)
                </span>
                <ul className="space-y-1.5 text-slate-700">
                  {feedback.vocabularyFeedback.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Coherence & Task response */}
            {feedback.coherenceFeedback && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px] text-amber-700 mb-1">
                  TÍNH MẠCH LẠC & LIÊN KẾT (COHERENCE & COHESION)
                </span>
                <p className="text-slate-700">{feedback.coherenceFeedback}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
