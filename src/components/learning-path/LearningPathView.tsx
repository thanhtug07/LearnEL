import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Clock,
  Target
} from 'lucide-react';

export const LearningPathView: React.FC = () => {
  const { user, courses, setActiveTab, setSelectedLesson, setActiveExamId, language } = useApp();

  const isLessonDone = (cId: string, lId: string): boolean => {
    if (!cId || !lId) return false;
    const crs = courses.find((c) => c.id === cId);
    if (!crs) return false;
    return crs.modules.some((m) => m.lessons.some((l) => l.id === lId && l.isCompleted));
  };

  const rawStages = [
    {
      stageNumber: 1,
      titleVi: 'Giai đoạn 1: Nền Tảng Phản Xạ & Ngữ Pháp Cốt Lõi',
      titleEn: 'Stage 1: Core Foundation & Communication Reflexes',
      targetCefr: 'A1 - A2',
      duration: '4 tuần (4 weeks)',
      modules: [
        { name: 'Thói quen sinh hoạt & Quản lý thời gian', courseId: 'course-daily-routine', lessonId: 'les-daily-1' },
        { name: 'Giao tiếp gọi đồ uống & Nhà hàng', courseId: 'course-daily-routine', lessonId: 'les-daily-2' },
        { name: 'Hỏi đường & Di chuyển trong Thành phố', courseId: 'course-daily-routine', lessonId: 'les-daily-3' }
      ]
    },
    {
      stageNumber: 2,
      titleVi: 'Giai đoạn 2: Bứt Phá Trung Cấp & Từ Vựng Học Thuật',
      titleEn: 'Stage 2: Intermediate Leap & Academic Lexicon',
      targetCefr: 'B1 - B2',
      duration: '6 tuần (6 weeks)',
      modules: [
        { name: 'Dấu hiệu đuôi từ loại & Bẫy ngữ pháp ETS', courseId: 'course-toeic-pro', lessonId: 'les-toeic-1' },
        { name: 'Thư tín Doanh nghiệp & Xử lý Hóa đơn, Đơn hàng', courseId: 'course-toeic-pro', lessonId: 'les-toeic-2' },
        { name: 'Thì Hiện tại hoàn thành vs Quá khứ đơn', courseId: 'course-daily-routine', lessonId: 'les-daily-1' }
      ]
    },
    {
      stageNumber: 3,
      titleVi: 'Giai đoạn 3: Chiến Thuật Luyện Thi Chuyên Sâu (IELTS / TOEIC)',
      titleEn: 'Stage 3: Advanced Exam Mastery & Critical Thinking',
      targetCefr: 'B2 - C1',
      duration: '8 tuần (8 weeks)',
      modules: [
        { name: 'IELTS Writing Task 2: Cấu trúc PEEL & Luận điểm phản biện', courseId: 'course-ielts-mastery', lessonId: 'les-ielts-w1' },
        { name: 'Academic Reading: Skimming & Scanning Mastery', courseId: 'course-ielts-mastery', lessonId: 'les-ielts-r1' },
        { name: 'Luyện đề thi thử có tính giờ chuẩn quốc tế', courseId: 'course-ielts-mastery', lessonId: 'les-ielts-w1' }
      ]
    },
    {
      stageNumber: 4,
      titleVi: 'Giai đoạn 4: Tự Tin Làm Chủ Ngôn Ngữ & Đạt Target',
      titleEn: 'Stage 4: Total Fluency & Goal Attainment',
      targetCefr: 'C1 - C2',
      duration: '4 tuần (4 weeks)',
      modules: [
        { name: 'Thuyết trình kinh doanh & Đàm phán quốc tế', courseId: 'course-toeic-pro', lessonId: 'les-toeic-2' },
        { name: 'Thi thử Full Mock Test & Rà soát lần cuối', courseId: 'course-ielts-mastery', lessonId: 'les-ielts-r1' }
      ]
    }
  ];

  let prevStageDone = true;
  const stages = rawStages.map((stage) => {
    const modulesWithStatus = stage.modules.map((m) => ({
      ...m,
      completed: isLessonDone(m.courseId, m.lessonId)
    }));

    const doneCount = modulesWithStatus.filter((m) => m.completed).length;
    const isAllDone = doneCount === modulesWithStatus.length && doneCount > 0;

    let status: 'completed' | 'in_progress' | 'upcoming' | 'locked' = 'upcoming';
    if (isAllDone) {
      status = 'completed';
    } else if (prevStageDone) {
      status = 'in_progress';
      prevStageDone = false;
    } else {
      status = 'locked';
    }

    return {
      ...stage,
      status,
      modules: modulesWithStatus
    };
  });

  const totalModules = stages.flatMap((s) => s.modules).length;
  const completedModules = stages.flatMap((s) => s.modules).filter((m) => m.completed).length;
  const roadmapPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {language === 'vi' ? 'Lộ Trình Học Tập Cá Nhân Hóa' : 'Personalized Learning Roadmap'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'vi'
              ? `Thiết kế riêng cho trình độ ${user.level} hướng tới mục tiêu ${user.targetExam} ${user.targetScore}.`
              : `Customized roadmap tailored for your target score.`}
          </p>
        </div>

        <button
          onClick={() => {
            setActiveExamId('test-placement');
            setActiveTab('practice-tests');
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Kiểm tra xếp lớp lại (Placement Test)</span>
        </button>
      </div>

      {/* Target Progress Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              MỤC TIÊU CỦA BẠN
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              Từ {user.level} ➔ Đạt {user.targetExam} {user.targetScore}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              Hoàn thành {roadmapPercent}% lộ trình
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${roadmapPercent}%` }}
          />
        </div>
      </div>

      {/* Stages Timeline */}
      <div className="space-y-6">
        {stages.map((stg) => {
          const isDone = stg.status === 'completed';
          const isInProgress = stg.status === 'in_progress';
          const isLocked = stg.status === 'locked';

          return (
            <div
              key={stg.stageNumber}
              className={`bg-white rounded-3xl p-6 border transition-all ${
                isInProgress
                  ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                  : isDone
                  ? 'border-emerald-200 bg-white'
                  : 'border-slate-200/80 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
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
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                      {stg.targetCefr} • {stg.duration}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {language === 'vi' ? stg.titleVi : stg.titleEn}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                    key={mIdx}
                    onClick={() => {
                      if (!isLocked && m.courseId) {
                        setSelectedLesson({ courseId: m.courseId, lessonId: m.lessonId });
                        setActiveTab('courses');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between transition-all cursor-pointer ${
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
                          BÀI HỌC {mIdx + 1}
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
                    </div>

                    {!isLocked && (
                      <div className="mt-3 pt-2 border-t border-black/5 text-[11px] font-bold text-blue-600 flex items-center justify-between">
                        <span>{m.completed ? 'Ôn lại' : 'Học ngay'}</span>
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
    </div>
  );
};
