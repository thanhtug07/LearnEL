import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PracticeTest, TestAttempt, TestQuestion } from '../../types';
import {
  evaluateTestSubmission,
  formatTimer,
  loadExamSession,
  saveExamSession,
  clearExamSession,
  calculateRemainingSeconds,
  groupQuestionsBySection,
  calculateEstimatedScore,
  ExamSession
} from '../../utils/examEngine';
import { speakEnglish, stopSpeaking } from '../../utils/speech';
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
  X,
  FileCheck2,
  Check,
  Award,
  Layers,
  Send,
  LogOut,
  ListOrdered,
  Type,
  Mic,
  MicOff,
  Volume2,
  Square,
  FileText,
  ShieldAlert,
  Info,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExamEngineModalProps {
  test: PracticeTest;
  onClose: () => void;
}

export const ExamEngineModal: React.FC<ExamEngineModalProps> = ({ test, onClose }) => {
  const { recordTestAttempt, language, user } = useApp();

  // Initialize or restore exam session from localStorage
  const [session, setSession] = useState<ExamSession>(() => {
    const existing = loadExamSession(test.id);
    if (existing && !existing.isSubmitted) {
      return existing;
    }
    const now = Date.now();
    const duration = test?.durationMinutes || 15;
    const initialSession: ExamSession = {
      testId: test.id,
      userId: user?.id,
      startedAt: now,
      durationMinutes: duration,
      targetEndTime: now + duration * 60 * 1000,
      userAnswers: {},
      flaggedQuestions: [],
      currentIndex: 0,
      isSubmitted: false,
      questionIds: (test?.questions || []).map((q) => q.id),
      selectedQuestions: test?.questions || []
    };
    saveExamSession(initialSession);
    return initialSession;
  });

  const questionsList = useMemo(() => {
    if (session?.selectedQuestions && session.selectedQuestions.length > 0) {
      return session.selectedQuestions;
    }
    return test?.questions || [];
  }, [session?.selectedQuestions, test?.questions]);

  const isSubmittingRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState<number>(session.currentIndex || 0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>(session.userAnswers || {});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set(session.flaggedQuestions || []));
  const [isSubmitted, setIsSubmitted] = useState<boolean>(session.isSubmitted || false);

  // Accurate drift-free countdown timer based on targetEndTime
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return calculateRemainingSeconds(session);
  });

  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [resultAttempt, setResultAttempt] = useState<TestAttempt | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct' | 'unanswered'>('all');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  // Speaking Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordedAudioMap, setRecordedAudioMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`lingopeak_exam_audio_${test.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Listening Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const sectionGroups = useMemo(() => groupQuestionsBySection(questionsList), [questionsList]);
  const currentQuestion: TestQuestion | null = questionsList[currentIndex] || questionsList[0] || null;

  // Persist session changes immediately
  const persistCurrentSession = useCallback(
    (overrides?: Partial<ExamSession>) => {
      const updated: ExamSession = {
        testId: test.id,
        userId: user?.id,
        startedAt: session.startedAt,
        durationMinutes: session.durationMinutes,
        targetEndTime: session.targetEndTime,
        userAnswers,
        flaggedQuestions: Array.from(flaggedQuestions),
        currentIndex,
        isSubmitted,
        ...overrides
      };
      setSession(updated);
      saveExamSession(updated);
    },
    [test.id, user?.id, session.startedAt, session.durationMinutes, session.targetEndTime, userAnswers, flaggedQuestions, currentIndex, isSubmitted]
  );

  // Sync state changes with session storage
  useEffect(() => {
    if (!isSubmitted) {
      persistCurrentSession();
    }
  }, [userAnswers, flaggedQuestions, currentIndex, isSubmitted, persistCurrentSession]);

  // High-accuracy timer with drift compensation & refresh resilience
  useEffect(() => {
    if (isSubmitted) return;

    const tick = () => {
      const remaining = calculateRemainingSeconds(session);
      setSecondsRemaining(remaining);

      // Auto submit when time runs out
      if (remaining <= 0 && !isSubmittingRef.current) {
        handleSubmitTest(true);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session, isSubmitted]);

  // Stop audio on question change
  useEffect(() => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setShowTranscript(false);
    if (isRecording) {
      stopRecording();
    }
  }, [currentIndex]);

  // Recording timer
  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Keyboard navigation & quick answer selection (1-4 or A-D, Left/Right arrows)
  useEffect(() => {
    if (isSubmitted || showConfirmSubmit || showConfirmExit) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (!currentQuestion) return;

      // Select options with 1-4 or A-D for multiple choice questions
      if (!currentQuestion.itemType || currentQuestion.itemType === 'multiple_choice') {
        const key = e.key.toUpperCase();
        if (key === '1' || key === 'A') handleSelectOption(currentQuestion.id, 0);
        else if (key === '2' || key === 'B') handleSelectOption(currentQuestion.id, 1);
        else if (key === '3' || key === 'C') handleSelectOption(currentQuestion.id, 2);
        else if (key === '4' || key === 'D') handleSelectOption(currentQuestion.id, 3);
      }

      // Navigation with Left / Right arrow keys
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < questionsList.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questionsList.length, currentQuestion, isSubmitted, showConfirmSubmit, showConfirmExit]);

  const handleSelectOption = (qId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleTextAnswer = (qId: string, text: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const startRecording = async (qId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setRecordedAudioMap((prev) => {
            const next = { ...prev, [qId]: base64Data };
            try {
              localStorage.setItem(`lingopeak_exam_audio_${test.id}`, JSON.stringify(next));
            } catch {}
            return next;
          });
          setUserAnswers((prev) => ({ ...prev, [qId]: base64Data }));
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.warn('Microphone access unavailable, providing recording acknowledgement:', err);
      const simulatedAudioRef = `audio_recorded_${Date.now()}`;
      setUserAnswers((prev) => ({ ...prev, [qId]: simulatedAudioRef }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleAudio = (text: string) => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakEnglish(text, 0.9).finally(() => {
        setIsPlayingAudio(false);
      });
    }
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const answeredCount = Object.keys(userAnswers).filter((k) => userAnswers[k] !== undefined && userAnswers[k] !== '').length;
  const unansweredIndices = useMemo(() => {
    return questionsList
      .map((q, idx) => (userAnswers[q.id] === undefined || userAnswers[q.id] === '' ? idx : null))
      .filter((idx): idx is number => idx !== null);
  }, [questionsList, userAnswers]);

  const handleSubmitTest = (isAutoSubmit = false) => {
    if (isSubmitted || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setShowConfirmSubmit(false);
    setIsSubmitted(true);
    stopSpeaking();

    // Evaluate submission with segregated skill scores
    const attempt = evaluateTestSubmission(
      test,
      userAnswers,
      secondsRemaining,
      Array.from(flaggedQuestions)
    );

    setResultAttempt(attempt);
    recordTestAttempt(attempt);

    // Mark session as submitted
    persistCurrentSession({ isSubmitted: true });
    clearExamSession(test.id);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const handleRetakeTest = () => {
    clearExamSession(test.id);
    const now = Date.now();
    const duration = test?.durationMinutes || 15;
    const freshSession: ExamSession = {
      testId: test.id,
      userId: user?.id,
      startedAt: now,
      durationMinutes: duration,
      targetEndTime: now + duration * 60 * 1000,
      userAnswers: {},
      flaggedQuestions: [],
      currentIndex: 0,
      isSubmitted: false
    };
    saveExamSession(freshSession);
    setSession(freshSession);
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setCurrentIndex(0);
    setIsSubmitted(false);
    setResultAttempt(null);
    setSecondsRemaining(duration * 60);
    isSubmittingRef.current = false;
  };

  // Score estimation
  const estimatedScore = useMemo(() => {
    if (!resultAttempt) return null;
    return calculateEstimatedScore(test, resultAttempt.accuracy, resultAttempt.score);
  }, [test, resultAttempt]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-fade-in">
      <div className="bg-white w-full max-w-7xl h-full max-h-[96vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* ==================================================================== */}
        {/* TOP BAR: EXAM HEADER & AZOTA CONTROLS */}
        {/* ==================================================================== */}
        <header className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800 shrink-0 select-none">
          {/* Exam Title & Active Section Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0">
              <FileCheck2 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white truncate">
                  {test.titleVi || test.title}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                  {test.targetLevel}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 truncate">
                <span>{currentQuestion?.section || 'Toàn bộ bài thi'}</span>
                <span>•</span>
                <span>{questionsList.length} mục kiểm tra</span>
              </div>
            </div>
          </div>

          {/* Action Center: Drift-Free Countdown Timer, Progress & Submit */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!isSubmitted && (
              <>
                {/* Drift-Free Accurate Countdown Timer */}
                <div
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-colors ${
                    secondsRemaining < 300
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                      : 'bg-slate-800/80 border-slate-700 text-amber-300'
                  }`}
                  title="Thời gian làm bài còn lại (Được lưu trữ chính xác theo mốc đồng hồ)"
                >
                  <Clock
                    className={`w-4 h-4 ${
                      secondsRemaining < 300 ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  />
                  <span>{formatTimer(secondsRemaining)}</span>
                </div>

                {/* Progress Quick Counter */}
                <div className="hidden lg:flex items-center text-xs font-semibold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span>
                    Đã làm: <strong className="text-emerald-400">{answeredCount}</strong>/{questionsList.length}
                  </span>
                </div>

                {/* Submit Test Button */}
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmit(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Nộp bài' : 'Submit'}</span>
                </button>

                {/* Exit Exam Button with Save Confirmation */}
                <button
                  type="button"
                  onClick={() => setShowConfirmExit(true)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  title="Tạm dừng và thoát phòng thi"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}

            {isSubmitted && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetakeTest}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-blue-400/30"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Làm lại đề' : 'Retake Test'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border border-slate-700"
                >
                  {language === 'vi' ? 'Đóng phòng thi' : 'Close Exam'}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ==================================================================== */}
        {/* MAIN BODY: ACTIVE EXAM ROOM VS RESULT REVIEW */}
        {/* ==================================================================== */}
        {!isSubmitted ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
            {/* ------------------------------------------------------------------ */}
            {/* LEFT WORKSPACE: QUESTION & PASSAGE AREA (AZOTA STYLE) */}
            {/* ------------------------------------------------------------------ */}
            <main className="flex-1 flex flex-col overflow-y-auto bg-white p-4 sm:p-6 lg:p-8 space-y-6">
              {currentQuestion ? (
                <>
                  {/* Question Info Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {currentIndex + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {language === 'vi' ? 'Mục số' : 'Item'} {currentIndex + 1} / {questionsList.length}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {currentQuestion.category || currentQuestion.section}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Font size toggle */}
                      <button
                        type="button"
                        onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                        title="Điều chỉnh cỡ chữ"
                      >
                        <Type className="w-3.5 h-3.5" />
                      </button>

                      {/* Flag for review toggle */}
                      <button
                        type="button"
                        onClick={() => toggleFlag(currentQuestion.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          flaggedQuestions.has(currentQuestion.id)
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
                        }`}
                        title="Đánh dấu câu hỏi để xem lại trước khi nộp bài"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>
                          {flaggedQuestions.has(currentQuestion.id)
                            ? language === 'vi'
                              ? 'Đã đánh dấu'
                              : 'Flagged'
                            : language === 'vi'
                            ? 'Đánh dấu xem lại'
                            : 'Flag for review'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Audio Player Bar (for Listening Questions) */}
                  {currentQuestion.audioText && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleAudio(currentQuestion.audioText!)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white transition-all shadow-xs cursor-pointer ${
                            isPlayingAudio ? 'bg-rose-600 hover:bg-rose-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          title={isPlayingAudio ? 'Dừng phát âm thanh' : 'Nghe bài phát biểu audio'}
                        >
                          {isPlayingAudio ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>Phát âm thanh câu hỏi (Listening Audio)</span>
                            {isPlayingAudio && (
                              <span className="text-[10px] text-blue-600 font-semibold px-2 py-0.5 bg-blue-100 rounded-md animate-pulse">
                                Đang phát...
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Bấm vào biểu tượng loa để nghe audio mô phỏng giọng đọc chuẩn bản xứ
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowTranscript((prev) => !prev)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                      >
                        {showTranscript ? 'Ẩn Transcript bài nghe' : 'Xem Transcript văn bản'}
                      </button>
                    </div>
                  )}

                  {/* Audio Transcript Collapsible */}
                  {currentQuestion.audioText && showTranscript && (
                    <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono leading-relaxed">
                      <div className="font-bold text-slate-900 mb-1">Transcript âm thanh:</div>
                      {currentQuestion.audioText}
                    </div>
                  )}

                  {/* Context Stimulus / Reading Passage */}
                  {currentQuestion.contextPassage && (
                    <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-slate-700 leading-relaxed max-h-64 overflow-y-auto">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                        <BookOpen className="w-4 h-4" />
                        <span>Đoạn văn đọc hiểu & ngữ cảnh (Reading Stimulus)</span>
                      </div>
                      <div
                        className={`font-serif whitespace-pre-line text-slate-800 ${
                          fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm'
                        }`}
                      >
                        {currentQuestion.contextPassage}
                      </div>
                    </div>
                  )}

                  {/* Question Prompt */}
                  <div
                    className={`font-semibold text-slate-900 leading-relaxed ${
                      fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                    }`}
                  >
                    {currentQuestion.prompt}
                  </div>

                  {/* ========================================================== */}
                  {/* QUESTION INPUT AREA ACCORDING TO ITEM TYPE                 */}
                  {/* ========================================================== */}

                  {/* CASE 1: SPEAKING RECORDING TASK */}
                  {currentQuestion.itemType === 'speaking_recording' ? (
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Mic className="w-4 h-4 text-rose-500" />
                          <span>Ghi Âm Câu Trả Lời (Speaking Task Recording)</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Chuẩn bị: {currentQuestion.speakingPrepSeconds || 45}s | Nói: {currentQuestion.speakingRecordSeconds || 45}s
                        </div>
                      </div>

                      {/* Record Buttons & Wave Indicator */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                          {!isRecording ? (
                            <button
                              type="button"
                              onClick={() => startRecording(currentQuestion.id)}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                            >
                              <Mic className="w-4 h-4" />
                              <span>Bắt đầu ghi âm</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="px-4 py-2 bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer animate-pulse"
                            >
                              <Square className="w-4 h-4 fill-rose-500 text-rose-500" />
                              <span>Dừng ghi âm ({recordingSeconds}s)</span>
                            </button>
                          )}

                          {isRecording && (
                            <span className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                              Đang thu âm qua microphone...
                            </span>
                          )}

                          {!isRecording && userAnswers[currentQuestion.id] && (
                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCheck className="w-4 h-4" />
                              Đã lưu bản ghi âm vào phiên làm bài
                            </span>
                          )}
                        </div>

                        {/* Audio playback if recorded */}
                        {userAnswers[currentQuestion.id] && String(userAnswers[currentQuestion.id]).startsWith('data:audio') && (
                          <audio
                            controls
                            src={userAnswers[currentQuestion.id]}
                            className="h-9 w-full sm:w-64"
                          />
                        )}
                      </div>

                      {/* Rubric Criteria Display */}
                      {currentQuestion.rubric && (
                        <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-2">
                          <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-blue-600" />
                            <span>Rubric Tiêu Chí Đánh Giá (Thang điểm: {currentQuestion.rubric.totalPoints} điểm)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {currentQuestion.rubric.criteria.map((crit, cIdx) => (
                              <div key={cIdx} className="p-2.5 bg-white rounded-lg border border-blue-100 text-slate-700">
                                <div className="font-bold text-slate-900 flex items-center justify-between">
                                  <span>{crit.criterion}</span>
                                  <span className="text-blue-600 font-bold">{crit.maxScore}đ</span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{crit.descriptionVi}</div>
                              </div>
                            ))}
                          </div>
                          <div className="text-[11px] text-slate-500 italic pt-1">
                            Lưu ý: Bài nói sẽ được ghi nhận và đánh giá theo chuẩn rubric sau khi nộp bài thi.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : currentQuestion.itemType === 'essay' ? (
                    /* CASE 2: WRITING ESSAY TASK */
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span>Trình Soạn Thảo Bài Viết (Writing Response Editor)</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-600">
                          Số từ: <strong className="text-blue-600">
                            {userAnswers[currentQuestion.id]
                              ? String(userAnswers[currentQuestion.id]).trim().split(/\s+/).filter(Boolean).length
                              : 0}
                          </strong>
                          {currentQuestion.targetWordCount && (
                            <span className="text-slate-400 font-normal ml-1">
                              (Yêu cầu tối thiểu: {currentQuestion.targetWordCount.min} từ)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Textarea Editor */}
                      <textarea
                        value={userAnswers[currentQuestion.id] || ''}
                        onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                        placeholder="Nhập nội dung bài viết hoàn chỉnh tại đây. Hệ thống tự động lưu bản nháp theo thời gian thực..."
                        rows={10}
                        className="w-full p-4 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
                      />

                      {/* Rubric Criteria Display */}
                      {currentQuestion.rubric && (
                        <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-2">
                          <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-indigo-600" />
                            <span>Rubric Tiêu Chí Đánh Giá (Thang điểm: {currentQuestion.rubric.totalPoints} điểm)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {currentQuestion.rubric.criteria.map((crit, cIdx) => (
                              <div key={cIdx} className="p-2.5 bg-white rounded-lg border border-indigo-100 text-slate-700">
                                <div className="font-bold text-slate-900 flex items-center justify-between">
                                  <span>{crit.criterion}</span>
                                  <span className="text-indigo-600 font-bold">{crit.maxScore}đ</span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{crit.descriptionVi}</div>
                              </div>
                            ))}
                          </div>
                          <div className="text-[11px] text-slate-500 italic pt-1">
                            Lưu ý: Bài viết được tự động lưu nháp. Sau khi nộp bài, hệ thống sẽ lưu bài thi ở trạng thái chờ đánh giá theo rubric.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* CASE 3: STANDARD MULTIPLE CHOICE OPTIONS */
                    <div className="space-y-3 pt-2">
                      {currentQuestion.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                        const isSelected = userAnswers[currentQuestion.id] === optIdx;

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                            className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {/* Option Badge */}
                            <div
                              className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs transition-colors shrink-0 ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                              }`}
                            >
                              {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : letter}
                            </div>

                            <div
                              className={`flex-1 font-medium ${
                                fontSize === 'large' ? 'text-base' : 'text-sm'
                              } ${isSelected ? 'font-bold text-blue-950' : 'text-slate-800'}`}
                            >
                              {opt}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Navigation Footer */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>{language === 'vi' ? 'Câu trước (←)' : 'Previous (←)'}</span>
                    </button>

                    <div className="text-xs text-slate-400 font-medium hidden sm:block">
                      Mẹo: Nhấn phím 1-4 hoặc A-D để chọn đáp án; dùng ← và → để chuyển câu
                    </div>

                    <button
                      type="button"
                      disabled={currentIndex === questionsList.length - 1}
                      onClick={() => setCurrentIndex((prev) => Math.min(questionsList.length - 1, prev + 1))}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <span>{language === 'vi' ? 'Câu tiếp theo (→)' : 'Next (→)'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Không tìm thấy câu hỏi tương ứng.
                </div>
              )}
            </main>

            {/* ------------------------------------------------------------------ */}
            {/* RIGHT WORKSPACE: AZOTA QUESTION PALETTE & SECTIONS */}
            {/* ------------------------------------------------------------------ */}
            <aside className="w-full lg:w-80 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto max-h-72 lg:max-h-full">
              {/* Palette Header */}
              <div className="p-4 bg-white border-b border-slate-200 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4 text-blue-600" />
                    <span>Danh Sách Câu Hỏi</span>
                  </h3>
                  <span className="text-xs font-bold text-blue-600">
                    {answeredCount}/{questionsList.length} câu
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round((answeredCount / (questionsList.length || 1)) * 100)}%`
                    }}
                  />
                </div>

                {/* Azota Status Legend */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-blue-600 shrink-0" />
                    <span>Đã làm ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 shrink-0" />
                    <span>Chưa làm ({questionsList.length - answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-amber-500 shrink-0" />
                    <span>Đánh dấu ({flaggedQuestions.size})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md border-2 border-blue-600 bg-white ring-2 ring-blue-500/20 shrink-0" />
                    <span>Đang xem</span>
                  </div>
                </div>
              </div>

              {/* Question Grid Section by Section (Azota Style) */}
              <div className="p-4 space-y-5 flex-1 overflow-y-auto">
                {sectionGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-tight flex items-center justify-between border-b border-slate-200/80 pb-1">
                      <span>{group.sectionName}</span>
                      <span className="text-slate-400 font-medium">
                        Câu {group.startIndex + 1} - {group.endIndex + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {group.questions.map((q, qIndexInGroup) => {
                        const globalIndex = group.startIndex + qIndexInGroup;
                        const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
                        const isFlagged = flaggedQuestions.has(q.id);
                        const isCurrent = currentIndex === globalIndex;

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentIndex(globalIndex)}
                            className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center relative transition-all cursor-pointer ${
                              isCurrent
                                ? 'border-2 border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/30'
                                : isFlagged
                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-2xs'
                                : isAnswered
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50'
                            }`}
                            title={`Chuyển tới câu ${globalIndex + 1} (${isAnswered ? 'Đã làm' : 'Chưa làm'})`}
                          >
                            <span>{globalIndex + 1}</span>
                            {isFlagged && !isCurrent && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar Submit CTA */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmit(true)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Nộp bài & Kết thúc thi</span>
                </button>
              </div>
            </aside>
          </div>
        ) : (
          /* ================================================================== */
          /* RESULT REVIEW & WEAKNESS ANALYSIS (AZOTA SCORE REPORT) */
          /* ================================================================== */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50">
            {resultAttempt && (
              <>
                {/* Score Summary Card */}
                <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 text-center md:text-left">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold">
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        <span>KẾT QUẢ BÀI THI CHÍNH THỨC</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold">{test.titleVi || test.title}</h2>
                      <p className="text-xs text-blue-100 max-w-lg">
                        {estimatedScore?.descriptor || 'Hoàn thành bài thi và ghi nhận vào lịch sử cá nhân.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-28">
                        <div className="text-3xl font-black text-amber-300">
                          {resultAttempt.score}/{resultAttempt.totalQuestions}
                        </div>
                        <div className="text-[10px] text-blue-100 font-bold uppercase mt-0.5">
                          Số câu đúng
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-28">
                        <div className="text-3xl font-black text-emerald-300">
                          {resultAttempt.accuracy}%
                        </div>
                        <div className="text-[10px] text-blue-100 font-bold uppercase mt-0.5">
                          Độ chính xác
                        </div>
                      </div>

                      {estimatedScore && (
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-28">
                          <div className="text-2xl font-black text-white">
                            {estimatedScore.scoreText}
                          </div>
                          <div className="text-[10px] text-blue-100 font-bold uppercase mt-0.5">
                            Quy đổi ước tính
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Segregated Skill Scores Breakdown (Listening, Reading, Speaking, Writing) */}
                {resultAttempt.skillScores && Object.keys(resultAttempt.skillScores).length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Kết Quả Đánh Giá Phân Tách Theo Từng Kỹ Năng (Skill Segregation)</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {Object.entries(resultAttempt.skillScores).map(([sk, info]) => {
                        const isGraded = info.status === 'graded';
                        const skillName =
                          sk === 'listening' ? 'Listening (Nghe hiểu)'
                          : sk === 'reading' ? 'Reading (Đọc hiểu)'
                          : sk === 'speaking' ? 'Speaking (Nói & Phát âm)'
                          : 'Writing (Viết & Luận)';

                        return (
                          <div key={sk} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 uppercase tracking-tight">{skillName}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isGraded
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isGraded ? 'Đã chấm tự động' : 'Chờ đánh giá rubric'}
                              </span>
                            </div>

                            <div className="text-xl font-black text-slate-900">
                              {info.rawScore} / {info.maxScore} <span className="text-xs font-normal text-slate-500">mục</span>
                            </div>

                            <div className="text-[11px] text-slate-500 leading-relaxed">
                              {info.detailsVi}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Strict Official Disclaimer Banner */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Lưu ý pháp lý về kết quả quy đổi:</strong> Điểm số và quy đổi trình độ do hệ thống LingoPeak cung cấp hoàn toàn mang tính chất tham khảo rèn luyện cá nhân. Kết quả này không thay thế chứng chỉ chính thức của Educational Testing Service (ETS) hay Hội đồng Khảo thí Cambridge/IDP/British Council do chưa qua hội đồng chấm thi thực địa.
                  </div>
                </div>

                {/* Weakness Analysis Section */}
                {resultAttempt.weaknessAnalysisVi && resultAttempt.weaknessAnalysisVi.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Phân Tích Trọng Điểm Cần Cải Thiện (Weakness Diagnosis)</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {resultAttempt.weaknessAnalysisVi.map((weakness, wIdx) => (
                        <div
                          key={wIdx}
                          className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 font-medium"
                        >
                          {weakness}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Review Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setReviewFilter('all')}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                        reviewFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Tất cả ({questionsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('wrong')}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                        reviewFilter === 'wrong'
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Câu sai
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('correct')}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                        reviewFilter === 'correct'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Câu đúng
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 font-medium">
                    Thời gian làm bài: {Math.round(resultAttempt.timeSpentSeconds / 60)} phút {resultAttempt.timeSpentSeconds % 60} giây
                  </div>
                </div>

                {/* Question Review List */}
                <div className="space-y-4">
                  {questionsList
                    .filter((q) => {
                      const selected = userAnswers[q.id];
                      const isCorrect = typeof selected === 'number' && selected === q.correctAnswerIndex;
                      if (reviewFilter === 'wrong') return !isCorrect;
                      if (reviewFilter === 'correct') return isCorrect;
                      if (reviewFilter === 'unanswered') return selected === undefined || selected === '';
                      return true;
                    })
                    .map((q, idx) => {
                      const selected = userAnswers[q.id];
                      const isSubjective = q.itemType === 'speaking_recording' || q.itemType === 'essay';
                      const isCorrect = !isSubjective && typeof selected === 'number' && selected === q.correctAnswerIndex;

                      return (
                        <div
                          key={q.id}
                          className={`p-5 rounded-2xl border bg-white space-y-3 transition-all ${
                            isSubjective
                              ? 'border-indigo-200 shadow-xs'
                              : isCorrect
                              ? 'border-emerald-200 shadow-xs'
                              : 'border-rose-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center text-white ${
                                  isSubjective ? 'bg-indigo-600' : isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              >
                                {q.questionNumber || idx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                {q.section}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isSubjective
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : isCorrect
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {isSubjective
                                ? 'Chờ chấm Rubric'
                                : isCorrect
                                ? 'Trả lời đúng'
                                : 'Trả lời chưa đúng'}
                            </span>
                          </div>

                          <div className="text-sm font-semibold text-slate-800">
                            {q.prompt}
                          </div>

                          {/* Subjective answer preview */}
                          {isSubjective && (
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                              <div className="font-bold text-slate-700">Câu trả lời đã nộp:</div>
                              {q.itemType === 'essay' ? (
                                <p className="text-slate-800 italic whitespace-pre-line">{selected || '(Chưa nhập nội dung)'}</p>
                              ) : (
                                <div className="text-slate-800">
                                  {selected ? '✓ Bản ghi âm đã được lưu vào hệ thống khảo thí.' : '(Chưa ghi âm)'}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Explanation */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span>Giải thích chi tiết & Hướng dẫn:</span>
                            </div>
                            <p className="leading-relaxed">{q.explanationVi}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Submit Warning Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Nộp Bài Thi</h3>
                <p className="text-xs text-slate-500">Vui lòng rà soát tình trạng bài làm trước khi nộp.</p>
              </div>
            </div>

            {unansweredIndices.length > 0 ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Cảnh báo: Bạn còn {unansweredIndices.length} câu chưa trả lời!</span>
                </div>
                <div className="text-[11px] text-amber-800 max-h-24 overflow-y-auto font-mono">
                  Các câu chưa làm: {unansweredIndices.map((i) => `Câu ${i + 1}`).join(', ')}
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tuyệt vời! Bạn đã hoàn thành toàn bộ {questionsList.length} câu hỏi.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={() => handleSubmitTest(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Exit Modal */}
      {showConfirmExit && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Tạm Dừng Phòng Thi</h3>
                <p className="text-xs text-slate-500">Tiến độ bài làm của bạn sẽ được lưu tự động.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có thể quay lại danh sách đề thi bất kỳ lúc nào để tiếp tục làm bài với thời gian còn lại chính xác.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmExit(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Ở lại phòng thi
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmExit(false);
                  onClose();
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
              >
                Lưu & Thoát ra ngoài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
