import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  generatePersonalizedPlan,
  CEFR_DETAILS,
  CEFR_ORDER
} from '../../services/studyPlanService';
import {
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Clock,
  Target,
  Calendar,
  Flame,
  Layers,
  ChevronRight,
  TrendingUp,
  CheckSquare,
  Square,
  Zap,
  Info
} from 'lucide-react';
import { CEFRLevel } from '../../types';

export const LearningPathView: React.FC = () => {
  const {
    user,
    courses,
    testAttempts,
    vocabulary,
    grammarTopics,
    setActiveTab,
    setSelectedLesson,
    setActiveExamId,
    updateUser,
    language
  } = useApp();

  const [studyPace, setStudyPace] = useState<number>(user.dailyMinutesGoal || 30);

  // Generate dynamic personalized plan memoized on progress dependencies
  const plan = useMemo(() => {
    const virtualUser = { ...user, dailyMinutesGoal: studyPace };
    return generatePersonalizedPlan(virtualUser, courses, testAttempts, vocabulary, grammarTopics);
  }, [user, studyPace, courses, testAttempts, vocabulary, grammarTopics]);

  const cefrInfo = CEFR_DETAILS[user.level || 'B1'] || CEFR_DETAILS['B1'];

  const handlePaceChange = (minutes: number) => {
    setStudyPace(minutes);
    updateUser({ dailyMinutesGoal: minutes });
  };

  const handleStartTask = (task: typeof plan.dailyTasks[0]) => {
    if (task.linkPayload?.courseId && task.linkPayload?.lessonId) {
      setSelectedLesson({
        courseId: task.linkPayload.courseId,
        lessonId: task.linkPayload.lessonId
      });
      setActiveTab('courses');
    } else if (task.actionTab) {
      setActiveTab(task.actionTab);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md uppercase tracking-wider">
              CEFR ALIGNED ROADMAP
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Cập nhật thời gian thực theo tiến độ học
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'vi' ? 'Lộ Trình Học Tập Cá Nhân Hóa' : 'Personalized Learning Roadmap'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'vi'
              ? `Chương trình thiết kế riêng từ trình độ ${user.level} hướng tới mục tiêu ${user.targetExam} ${user.targetScore}.`
              : `Curated learning pathway tailored to your current level and target score.`}
          </p>
        </div>

        <button
          onClick={() => {
            setActiveExamId('test-placement');
            setActiveTab('practice-tests');
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Kiểm tra xếp lớp lại (Placement Test)</span>
        </button>
      </div>

      {/* Target & Roadmap Metrics Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Target Journey */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              <span>LỘ TRÌNH MỤC TIÊU CỦA BẠN</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-800 font-extrabold text-sm rounded-xl">
                  {user.level}
                </span>
                <span className="text-slate-400 font-bold">➔</span>
                <span className="px-3 py-1 bg-blue-600 text-white font-extrabold text-sm rounded-xl shadow-xs">
                  {user.targetExam} {user.targetScore}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              {cefrInfo.nameVi}: {cefrInfo.descriptionVi}
            </p>
          </div>

          {/* Target Completion Estimation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">TIẾN ĐỘ</div>
              <div className="text-lg font-black text-blue-600 mt-0.5">
                {plan.overallProgressPercentage}%
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">DỰ KIẾN</div>
              <div className="text-lg font-black text-slate-800 mt-0.5">
                {plan.totalEstimatedWeeks} tuần
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">NGÀY ĐÍCH</div>
              <div className="text-xs font-bold text-slate-800 mt-1.5">
                {plan.targetCompletionDate}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Roadmap Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-700">Tiến độ hoàn thành lộ trình</span>
            <span className="text-blue-700">{plan.overallProgressPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${plan.overallProgressPercentage}%` }}
            />
          </div>
        </div>

        {/* Study Pace Selector */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Thời gian học mỗi ngày:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handlePaceChange(mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  studyPace === mins
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {mins} phút/ngày
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Action Checklist (Kế hoạch hôm nay) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {language === 'vi' ? 'Nhiệm Vụ Học Tập Hôm Nay' : "Today's Action Tasks"}
              </h2>
              <p className="text-[11px] text-slate-500">
                Hoàn thành các nhiệm vụ để duy trì chuỗi Streak và tích lũy XP
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            +{plan.dailyTasks.reduce((acc, t) => acc + (t.isCompleted ? 0 : t.xpReward), 0)} XP khả dụng
          </span>
        </div>

        <div className="space-y-2.5">
          {plan.dailyTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleStartTask(task)}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                task.isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-500'
                  : 'bg-slate-50/70 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {task.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-md border-2 border-slate-300 flex items-center justify-center shrink-0" />
                )}
                <div>
                  <div className={`text-xs font-bold ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {language === 'vi' ? task.titleVi : task.titleEn}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>⏱ {task.estimatedMinutes} phút</span>
                    <span>•</span>
                    <span className="text-amber-600 font-semibold">+{task.xpReward} XP</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 shrink-0">
                <span>{task.isCompleted ? 'Xem lại' : 'Thực hiện ngay'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stages Timeline */}
      <div className="space-y-5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          CÁC GIAI ĐOẠN ĐÀO TẠO (CURRICULUM MILESTONES)
        </div>

        {plan.milestones.map((stg) => {
          const isDone = stg.status === 'completed';
          const isInProgress = stg.status === 'in_progress';
          const isLocked = stg.status === 'locked';

          return (
            <div
              key={stg.id}
              className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all ${
                isInProgress
                  ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                  : isDone
                  ? 'border-emerald-200 bg-white'
                  : 'border-slate-200/80 opacity-80'
              }`}
            >
              {/* Stage Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : isInProgress
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : stg.stageNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                        CEFR {stg.level} • {stg.estimatedWeeks} tuần
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">
                        +{stg.requiredXp} XP Milestone
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {language === 'vi' ? stg.titleVi : stg.titleEn}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {stg.targetDescriptionVi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isInProgress && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold animate-pulse">
                      Đang thực hiện
                    </span>
                  )}
                  {isDone && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                      Đã hoàn tất
                    </span>
                  )}
                  {isLocked && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Khóa</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Module cards inside stage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                {stg.modules.map((m, mIdx) => (
                  <div
                    key={m.id || mIdx}
                    onClick={() => {
                      if (!isLocked) {
                        if (m.courseId && m.lessonId) {
                          setSelectedLesson({ courseId: m.courseId, lessonId: m.lessonId });
                          setActiveTab('courses');
                        } else if (m.testId) {
                          setActiveExamId(m.testId);
                          setActiveTab('practice-tests');
                        } else if (m.type === 'speaking_checkpoint') {
                          setActiveTab('speaking');
                        }
                      }
                    }}
                    className={`p-4 rounded-2xl border text-xs flex flex-col justify-between transition-all cursor-pointer ${
                      m.completed
                        ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                        : isLocked
                        ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {m.type === 'exam' || m.type === 'quiz'
                            ? 'BÀI KIỂM TRA'
                            : m.type === 'speaking_checkpoint'
                            ? 'LUYỆN NÓI AI'
                            : `BÀI HỌC ${mIdx + 1}`}
                        </span>
                        {m.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isLocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <div className="font-bold text-slate-800 leading-snug">{m.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1">⏱ {m.durationMinutes} phút</div>
                    </div>

                    {!isLocked && (
                      <div className="mt-3 pt-2 border-t border-black/5 text-[11px] font-bold text-blue-600 flex items-center justify-between">
                        <span>{m.completed ? 'Ôn lại' : 'Bắt đầu ngay'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Strengths and Diagnostic Advice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
            <CheckCircle2 className="w-4 h-4" />
            <span>ĐIỂM MẠNH ĐÃ GHI NHẬN</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {plan.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase">
            <Info className="w-4 h-4" />
            <span>ĐIỂM CẦN BỔ SUNG & CỦNG CỐ</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {plan.areasToImprove.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">!</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
