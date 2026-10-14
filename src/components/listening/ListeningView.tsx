import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { speakEnglish, stopSpeaking } from '../../utils/speech';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';

interface ListeningTrack {
  id: string;
  title: string;
  titleVi: string;
  level: string;
  topic: string;
  durationSeconds: number;
  scriptText: string;
  scriptVi: string;
  questions: {
    id: string;
    prompt: string;
    options: string[];
    correctAnswer: string;
    explanationVi: string;
  }[];
}

const LISTENING_TRACKS: ListeningTrack[] = [
  {
    id: 'track-1',
    title: 'Airport Check-in & Gate Change Announcement',
    titleVi: 'Thông báo thủ tục sân bay & Đổi cổng bay',
    level: 'A2-B1',
    topic: 'Travel & Transportation',
    durationSeconds: 45,
    scriptText: `Attention all passengers on flight VN-254 bound for Tokyo Narita. Due to technical maintenance at gate 14, boarding will now proceed through gate 18B. Passengers requiring special assistance and business class travelers may proceed to board immediately. Please have your boarding passes and passports ready. We apologize for the inconvenience and thank you for your cooperation.`,
    scriptVi: `Xin toàn thể hành khách trên chuyến bay VN-254 đi Tokyo Narita chú ý. Do bảo trì kỹ thuật tại cổng 14, việc lên máy bay sẽ chuyển sang cổng 18B. Hành khách cần hỗ trợ đặc biệt và khách vé thương gia có thể lên máy bay ngay bây giờ. Xin vui lòng chuẩn bị sẵn thẻ lên máy bay và hộ chiếu. Chúng tôi xin lỗi vì sự bất tiện này.`,
    questions: [
      {
        id: 'lq-1',
        prompt: 'Where is flight VN-254 now boarding?',
        options: ['Gate 14', 'Gate 18B', 'Gate Tokyo', 'Gate 254'],
        correctAnswer: 'Gate 18B',
        explanationVi: 'Thông báo nêu: "boarding will now proceed through gate 18B".'
      },
      {
        id: 'lq-2',
        prompt: 'Who is invited to board immediately?',
        options: [
          'All economy class passengers',
          'Only passengers traveling alone',
          'Passengers requiring special assistance and business class',
          'Airport ground staff'
        ],
        correctAnswer: 'Passengers requiring special assistance and business class',
        explanationVi: 'Thông báo: "Passengers requiring special assistance and business class travelers may proceed to board immediately".'
      }
    ]
  },
  {
    id: 'track-2',
    title: 'Corporate Strategy & Sustainable Investment',
    titleVi: 'Chiến lược doanh nghiệp & Đầu tư bền vững',
    level: 'B2-C1',
    topic: 'Business & ESG',
    durationSeconds: 60,
    scriptText: `Good morning everyone. As we review our fourth-quarter financial trajectory, our executive leadership has decided to allocate fifteen percent of our annual budget towards renewable infrastructure. While initial capital expenditure is substantial, this strategic realignment will mitigate carbon liabilities and generate lucrative long-term dividends for our stakeholders.`,
    scriptVi: `Chào buổi sáng quý vị. Khi xem xét lộ trình tài chính quý 4, ban lãnh đạo đã quyết định phân bổ 15% ngân sách hàng năm vào hạ tầng tái tạo. Dù chi phí ban đầu đáng kể, sự tái cấu trúc chiến lược này sẽ giảm nhẹ rủi ro về carbon và tạo lợi nhuận dài hạn cho cổ đông.`,
    questions: [
      {
        id: 'lq-3',
        prompt: 'What proportion of the annual budget is allocated to renewable infrastructure?',
        options: ['5%', '15%', '50%', '4%'],
        correctAnswer: '15%',
        explanationVi: 'Bài nói ghi rõ: "allocate fifteen percent (15%) of our annual budget".'
      }
    ]
  }
];

