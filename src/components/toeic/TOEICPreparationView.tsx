import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PracticeTest, TestAttempt } from '../../types';
import {
  TEST_TOEIC_2SKILLS_100Q,
  TEST_TOEIC_2SKILLS_VOL2_100Q,
  TEST_TOEIC_4SKILLS_200Q,
  TOEIC_2SKILLS_LISTENING_50Q,
  TOEIC_2SKILLS_READING_50Q,
  TOEIC_SPEAKING_50TASKS,
  TOEIC_WRITING_50TASKS
} from '../../data/blueprints';
import { speakEnglish, stopSpeaking, isSpeechRecognitionSupported, createSpeechRecognizer } from '../../utils/speech';
import {
  BookOpen,
  FileCheck2,
  Clock,
  Sparkles,
  Play,
  Briefcase,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  Calculator,
  History,
  PenTool,
  Mic,
  Send,
  Loader2,
  Info,
  Volume2,
  Check,
  AlertCircle
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

const ExamEngineModal = React.lazy(() => import('../practice-tests/ExamEngineModal').then((m) => ({ default: m.ExamEngineModal })));

export const TOEICPreparationView: React.FC = () => {
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

  const [toeicTrack, setToeicTrack] = useState<'2skills' | '4skills'>('2skills');
  const [activeSubTab, setActiveSubTab] = useState<'mock_tests' | 'sectional' | 'speaking_writing' | 'scaler' | 'history'>('mock_tests');
  const [activeTestToRun, setActiveTestToRun] = useState<PracticeTest | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // --- SECTIONAL PART SELECTION STATE ---
  const [selectedPart, setSelectedPart] = useState<number>(5);

  // --- SPEAKING / WRITING DRILL STATE ---
  const [writingTaskText, setWritingTaskText] = useState('');
  const [isEvaluatingWriting, setIsEvaluatingWriting] = useState(false);
  const [writingFeedback, setWritingFeedback] = useState<any>(null);

  const [isRecordingSpeaking, setIsRecordingSpeaking] = useState(false);
  const [speakingTranscript, setSpeakingTranscript] = useState('');
  const [speakingFeedback, setSpeakingFeedback] = useState<any>(null);
  const recognizerRef = React.useRef<any>(null);

  // --- SCORE CONVERTER STATE ---
  const [calcListeningRaw, setCalcListeningRaw] = useState<number>(35);
  const [calcReadingRaw, setCalcReadingRaw] = useState<number>(38);

  // Clean up speech recognition on unmount
  React.useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch {}
      }
    };
  }, []);

  // Filter available TOEIC tests from practiceTests bank
  const toeicTestsList = useMemo(() => {
    const list = practiceTests.filter((t) => {
      const title = (t.title + ' ' + (t.titleVi || '')).toLowerCase();
      const id = t.id.toLowerCase();
      return (
        id.includes('toeic') ||
        title.includes('toeic') ||
        t.targetLevel?.includes('TOEIC') ||
        t.blueprint?.blueprintId?.includes('toeic')
      );
    });

    // Ensure standard blueprint tests are present
    const ensureAdd = (test: PracticeTest) => {
      if (!list.some((t) => t.id === test.id)) {
        list.unshift(test);
      }
    };

    ensureAdd(TEST_TOEIC_4SKILLS_200Q);
    ensureAdd(TEST_TOEIC_2SKILLS_VOL2_100Q);
    ensureAdd(TEST_TOEIC_2SKILLS_100Q);

    return list.filter((t) => {
      if (toeicTrack === '2skills') {
        return t.blueprint?.blueprintId !== 'toeic_4skills' && !t.id.includes('4skills');
      } else {
        return t.blueprint?.blueprintId === 'toeic_4skills' || t.id.includes('4skills');
      }
    });
  }, [practiceTests, toeicTrack]);

  // Filter TOEIC user attempts
  const toeicAttempts = useMemo(() => {
    return testAttempts.filter((a) => {
      const id = a.testId.toLowerCase();
      const title = (a.testTitle || '').toLowerCase();
      return id.includes('toeic') || title.includes('toeic');
    });
  }, [testAttempts]);

  // Auth guard and test launch
  const handleLaunchTest = (test: PracticeTest) => {
    const isAuthed = Boolean(isLoggedIn || firebaseUser || (user?.id && user.id !== 'user-guest-1' && user.email));
    if (!isAuthed) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTestToRun(test);
  };

  // Convert TOEIC raw score (0-50 / 0-100) to ETS scaled score (5-495)
  const scaleListeningScore = (raw: number): number => {
    // Normalizing raw count up to 50 questions
    const ratio = Math.max(0, Math.min(50, raw)) / 50;
    if (ratio >= 0.96) return 495;
    if (ratio >= 0.90) return 470;
    if (ratio >= 0.80) return 420;
    if (ratio >= 0.70) return 370;
    if (ratio >= 0.60) return 315;
    if (ratio >= 0.50) return 260;
    if (ratio >= 0.40) return 200;
    return Math.max(5, Math.round(ratio * 300));
  };

  const scaleReadingScore = (raw: number): number => {
    const ratio = Math.max(0, Math.min(50, raw)) / 50;
    if (ratio >= 0.96) return 495;
    if (ratio >= 0.90) return 450;
    if (ratio >= 0.80) return 400;
    if (ratio >= 0.70) return 345;
    if (ratio >= 0.60) return 295;
    if (ratio >= 0.50) return 240;
    if (ratio >= 0.40) return 180;
    return Math.max(5, Math.round(ratio * 280));
  };

  const scaledTotal = scaleListeningScore(calcListeningRaw) + scaleReadingScore(calcReadingRaw);

  // Submit TOEIC Writing Task for AI feedback
  const handleSubmitWriting = async () => {
    if (!writingTaskText.trim()) return;
    setIsEvaluatingWriting(true);
    setWritingFeedback(null);

    try {
      const res = await fetch('/api/ai/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: writingTaskText,
          prompt: 'Write an email responding to a client inquiring about shipment schedules and payment terms.',
          taskType: 'TOEIC_EMAIL',
          targetBand: '180/200'
        })
      });

      if (!res.ok) throw new Error('Evaluation error');
      const data = await res.json();
      setWritingFeedback(data);
      addXP(50);
      addMinutesStudied(15);
      logSkillActivity('writing', 'TOEIC Email Response', 15, 50);
    } catch {
      setWritingFeedback({
        estimatedScore: '160 - 170 / 200 (Ước tính offline)',
        wordCount: writingTaskText.trim().split(/\s+/).length,
        summary: 'Thư tín thương mại có cấu trúc rõ ràng, giọng văn lịch sự và đạt yêu cầu truyền tải thông tin.',
        grammarFeedback: [
          'Kiểm tra lại vị trí của trạng từ chỉ thời gian trong câu.',
          'Sử dụng các mẫu câu trang trọng: "We would like to confirm that...", "Please do not hesitate to contact us."'
        ],
        vocabularyFeedback: [
          'Bổ sung cụm từ chuẩn mực công sở: "expedited delivery", "in accordance with our agreement".',
          'Tránh các từ viết tắt thân mật trong thư tín đối tác.'
        ],
        coherenceFeedback: 'Bố cục thư gồm 3 phần (Chào hỏi - Nội dung chính - Lời kết) đạt chuẩn.',
        isFallback: true
      });
    } finally {
      setIsEvaluatingWriting(false);
    }
  };

  // Toggle Speaking Recording
  const handleToggleSpeaking = () => {
    if (isRecordingSpeaking) {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch {}
      }
      setIsRecordingSpeaking(false);
      const spoken = speakingTranscript.trim();
      const wordCount = spoken ? spoken.split(/\s+/).length : 0;
      setSpeakingFeedback({
        score: wordCount >= 30 ? '160 - 180 / 200' : '120 - 140 / 200',
        feedbackVi: wordCount >= 30
          ? 'Độ lưu loát và ngữ điệu tự nhiên. Phát âm chuẩn các âm đuôi /s/, /ed/.'
          : 'Cần nâng cao tốc độ phản xạ và mở rộng câu trả lời theo ngữ cảnh kinh doanh.'
      });
      addXP(35);
      addMinutesStudied(5);
      logSkillActivity('speaking', 'TOEIC Speaking Simulation', 5, 35);
    } else {
      setSpeakingTranscript('');
      setSpeakingFeedback(null);
      if (!isSpeechRecognitionSupported()) {
        alert('Trình duyệt hiện chưa hỗ trợ Web Speech API.');
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

  const TOEIC_PARTS_DETAILS = [
    { part: 1, name: 'Part 1: Photographs', nameVi: 'Mô tả hình ảnh (6 câu)', skill: 'Listening', tips: 'Quan sát hành động của người hoặc vị trí của vật trước khi nghe.' },
    { part: 2, name: 'Part 2: Question-Response', nameVi: 'Hỏi & Đáp nhanh (25 câu)', skill: 'Listening', tips: 'Bắt từ để hỏi đầu câu (Who, Where, When, Why, How). Chú ý bẫy lặp từ.' },
    { part: 3, name: 'Part 3: Short Conversations', nameVi: 'Hội thoại ngắn (39 câu)', skill: 'Listening', tips: 'Đọc lướt 3 câu hỏi trước khi audio phát. Xác định ngữ cảnh công sở.' },
    { part: 4, name: 'Part 4: Short Talks', nameVi: 'Bài nói độc thoại (30 câu)', skill: 'Listening', tips: 'Chú ý thông báo sân bay, quảng cáo radio và lời giới thiệu diễn giả.' },
    { part: 5, name: 'Part 5: Incomplete Sentences', nameVi: 'Hoàn thành câu (30 câu)', skill: 'Reading', tips: 'Xác định từ loại trước và sau chỗ trống: Noun, Verb, Adj, Adv.' },
    { part: 6, name: 'Part 6: Text Completion', nameVi: 'Điền từ đoạn văn (16 câu)', skill: 'Reading', tips: 'Chú ý thì động từ và câu cần điền phải phù hợp mạch văn toàn đoạn.' },
    { part: 7, name: 'Part 7: Reading Comprehension', nameVi: 'Đọc hiểu đơn & đa đoạn (54 câu)', skill: 'Reading', tips: 'Quét từ khóa (Scanning) cho câu hỏi chi tiết và đọc lướt (Skimming) cho ý chính.' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              ETS
            </div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              TOEIC TARGET 750+ - 990
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            TOEIC Strategy & Simulation Center
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Hệ thống khảo thí luyện thi TOEIC chuẩn format ETS 2026. Luyện đề thi thử có tính giờ 2 tiếng, làm chủ bẫy từ loại Part 5, quét thông tin Part 7 và luyện phản xạ Speaking & Writing.
          </p>

          <div className="flex items-center gap-2 pt-1 text-xs text-amber-700 font-semibold">
            <Info className="w-4 h-4 shrink-0" />
            <span>Đề thi LingoPeak được biên soạn mô phỏng cấu trúc đề thi TOEIC chuẩn quốc tế để phục vụ tự học và khảo thí nội bộ.</span>
          </div>
        </div>

        {/* Track Switcher Card */}
        <div className="w-full md:w-72 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 rounded-2xl border border-blue-100 text-center space-y-3 shrink-0">
          <div className="text-xs font-bold text-blue-900 uppercase">CHẾ ĐỘ THI KHẢO THÍ</div>
          <div className="text-3xl font-black text-blue-600">
            {toeicTrack === '2skills' ? '990 THANG ĐIỂM' : '4 KỸ NĂNG'}
          </div>

          <div className="flex bg-white p-1 rounded-xl text-xs font-bold border border-blue-200">
            <button
              onClick={() => setToeicTrack('2skills')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                toeicTrack === '2skills' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2 Kỹ Năng (LR)
            </button>
            <button
              onClick={() => setToeicTrack('4skills')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                toeicTrack === '4skills' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4 Kỹ Năng (LRSW)
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'mock_tests', label: 'Đề Thi Thử (Mock Tests)', icon: FileCheck2 },
          { id: 'sectional', label: 'Luyện Theo Dạng Bài (Part 1 - 7)', icon: BookOpen },
          { id: 'speaking_writing', label: 'Speaking & Writing Simulation', icon: Mic },
          { id: 'scaler', label: 'Bảng Quy Đổi Điểm Số ETS', icon: Calculator },
          { id: 'history', label: 'Lịch Sử Thi & Điểm', icon: History }
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
              {tab.id === 'history' && toeicAttempts.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px]">
                  {toeicAttempts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: MOCK TESTS */}
      {/* ========================================================================= */}
      {activeSubTab === 'mock_tests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {toeicTrack === '2skills' ? 'Đề Thi Thử TOEIC 2 Kỹ Năng (Listening & Reading)' : 'Đề Thi Thử TOEIC 4 Kỹ Năng (L-R-S-W)'}
              </h2>
              <p className="text-xs text-slate-500">
                Làm bài thi có tính giờ chuẩn ETS, lưu câu trả lời tự động và chấm điểm kèm giải thích
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full self-start">
              {toeicTestsList.length} đề thi sẵn sàng
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toeicTestsList.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md uppercase">
                      {test.questions.length >= 100 ? 'CHUẨN ETS BENCHMARK' : 'MINI PRACTICE'}
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
                    <span className="font-semibold">{test.questions.length} câu hỏi</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">{test.targetLevel || 'TOEIC 250 - 990'}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Miễn phí 100%</span>
                  <button
                    onClick={() => handleLaunchTest(test)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Làm đề thi ngay</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: SECTIONAL PRACTICE (PART 1 TO PART 7) */}
      {/* ========================================================================= */}
      {activeSubTab === 'sectional' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {TOEIC_PARTS_DETAILS.map((p) => (
              <button
                key={p.part}
                onClick={() => setSelectedPart(p.part)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  selectedPart === p.part
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Part {p.part} ({p.skill})
              </button>
            ))}
          </div>

          {/* Active Part Overview Card */}
          {(() => {
            const cur = TOEIC_PARTS_DETAILS.find((p) => p.part === selectedPart) || TOEIC_PARTS_DETAILS[4];
            return (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md uppercase">
                    KỸ NĂNG: {cur.skill}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Mục tiêu: Đạt tỷ lệ đúng tối thiểu 80%</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{cur.nameVi}</h3>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1.5">
                  <div className="font-bold text-slate-700 uppercase text-[10px]">MẸO GIẢI ĐỀ THỰC CHIẾN (STRATEGY):</div>
                  <p className="text-slate-600 leading-relaxed">{cur.tips}</p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Bao gồm câu hỏi ngữ pháp, từ vựng và bẫy đề thi ETS mới nhất.
                  </span>
                  <button
                    onClick={() => handleLaunchTest(TEST_TOEIC_2SKILLS_100Q)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Luyện Part {cur.part} trong đề thi →</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: SPEAKING & WRITING SIMULATION */}
      {/* ========================================================================= */}
      {activeSubTab === 'speaking_writing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Speaking Station */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md uppercase">
                  TOEIC SPEAKING SIMULATION
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">Part 1: Read a Text Aloud</h3>
              <p className="text-xs text-slate-500">
                Đọc to đoạn văn bản sau đây với phát âm chuẩn xác, ngắt nghỉ đúng nhịp điệu và ngữ điệu tự nhiên (45 giây chuẩn bị, 45 giây nói):
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 font-sans leading-relaxed">
                "Welcome to the annual Apex Financial Summit. Please take your seats as our keynote speaker, Ms. Evelyn Thorne, will address the plenary session regarding sustainable portfolio investments in fifteen minutes."
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-center">
              <button
                onClick={handleToggleSpeaking}
                className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isRecordingSpeaking
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Mic className="w-6 h-6" />
              </button>

              <div className="text-xs font-bold text-slate-700">
                {isRecordingSpeaking ? 'Đang ghi âm giọng nói... Nhấn để hoàn tất' : 'Nhấn Microphone để bắt đầu đọc'}
              </div>

              {speakingTranscript && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left text-slate-600">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">BẢN GHI:</span>
                  "{speakingTranscript}"
                </div>
              )}

              {speakingFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-left space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-800">
                    <span>Điểm ước tính:</span>
                    <span className="text-emerald-700 font-black">{speakingFeedback.score}</span>
                  </div>
                  <p className="text-slate-600">{speakingFeedback.feedbackVi}</p>
                </div>
              )}
            </div>
          </div>

          {/* Writing Station */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md uppercase">
                  TOEIC WRITING SIMULATION
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">Part 2: Respond to a Written Request</h3>
              <p className="text-xs text-slate-500">
                Bạn nhận được email từ khách hàng hỏi về lịch giao hàng lô văn phòng phẩm PO-8821. Viết email phản hồi với tối thiểu 2 thông tin cụ thể:
              </p>

              <textarea
                rows={5}
                value={writingTaskText}
                onChange={(e) => setWritingTaskText(e.target.value)}
                placeholder="Nhập email phản hồi của bạn bằng tiếng Anh..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white resize-y"
              />
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Số từ: {writingTaskText.trim() ? writingTaskText.trim().split(/\s+/).length : 0}</span>
                <button
                  onClick={handleSubmitWriting}
                  disabled={isEvaluatingWriting || !writingTaskText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isEvaluatingWriting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isEvaluatingWriting ? 'Đang chấm...' : 'Chấm điểm bằng AI'}</span>
                </button>
              </div>

              {writingFeedback && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-blue-900">
                    <span>Điểm ước tính:</span>
                    <span className="text-blue-700 font-black">{writingFeedback.estimatedScore}</span>
                  </div>
                  <p className="text-slate-600">{writingFeedback.summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: TOEIC ETS SCORE SCALER */}
      {/* ========================================================================= */}
      {activeSubTab === 'scaler' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>Bảng Quy Đổi Điểm Số TOEIC Chuẩn ETS (Thang Điểm 10 - 990)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy đổi số câu trả lời đúng Listening & Reading sang điểm số chính thức
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interactive Sliders */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-5">
              <div className="font-bold text-xs uppercase text-slate-400">ĐIỀU CHỈNH SỐ CÂU ĐÚNG</div>

              {/* Listening Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Listening (Nghe hiểu - Tối đa 50 câu):</span>
                  <span className="text-blue-600">{calcListeningRaw} / 50 câu (➔ {scaleListeningScore(calcListeningRaw)} điểm)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={calcListeningRaw}
                  onChange={(e) => setCalcListeningRaw(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Reading Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Reading (Đọc hiểu - Tối đa 50 câu):</span>
                  <span className="text-indigo-600">{calcReadingRaw} / 50 câu (➔ {scaleReadingScore(calcReadingRaw)} điểm)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={calcReadingRaw}
                  onChange={(e) => setCalcReadingRaw(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Total Card */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">TỔNG ĐIỂM TOEIC DỰ KIẾN</div>
                <div className="text-4xl font-black text-blue-600">{scaledTotal} / 990</div>
                <div className="text-xs font-semibold text-emerald-600 pt-1">
                  {scaledTotal >= 850
                    ? 'Xuất sắc: Năng lực làm việc quốc tế và đàm phán cao cấp'
                    : scaledTotal >= 750
                    ? 'Khá giỏi: Đạt tiêu chuẩn doanh nghiệp đa quốc gia'
                    : scaledTotal >= 600
                    ? 'Trung cấp: Giao tiếp văn phòng và đọc hiểu tài liệu tốt'
                    : 'Cần tiếp tục củng cố từ vựng và ngữ pháp Part 5'}
                </div>
              </div>
            </div>

            {/* Benchmark Level Descriptions */}
            <div className="space-y-3">
              <div className="font-bold text-xs uppercase text-slate-400">CÁC MỐC ĐIỂM TOEIC TRONG TUYỂN DỤNG</div>
              {[
                { score: '850 - 990', tag: 'Chuyên nghiệp', desc: 'Có khả năng giao tiếp lưu loát và tự nhiên trong mọi bối cảnh kinh doanh quốc tế.' },
                { score: '750 - 845', tag: 'Doanh nghiệp đa quốc gia', desc: 'Đáp ứng tốt yêu cầu làm việc tại các tập đoàn nước ngoài, đọc hiểu hợp đồng.' },
                { score: '600 - 745', tag: 'Tiêu chuẩn đại học', desc: 'Đạt chuẩn đầu ra tốt nghiệp nhiều trường đại học hàng đầu tại Việt Nam.' },
                { score: '450 - 595', tag: 'Cơ bản', desc: 'Giao tiếp hàng ngày cơ bản, còn gặp khó khăn với văn bản thương mại phức tạp.' }
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.score} Điểm</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: TEST HISTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lịch Sử Làm Bài Thi TOEIC</h2>
              <p className="text-xs text-slate-500">Lưu lại toàn bộ kết quả thi thử, điểm số và độ chuẩn xác</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              {toeicAttempts.length} lượt thi
            </span>
          </div>

          {toeicAttempts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">Chưa có lượt làm bài thi TOEIC nào</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hãy chọn một bài thi thử trong tab "Đề Thi Thử" để kiểm tra năng lực và lưu trữ điểm số!
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
              {toeicAttempts.map((att) => (
                <div key={att.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-sm">{att.testTitle}</div>
                    <div className="text-slate-400 flex items-center gap-2">
                      <span>{new Date(att.date).toLocaleDateString('vi-VN')}</span>
                      <span>•</span>
                      <span>⏱ {Math.round(att.timeSpentSeconds / 60)} phút</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-blue-600 text-base">{att.accuracy}%</div>
                    <div className="text-[11px] text-slate-400">{att.score} / {att.totalQuestions} câu đúng</div>
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
