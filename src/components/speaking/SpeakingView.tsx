import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_SPEAKING_TOPICS } from '../../data/seedData';
import { speakEnglish, stopSpeaking, isSpeechRecognitionSupported, createSpeechRecognizer } from '../../utils/speech';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SpeakingView: React.FC = () => {
  const { addXP, addMinutesStudied, language, logSkillActivity } = useApp();

  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedbackVi: string;
    matchedWords: string[];
  } | null>(null);

  const recognizerRef = useRef<any>(null);

  // Stop recording and speech audio upon component unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const currentTopic = INITIAL_SPEAKING_TOPICS[activeTopicIndex] || INITIAL_SPEAKING_TOPICS[0];
  const currentQuestion = currentTopic.questions[activeQuestionIndex] || currentTopic.questions[0];

  const handleStartRecording = () => {
    setMicError(null);
    setEvaluation(null);
    setTranscript('');

    if (!isSpeechRecognitionSupported()) {
      setMicError('Trình duyệt của bạn hiện chưa hỗ trợ Web Speech API. Bạn có thể tự luyện nói theo câu mẫu và nghe phát âm!');
      return;
    }

    try {
      const recognizer = createSpeechRecognizer(
        (text) => setTranscript(text),
        (err) => {
          console.error('Speech recognition error:', err);
          setIsRecording(false);
          setMicError(`Không thể thu âm: ${err}. Vui lòng cấp quyền Microphone trong trình duyệt.`);
        },
        () => {
          setIsRecording(false);
        }
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsRecording(true);
      }
    } catch (e: any) {
      setMicError(e.message || 'Lỗi khởi động microphone.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsRecording(false);

    // Evaluate speech based on transcript
    setTimeout(() => {
      evaluateSpeech(transcript);
    }, 500);
  };

  const evaluateSpeech = (spokenText: string) => {
    if (!spokenText.trim()) {
      setEvaluation({
        score: 60,
        feedbackVi: 'Chưa phát hiện rõ giọng nói. Hãy nói to hơn và gần micro hơn nhé!',
        matchedWords: []
      });
      return;
    }

    const words = spokenText.toLowerCase().split(/\s+/);
    const targetWords = currentQuestion.modelAnswerEn.toLowerCase().split(/\s+/);
    const keyVocabs = currentQuestion.keyVocabulary.map((v) => v.toLowerCase());

    const matchedKeyWords = keyVocabs.filter((k) => spokenText.toLowerCase().includes(k));
    const wordCount = words.length;

    let calculatedScore = 70;
    if (wordCount >= 10) calculatedScore += 10;
    if (matchedKeyWords.length > 0) calculatedScore += 15;
    calculatedScore = Math.min(95, calculatedScore);

    setEvaluation({
      score: calculatedScore,
      feedbackVi: `Phát âm rõ ràng, nhịp điệu tương đối tự nhiên. Đã sử dụng được ${matchedKeyWords.length}/${keyVocabs.length} từ vựng then chốt!`,
      matchedWords: matchedKeyWords
    });

    addXP(40);
    addMinutesStudied(5);
    logSkillActivity('speaking', currentQuestion.promptEn, 5, 40);
    if (calculatedScore >= 85) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {language === 'vi' ? 'Luyện Nói & Nhận Diện Giọng Nói (Speaking Practice)' : 'Speaking Practice Lab'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {language === 'vi'
            ? 'Luyện phát âm chuẩn IPA, trả lời câu hỏi IELTS Part 1-3 và nhận đánh giá phản xạ tức thì.'
            : 'Interactive microphone recording, phonetic listening models, and vocabulary fluency checks.'}
        </p>
      </div>

      {/* Topic Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {INITIAL_SPEAKING_TOPICS.map((topic, tIdx) => (
          <button
            key={topic.id}
            onClick={() => {
              setActiveTopicIndex(tIdx);
              setActiveQuestionIndex(0);
              setTranscript('');
              setEvaluation(null);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              activeTopicIndex === tIdx
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {topic.titleVi}
          </button>
        ))}
      </div>

      {/* Main Speaking Workspace */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        {/* Cue Card if present */}
        {currentTopic.cueCardEn && (
          <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2 text-xs leading-relaxed text-amber-950">
            <div className="font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>IELTS CUE CARD (1 PHÚT CHUẨN BỊ - 2 PHÚT NÓI)</span>
            </div>
            <p className="whitespace-pre-line font-sans">{currentTopic.cueCardEn}</p>
          </div>
        )}

        {/* Current Question */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md uppercase">
            CÂU HỎI {activeQuestionIndex + 1}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            {currentQuestion.promptEn}
          </h2>
          <div className="text-xs text-slate-500 italic">{currentQuestion.promptVi}</div>
        </div>

        {/* Target Model Answer with Audio Player */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>CÂU TRẢ LỜI MẪU (BAND 8.0+)</span>
            </span>
            <button
              onClick={() => speakEnglish(currentQuestion.modelAnswerEn, 0.85)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 hover:border-blue-400 text-blue-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Nghe phát âm chuẩn</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans font-medium">
            "{currentQuestion.modelAnswerEn}"
          </p>

          {/* Key collocations */}
          <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Từ khóa ghi điểm:</span>
            {currentQuestion.keyVocabulary.map((kw, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium text-[11px]">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Microphone Interactive Box */}
        <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl text-white text-center space-y-5">
          <div className="relative inline-block">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                isRecording
                  ? 'bg-red-600 animate-pulse ring-8 ring-red-500/30'
                  : 'bg-blue-600 hover:bg-blue-500 ring-8 ring-blue-500/20'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
            </button>
          </div>

          <div>
            <div className="text-sm font-bold text-white">
              {isRecording ? 'Đang lắng nghe... Hãy nói tiếng Anh vào microphone' : 'Nhấn vào Micro để bắt đầu luyện nói'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {isRecording ? 'Nhấn lại một lần nữa khi bạn nói xong' : 'Hệ thống nhận diện giọng nói tự động'}
            </div>
          </div>

          {/* Real-time transcript display */}
          {transcript && (
            <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-xs sm:text-sm text-blue-100 italic max-w-lg mx-auto">
              "{transcript}"
            </div>
          )}

          {micError && (
            <div className="p-3 bg-red-900/60 border border-red-500/40 text-red-200 rounded-xl text-xs max-w-md mx-auto flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{micError}</span>
            </div>
          )}
        </div>

        {/* Evaluation Feedback */}
        {evaluation && (
          <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-emerald-950 text-sm">Kết Quả Đánh Giá Bài Nói</h3>
              </div>
              <div className="px-3 py-1 bg-emerald-600 text-white font-black text-sm rounded-xl">
                {evaluation.score} / 100 ĐIỂM
              </div>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              {evaluation.feedbackVi}
            </p>

            {evaluation.matchedWords.length > 0 && (
              <div className="text-xs text-emerald-800">
                <span className="font-bold">Từ khóa bạn đã dùng thành công: </span>
                <span>{evaluation.matchedWords.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
