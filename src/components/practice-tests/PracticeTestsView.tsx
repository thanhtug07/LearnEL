import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PracticeTest } from '../../types';
const ExamEngineModal = React.lazy(() => import('./ExamEngineModal').then((m) => ({ default: m.ExamEngineModal })));
const QuestionBankPipelineView = React.lazy(() => import('./QuestionBankPipelineView').then((m) => ({ default: m.QuestionBankPipelineView })));
import {
  FileCheck2,
  Clock,
  Award,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Filter,
  BarChart2,
  ShieldCheck
} from 'lucide-react';

export const PracticeTestsView: React.FC = () => {
  const { practiceTests, testAttempts, activeExamId, setActiveExamId, language } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'practice' | 'pipeline'>('practice');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTestToRun, setActiveTestToRun] = useState<PracticeTest | null>(null);

  // If activeExamId is set externally (e.g. from TOEIC or IELTS tabs)
  React.useEffect(() => {
    if (activeExamId) {
      const test = practiceTests.find((t) => t.id === activeExamId);
      if (test) setActiveTestToRun(test);
      setActiveExamId(null);
    }
  }, [activeExamId, practiceTests, setActiveExamId]);

  const filteredTests = practiceTests.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* View Switcher: Practice vs QA Pipeline */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs w-fit">
        <button
          onClick={() => setActiveSubTab('practice')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'practice'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          {language === 'vi' ? 'Đề Thi Thực Chiến & Làm Đề' : 'Practice Exams'}
        </button>

        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'pipeline'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          {language === 'vi' ? 'Quy Trình Kiểm Định QA Ngân Hàng Đề' : 'Question Quality Pipeline'}
        </button>
      </div>

      {activeSubTab === 'pipeline' ? (
        <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Đang tải bộ dữ liệu kiểm định...</div>}>
          <QuestionBankPipelineView />
        </React.Suspense>
      ) : (
        <>
          {/* Header Banner matching Reference Image #2 */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-xs rounded-lg text-xs font-bold uppercase tracking-wider text-blue-100">
              EXAMINATION LAB
            </span>
            <span className="text-xs text-blue-200">Chuẩn hóa cấu trúc ETS & Cambridge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'vi' ? 'Trung Tâm Luyện Đề & Đánh Giá Năng Lực' : 'Practice Test Engine & Assessments'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            {language === 'vi'
              ? 'Rèn luyện áp lực thời gian, phát hiện lỗ hổng ngữ pháp và làm quen với 100% dạng câu hỏi thi thật.'
              : 'Timed examinations with detailed rationale, topic weakness analysis, and score tracking.'}
          </p>
        </div>

        <div className="flex items-center gap-4 z-10 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-32">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {testAttempts.length}
            </div>
            <div className="text-[10px] text-blue-100 font-bold uppercase mt-0.5">
              {language === 'vi' ? 'LƯỢT THI ĐÃ LÀM' : 'ATTEMPTS'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs matching Reference Image #2 */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        {[
          { id: 'all', labelVi: 'Tất cả bài thi', labelEn: 'All Tests' },
          { id: 'placement_test', labelVi: 'Kiểm tra xếp lớp', labelEn: 'Placement Test' },
          { id: 'full_toeic', labelVi: 'Đề thi TOEIC', labelEn: 'TOEIC Practice' },
          { id: 'full_ielts', labelVi: 'Đề thi IELTS', labelEn: 'IELTS Practice' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filterType === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'vi' ? tab.labelVi : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Recommended for You Grid matching Reference Image #2 */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          {language === 'vi' ? 'ĐỀ THI ĐƯỢC ĐỀ XUẤT CHO BẠN' : 'RECOMMENDED FOR YOU'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTests.map((test) => {
            const pastAttempt = testAttempts.find((a) => a.testId === test.id);

            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md uppercase">
                      {test.targetLevel}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{test.durationMinutes} phút</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{test.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {test.descriptionVi}
                    </p>
                  </div>

                  {/* Test parameters */}
                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>{test.totalQuestions} câu hỏi</span>
                    </div>
                    {pastAttempt && (
                      <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Điểm gần nhất: {pastAttempt.accuracy}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {pastAttempt ? `Đã làm: ${pastAttempt.date}` : 'Chưa làm lần nào'}
                  </div>

                  <button
                    onClick={() => setActiveTestToRun(test)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{pastAttempt ? 'Thi lại ngay' : 'Vào phòng thi'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Attempt History Section */}
      {testAttempts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>{language === 'vi' ? 'Lịch Sử Làm Bài Gần Đây' : 'Recent Attempt History'}</span>
            </h3>
            <span className="text-xs text-slate-400">{testAttempts.length} lượt thi</span>
          </div>

          <div className="divide-y divide-slate-100">
            {testAttempts.map((att) => (
              <div key={att.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-800">{att.testTitle}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {att.date} • {Math.round(att.timeSpentSeconds / 60)} phút • {att.score}/{att.totalQuestions} câu đúng
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
                      att.accuracy >= 80
                        ? 'bg-emerald-50 text-emerald-700'
                        : att.accuracy >= 60
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {att.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}

      {/* Exam Runner Modal */}
      {activeTestToRun && (
        <React.Suspense fallback={null}>
          <ExamEngineModal
            test={activeTestToRun}
            onClose={() => setActiveTestToRun(null)}
          />
        </React.Suspense>
      )}
    </div>
  );
};
