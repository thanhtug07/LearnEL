import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  FileCheck2,
  Clock,
  Sparkles,
  Play,
  Briefcase,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  Award
} from 'lucide-react';

export const TOEICPreparationView: React.FC = () => {
  const { setActiveTab, setActiveExamId, language } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'reading' | 'listening' | 'vocabulary'>('reading');

  const practices = [
    {
      id: 'prac-1',
      tag: 'READING COMPREHENSION',
      tagColor: 'bg-blue-50 text-blue-700',
      title: 'Business Articles & Memorandums',
      titleVi: 'Bài đọc báo chí kinh doanh & Bản ghi nhớ nội bộ',
      metric: '3 passages • 15 questions',
      progress: 75,
      testId: 'test-toeic-reading-750'
    },
    {
      id: 'prac-2',
      tag: 'TEXT COMPLETION',
      tagColor: 'bg-emerald-50 text-emerald-700',
      title: 'Emails & Corporate Notices',
      titleVi: 'Thư điện tử giao dịch & Thông báo doanh nghiệp',
      metric: '2 sets • 8 questions',
      progress: 60,
      testId: 'test-toeic-reading-750'
    },
    {
      id: 'prac-3',
      tag: 'PART 5 GRAMMAR',
      tagColor: 'bg-purple-50 text-purple-700',
      title: 'High-Frequency ETS Words & Suffix Traps',
      titleVi: 'Từ vựng cốt lõi ETS & Bẫy đuôi từ loại',
      metric: '20 questions • 12 minutes',
      progress: 40,
      testId: 'test-toeic-reading-750'
    }
  ];

  const handleStartPractice = (testId: string) => {
    setActiveExamId(testId);
    setActiveTab('practice-tests');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Hero Header matching Reference Image #2 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              ETS
            </div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              TOEIC TARGET 750+ - 990
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            TOEIC Reading & Listening Practice
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Build skills. Boost scores. Achieve your career target. Rèn luyện kỹ năng giải đề ETS thực chiến, nắm chắc bẫy Part 5 và phương pháp quét thông tin Part 7.
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
            <span className="flex items-center gap-1.5 text-amber-600">
              <Award className="w-4 h-4" />
              <span>Chuẩn Format ETS 2026</span>
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">Thang điểm 990</span>
          </div>
        </div>

        {/* Hero Illustration Card */}
        <div className="w-full md:w-72 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 rounded-2xl border border-blue-100 text-center space-y-3 shrink-0">
          <div className="text-xs font-bold text-blue-900 uppercase">TIẾN ĐỘ CHUẨN BỊ</div>
          <div className="text-3xl font-black text-blue-600">750+</div>
          <p className="text-[11px] text-slate-500">Mục tiêu hiện tại của bạn: Đạt mức điểm làm việc tại các tập đoàn đa quốc gia.</p>
          <button
            onClick={() => handleStartPractice('test-toeic-reading-750')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Làm Đề Thi Thử Ngay →
          </button>
        </div>
      </div>

      {/* Subcategory Switcher matching Reference Image #2 */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          CHỌN DẠNG LUYỆN TẬP (CHOOSE A PRACTICE)
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'vocabulary', label: 'Từ vựng ETS (Vocabulary)' },
            { id: 'grammar', label: 'Bẫy ngữ pháp Part 5 (Grammar)' },
            { id: 'reading', label: 'Đọc hiểu Part 7 (Reading Comprehension)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabSub(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeTabSub === tab.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended for You Cards matching Reference Image #2 */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          ĐƯỢC ĐỀ XUẤT CHO BẠN (RECOMMENDED FOR YOU)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {practices.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="space-y-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${item.tagColor}`}>
                  {item.tag}
                </span>

                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <div className="text-xs text-slate-500">{item.titleVi}</div>

                <div className="text-[11px] text-slate-400">{item.metric}</div>

                {/* Progress bar matching Image #2 */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>Tiến độ</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-3 border-t border-slate-100">
                <button
                  onClick={() => handleStartPractice(item.testId)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Bắt đầu luyện tập →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-frequency Business Vocabulary list */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Từ Vựng Doanh Nghiệp Hay Xuất Hiện Trong Đề Thi TOEIC</span>
          </h3>
          <span className="text-xs text-blue-600 font-bold cursor-pointer" onClick={() => setActiveTab('vocabulary')}>
            Xem tất cả trong Flashcards →
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { word: 'lucrative', ipa: '/ˈluːkrətɪv/', vi: 'sinh lời cao' },
            { word: 'discrepancy', ipa: '/dɪˈskrepənsi/', vi: 'sự sai lệch' },
            { word: 'in compliance with', ipa: '/kəmˈplaɪəns/', vi: 'tuân thủ theo' },
            { word: 'preliminary', ipa: '/prɪˈlɪmɪnəri/', vi: 'sơ bộ, ban đầu' }
          ].map((item, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="font-bold text-slate-900">{item.word}</div>
              <div className="text-[11px] text-slate-400 font-mono">{item.ipa}</div>
              <div className="text-[11px] text-blue-700 font-semibold mt-0.5">{item.vi}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
