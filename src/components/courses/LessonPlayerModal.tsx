import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lesson, Exercise } from '../../types';
import { speakEnglish } from '../../utils/speech';
import {
  X,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Volume2,
  Check,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LessonPlayerModalProps {
  lesson: Lesson;
  courseId: string;
  onClose: () => void;
}

export const LessonPlayerModal: React.FC<LessonPlayerModalProps> = ({
  lesson,
  courseId,
  onClose
}) => {
  const { completeLesson, language } = useApp();

  const [step, setStep] = useState<'theory' | 'exercises' | 'completed'>('theory');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [userSelectedAnswer, setUserSelectedAnswer] = useState<string>('');
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const currentExercise: Exercise | undefined = lesson.exercises[exerciseIndex];

  const handleCheckAnswer = () => {
    if (!currentExercise || !userSelectedAnswer) return;
    const isCorrect = userSelectedAnswer.trim().toLowerCase() === String(currentExercise.correctAnswer).trim().toLowerCase();
    setIsAnswerCorrect(isCorrect);
    setHasCheckedAnswer(true);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextExercise = () => {
    setHasCheckedAnswer(false);
    setUserSelectedAnswer('');
    setIsAnswerCorrect(false);

    if (exerciseIndex < lesson.exercises.length - 1) {
      setExerciseIndex((prev) => prev + 1);
    } else {
      // Finished all exercises
      setStep('completed');
      completeLesson(courseId, lesson.id);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md uppercase">
                {lesson.type}
              </span>
              <span className="text-xs text-slate-500 font-medium">+{lesson.xpReward} XP</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{lesson.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {step === 'theory' && (
            <div className="space-y-5">
              {/* Objectives banner */}
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                  {language === 'vi' ? 'MỤC TIÊU BÀI HỌC' : 'LEARNING OBJECTIVES'}
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {lesson.objectivesVi.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Theory Explanation */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>{lesson.theoryContent.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {lesson.theoryContent.explanationVi}
                </p>
              </div>

              {/* Examples with Audio */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {language === 'vi' ? 'VÍ DỤ THỰC TẾ & PHÁT ÂM' : 'REAL EXAMPLES & AUDIO'}
                </h4>
                <div className="space-y-2">
                  {lesson.theoryContent.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 hover:border-blue-300 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{ex.en}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{ex.vi}</div>
                      </div>
                      <button
                        onClick={() => speakEnglish(ex.en)}
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'exercises' && currentExercise && (
            <div className="space-y-5">
              {/* Exercise Progress Header */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>
                  {language === 'vi' ? 'Câu hỏi' : 'Question'} {exerciseIndex + 1} / {lesson.exercises.length}
                </span>
                <span className="font-bold text-blue-600">
                  {Math.round(((exerciseIndex) / lesson.exercises.length) * 100)}% {language === 'vi' ? 'hoàn thành' : 'done'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((exerciseIndex + 1) / lesson.exercises.length) * 100}%` }}
                />
              </div>

              {/* Question Box */}
              <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                <div className="text-sm font-bold text-slate-900">{currentExercise.prompt}</div>
                {currentExercise.promptVi && (
                  <div className="text-xs text-slate-500 italic">{currentExercise.promptVi}</div>
                )}
              </div>

              {/* Options */}
              {currentExercise.options && (
                <div className="space-y-2">
                  {currentExercise.options.map((opt, oIndex) => {
                    const isSelected = userSelectedAnswer === opt;
                    const isCorrectAnswer = opt === currentExercise.correctAnswer;
                    let optStyle = 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30';

                    if (hasCheckedAnswer) {
                      if (isCorrectAnswer) {
                        optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                      } else if (isSelected && !isCorrectAnswer) {
                        optStyle = 'border-red-400 bg-red-50 text-red-900';
                      }
                    } else if (isSelected) {
                      optStyle = 'border-blue-600 bg-blue-50/60 font-semibold text-blue-900';
                    }

                    return (
                      <button
                        key={oIndex}
                        disabled={hasCheckedAnswer}
                        onClick={() => setUserSelectedAnswer(opt)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {hasCheckedAnswer && isCorrectAnswer && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Feedback Explanation */}
              {hasCheckedAnswer && (
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    isAnswerCorrect
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50/80 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {isAnswerCorrect ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'vi' ? 'Chính xác!' : 'Correct!'}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>{language === 'vi' ? 'Chưa chính xác' : 'Incorrect'}</span>
                      </>
                    )}
                  </div>
                  <div>{currentExercise.explanationVi}</div>
                </div>
              )}
            </div>
          )}

          {step === 'completed' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {language === 'vi' ? 'Xuất Sắc! Bài Học Hoàn Tất' : 'Lesson Completed!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                {language === 'vi'
                  ? `Bạn đã hoàn thành bài học, tích lũy thêm +${lesson.xpReward} XP và củng cố kiến thức vững chắc.`
                  : `You finished the lesson and earned +${lesson.xpReward} XP.`}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-bold text-xs">
                <span>{language === 'vi' ? 'Điểm bài tập:' : 'Score:'} {score} / {lesson.exercises.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
          {step === 'theory' ? (
            <button
              onClick={() => setStep('exercises')}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <span>{language === 'vi' ? 'Làm bài tập ứng dụng' : 'Start Exercises'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : step === 'exercises' ? (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => setStep('theory')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                {language === 'vi' ? '← Xem lại lý thuyết' : '← Review theory'}
              </button>

              {!hasCheckedAnswer ? (
                <button
                  disabled={!userSelectedAnswer}
                  onClick={handleCheckAnswer}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userSelectedAnswer
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {language === 'vi' ? 'Kiểm tra' : 'Check Answer'}
                </button>
              ) : (
                <button
                  onClick={handleNextExercise}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{exerciseIndex < lesson.exercises.length - 1 ? (language === 'vi' ? 'Câu tiếp theo' : 'Next') : (language === 'vi' ? 'Hoàn thành' : 'Finish')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              {language === 'vi' ? 'Quay lại danh sách khóa học' : 'Back to Courses'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
