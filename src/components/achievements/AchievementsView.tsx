import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  BookOpen,
  Mic,
  CheckCircle2,
  Sparkles,
  Lock
} from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const { achievements, language } = useApp();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return Flame;
      case 'Zap': return Zap;
      case 'BookOpen': return BookOpen;
      case 'Award': return Award;
      case 'Mic': return Mic;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {language === 'vi' ? 'Huy Hiệu & Thành Tựu Học Tập' : 'Achievements & Milestones'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'vi'
              ? 'Ghi nhận các cột mốc thực tế dựa trên sự chuyên cần và kết quả kiểm tra của bạn.'
              : 'Meaningful achievements awarded upon verified learning accomplishments.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-bold text-slate-800">
            Đã mở khóa: {unlockedCount} / {achievements.length} huy hiệu
          </span>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {achievements.map((ach) => {
          const Icon = getIcon(ach.iconName);
          const max = Math.max(1, ach.maxProgress);
          // Keep the badge and the bar consistent: an unlocked achievement always
          // shows full progress instead of a contradictory "0 / 1".
          const progress = ach.unlocked ? Math.max(ach.progress, max) : ach.progress;
          const percent = Math.min(100, Math.round((progress / max) * 100));

          return (
            <div
              key={ach.id}
              className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                ach.unlocked
                  ? 'bg-white border-amber-300/80 shadow-sm ring-1 ring-amber-300/30'
                  : 'bg-white/60 border-slate-200/80 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      ach.unlocked
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {ach.unlocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ĐÃ ĐẠT</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>CHƯA MỞ</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{ach.titleVi}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ach.descVi}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-5 mt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>Tiến độ</span>
                  <span>{progress} / {ach.maxProgress}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.unlocked ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
