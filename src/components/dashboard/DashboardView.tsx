import React from 'react';
import { useApp, getTodayMinutesSpent } from '../../context/AppContext';
import {
  Clock,
  Flame,
  CheckCircle2,
  Target,
  ArrowRight,
  Sparkles,
  Play,
  Layers,
  BookOpen,
  Mic,
  Award,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Volume2
} from 'lucide-react';
import { speakEnglish } from '../../utils/speech';

export const DashboardView: React.FC = () => {
  const {
    user,
    courses,
    vocabulary,
    testAttempts,
    setActiveTab,
    setSelectedLesson,
    language
  } = useApp();

  const { totalCompletedLessons, avgAccuracy, dueVocabCount, masteredVocabCount, nextLessonInfo, dueVocabList } = React.useMemo(() => {
    const completed = courses.reduce((acc, c) => acc + c.completedLessons, 0);
    const accuracy = testAttempts.length > 0
      ? Math.round(testAttempts.reduce((acc, t) => acc + t.accuracy, 0) / testAttempts.length)
      : 0;

    const dueItems = vocabulary.filter((v) => v.status === 'learning');
    const due = dueItems.length;
    const mastered = vocabulary.filter((v) => v.status === 'mastered').length;

    let nextLesson: { course: any; lesson: any } | null = null;
    for (const c of courses) {
      for (const m of c.modules) {
        for (const l of m.lessons) {
          if (!l.isCompleted && !l.isLocked) {
            nextLesson = { course: c, lesson: l };
            break;
          }
        }
        if (nextLesson) break;
      }
      if (nextLesson) break;
    }
    if (!nextLesson) {
      const firstCourse = courses[0];
      const firstLesson = firstCourse?.modules[0]?.lessons[0];
      nextLesson = { course: firstCourse, lesson: firstLesson };
    }

    return {
      totalCompletedLessons: completed,
      avgAccuracy: accuracy,
      dueVocabCount: due,
      masteredVocabCount: mastered,
      dueVocabList: dueItems.slice(0, 3),
      nextLessonInfo: nextLesson
    };
  }, [courses, testAttempts, vocabulary]);

  const todayMinutes = getTodayMinutesSpent(user);
  const dailyGoal = user.dailyMinutesGoal > 0 ? user.dailyMinutesGoal : 30;
  const dailyProgressPct = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));
  const nextLevel = user.levelNumber + 1;

  const handleContinueLesson = () => {
    if (nextLessonInfo.course && nextLessonInfo.lesson) {
      setSelectedLesson({ courseId: nextLessonInfo.course.id, lessonId: nextLessonInfo.lesson.id });
      setActiveTab('courses');
      return;
    }
    // Fallback to first lesson
    if (courses[0]?.modules[0]?.lessons[0]) {
      setSelectedLesson({ courseId: courses[0].id, lessonId: courses[0].modules[0].lessons[0].id });
      setActiveTab('courses');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner (Welcome + Status Bar matching Reference Image #1) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">
            LVL {user.levelNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                LVL {user.levelNumber}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                {user.level} • ENGLISH
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                {user.targetExam} {user.targetScore}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              {language === 'vi' ? `Chào mừng trở lại, ${user.name}` : `Welcome back, ${user.name}`}
            </h1>
            <p className="text-xs text-slate-500">
              {language === 'vi'
                ? `Hôm nay bạn đã tích lũy ${todayMinutes} phút học tập • Giữ vững phong độ!`
                : `${todayMinutes} minutes studied today • Keep your momentum!`}
            </p>
          </div>
        </div>

        {/* Level XP Progress & Quick Action */}
        <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div className="min-w-44">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span>{language === 'vi' ? `Tiến độ lên Level ${nextLevel}` : `XP to Level ${nextLevel}`}</span>
              <span>{user.xp % 500} / 500</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((user.xp % 500) / 500) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ai-tutor')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Coach</span>
          </button>
        </div>
      </div>

      {/* Main Section Header */}
      <div>
        <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          {language === 'vi' ? 'TỔNG QUAN HỌC TẬP HÀNG NGÀY' : 'DAILY LEARNING OVERVIEW'}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mt-1">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {language === 'vi' ? 'Nhịp học tập sẵn sàng tiếp nối.' : 'Your learning rhythm, ready to resume.'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'vi'
                ? 'Tiếp tục bài học dở dang, quan sát đà tiến bộ và bước vào luyện tập kỹ năng mà không có trở ngại.'
                : 'Continue the right lesson, glance at your momentum, and jump into practice without friction.'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('ai-tutor')}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{language === 'vi' ? 'Khởi động cùng AI' : 'Start with AI'}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Image #1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Study time */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              {language === 'vi' ? 'THỜI GIAN HỌC' : 'STUDY TIME'}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{user.totalMinutesStudied}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{language === 'vi' ? 'PHÚT ĐÃ TÍCH LŨY' : 'MINUTES'}</div>
          </div>
        </div>

        {/* Stat 2: Streak */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </span>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              {language === 'vi' ? 'CHUỖI NGÀY' : 'STREAK'}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{user.currentStreak}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{language === 'vi' ? 'NGÀY LIÊN TIẾP' : 'DAYS'}</div>
          </div>
        </div>

        {/* Stat 3: Lessons Completed */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              {language === 'vi' ? 'BÀI ĐÃ XONG' : 'COMPLETED'}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{totalCompletedLessons}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{language === 'vi' ? 'BÀI HỌC HOÀN THÀNH' : 'LESSONS DONE'}</div>
          </div>
        </div>

        {/* Stat 4: Quiz Accuracy */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              {language === 'vi' ? 'ĐỘ CHÍNH XÁC' : 'ACCURACY'}
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{avgAccuracy}%</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{language === 'vi' ? 'TỔNG ĐIỂM TRẮC NGHIỆM' : 'QUIZ SCORE'}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left side Continue Lesson + Right side Guide Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Continue Lesson Card & Quick Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Continue Lesson Card matching Reference Image #1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                  {totalCompletedLessons === 0
                    ? (language === 'vi' ? 'BẮT ĐẦU BÀI HỌC' : 'START LESSON')
                    : (language === 'vi' ? 'TIẾP TỤC BÀI HỌC' : 'CONTINUE LESSON')}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {nextLessonInfo.lesson?.durationMinutes || 15} MIN
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {language === 'vi' ? `Cấp độ ${nextLessonInfo.course?.level || 'A1'}` : `Level ${nextLessonInfo.course?.level || 'A1'}`}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              {nextLessonInfo.lesson?.titleVi || nextLessonInfo.lesson?.title || 'Daily Routines & Time Management'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {nextLessonInfo.lesson?.theoryContent?.explanationVi || nextLessonInfo.course?.descriptionVi || 'Bắt đầu bài học để tích lũy kiến thức và mở khóa các chặng tiếp theo.'}
            </p>

            {/* Target Progress Bar */}
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>{language === 'vi' ? 'Mục tiêu hôm nay' : "Today's target"}</span>
                <span>{todayMinutes} / {dailyGoal} min</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${dailyProgressPct}%` }}
                />
              </div>
            </div>

            {/* Lifetime XP banner */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{language === 'vi' ? 'Tổng điểm XP tích lũy' : 'Total XP earned'}</span>
              </div>
              <span className="font-bold text-slate-900">{user.xp} XP</span>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={handleContinueLesson}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>
                  {totalCompletedLessons === 0
                    ? (language === 'vi' ? 'Bắt đầu học ngay' : 'Start Lesson')
                    : (language === 'vi' ? 'Học tiếp ngay' : 'Continue')}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                {language === 'vi' ? 'Chi tiết khóa học' : 'Lesson detail'}
              </button>
            </div>
          </div>

          {/* Quick Shortcuts to 4 Skills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => setActiveTab('listening')}
              className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit group-hover:scale-105 transition-transform">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 mt-2">{language === 'vi' ? 'Luyện Nghe' : 'Listening'}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{language === 'vi' ? 'Hội thoại & Transcript' : 'Audio labs'}</div>
            </div>

            <div
              onClick={() => setActiveTab('speaking')}
              className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit group-hover:scale-105 transition-transform">
                <Mic className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 mt-2">{language === 'vi' ? 'Luyện Nói' : 'Speaking'}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{language === 'vi' ? 'Ghi âm & Chấm điểm' : 'Mic recognition'}</div>
            </div>

            <div
              onClick={() => setActiveTab('vocabulary')}
              className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg w-fit group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 mt-2">{language === 'vi' ? 'Flashcards' : 'Flashcards'}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{dueVocabCount} {language === 'vi' ? 'từ cần ôn tập' : 'due review'}</div>
            </div>

            <div
              onClick={() => setActiveTab('practice-tests')}
              className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-800 mt-2">{language === 'vi' ? 'Luyện Đề' : 'Mock Tests'}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{language === 'vi' ? 'IELTS & TOEIC' : 'Timed exams'}</div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Guide Pulse & Flashcards Due */}
        <div className="space-y-6">
          {/* Guide Pulse Card matching Reference Image #1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                GUIDE PULSE
              </div>
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-slate-800">
                  {language === 'vi'
                    ? 'Giữ buổi học nhẹ nhàng và liền mạch.'
                    : 'Keep the session light and keep it moving.'}
                </p>
                <div className="text-[11px] text-blue-700 mt-1 font-medium">
                  English • {user.level} {user.targetExam} focus
                </div>
              </div>
            </div>

            {/* Today's cue */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'vi' ? 'Gợi ý hôm nay' : "Today's cue"}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'vi'
                  ? dueVocabCount > 0
                    ? `Bạn có ${dueVocabCount} từ vựng Spaced Repetition cần củng cố và bài học mới đang chờ.`
                    : 'Bạn chưa có từ vựng đến hạn ôn tập hôm nay. Hãy học bài mới để nạp thêm từ vựng!'
                  : dueVocabCount > 0
                    ? `${dueVocabCount} vocabulary words due for review and lessons ready.`
                    : 'No words due for review right now. Complete a lesson to add vocabulary!'}
              </p>
              <button
                onClick={() => setActiveTab('speaking')}
                className="mt-3 w-full py-2 bg-white border border-slate-200 hover:border-blue-400 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'vi' ? 'Bắt đầu luyện nói' : 'Start speaking practice'}</span>
              </button>
            </div>

            {/* Spaced Repetition Vocabulary Queue */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                <span>{language === 'vi' ? 'Từ vựng cần ôn tập' : 'Words due for review'}</span>
                <span className="text-xs text-blue-600 font-semibold cursor-pointer" onClick={() => setActiveTab('vocabulary')}>
                  {language === 'vi' ? 'Xem hết' : 'View all'}
                </span>
              </div>
              <div className="space-y-2">
                {dueVocabList.length > 0 ? (
                  dueVocabList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl hover:bg-blue-50/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{item.word}</span>
                          <span className="text-[10px] text-slate-400">{item.ipa}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-44">{item.viMeaning}</div>
                      </div>
                      <button
                        onClick={() => speakEnglish(item.word)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 italic px-1">
                    {language === 'vi'
                      ? 'Chưa có từ vựng nào đang trong tiến trình ôn tập.'
                      : 'No vocabulary is currently in review.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick AI Advice Box */}
          <div className="p-4 bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-200 mb-2">
              <BrainCircuit className="w-4 h-4 text-blue-300" />
              <span>{language === 'vi' ? 'LỜI KHUYÊN TỪ AI TUTOR' : 'AI TUTOR RECOMMENDATION'}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {language === 'vi'
                ? `Với trình độ ${user.level} hướng tới ${user.targetExam}, hãy thay thế các từ nối đơn giản (so, because) bằng cấu trúc phân từ hoặc câu điều kiện hỗn hợp để nâng band Writing & Speaking.`
                : `At your ${user.level} level targeting ${user.targetExam}, practice incorporating advanced participial clauses and topic-specific academic collocations into your writing.`}
            </p>
            <button
              onClick={() => setActiveTab('ai-tutor')}
              className="mt-3 text-xs font-bold text-blue-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>{language === 'vi' ? 'Hỏi thêm AI Tutor' : 'Consult AI Tutor'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
