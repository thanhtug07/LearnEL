import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, Lesson } from '../../types';
import { LessonPlayerModal } from './LessonPlayerModal';
import {
  GraduationCap,
  Clock,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const CoursesView: React.FC = () => {
  const {
    courses,
    selectedLesson,
    setSelectedLesson,
    language
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [expandedCourseId, setExpandedCourseId] = useState<string>(courses[0]?.id || '');
  const [activeLessonToPlay, setActiveLessonToPlay] = useState<{ lesson: Lesson; courseId: string } | null>(null);

  // If selectedLesson is passed from Dashboard, open it
  React.useEffect(() => {
    if (selectedLesson) {
      const course = courses.find((c) => c.id === selectedLesson.courseId);
      if (course) {
        for (const mod of course.modules) {
          const l = mod.lessons.find((les) => les.id === selectedLesson.lessonId);
          if (l) {
            setActiveLessonToPlay({ lesson: l, courseId: course.id });
            setExpandedCourseId(course.id);
            break;
          }
        }
      }
      setSelectedLesson(null);
    }
  }, [selectedLesson, courses, setSelectedLesson]);

  const categories = ['All', 'Communication', 'IELTS', 'TOEIC', 'Grammar'];
  const levels = ['All', 'A1', 'A2', 'B1', 'B2', 'C1'];

  const filteredCourses = courses.filter((c) => {
    const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchLvl = selectedLevel === 'All' || c.level === selectedLevel;
    return matchCat && matchLvl;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {language === 'vi' ? 'Khóa Học & Lộ Trình Chi Tiết' : 'Courses & Lesson Directory'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {language === 'vi'
            ? 'Các khóa học bài bản từ A1 đến C1, bám sát cấu trúc đề thi IELTS & TOEIC quốc tế.'
            : 'Structured curriculum across CEFR levels and target exams with interactive exercises.'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Levels */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                selectedLevel === lvl
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-5">
        {filteredCourses.map((course) => {
          const isExpanded = expandedCourseId === course.id;
          const totalLessons = course.modules.flatMap((m) => m.lessons).length;
          const completedCount = course.modules.flatMap((m) => m.lessons).filter((l) => l.isCompleted).length;
          const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
            >
              {/* Course Header Banner */}
              <div
                onClick={() => setExpandedCourseId(isExpanded ? '' : course.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                        {course.level} • {course.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.estimatedHours}h học</span>
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {course.titleVi || course.title}
                    </h2>
                    <p className="text-xs text-slate-500 max-w-xl line-clamp-2">
                      {course.descriptionVi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">{progressPct}% Hoàn thành</div>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-2 text-slate-400 hover:text-slate-700">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Modules & Lessons Section (when expanded) */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/40 p-5 space-y-4">
                  {course.modules.map((module, mIndex) => (
                    <div key={module.id} className="bg-white rounded-xl border border-slate-200/70 p-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          Module {mIndex + 1}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800">{module.titleVi}</h3>
                        <p className="text-xs text-slate-500">{module.descriptionVi}</p>
                      </div>

                      {/* Lessons Grid */}
                      <div className="space-y-2 pt-1">
                        {module.lessons.map((lesson, lIndex) => {
                          return (
                            <div
                              key={lesson.id}
                              onClick={() => {
                                if (!lesson.isLocked) {
                                  setActiveLessonToPlay({ lesson, courseId: course.id });
                                }
                              }}
                              className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                lesson.isCompleted
                                  ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50'
                                  : lesson.isLocked
                                  ? 'bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed'
                                  : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                    lesson.isCompleted
                                      ? 'bg-emerald-600 text-white'
                                      : lesson.isLocked
                                      ? 'bg-slate-300 text-slate-600'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {lesson.isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : lesson.isLocked ? (
                                    <Lock className="w-3.5 h-3.5" />
                                  ) : (
                                    lIndex + 1
                                  )}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900">{lesson.title}</div>
                                  <div className="text-[11px] text-slate-500">{lesson.titleVi}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {lesson.durationMinutes} min • +{lesson.xpReward} XP
                                </span>
                                {!lesson.isLocked && (
                                  <button className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors">
                                    {lesson.isCompleted ? 'Học lại' : 'Bắt đầu'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lesson Player Modal */}
      {activeLessonToPlay && (
        <LessonPlayerModal
          lesson={activeLessonToPlay.lesson}
          courseId={activeLessonToPlay.courseId}
          onClose={() => setActiveLessonToPlay(null)}
        />
      )}
    </div>
  );
};
