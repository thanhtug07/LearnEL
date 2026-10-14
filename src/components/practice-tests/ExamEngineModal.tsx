import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PracticeTest, TestAttempt } from '../../types';
import { evaluateTestSubmission, formatTimer } from '../../utils/examEngine';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExamEngineModalProps {
  test: PracticeTest;
  onClose: () => void;
}

export const ExamEngineModal: React.FC<ExamEngineModalProps> = ({ test, onClose }) => {
  const { recordTestAttempt, language } = useApp();

  const progressStorageKey = `lingopeak_exam_progress_${test.id}`;
  const isSubmittingRef = React.useRef(false);

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(progressStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentIndex === 'number' && parsed.currentIndex >= 0) {
          return parsed.currentIndex;
        }
      }
    } catch {}
    return 0;
  });

  const [userAnswers, setUserAnswers] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(progressStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return (parsed && typeof parsed.userAnswers === 'object' && parsed.userAnswers !== null)
          ? parsed.userAnswers
          : {};
      }
    } catch {}
    return {};
  });

  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(progressStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.flaggedQuestions)) {
          return new Set(parsed.flaggedQuestions);
        }
      }
    } catch {}
    return new Set();
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(progressStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.secondsRemaining === 'number' && parsed.secondsRemaining > 0) {
          return parsed.secondsRemaining;
        }
      }
    } catch {}
    return (test?.durationMinutes || 15) * 60;
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [resultAttempt, setResultAttempt] = useState<TestAttempt | null>(null);
  const [reviewMistakesOnly, setReviewMistakesOnly] = useState(false);

  const secondsRemainingRef = React.useRef(secondsRemaining);
  secondsRemainingRef.current = secondsRemaining;

  // Persist exam progress safely without writing to disk on every single second
  const persistProgress = React.useCallback(
    (currentSecs?: number) => {
      if (isSubmitted) return;
      try {
        localStorage.setItem(
          progressStorageKey,
          JSON.stringify({
            userAnswers,
            flaggedQuestions: Array.from(flaggedQuestions),
            secondsRemaining: typeof currentSecs === 'number' ? currentSecs : secondsRemainingRef.current,
            currentIndex
          })
        );
      } catch {}
    },
    [userAnswers, flaggedQuestions, currentIndex, isSubmitted, progressStorageKey]
  );

  // Save immediately when user answers, flags or changes question
  useEffect(() => {
    if (isSubmitted) {
      localStorage.removeItem(progressStorageKey);
      return;
    }
    persistProgress();
  }, [userAnswers, flaggedQuestions, currentIndex, isSubmitted, progressStorageKey, persistProgress]);

  // Flush on unmount or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isSubmitted) persistProgress();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (!isSubmitted) persistProgress();
    };
  }, [isSubmitted, persistProgress]);

  // High-accuracy timer with drift compensation & periodic (every 10s) state persistence
  useEffect(() => {
    if (isSubmitted) return;
    const targetEnd = Date.now() + secondsRemainingRef.current * 1000;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((targetEnd - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      secondsRemainingRef.current = remaining;

      // Periodically persist timer every 10 seconds to safeguard progress without disk thrashing
      if (remaining > 0 && remaining % 10 === 0) {
        persistProgress(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, persistProgress]);

  // Handle timeout auto-submission safely
  useEffect(() => {
    if (!isSubmitted && secondsRemaining === 0 && !isSubmittingRef.current) {
      handleSubmitTest();
    }
  }, [secondsRemaining, isSubmitted]);

  const questionsList = test?.questions || [];
  const currentQuestion = questionsList[currentIndex] || questionsList[0] || null;

  const handleSelectOption = (qId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionIndex
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleSubmitTest = () => {
    // Strictly prevent duplicate submissions or concurrent race conditions
    if (isSubmitted || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setShowConfirmSubmit(false);
    setIsSubmitted(true);
    const attempt = evaluateTestSubmission(test, userAnswers, secondsRemaining, flaggedQuestions);

    setResultAttempt(attempt);
    recordTestAttempt(attempt);

    if (attempt.accuracy >= 80) {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleRetakeTest = () => {
    isSubmittingRef.current = false;
    localStorage.removeItem(progressStorageKey);
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setSecondsRemaining((test?.durationMinutes || 15) * 60);
    setIsSubmitted(false);
    setResultAttempt(null);
    setCurrentIndex(0);
    setReviewMistakesOnly(false);
  };

  // Filter questions if user clicks "Review mistakes only"
  const questionsToDisplay = reviewMistakesOnly
    ? test.questions.filter((q) => userAnswers[q.id] !== q.correctAnswerIndex)
    : test.questions;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[95vh] overflow-hidden">
        {/* Top Navbar */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md uppercase">
              {test.type.replace('_', ' ')}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{test.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            {!isSubmitted && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold ${
                  secondsRemaining < 120
                    ? 'bg-red-50 text-red-600 animate-pulse border border-red-200'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            )}

            {!isSubmitted ? (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {language === 'vi' ? 'Nộp bài' : 'Submit'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetakeTest}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Thi lại' : 'Retake'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {language === 'vi' ? 'Đóng phòng thi' : 'Close Exam'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Main Area */}
        {questionsList.length === 0 ? (
          <div className="flex-1 p-12 flex flex-col items-center justify-center text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                {language === 'vi' ? 'Đề thi hiện chưa có câu hỏi' : 'No Questions Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {language === 'vi'
                  ? 'Nội dung đề thi này đang được cập nhật. Vui lòng chọn bài thi khác.'
                  : 'This practice test has no active questions configured.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              {language === 'vi' ? 'Quay lại' : 'Close'}
            </button>
          </div>
        ) : !isSubmitted ? (
          /* ACTIVE TEST MODE */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Question Content & Passage */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Question Index & Flag status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {language === 'vi' ? 'Câu' : 'Question'} {currentIndex + 1} / {questionsList.length} • {currentQuestion?.section || 'General'}
                </span>

                <button
                  onClick={() => currentQuestion && toggleFlag(currentQuestion.id)}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    currentQuestion && flaggedQuestions.has(currentQuestion.id)
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${currentQuestion && flaggedQuestions.has(currentQuestion.id) ? 'fill-amber-500' : ''}`} />
                  <span>{currentQuestion && flaggedQuestions.has(currentQuestion.id) ? 'Đã đánh dấu cờ' : 'Đánh dấu xem lại'}</span>
                </button>
              </div>

              {/* Context Passage if provided */}
              {currentQuestion?.contextPassage && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed font-sans text-slate-800 whitespace-pre-line max-h-56 overflow-y-auto custom-scroll">
                  {currentQuestion.contextPassage}
                </div>
              )}

              {/* Question Prompt */}
              <div className="text-sm sm:text-base font-bold text-slate-900">
                {currentQuestion?.prompt}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[currentQuestion.id] === oIdx;
                  const letter = String.fromCharCode(65 + oIdx);

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(currentQuestion.id, oIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {letter}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Question Navigation Panel */}
            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-200 p-4 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  {language === 'vi' ? 'BẢNG CÂU HỎI' : 'QUESTION PALETTE'}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {questionsList.map((q, idx) => {
                    const isAnswered = userAnswers[q.id] !== undefined;
                    const isFlagged = flaggedQuestions.has(q.id);
                    const isCurrent = idx === currentIndex;

                    let bgClass = 'bg-white text-slate-600 border-slate-200';
                    if (isAnswered) bgClass = 'bg-blue-600 text-white border-blue-600 font-bold';
                    if (isCurrent) bgClass += ' ring-2 ring-blue-400 ring-offset-1';

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative h-9 rounded-lg border text-xs flex items-center justify-center transition-all cursor-pointer ${bgClass}`}
                      >
                        <span>{idx + 1}</span>
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-600 rounded"></span>
                    <span>Đã làm: {Object.keys(userAnswers).length} câu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-white border border-slate-300 rounded"></span>
                    <span>Chưa làm: {Math.max(0, questionsList.length - Object.keys(userAnswers).length)} câu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-500 rounded"></span>
                    <span>Đã gắn cờ: {flaggedQuestions.size} câu</span>
                  </div>
                </div>
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-2 pt-4">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-white disabled:opacity-40 cursor-pointer"
                >
                  ← Trước
                </button>
                <button
                  disabled={currentIndex >= questionsList.length - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(questionsList.length - 1, prev + 1))}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
                >
                  Sau →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* DETAILED RESULT REPORT */
          resultAttempt && (
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              {/* Score summary cards */}
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    BÁO CÁO KẾT QUẢ BÀI THI
                  </div>
                  <h3 className="text-2xl font-extrabold">{test.title}</h3>
                  <p className="text-xs text-blue-200/80">
                    Thời gian hoàn thành: {Math.round(resultAttempt.timeSpentSeconds / 60)} phút • Ngày thi: {resultAttempt.date}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/20 min-w-28">
                    <div className="text-3xl font-black text-amber-300">{resultAttempt.score} / {resultAttempt.totalQuestions}</div>
                    <div className="text-[10px] text-blue-200 font-bold uppercase mt-1">SỐ CÂU ĐÚNG</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/20 min-w-28">
                    <div className="text-3xl font-black text-emerald-400">{resultAttempt.accuracy}%</div>
                    <div className="text-[10px] text-blue-200 font-bold uppercase mt-1">ĐỘ CHÍNH XÁC</div>
                  </div>
                </div>
              </div>

              {/* Weakness Analysis */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>PHÂN TÍCH ĐIỂM YẾU CẦN KHẮC PHỤC</span>
                </h4>
                <ul className="space-y-1 text-xs text-amber-900">
                  {resultAttempt.weaknessAnalysisVi.map((w, idx) => (
                    <li key={idx}>• {w}</li>
                  ))}
                </ul>
              </div>

              {/* Toggle: Review Mistakes Only vs All Questions */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h4 className="text-sm font-bold text-slate-800">
                  {reviewMistakesOnly ? 'Danh Sách Câu Sai Cần Xem Lại' : 'Chi Tiết Tất Cả Câu Hỏi & Giải Thích'}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReviewMistakesOnly(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      !reviewMistakesOnly ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Tất cả ({test.questions.length})
                  </button>
                  <button
                    onClick={() => setReviewMistakesOnly(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      reviewMistakesOnly ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Chỉ xem câu sai ({test.questions.length - resultAttempt.score})
                  </button>
                </div>
              </div>

              {/* Question by question explanation review */}
              <div className="space-y-4">
                {questionsToDisplay.map((q) => {
                  const userAns = userAnswers[q.id];
                  const isCorrect = userAns === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border text-xs space-y-3 ${
                        isCorrect ? 'bg-white border-slate-200' : 'bg-red-50/30 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Câu {q.questionNumber}: {q.section}</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isCorrect ? 'ĐÚNG' : 'CHƯA ĐÚNG'}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 text-sm">{q.prompt}</div>

                      <div className="space-y-1.5">
                        {q.options.map((opt, oIdx) => {
                          const isOptionCorrect = oIdx === q.correctAnswerIndex;
                          const isOptionUser = oIdx === userAns;

                          let style = 'bg-white border-slate-200 text-slate-700';
                          if (isOptionCorrect) style = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                          else if (isOptionUser && !isOptionCorrect) style = 'bg-red-50 border-red-400 text-red-950 font-semibold';

                          return (
                            <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}>
                              <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                              {isOptionCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                              {isOptionUser && !isOptionCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-950">
                        <span className="font-bold">Giải thích: </span>
                        <span>{q.explanationVi}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* Modal Confirm Submit Dialog */}
        {showConfirmSubmit && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-blue-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">Xác Nhận Nộp Bài Thi?</h3>
              <p className="text-xs text-slate-500">
                Bạn đã hoàn thành {Object.keys(userAnswers).length} / {test.questions.length} câu hỏi.
                {test.questions.length - Object.keys(userAnswers).length > 0 && (
                  <span className="text-red-500 block mt-1 font-semibold">
                    (Vẫn còn {test.questions.length - Object.keys(userAnswers).length} câu chưa chọn đáp án)
                  </span>
                )}
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Làm tiếp
                </button>
                <button
                  onClick={handleSubmitTest}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Nộp bài ngay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
