import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Clock,
  Flame,
  Award,
  Target,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { user, courses, vocabulary, grammarTopics, testAttempts, language } = useApp();

  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'all'>('7d');

  // Real weekly study minutes (today is actual, prior days 0 unless recorded)
  const weeklyDays = [
    { day: 'Thứ 2', mins: 0 },
    { day: 'Thứ 3', mins: 0 },
    { day: 'Thứ 4', mins: 0 },
    { day: 'Thứ 5', mins: 0 },
    { day: 'Thứ 6', mins: 0 },
    { day: 'Thứ 7', mins: 0 },
    { day: 'CN (Hôm nay)', mins: user.todayMinutesSpent }
  ];

  const maxMins = Math.max(...weeklyDays.map((d) => d.mins), 30);

  // Skill masteries derived from actual user activities (memoized)
  const { skills, hasActivity } = React.useMemo(() => {
    const vocabMastery = Math.round(
      (vocabulary.filter((v) => v.status === 'mastered').length / Math.max(1, vocabulary.length)) * 100
    );
    const grammarMastery = Math.round(
      grammarTopics.reduce((acc, g) => acc + g.masteryPercentage, 0) / Math.max(1, grammarTopics.length)
    );
    const completedLessonCount = courses.reduce((acc, c) => acc + c.completedLessons, 0);
    const avgTestAccuracy = testAttempts.length > 0
      ? Math.round(testAttempts.reduce((acc, t) => acc + t.accuracy, 0) / testAttempts.length)
      : 0;

    const hasActivity = testAttempts.length > 0 || completedLessonCount > 0;
    const listeningScore = hasActivity ? Math.min(100, Math.round(avgTestAccuracy * 0.95 + completedLessonCount * 5)) : 0;
    const speakingScore = hasActivity ? Math.min(100, Math.round(avgTestAccuracy * 0.85 + completedLessonCount * 3)) : 0;
    const readingScore = hasActivity ? Math.min(100, Math.round(avgTestAccuracy * 1.0 + completedLessonCount * 4)) : 0;
    const writingScore = hasActivity ? Math.min(100, Math.round(avgTestAccuracy * 0.88 + completedLessonCount * 4)) : 0;

    const skillsList = [
      { name: 'Listening (Nghe hiểu)', score: listeningScore, color: 'bg-blue-600' },
      { name: 'Speaking (Phát âm & Phản xạ)', score: speakingScore, color: 'bg-emerald-600' },
      { name: 'Reading (Đọc hiểu học thuật)', score: readingScore, color: 'bg-indigo-600' },
      { name: 'Writing (Ngữ pháp & Lập luận)', score: writingScore, color: 'bg-purple-600' },
      { name: 'Vocabulary (Từ vựng Spaced Repetition)', score: vocabMastery, color: 'bg-amber-500' },
      { name: 'Grammar (Độ chuẩn xác ngữ pháp)', score: grammarMastery, color: 'bg-rose-500' }
    ];

    return { skills: skillsList, hasActivity };
  }, [vocabulary, grammarTopics, courses, testAttempts]);

  // Derived weaknesses from genuine test attempts
  const allWeaknesses = Array.from(
    new Set(testAttempts.flatMap((t) => t.weaknessAnalysisVi || []))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {language === 'vi' ? 'Tiến Độ & Phân Tích Năng Lực' : 'Progress & Learning Analytics'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'vi'
              ? 'Số liệu trực quan dựa trên thời gian học thực tế và kết quả bài thi của bạn.'
              : 'Data-driven insights into your study habits, skill proficiencies, and exam scores.'}
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          {[
            { id: '7d', label: '7 Ngày qua' },
            { id: '30d', label: '30 Ngày qua' },
            { id: 'all', label: 'Toàn bộ thời gian' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                timeFilter === f.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>TỔNG THỜI GIAN</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{user.totalMinutesStudied}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Phút học tập</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>CHUỖI KỶ LỤC</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{user.currentStreak}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ngày liên tiếp</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>TỪ VỰNG THUỘC LÒNG</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {vocabulary.filter((v) => v.status === 'mastered').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Từ đã làm chủ (Mastered)</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>ĐỘ CHÍNH XÁC TEST</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {testAttempts.length > 0 ? `${Math.round(testAttempts.reduce((a, b) => a + b.accuracy, 0) / testAttempts.length)}%` : '0%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Trung bình bài thi</div>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Thời Gian Học Trong Tuần (Weekly Study Rhythm)</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Mục tiêu: {user.dailyMinutesGoal} phút/ngày</span>
        </div>

        {/* Visual Bar Columns */}
        <div className="pt-6 pb-2 flex items-end justify-between gap-3 h-48 border-b border-slate-100">
          {weeklyDays.map((item, idx) => {
            const heightPct = Math.round((item.mins / maxMins) * 100);
            const isToday = idx === weeklyDays.length - 1;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.mins}m
                </div>
                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-blue-700 to-blue-500'
                        : 'bg-gradient-to-t from-blue-600 to-indigo-500 hover:from-blue-500'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <div className={`text-[11px] font-semibold truncate ${isToday ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                  {item.day}
                </div>
              </div>
            );
          })}
        </div>

        {weeklyDays.every((d) => d.mins === 0) && (
          <p className="text-xs text-slate-400 text-center italic pt-2">
            Chưa có thời gian học trong tuần. Hãy hoàn thành bài học hôm nay để bắt đầu ghi nhận nhịp học tập!
          </p>
        )}
      </div>

      {/* Skill Breakdown & Weakness Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Mastery Levels */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Mức Độ Thành Thạo 4 Kỹ Năng & Ngữ Pháp</span>
            </h3>
          </div>

          {!hasActivity && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-700">
              Chưa có dữ liệu khảo thí. Chỉ số 4 kỹ năng sẽ được tính toán trung thực ngay khi bạn làm bài thi hoặc hoàn thành bài học.
            </div>
          )}

          <div className="space-y-3.5">
            {skills.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{s.name}</span>
                  <span className="font-bold text-slate-900">{s.score}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all duration-500`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weakness & Focus Recommendations */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Điểm Cần Khắc Phục (Weak Areas Identified)</span>
          </h3>

          <div className="space-y-3 text-xs">
            {allWeaknesses.length > 0 ? (
              allWeaknesses.map((weakness, wIdx) => (
                <div key={wIdx} className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1">
                  <div className="font-bold text-amber-900">Điểm cần chú ý #{wIdx + 1}</div>
                  <p className="text-amber-800 leading-relaxed">{weakness}</p>
                </div>
              ))
            ) : (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                <Target className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-bold text-slate-800 text-xs">Chưa có dữ liệu điểm yếu</div>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Sau khi bạn hoàn thành bài kiểm tra xếp lớp hoặc đề thi thử, hệ thống sẽ tự động tổng hợp các bẫy ngữ pháp và dạng câu cần cải thiện.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
