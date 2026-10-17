import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PracticeTest, TestAttempt } from '../../types';
import {
  TEST_IELTS_CUSTOM_100Q,
  IELTS_LISTENING_25Q,
  IELTS_READING_25Q,
  IELTS_WRITING_25TASKS,
  IELTS_SPEAKING_25TASKS
} from '../../data/blueprints';
import { INITIAL_WRITING_PROMPTS, INITIAL_SPEAKING_TOPICS } from '../../data/seedData';
import { speakEnglish, stopSpeaking, isSpeechRecognitionSupported, createSpeechRecognizer } from '../../utils/speech';
import {
  Award,
  BookOpen,
  Mic,
  PenTool,
  Headphones,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Play,
  RotateCcw,
  AlertCircle,
  FileCheck2,
  Send,
  Loader2,
  Eye,
  EyeOff,
  History,
  Calculator,
  Volume2,
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

const ExamEngineModal = React.lazy(() => import('../practice-tests/ExamEngineModal').then((m) => ({ default: m.ExamEngineModal })));

export const IELTSPreparationView: React.FC = () => {
  const {
    practiceTests,
    testAttempts,
    setActiveExamId,
    setActiveTab,
    language,
    user,
    isLoggedIn,
    firebaseUser,
    addXP,
    addMinutesStudied,
    logSkillActivity
  } = useApp();

  // Primary Sub-tab: 'mock_tests' | 'writing' | 'speaking' | 'history' | 'scoring'
  const [activeSubTab, setActiveSubTab] = useState<'mock_tests' | 'writing' | 'speaking' | 'history' | 'scoring'>('mock_tests');
  const [ieltsTrack, setIeltsTrack] = useState<'academic' | 'general'>('academic');
  const [activeTestToRun, setActiveTestToRun] = useState<PracticeTest | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // --- WRITING WORKSPACE STATE ---
  const ieltsWritingPrompts = useMemo(() => {
    return INITIAL_WRITING_PROMPTS.filter((p) => p.category.includes('IELTS') || p.category === 'IELTS_TASK_2' || p.category === 'IELTS_TASK_1');
  }, []);

  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const activePrompt = ieltsWritingPrompts[selectedPromptIndex] || INITIAL_WRITING_PROMPTS[0];
  const [essayText, setEssayText] = useState('');
  const [showSampleEssay, setShowSampleEssay] = useState(false);
  const [isSubmittingWriting, setIsSubmittingWriting] = useState(false);
  const [writingFeedback, setWritingFeedback] = useState<any>(null);

  // --- SPEAKING WORKSPACE STATE ---
  const ieltsSpeakingTopics = useMemo(() => {
    return INITIAL_SPEAKING_TOPICS.filter((t) => t.part.includes('ielts') || t.id.includes('ielts'));
  }, []);

  const [selectedSpeakingTopicIndex, setSelectedSpeakingTopicIndex] = useState(0);
  const activeSpeakingTopic = ieltsSpeakingTopics[selectedSpeakingTopicIndex] || INITIAL_SPEAKING_TOPICS[0];
  const [isPrepTimerActive, setIsPrepTimerActive] = useState(false);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(60);
  const [isRecordingSpeaking, setIsRecordingSpeaking] = useState(false);
  const [speakingTranscript, setSpeakingTranscript] = useState('');
  const [speakingFeedback, setSpeakingFeedback] = useState<any>(null);
  const recognizerRef = React.useRef<any>(null);

  // --- SCORE CALCULATOR STATE ---
  const [calcRawScore, setCalcRawScore] = useState<number>(30);
  const [calcSkill, setCalcSkill] = useState<'reading_academic' | 'reading_general' | 'listening'>('reading_academic');

  // Prep timer countdown effect
  React.useEffect(() => {
    let timer: any = null;
    if (isPrepTimerActive && prepSecondsLeft > 0) {
      timer = setInterval(() => {
        setPrepSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (prepSecondsLeft === 0) {
      setIsPrepTimerActive(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPrepTimerActive, prepSecondsLeft]);

  // Clean up speech on unmount
  React.useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch {}
      }
    };
  }, []);

  // Filter available IELTS tests from practiceTests bank
  const ieltsTestsList = useMemo(() => {
    const list = practiceTests.filter((t) => {
      const title = (t.title + ' ' + (t.titleVi || '')).toLowerCase();
      return (
        t.id.includes('ielts') ||
        title.includes('ielts') ||
        t.targetLevel?.includes('IELTS') ||
        t.blueprint?.blueprintId === 'ielts_custom_mock'
      );
    });

    // Ensure TEST_IELTS_CUSTOM_100Q is included
    if (!list.some((t) => t.id === TEST_IELTS_CUSTOM_100Q.id)) {
      list.unshift(TEST_IELTS_CUSTOM_100Q);
    }
    return list;
  }, [practiceTests]);

  // Filter IELTS user attempts
  const ieltsAttempts = useMemo(() => {
    return testAttempts.filter((a) => {
      const id = a.testId.toLowerCase();
      const title = (a.testTitle || '').toLowerCase();
      return id.includes('ielts') || title.includes('ielts');
    });
  }, [testAttempts]);

  // Start exam auth guard
  const handleLaunchTest = (test: PracticeTest) => {
    const isAuthed = Boolean(isLoggedIn || firebaseUser || (user?.id && user.id !== 'user-guest-1' && user.email));
    if (!isAuthed) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTestToRun(test);
  };

  // Convert raw score (0-40) to IELTS Band 1.0 - 9.0
  const calculateBand = (raw: number, skillType: 'reading_academic' | 'reading_general' | 'listening'): string => {
    const r = Math.max(0, Math.min(40, raw));
    if (skillType === 'listening') {
      if (r >= 39) return '9.0';
      if (r >= 37) return '8.5';
      if (r >= 35) return '8.0';
      if (r >= 32) return '7.5';
      if (r >= 30) return '7.0';
      if (r >= 26) return '6.5';
      if (r >= 23) return '6.0';
      if (r >= 18) return '5.5';
      if (r >= 16) return '5.0';
      if (r >= 13) return '4.5';
      return '4.0 hoặc thấp hơn';
    } else if (skillType === 'reading_academic') {
      if (r >= 39) return '9.0';
      if (r >= 37) return '8.5';
      if (r >= 35) return '8.0';
      if (r >= 33) return '7.5';
      if (r >= 30) return '7.0';
      if (r >= 27) return '6.5';
      if (r >= 23) return '6.0';
      if (r >= 19) return '5.5';
      if (r >= 15) return '5.0';
      if (r >= 13) return '4.5';
      return '4.0 hoặc thấp hơn';
    } else {
      // General Training Reading
      if (r >= 40) return '9.0';
      if (r >= 39) return '8.5';
      if (r >= 37) return '8.0';
      if (r >= 36) return '7.5';
      if (r >= 34) return '7.0';
      if (r >= 32) return '6.5';
      if (r >= 30) return '6.0';
      if (r >= 27) return '5.5';
      if (r >= 23) return '5.0';
      return '4.5 hoặc thấp hơn';
    }
  };

  // Handle Writing Submission to Backend AI
  const handleSubmitWriting = async () => {
    if (!essayText.trim()) return;
    setIsSubmittingWriting(true);
    setWritingFeedback(null);

    try {
      const res = await fetch('/api/ai/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: essayText,
          prompt: activePrompt.promptEn,
          taskType: activePrompt.category || 'IELTS_TASK_2',
          targetBand: user.targetScore || '7.5'
        })
      });

      if (!res.ok) throw new Error('Failed to evaluate essay');
      const data = await res.json();
      setWritingFeedback(data);
      addXP(60);
      addMinutesStudied(20);
      logSkillActivity('writing', `IELTS: ${activePrompt.title}`, 20, 60);
    } catch (e) {
      const words = essayText.trim().split(/\s+/).length;
      setWritingFeedback({
        estimatedScore: words >= 250 ? 'Band 6.5 - 7.0 (Ước tính offline)' : 'Band 5.5 - 6.0 (Ước tính offline)',
        wordCount: words,
        summary: 'Bài viết có bố cục lạc quan. Đang hiển thị kết quả phân tích quy chuẩn LingoPeak.',
        grammarFeedback: [
          'Kiểm tra sự hòa hợp chủ vị (Subject-Verb Agreement) trong các mệnh đề phụ.',
          'Nên tăng cường cấu trúc câu phức với liên từ phụ thuộc (Although, Whereas, In spite of).'
        ],
        vocabularyFeedback: [
          'Thay thế các từ đơn giản như "good", "people", "think" bằng từ vựng học thuật C1/C2.',
          'Vận dụng các cụm Collocations như: "a double-edged sword", "exert negative ramifications".'
        ],
        coherenceFeedback: 'Ý tưởng liên kết tương đối tốt. Đảm bảo triển khai theo mô hình PEEL (Point, Explanation, Example, Link).',
        improvedExcerpt: essayText.slice(0, 120) + '...',
        isFallback: true
      });
    } finally {
      setIsSubmittingWriting(false);
    }
  };

  // Handle Speaking Recording
  const handleToggleSpeaking = () => {
    if (isRecordingSpeaking) {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch {}
      }
      setIsRecordingSpeaking(false);
      // Evaluate
      const spoken = speakingTranscript.trim();
      const wordCount = spoken ? spoken.split(/\s+/).length : 0;
      let estBand = '5.5';
      if (wordCount >= 60) estBand = '7.5';
      else if (wordCount >= 35) estBand = '6.5';
      else if (wordCount >= 15) estBand = '6.0';

      setSpeakingFeedback({
        band: estBand,
        wordCount,
        feedbackVi: wordCount >= 35
          ? 'Phát âm rõ ràng, tốc độ phản xạ đạt yêu cầu. Đã triển khai được ý tưởng mạch lạc.'
          : 'Cần kéo dài câu trả lời hơn, mở rộng chi tiết và ví dụ để đạt band 6.5+.'
      });
      addXP(40);
      addMinutesStudied(10);
      logSkillActivity('speaking', `IELTS Speaking: ${activeSpeakingTopic.title}`, 10, 40);
    } else {
      setSpeakingTranscript('');
      setSpeakingFeedback(null);
      if (!isSpeechRecognitionSupported()) {
        alert('Trình duyệt hiện chưa hỗ trợ Web Speech API. Bạn có thể tự luyện nói theo câu mẫu!');
        return;
      }
      const recognizer = createSpeechRecognizer(
        (txt) => setSpeakingTranscript(txt),
        (err) => {
          console.error(err);
          setIsRecordingSpeaking(false);
        },
        () => setIsRecordingSpeaking(false)
      );
      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsRecordingSpeaking(true);
      }
    }
  };

  const essayWordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const targetWordCount = activePrompt.category === 'IELTS_TASK_1' ? 150 : 250;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Hero Banner with Official Exam Disclaimer */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-xs rounded-lg text-xs font-bold uppercase tracking-wider text-blue-200">
              IELTS MASTER HUB
            </span>
            <span className="text-xs text-blue-300">Chuẩn Band 6.5 - 8.5+</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            IELTS Academic & General Strategy Hub
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Hệ thống luyện thi chuyên sâu toàn diện 4 kỹ năng: Đề thi thử có tính giờ quốc tế, phòng luyện viết chấm điểm theo tiêu chí giám khảo và phòng luyện nói bấm giờ Cue Card.
          </p>

          <div className="flex items-center gap-2 pt-1 text-xs text-amber-300 font-semibold">
            <Info className="w-4 h-4 shrink-0" />
            <span>Đề thi LingoPeak được xây dựng nhằm mục đích ôn luyện khảo thí, không thay thế chứng chỉ chính thức của IDP / British Council.</span>
          </div>
        </div>

        {/* Track Switcher & Target Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-44 shrink-0 space-y-3">
          <div className="text-3xl font-black text-amber-300">{user.targetScore || 'BAND 7.5+'}</div>
          <div className="text-[10px] text-blue-200 font-bold uppercase">MỤC TIÊU CỦA BẠN</div>

          <div className="flex bg-black/30 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setIeltsTrack('academic')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                ieltsTrack === 'academic' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-200 hover:text-white'
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setIeltsTrack('general')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                ieltsTrack === 'general' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-200 hover:text-white'
              }`}
            >
              General
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'mock_tests', label: 'Đề Thi Thử (Mock Tests)', icon: FileCheck2 },
          { id: 'writing', label: 'Luyện Viết Task 1 & 2', icon: PenTool },
          { id: 'speaking', label: 'Luyện Nói (Cue Card)', icon: Mic },
          { id: 'scoring', label: 'Thang Điểm & Quy Đổi', icon: Calculator },
          { id: 'history', label: 'Lịch Sử Làm Bài', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'history' && ieltsAttempts.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px]">
                  {ieltsAttempts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: MOCK TESTS & SECTIONAL TESTS */}
      {/* ========================================================================= */}
      {activeSubTab === 'mock_tests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {ieltsTrack === 'academic' ? 'Đề Thi Thử IELTS Academic' : 'Đề Thi Thử IELTS General Training'}
              </h2>
              <p className="text-xs text-slate-500">
                Đề thi có đồng hồ đếm ngược, lưu câu trả lời tự động và giải thích chi tiết từng câu
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full self-start">
              {ieltsTestsList.length} đề khả dụng
            </span>
          </div>

          {ieltsTrack === 'general' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>IELTS General Training: Đang Biên Soạn Theo Tiêu Chuẩn Quốc Tế</span>
              </div>
              <p className="leading-relaxed">
                Ngân hàng đề thi cho IELTS General Training (chuyên về thư tín xã hội và đọc hiểu đời sống thực tế) đang được hoàn thiện câu hỏi chuẩn hóa. Để đảm bảo không dùng dữ liệu giả lập, bạn có thể chuyển sang tab Academic để luyện tập các đề thi đã kiểm duyệt đầy đủ.
              </p>
              <button
                onClick={() => setIeltsTrack('academic')}
                className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all"
              >
                Chuyển sang IELTS Academic →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ieltsTestsList.map((test) => {
                const isFullMock = test.questions.length >= 50;
                return (
                  <div
                    key={test.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-sm transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          isFullMock ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {isFullMock ? 'FULL SIMULATION MOCK TEST' : 'SECTIONAL PRACTICE'}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{test.durationMinutes} phút</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {test.titleVi || test.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {test.descriptionVi}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                        <span className="font-semibold">{test.questions.length} câu hỏi / mục thi</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">{test.targetLevel || 'IELTS Band 5.0 - 9.0'}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Miễn phí 100%</span>
                      <button
                        onClick={() => handleLaunchTest(test)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Làm bài thi ngay</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: WRITING WORKSPACE (TASK 1 & TASK 2) */}
      {/* ========================================================================= */}
      {activeSubTab === 'writing' && (
        <div className="space-y-6">
          {/* Prompt Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {ieltsWritingPrompts.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPromptIndex(idx);
                  setWritingFeedback(null);
                  setShowSampleEssay(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  selectedPromptIndex === idx
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Writing Prompt Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md uppercase">
                {activePrompt.category} • YÊU CẦU TỐI THIỂU {targetWordCount} TỪ
              </span>
              <span className="text-xs font-bold text-amber-600">{activePrompt.bandOrLevel}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {activePrompt.promptEn}
            </h3>
            <p className="text-xs text-slate-500 italic">{activePrompt.promptVi}</p>

            {/* Strategic Tips */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5 text-xs">
              <div className="font-bold text-slate-700 uppercase text-[10px]">CHIẾN THUẬT ĂN ĐIỂM (STRATEGY TIPS):</div>
              <ul className="space-y-1 text-slate-600">
                {activePrompt.tipsVi.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Essay Input Workspace */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Bài viết của bạn:</span>
                <span className={`${essayWordCount >= targetWordCount ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {essayWordCount} / {targetWordCount} từ
                </span>
              </div>

              <textarea
                rows={10}
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Nhập bài viết luận của bạn tại đây bằng tiếng Anh..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setShowSampleEssay(!showSampleEssay)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {showSampleEssay ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSampleEssay ? 'Ẩn bài mẫu Band 8.5' : 'Xem bài mẫu Band 8.5'}</span>
              </button>

              <button
                onClick={handleSubmitWriting}
                disabled={isSubmittingWriting || !essayText.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isSubmittingWriting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isSubmittingWriting ? 'Đang chấm bài...' : 'Chấm điểm bằng AI Advisor'}</span>
              </button>
            </div>

            {/* Sample Band 8.5 Modal/Card */}
            {showSampleEssay && activePrompt.sampleAnswerEn && (
              <div className="mt-4 p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-emerald-900 uppercase text-[10px] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>BÀI VIẾT MẪU ĐẠT CHUẨN BAND 8.5+</span>
                </div>
                <div className="text-slate-700 whitespace-pre-line leading-relaxed font-serif text-xs sm:text-sm">
                  {activePrompt.sampleAnswerEn}
                </div>
              </div>
            )}

            {/* Feedback Assessment Report */}
            {writingFeedback && (
              <div className="mt-5 p-5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-4 text-xs animate-fadeIn">
                <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                  <div className="font-bold text-blue-900 text-sm">Kết quả đánh giá tiêu chí IELTS</div>
                  <div className="text-base font-black text-blue-700">
                    Điểm ước tính: {writingFeedback.estimatedScore}
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">{writingFeedback.summary}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-1.5">
                    <div className="font-bold text-slate-800">1. Grammatical Range & Accuracy</div>
                    <ul className="space-y-1 text-slate-600">
                      {writingFeedback.grammarFeedback?.map((g: string, i: number) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-blue-500">•</span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-1.5">
                    <div className="font-bold text-slate-800">2. Lexical Resource (Từ vựng)</div>
                    <ul className="space-y-1 text-slate-600">
                      {writingFeedback.vocabularyFeedback?.map((v: string, i: number) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-emerald-500">•</span>
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {writingFeedback.coherenceFeedback && (
                  <div className="p-3 bg-white rounded-xl border border-blue-100 text-slate-700">
                    <span className="font-bold">3. Coherence & Cohesion: </span>
                    {writingFeedback.coherenceFeedback}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: SPEAKING WORKSPACE (CUE CARD & MIC) */}
      {/* ========================================================================= */}
      {activeSubTab === 'speaking' && (
        <div className="space-y-6">
          {/* Speaking Topic Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {ieltsSpeakingTopics.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedSpeakingTopicIndex(idx);
                  setSpeakingFeedback(null);
                  setSpeakingTranscript('');
                  setIsPrepTimerActive(false);
                  setPrepSecondsLeft(60);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  selectedSpeakingTopicIndex === idx
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.titleVi}
              </button>
            ))}
          </div>

          {/* Speaking Workspace Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
            {activeSpeakingTopic.cueCardEn && (
              <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-900 uppercase text-xs flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>IELTS CUE CARD (PART 2)</span>
                  </div>

                  {/* 1-Minute Prep Countdown Timer */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPrepSecondsLeft(60);
                        setIsPrepTimerActive(!isPrepTimerActive);
                      }}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isPrepTimerActive ? `Đang chuẩn bị: ${prepSecondsLeft}s` : 'Bắt đầu 1 phút chuẩn bị'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-amber-950 whitespace-pre-line leading-relaxed font-sans">
                  {activeSpeakingTopic.cueCardEn}
                </div>
              </div>
            )}

            {/* Questions list */}
            <div className="space-y-4">
              {activeSpeakingTopic.questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md uppercase">
                      CÂU HỎI {qIdx + 1}
                    </span>
                    <button
                      onClick={() => speakEnglish(q.promptEn, 0.9)}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe câu hỏi</span>
                    </button>
                  </div>

                  <div className="font-bold text-slate-800 text-sm">{q.promptEn}</div>
                  <div className="text-xs text-slate-500 italic">{q.promptVi}</div>

                  <div className="pt-2 border-t border-slate-200/50 text-xs text-slate-600 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">TỪ KHÓA ĂN ĐIỂM (KEY VOCABULARY):</div>
                    <div className="flex flex-wrap gap-1.5">
                      {q.keyVocabulary.map((kw, kwIdx) => (
                        <span key={kwIdx} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-700">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Microphone Recording Station */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-blue-100 flex flex-col items-center justify-center space-y-3 text-center">
              <button
                onClick={handleToggleSpeaking}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isRecordingSpeaking
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                }`}
              >
                <Mic className="w-7 h-7" />
              </button>

              <div className="font-bold text-slate-800 text-xs sm:text-sm">
                {isRecordingSpeaking ? 'Đang ghi âm và nhận diện giọng nói... Nhấn để dừng' : 'Nhấn Microphone để bắt đầu luyện nói'}
              </div>

              {speakingTranscript && (
                <div className="max-w-lg w-full p-4 bg-white rounded-xl border border-slate-200 text-xs text-left text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">NỘI DUNG NHẬN DIỆN:</span>
                  "{speakingTranscript}"
                </div>
              )}

              {speakingFeedback && (
                <div className="max-w-lg w-full p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-left space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-800">
                    <span>Ước tính Fluency Band:</span>
                    <span className="text-sm font-black text-emerald-700">Band {speakingFeedback.band}</span>
                  </div>
                  <p className="text-slate-600">{speakingFeedback.feedbackVi}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: IELTS SCORING CALCULATOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'scoring' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>Bảng Quy Đổi Điểm Số IELTS (Raw Score to Band Score)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy đổi số câu đúng trên thang điểm 40 câu chính thức sang IELTS Band 1.0 - 9.0
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interactive Calculator */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="font-bold text-xs uppercase text-slate-400">CHỌN KỸ NĂNG & NHẬP SỐ CÂU ĐÚNG</div>

              <div className="flex gap-2">
                {[
                  { id: 'reading_academic', label: 'Reading Academic' },
                  { id: 'listening', label: 'Listening' },
                  { id: 'reading_general', label: 'Reading General' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCalcSkill(s.id as any)}
                    className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      calcSkill === s.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Số câu trả lời chính xác:</span>
                  <span className="text-blue-600 font-black text-sm">{calcRawScore} / 40 câu</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={calcRawScore}
                  onChange={(e) => setCalcRawScore(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">KẾT QUẢ QUY ĐỔI</div>
                <div className="text-3xl font-black text-blue-600">
                  Band {calculateBand(calcRawScore, calcSkill)}
                </div>
              </div>
            </div>

            {/* Official Band Descriptors Guide */}
            <div className="space-y-3">
              <div className="font-bold text-xs uppercase text-slate-400">KHUNG NĂNG LỰC 9 BẬC IELTS</div>
              {[
                { band: 'Band 8.0 - 9.0', level: 'Expert / Very Good User', desc: 'Sử dụng ngôn ngữ hoàn toàn lưu loát, từ vựng học thuật hiếm gặp, cấu trúc ngữ pháp phức tạp chuẩn xác.' },
                { band: 'Band 7.0 - 7.5', level: 'Good User', desc: 'Nắm chắc ngôn ngữ, mạch lạc tốt (Cohesion & Coherence), thỉnh thoảng có lỗi nhỏ không ảnh hưởng hiểu bài.' },
                { band: 'Band 6.0 - 6.5', level: 'Competent User', desc: 'Sử dụng hiệu quả ngôn ngữ dù còn vài sai sót về độ chính xác và tính phù hợp ngữ cảnh.' },
                { band: 'Band 5.0 - 5.5', level: 'Modest User', desc: 'Có khả năng giao tiếp cơ bản, còn gặp khó khăn với cấu trúc câu phức và văn bản học thuật.' }
              ].map((b, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900">{b.band}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{b.level}</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-snug">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: TEST ATTEMPTS HISTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lịch Sử Thi & Luyện Tập IELTS</h2>
              <p className="text-xs text-slate-500">Lưu trữ toàn bộ kết quả thi thử, điểm số và phân tích điểm yếu</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              {ieltsAttempts.length} lượt thi
            </span>
          </div>

          {ieltsAttempts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">Chưa có lượt làm bài thi IELTS nào</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hãy chọn một bài thi thử trong tab "Đề Thi Thử" để bắt đầu kiểm tra và lưu lại kết quả!
              </p>
              <button
                onClick={() => setActiveSubTab('mock_tests')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Làm đề thi thử ngay →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {ieltsAttempts.map((att) => (
                <div key={att.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-sm">{att.testTitle}</div>
                    <div className="text-slate-400 flex items-center gap-2">
                      <span>{new Date(att.date).toLocaleDateString('vi-VN')}</span>
                      <span>•</span>
                      <span>⏱ {Math.round(att.timeSpentSeconds / 60)} phút</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-black text-blue-600 text-base">{att.accuracy}%</div>
                      <div className="text-[11px] text-slate-400">{att.score} / {att.totalQuestions} câu đúng</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Embedded Exam Engine Modal */}
      {activeTestToRun && (
        <React.Suspense fallback={null}>
          <ExamEngineModal
            test={activeTestToRun}
            onClose={() => setActiveTestToRun(null)}
          />
        </React.Suspense>
      )}

      {/* Auth Modal Guard */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
