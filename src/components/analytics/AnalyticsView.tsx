import React, { useState } from 'react';
import { useApp, getTodayMinutesSpent } from '../../context/AppContext';
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

  // Attempts within the selected time window (used for every attempt-derived metric)
  const scopedAttempts = React.useMemo(() => {
    if (timeFilter === 'all') return testAttempts;
    const windowDays = timeFilter === '7d' ? 7 : 30;
    const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
    return testAttempts.filter((t) => {
      const ts = new Date(t.completedAt || t.date).getTime();
      return Number.isFinite(ts) ? ts >= cutoff : true;
    });
  }, [testAttempts, timeFilter]);

  // Real weekly study minutes for the current week (Mon..Sun). Only today's value
  // is known precisely; previous days are 0 because no per-day history is stored.
  const { weeklyDays, maxMins } = React.useMemo(() => {
    const labels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    const jsDay = new Date().getDay(); // 0 = Sunday .. 6 = Saturday
    const todayIndex = (jsDay + 6) % 7; // 0 = Monday
    const todayMinutes = getTodayMinutesSpent(user);
    const days = labels.map((label, idx) => ({
      day: idx === todayIndex ? `${label} (Hôm nay)` : label,
      mins: idx === todayIndex ? todayMinutes : 0
    }));
    return { weeklyDays: days, maxMins: Math.max(...days.map((d) => d.mins), 30) };
  }, [user]);

  const hasWeeklyActivity = weeklyDays.some((d) => d.mins > 0);

  // Skill masteries derived from actual user activities (memoized)
  const { skills, hasActivity, avgAccuracy, allWeaknesses } = React.useMemo(() => {
    const vocabMastery = Math.round(
      (vocabulary.filter((v) => v.status === 'mastered').length / Math.max(1, vocabulary.length)) * 100
    );
    const grammarMastery = Math.round(
      grammarTopics.reduce((acc, g) => acc + g.masteryPercentage, 0) / Math.max(1, grammarTopics.length)
    );
    const completedLessonCount = courses.reduce((acc, c) => acc + c.completedLessons, 0);

    // Aggregate only objectively graded skill scores. Pending (speaking/writing)
    // evaluations are submission-progress, not accuracy, so they are excluded.
    const agg: Record<string, { sum: number; count: number }> = {};
    for (const attempt of scopedAttempts) {
      if (!attempt.skillScores) continue;
      for (const [skillKey, info] of Object.entries(attempt.skillScores)) {
        if (!info || info.status !== 'graded' || typeof info.percentage !== 'number') continue;
        const key = skillKey.toLowerCase();
        if (!agg[key]) agg[key] = { sum: 0, count: 0 };
        agg[key].sum += info.percentage;
        agg[key].count += 1;
      }
    }
    const skillScore = (key: string): number => {
      const entry = agg[key];
      return entry && entry.count > 0 ? Math.round(entry.sum / entry.count) : 0;
    };

    const accuracy = scopedAttempts.length > 0
      ? Math.round(scopedAttempts.reduce((acc, t) => acc + t.accuracy, 0) / scopedAttempts.length)
      : 0;

    const skillsList = [
      { name: 'Listening (Nghe hiểu)', score: skillScore('listening'), color: 'bg-blue-600' },
      { name: 'Speaking (Phát âm & Phản xạ)', score: skillScore('speaking'), color: 'bg-emerald-600' },
      { name: 'Reading (Đọc hiểu học thuật)', score: skillScore('reading'), color: 'bg-indigo-600' },
      { name: 'Writing (Ngữ pháp & Lập luận)', score: skillScore('writing'), color: 'bg-purple-600' },
      { name: 'Vocabulary (Từ vựng Spaced Repetition)', score: vocabMastery, color: 'bg-amber-500' },
      { name: 'Grammar (Độ chuẩn xác ngữ pháp)', score: grammarMastery, color: 'bg-rose-500' }
    ];

    const weaknesses = Array.from(
      new Set(scopedAttempts.flatMap((t) => t.weaknessAnalysisVi || []))
    );

    return {
      skills: skillsList,
      hasActivity: scopedAttempts.length > 0 || completedLessonCount > 0,
      avgAccuracy: accuracy,
      allWeaknesses: weaknesses
    };
  }, [vocabulary, grammarTopics, courses, scopedAttempts]);

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
            {avgAccuracy}%
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

        {!hasWeeklyActivity && (
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
