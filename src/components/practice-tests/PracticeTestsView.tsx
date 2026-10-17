import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { PracticeTest, TestAttempt } from '../../types';
import {
  loadExamSession,
  calculateRemainingSeconds,
  formatTimer,
  ExamSession
} from '../../utils/examEngine';
import {
  classifyTestCategory,
  isTestValidAndAuthentic,
  computeCategoryInventories,
  ExamHubCategoryKey
} from '../../services/examPipelineService';
import {
  FileCheck2,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Filter,
  ShieldCheck,
  Search,
  Trophy,
  Target,
  ChevronRight,
  ChevronLeft,
  X,
  History,
  Timer,
  Layers,
  GraduationCap,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { EmptyState, ViewLoadingFallback } from '../common/ViewFeedbackStates';
import { AuthModal } from '../auth/AuthModal';

const ExamEngineModal = React.lazy(() => import('./ExamEngineModal').then((m) => ({ default: m.ExamEngineModal })));
const QuestionBankPipelineView = React.lazy(() => import('./QuestionBankPipelineView').then((m) => ({ default: m.QuestionBankPipelineView })));

export const PracticeTestsView: React.FC = () => {
  const {
    practiceTests,
    testAttempts,
    activeExamId,
    setActiveExamId,
    language,
    user,
    firebaseUser,
    isLoggedIn
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'practice' | 'pipeline'>('practice');
  const [activeTestToRun, setActiveTestToRun] = useState<PracticeTest | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Tree Navigation Hierarchy:
  // Primary Tab: 'all' | 'toeic' | 'ielts' | 'cefr'
  const [primaryTab, setPrimaryTab] = useState<'all' | 'toeic' | 'ielts' | 'cefr'>('all');

  // Sub-category Filter Key
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<ExamHubCategoryKey>('all');

  // Secondary Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'unattempted' | 'in_progress' | 'completed'>('all');
  const [durationFilter, setDurationFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'questions_desc' | 'duration_desc' | 'duration_asc' | 'in_progress_first' | 'completed_first'>('default');

  // Pagination (12 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 12;

  // Active in-progress session map
  const [activeSessionsMap, setActiveSessionsMap] = useState<Record<string, { session: ExamSession; remainingSeconds: number }>>({});

  const refreshActiveSessions = useCallback(() => {
    const map: Record<string, { session: ExamSession; remainingSeconds: number }> = {};
    practiceTests.forEach((t) => {
      const sess = loadExamSession(t.id);
      if (sess && !sess.isSubmitted) {
        const remaining = calculateRemainingSeconds(sess);
        if (remaining > 0) {
          map[t.id] = { session: sess, remainingSeconds: remaining };
        }
      }
    });
    setActiveSessionsMap(map);
  }, [practiceTests]);

  useEffect(() => {
    refreshActiveSessions();
    const interval = setInterval(refreshActiveSessions, 5000);
    return () => clearInterval(interval);
  }, [refreshActiveSessions]);

  // Handle external exam trigger (e.g. from TOEIC or IELTS sidebar/dashboard)
  useEffect(() => {
    if (activeExamId) {
      const test = practiceTests.find((t) => t.id === activeExamId);
      if (test) setActiveTestToRun(test);
      setActiveExamId(null);
    }
  }, [activeExamId, practiceTests, setActiveExamId]);

  // Auth Guard
  const isUserAuthenticated = Boolean(
    isLoggedIn || firebaseUser || (user?.id && user.id !== 'user-guest-1' && user.email)
  );

  const handleStartExam = useCallback(
    (test: PracticeTest) => {
      if (!isUserAuthenticated) {
        setIsAuthModalOpen(true);
        return;
      }
      setActiveTestToRun(test);
    },
    [isUserAuthenticated]
  );

  // Calculate live category inventories across all tests
  const categoryInventories = useMemo(() => {
    return computeCategoryInventories(practiceTests);
  }, [practiceTests]);

  // Handle Primary Tab Change
  const handlePrimaryTabChange = (tab: 'all' | 'toeic' | 'ielts' | 'cefr') => {
    setPrimaryTab(tab);
    if (tab === 'all') setSelectedCategoryKey('all');
    else if (tab === 'toeic') setSelectedCategoryKey('toeic_2skills');
    else if (tab === 'ielts') setSelectedCategoryKey('ielts_academic');
    else if (tab === 'cefr') setSelectedCategoryKey('cefr_b1');
    setCurrentPage(1);
  };

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [primaryTab, selectedCategoryKey, statusFilter, durationFilter, searchQuery, sortBy]);

  // Filter Tests strictly according to current selection
  const filteredTests = useMemo(() => {
    return practiceTests.filter((test) => {
      const catKey = classifyTestCategory(test);

      // 1. Primary Tab & Category Filter
      if (primaryTab === 'toeic') {
        if (catKey !== 'toeic_2skills' && catKey !== 'toeic_4skills') return false;
        if (selectedCategoryKey !== 'all' && catKey !== selectedCategoryKey) return false;
      } else if (primaryTab === 'ielts') {
        if (catKey !== 'ielts_academic' && catKey !== 'ielts_general') return false;
        if (selectedCategoryKey !== 'all' && catKey !== selectedCategoryKey) return false;
      } else if (primaryTab === 'cefr') {
        if (!catKey.startsWith('cefr_')) return false;
        if (selectedCategoryKey !== 'all' && catKey !== selectedCategoryKey) return false;
      } else if (selectedCategoryKey !== 'all') {
        if (catKey !== selectedCategoryKey) return false;
      }

      // 2. Status Filter
      const hasActiveSession = Boolean(activeSessionsMap[test.id]);
      const hasCompletedAttempt = testAttempts.some((a) => a.testId === test.id);
      if (statusFilter === 'in_progress' && !hasActiveSession) return false;
      if (statusFilter === 'completed' && !hasCompletedAttempt) return false;
      if (statusFilter === 'unattempted' && (hasActiveSession || hasCompletedAttempt)) return false;

      // 3. Duration Filter
      const dur = test.durationMinutes;
      if (durationFilter === 'short' && dur >= 30) return false;
      if (durationFilter === 'medium' && (dur < 30 || dur > 60)) return false;
      if (durationFilter === 'long' && dur <= 60) return false;

      // 4. Search Filter (by title, titleVi, ID, or description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = test.title.toLowerCase().includes(q);
        const matchTitleVi = test.titleVi?.toLowerCase().includes(q) || false;
        const matchId = test.id.toLowerCase().includes(q);
        const matchDesc = test.descriptionVi?.toLowerCase().includes(q) || false;
        const matchTarget = test.targetLevel?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchTitleVi && !matchId && !matchDesc && !matchTarget) return false;
      }

      return true;
    });
  }, [practiceTests, primaryTab, selectedCategoryKey, statusFilter, durationFilter, searchQuery, activeSessionsMap, testAttempts]);

  // Sorting
  const sortedTests = useMemo(() => {
    const list = [...filteredTests];
    if (sortBy === 'questions_desc') {
      list.sort((a, b) => b.questions.length - a.questions.length);
    } else if (sortBy === 'duration_desc') {
      list.sort((a, b) => b.durationMinutes - a.durationMinutes);
    } else if (sortBy === 'duration_asc') {
      list.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (sortBy === 'in_progress_first') {
      list.sort((a, b) => {
        const aActive = activeSessionsMap[a.id] ? 1 : 0;
        const bActive = activeSessionsMap[b.id] ? 1 : 0;
        return bActive - aActive;
      });
    } else if (sortBy === 'completed_first') {
      list.sort((a, b) => {
        const aComp = testAttempts.some((att) => att.testId === a.id) ? 1 : 0;
        const bComp = testAttempts.some((att) => att.testId === b.id) ? 1 : 0;
        return bComp - aComp;
      });
    }
    return list;
  }, [filteredTests, sortBy, activeSessionsMap, testAttempts]);

  // Paginated items
  const totalPages = Math.ceil(sortedTests.length / ITEMS_PER_PAGE) || 1;
  const paginatedTests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedTests.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedTests, currentPage]);

  // Top Active Session Banner
  const topActiveSession = useMemo(() => {
    const activeTestId = Object.keys(activeSessionsMap)[0];
    if (!activeTestId) return null;
    const test = practiceTests.find((t) => t.id === activeTestId);
    if (!test) return null;
    return {
      test,
      session: activeSessionsMap[activeTestId].session,
      remainingSeconds: activeSessionsMap[activeTestId].remainingSeconds
    };
  }, [activeSessionsMap, practiceTests]);

  const activeCategoryInfo = categoryInventories[selectedCategoryKey] || categoryInventories.all;

  const resetFilters = () => {
    setSelectedCategoryKey('all');
    setStatusFilter('all');
    setDurationFilter('all');
    setSearchQuery('');
    setSortBy('default');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-2 sm:px-4">
      {/* Top Switcher: Practice Hub vs Pipeline */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveSubTab('practice')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'practice'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Phòng Thi & Luyện Đề Chuẩn</span>
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
            <span>Kiểm Định & Nhập Đề (Pipeline)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{practiceTests.length} bộ đề đang được quản lý</span>
        </div>
      </div>

      {activeSubTab === 'pipeline' ? (
        <React.Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Đang tải bộ công cụ kiểm định...</div>}>
          <QuestionBankPipelineView />
        </React.Suspense>
      ) : (
        <>
          {/* Active In-Progress Session Resume Banner */}
          {topActiveSession && (
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-amber-300/40 animate-fade-in">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Timer className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-black/20 rounded-md">
                      BÀI THI ĐANG LÀM DỞ
                    </span>
                    <span className="text-xs font-medium text-amber-100">
                      Thời gian còn: <strong className="text-white font-mono">{formatTimer(topActiveSession.remainingSeconds)}</strong>
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white mt-0.5 line-clamp-1">
                    {topActiveSession.test.titleVi || topActiveSession.test.title}
                  </h4>
                  <div className="text-xs text-amber-100 mt-0.5">
                    Đã lưu {Object.keys(topActiveSession.session.userAnswers || {}).length} / {topActiveSession.test.questions.length} câu trả lời
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartExam(topActiveSession.test)}
                className="w-full sm:w-auto px-5 py-2.5 bg-white text-orange-600 hover:bg-orange-50 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-orange-600" />
                <span>Tiếp tục làm bài ngay</span>
              </button>
            </div>
          )}

          {/* Header Hero Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-3 z-10 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-xs rounded-lg text-xs font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  Trung Tâm Luyện Thi Chuẩn Hóa
                </span>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-lg text-xs font-bold">
                  Azota-Style Exam Engine
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Ngân Hàng Đề Thi Thử TOEIC, IELTS & CEFR
              </h1>
              <p className="text-sm text-blue-100 leading-relaxed font-medium">
                Mỗi đề thi là một bài kiểm tra trọn vẹn với đồng hồ đếm ngược, lưu nháp bài làm tự động, hỗ trợ audio nghe, ghi âm Speaking và trình soạn thảo Writing.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10 shrink-0 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center flex-1 md:flex-initial min-w-28">
                <div className="text-2xl sm:text-3xl font-black text-amber-300">
                  {categoryInventories.all.validCount}
                </div>
                <div className="text-[10px] text-blue-100 font-bold uppercase mt-0.5">
                  ĐỀ ĐÃ KIỂM ĐỊNH
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center flex-1 md:flex-initial min-w-28">
                <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                  {testAttempts.length}
                </div>
                <div className="text-[10px] text-blue-100 font-bold uppercase mt-0.5">
                  LƯỢT ĐÃ NỘP
                </div>
              </div>
            </div>
          </div>

          {/* New Multi-Tier Tree Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Level 1: Primary Exam Family Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
              {[
                { id: 'all', label: 'Tất Cả Kỳ Thi', icon: Layers },
                { id: 'toeic', label: 'TOEIC (2 & 4 Skills)', icon: Trophy },
                { id: 'ielts', label: 'IELTS (Academic & General)', icon: GraduationCap },
                { id: 'cefr', label: 'Luyện Đề Theo CEFR (A1 - C2)', icon: Target }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = primaryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handlePrimaryTabChange(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Level 2: Sub-category Selector Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {primaryTab === 'all' && (
                <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                  <span>Toàn bộ danh mục:</span>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-xs">
                    {categoryInventories.all.validCount} đề hợp lệ
                  </span>
                </div>
              )}

              {primaryTab === 'toeic' && (
                <>
                  <button
                    onClick={() => setSelectedCategoryKey('toeic_2skills')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedCategoryKey === 'toeic_2skills'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>TOEIC 2 Skills (Listening & Reading)</span>
                    <span className="px-1.5 py-0.2 bg-blue-500 text-white rounded-full text-[10px]">
                      {categoryInventories.toeic_2skills.validCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedCategoryKey('toeic_4skills')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedCategoryKey === 'toeic_4skills'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>TOEIC 4 Skills (L-R-S-W)</span>
                    <span className="px-1.5 py-0.2 bg-indigo-500 text-white rounded-full text-[10px]">
                      {categoryInventories.toeic_4skills.validCount}
                    </span>
                  </button>
                </>
              )}

              {primaryTab === 'ielts' && (
                <>
                  <button
                    onClick={() => setSelectedCategoryKey('ielts_academic')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedCategoryKey === 'ielts_academic'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>IELTS Academic</span>
                    <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px]">
                      {categoryInventories.ielts_academic.validCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedCategoryKey('ielts_general')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedCategoryKey === 'ielts_general'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <span>IELTS General Training</span>
                    <span className="px-1.5 py-0.2 bg-amber-700 text-white rounded-full text-[10px]">
                      Chưa sẵn sàng (0)
                    </span>
                  </button>
                </>
              )}

              {primaryTab === 'cefr' && (
                <>
                  {[
                    { key: 'cefr_a1', label: 'A1 Căn bản', count: categoryInventories.cefr_a1.validCount },
                    { key: 'cefr_a2', label: 'A2 Sơ cấp', count: categoryInventories.cefr_a2.validCount },
                    { key: 'cefr_b1', label: 'B1 Trung cấp', count: categoryInventories.cefr_b1.validCount },
                    { key: 'cefr_b2', label: 'B2 Trung cao cấp', count: categoryInventories.cefr_b2.validCount },
                    { key: 'cefr_c1', label: 'C1 Cao cấp', count: categoryInventories.cefr_c1.validCount },
                    { key: 'cefr_c2', label: 'C2 Thành thạo', count: categoryInventories.cefr_c2.validCount }
                  ].map((lvl) => (
                    <button
                      key={lvl.key}
                      onClick={() => setSelectedCategoryKey(lvl.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCategoryKey === lvl.key
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{lvl.label}</span>
                      <span className="px-1.5 py-0.2 bg-blue-500 text-white rounded-full text-[10px]">
                        {lvl.count}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Category Status & Deficit Transparency Alert Banner */}
            {selectedCategoryKey === 'ielts_general' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-900 text-sm">
                    IELTS General Training: Trạng Thái Chưa Sẵn Sàng (0/50 Đề)
                  </h4>
                  <p className="leading-relaxed">
                    Hệ thống LingoPeak hiện chưa hoàn tất biên soạn ngân hàng câu hỏi chuẩn hóa riêng biệt cho IELTS General Training (thư tín xã hội & đọc hiểu đời sống).
                    Tuân thủ nguyên tắc trung thực và bảo đảm chất lượng, hệ thống <strong>không tạo đề giả lập</strong> để che giấu thiếu hụt. Danh mục này sẽ được mở ngay khi hoàn tất kiểm duyệt.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{activeCategoryInfo.nameVi}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500 font-medium">{activeCategoryInfo.blueprintSummaryVi}</span>
                  </div>
                  {activeCategoryInfo.disclaimerVi && (
                    <div className="text-[11px] text-slate-500 italic">
                      {activeCategoryInfo.disclaimerVi}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-semibold text-[11px]">
                  <span>Mục tiêu: <strong>50 đề</strong></span>
                  <span className="text-slate-300">/</span>
                  <span className="text-emerald-700">Hợp lệ: <strong>{activeCategoryInfo.validCount}</strong></span>
                  <span className="text-slate-300">/</span>
                  <span className="text-amber-700">Thiếu: <strong>{activeCategoryInfo.deficit} đề</strong></span>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-center pt-2 border-t border-slate-100">
              {/* Search Box */}
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên đề hoặc mã đề (ID)..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Trạng thái: Tất cả</option>
                  <option value="unattempted">Chưa làm</option>
                  <option value="in_progress">Đang làm dở</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Thời lượng: Tất cả</option>
                  <option value="short">Dưới 30 phút</option>
                  <option value="medium">30 - 60 phút</option>
                  <option value="long">Trên 60 phút</option>
                </select>
              </div>

              {/* Sort By Filter */}
              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="default">Sắp xếp: Mặc định</option>
                  <option value="questions_desc">Số câu hỏi: Nhiều nhất</option>
                  <option value="duration_desc">Thời lượng: Dài nhất</option>
                  <option value="duration_asc">Thời lượng: Ngắn nhất</option>
                  <option value="in_progress_first">Ưu tiên bài đang làm dở</option>
                  <option value="completed_first">Ưu tiên bài đã hoàn thành</option>
                </select>
              </div>
            </div>

            {/* Filter Stats Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span>
                  Hiển thị <strong className="text-slate-900 font-bold">{sortedTests.length}</strong> bài thi
                </span>
                {(selectedCategoryKey !== 'all' || statusFilter !== 'all' || durationFilter !== 'all' || searchQuery || sortBy !== 'default') && (
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer ml-2"
                  >
                    Đặt lại bộ lọc
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                Trang {currentPage} / {totalPages}
              </div>
            </div>
          </div>

          {/* Test Cards Grid */}
          <div>
            {practiceTests.length === 0 ? (
              <ViewLoadingFallback label="Đang tải danh mục bài thi..." />
            ) : sortedTests.length === 0 ? (
              <EmptyState
                title="Không có bài thi nào phù hợp"
                description={
                  selectedCategoryKey === 'ielts_general'
                    ? 'Danh mục IELTS General Training hiện đang biên soạn và chưa mở thi thật.'
                    : 'Không tìm thấy bài thi nào thỏa mãn tiêu chí lọc hiện tại. Hãy thử chọn danh mục khác hoặc đặt lại bộ lọc.'
                }
                actionLabel="Đặt lại bộ lọc"
                onAction={resetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {paginatedTests.map((test) => {
                  const pastAttempt = testAttempts.find((a) => a.testId === test.id);
                  const activeSessionInfo = activeSessionsMap[test.id];
                  const isValid = isTestValidAndAuthentic(test);

                  // Extract skill categories present in test
                  const skillsSet = new Set(test.questions.map((q) => q.skill || 'reading'));
                  const hasListening = Array.from(skillsSet).some((s) => s.includes('listening'));
                  const hasReading = Array.from(skillsSet).some((s) => s.includes('reading') || s.includes('grammar') || s.includes('vocab'));
                  const hasSpeaking = Array.from(skillsSet).some((s) => s.includes('speaking'));
                  const hasWriting = Array.from(skillsSet).some((s) => s.includes('writing'));

                  return (
                    <div
                      key={test.id}
                      className={`bg-white rounded-2xl border transition-all flex flex-col justify-between p-5 shadow-xs hover:shadow-md ${
                        activeSessionInfo
                          ? 'border-amber-400 ring-2 ring-amber-100'
                          : 'border-slate-200/90 hover:border-blue-400'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Header Badges: Exam Target & Duration */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md uppercase">
                              {test.targetLevel || 'All Levels'}
                            </span>

                            {isValid ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                                Chuẩn Hóa
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                                Mẫu Đề Luyện
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{test.durationMinutes} phút</span>
                          </div>
                        </div>

                        {/* Title, Code & Description */}
                        <div>
                          <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                            {test.titleVi || test.title}
                          </h3>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Mã đề: <strong className="text-slate-600">{test.id}</strong>
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                            {test.descriptionVi}
                          </p>
                        </div>

                        {/* Skill Badges & Question Count */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1.5 font-medium">
                              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                              <span>Quy mô bài thi:</span>
                            </span>
                            <strong className="text-slate-900 font-bold">{test.questions.length} câu hỏi</strong>
                          </div>

                          {/* Skill Tags */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {hasListening && (
                              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold">
                                Listening
                              </span>
                            )}
                            {hasReading && (
                              <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold">
                                Reading
                              </span>
                            )}
                            {hasSpeaking && (
                              <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-semibold">
                                Speaking
                              </span>
                            )}
                            {hasWriting && (
                              <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md font-semibold">
                                Writing
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Status & Action Button */}
                      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-3">
                        <div className="text-xs min-w-0">
                          {activeSessionInfo ? (
                            <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                              <span className="truncate">Còn {formatTimer(activeSessionInfo.remainingSeconds)}</span>
                            </div>
                          ) : pastAttempt ? (
                            <div className="text-[11px] text-emerald-700 font-bold truncate">
                              Đã làm ({pastAttempt.accuracy}% đúng)
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 truncate">
                              Chưa làm lần nào
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleStartExam(test)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
                            activeSessionInfo
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                              : pastAttempt
                              ? 'bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {activeSessionInfo ? (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Làm tiếp</span>
                            </>
                          ) : pastAttempt ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Thi lại</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Vào thi</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trang trước</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, index, arr) => {
                    const prevPage = arr[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentPage === page
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Past Attempt History Section */}
          {testAttempts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>Lịch Sử Làm Bài Gần Đây</span>
                </h3>
                <span className="text-xs font-semibold text-slate-400">{testAttempts.length} lượt thi đã nộp</span>
              </div>

              <div className="divide-y divide-slate-100">
                {testAttempts.slice(0, 5).map((att) => {
                  const correspondingTest = practiceTests.find((t) => t.id === att.testId);
                  return (
                    <div key={att.id} className="py-3 flex items-center justify-between gap-3 text-xs flex-wrap">
                      <div>
                        <div className="font-bold text-slate-800 line-clamp-1">{att.testTitle}</div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Nộp ngày {new Date(att.date).toLocaleDateString('vi-VN')} lúc {new Date(att.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • Thời gian làm: {Math.round(att.timeSpentSeconds / 60)} phút
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold ${
                            att.accuracy >= 80
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : att.accuracy >= 60
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {att.accuracy}% ({att.score}/{att.totalQuestions})
                        </span>

                        {correspondingTest && (
                          <button
                            onClick={() => handleStartExam(correspondingTest)}
                            className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Thi lại
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Azota-Style Exam Engine Modal */}
      {activeTestToRun && (
        <React.Suspense fallback={<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white text-sm font-semibold">Đang chuẩn bị phòng thi...</div>}>
          <ExamEngineModal
            test={activeTestToRun}
            onClose={() => {
              setActiveTestToRun(null);
              refreshActiveSessions();
            }}
          />
        </React.Suspense>
      )}

      {/* Authentication Guard Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