export const ListeningView: React.FC = () => {
  const { language, addXP, addMinutesStudied, logSkillActivity } = useApp();

  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.9);
  const [showTranscript, setShowTranscript] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [answersChecked, setAnswersChecked] = useState(false);

  const replayTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up audio playback and any pending timers when component unmounts
  React.useEffect(() => {
    return () => {
      stopSpeaking();
      if (replayTimerRef.current) {
        clearTimeout(replayTimerRef.current);
      }
    };
  }, []);

  const currentTrack = LISTENING_TRACKS[activeTrackIndex];

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await speakEnglish(currentTrack.scriptText, playbackSpeed);
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    stopSpeaking();
    setIsPlaying(false);
    if (replayTimerRef.current) clearTimeout(replayTimerRef.current);
    replayTimerRef.current = setTimeout(() => {
      handlePlayAudio();
    }, 200);
  };

  const handleSelectOption = (qId: string, opt: string) => {
    if (answersChecked) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: opt }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {language === 'vi' ? 'Phòng Luyện Nghe Tiếng Anh (Listening Lab)' : 'English Listening Lab'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {language === 'vi'
            ? 'Luyện nghe hiểu chuẩn ngữ điệu, điều chỉnh tốc độ và làm bài tập trắc nghiệm ngay sau khi nghe.'
            : 'Interactive audio player with speed controls, transcripts toggle, and comprehension quizzes.'}
        </p>
      </div>

      {/* Track Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {LISTENING_TRACKS.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => {
              stopSpeaking();
              setIsPlaying(false);
              setActiveTrackIndex(idx);
              setAnswersChecked(false);
              setUserAnswers({});
              setShowTranscript(false);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              activeTrackIndex === idx
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Bài {idx + 1}: {t.titleVi}
          </button>
        ))}
      </div>

      {/* Main Player Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                {currentTrack.level} • {currentTrack.topic}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentTrack.durationSeconds}s</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              {currentTrack.title}
            </h2>
            <div className="text-xs text-slate-500">{currentTrack.titleVi}</div>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[0.75, 0.9, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  playbackSpeed === speed ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Audio Visualizer & Play Bar */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayAudio}
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/30 cursor-pointer active:scale-95"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            <button
              onClick={handleReplay}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Nghe lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div>
              <div className="text-sm font-bold text-white">
                {isPlaying ? 'Đang phát âm thanh...' : 'Nhấn nút Play để nghe'}
              </div>
              <div className="text-xs text-blue-300">Tốc độ hiện tại: {playbackSpeed}x (US Voice)</div>
            </div>
          </div>

          {/* Audio waveforms visual */}
          <div className="flex items-center gap-1 h-8">
            {[16, 24, 32, 18, 28, 36, 20, 30, 24, 16, 28, 20].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full bg-blue-400 transition-all duration-300 ${
                  isPlaying ? 'animate-pulse' : 'opacity-40'
                }`}
                style={{ height: `${isPlaying ? (h * (i % 2 === 0 ? 1 : 0.7)) : 10}px` }}
              />
            ))}
          </div>
        </div>

        {/* Transcript Toggle Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            {showTranscript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showTranscript ? 'Ẩn lời thoại (Hide Transcript)' : 'Hiện lời thoại (Show Transcript)'}</span>
          </button>
          <span className="text-[11px] text-slate-400">
            *Lời khuyên: Hãy nghe ít nhất 2 lần trước khi mở lời thoại.
          </span>
        </div>

        {/* Transcript Box */}
        {showTranscript && (
          <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3 text-xs leading-relaxed animate-fadeIn">
            <div>
              <span className="font-bold text-blue-900 block mb-1">ENGLISH SCRIPT:</span>
              <p className="text-slate-800">{currentTrack.scriptText}</p>
            </div>
            <div className="pt-2 border-t border-blue-200/60">
              <span className="font-bold text-blue-900 block mb-1">BẢN DỊCH TIẾNG VIỆT:</span>
              <p className="text-slate-600">{currentTrack.scriptVi}</p>
            </div>
          </div>
        )}

        {/* Comprehension Questions */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Câu Hỏi Kiểm Tra Đọc Hiểu (Comprehension Questions)</span>
          </h3>

          <div className="space-y-4">
            {currentTrack.questions.map((q, qIndex) => {
              const selected = userAnswers[q.id];
              const isCorrect = selected === q.correctAnswer;

              return (
                <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                  <div className="font-bold text-slate-900 text-sm">
                    {qIndex + 1}. {q.prompt}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isOptionSelected = selected === opt;
                      let style = 'bg-white border-slate-200 text-slate-700 hover:border-blue-400';

                      if (answersChecked) {
                        if (opt === q.correctAnswer) {
                          style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                        } else if (isOptionSelected && !isCorrect) {
                          style = 'bg-red-50 border-red-400 text-red-900';
                        }
                      } else if (isOptionSelected) {
                        style = 'bg-blue-50 border-blue-600 text-blue-900 font-bold';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={answersChecked}
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {answersChecked && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700">
                      <span className="font-bold text-blue-600">Giải thích: </span>
                      <span>{q.explanationVi}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            {!answersChecked ? (
              <button
                disabled={Object.keys(userAnswers).length === 0}
                onClick={() => {
                  setAnswersChecked(true);
                  addXP(30);
                  addMinutesStudied(5);
                  logSkillActivity('listening', currentTrack.title, 5, 30);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Kiểm tra kết quả nghe
              </button>
            ) : (
              <button
                onClick={() => {
                  setAnswersChecked(false);
                  setUserAnswers({});
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Làm lại câu hỏi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
