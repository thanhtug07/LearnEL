import React, { useState, useEffect } from 'react';
import { TestQuestion, CEFRLevel, ContentSourceCategory, ReviewStatus } from '../../types';
import {
  validateQuestionBatch,
  validateQuestion,
  parseQuestionsFromJSON,
  parseQuestionsFromCSV
} from '../../services/questionValidator';
import { VERIFIED_QUESTION_BANK } from '../../data/verifiedQuestionBank';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Upload,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  BookOpen,
  Headphones,
  Award,
  Layers,
  Clock,
  RotateCcw,
  Check,
  ChevronDown,
  Info,
  Play
} from 'lucide-react';

interface QuestionBankPipelineViewProps {
  onRunTestWithQuestions?: (questions: TestQuestion[]) => void;
}

export const QuestionBankPipelineView: React.FC<QuestionBankPipelineViewProps> = () => {
  const [questions, setQuestions] = useState<TestQuestion[]>(() => {
    // Try to load cached pipeline questions or initialize with verified bank
    try {
      const saved = localStorage.getItem('lingopeak_pipeline_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return VERIFIED_QUESTION_BANK;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Selected question for reviewing in detail
  const [activeReviewQuestion, setActiveReviewQuestion] = useState<TestQuestion | null>(null);

  // Ingestion Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [importRawText, setImportRawText] = useState('');
  const [validationReport, setValidationReport] = useState<any | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importNotification, setImportNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // AI Review State
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewResult, setAiReviewResult] = useState<any | null>(null);

  // Audio preview
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Debounce search query (300ms) to avoid expensive re-filters on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lingopeak_pipeline_questions', JSON.stringify(questions));
    } catch {}
  }, [questions]);

  // Statistics
  const totalCount = questions.length;
  const approvedCount = questions.filter((q) => q.review?.status === 'approved').length;
  const pendingCount = questions.filter((q) => q.review?.status === 'pending_review').length;
  const rejectedCount = questions.filter((q) => q.review?.status === 'rejected').length;
  const draftCount = questions.filter((q) => q.review?.status === 'draft').length;

  // Filtered list memoized
  const filteredQuestions = React.useMemo(() => {
    return questions.filter((q) => {
      if (selectedStatus !== 'all' && q.review?.status !== selectedStatus) return false;
      if (selectedSkill !== 'all' && q.skill !== selectedSkill) return false;
      if (selectedLevel !== 'all' && q.cefr !== selectedLevel) return false;
      if (selectedSource !== 'all' && q.source?.category !== selectedSource) return false;

      if (debouncedSearchQuery.trim()) {
        const lower = debouncedSearchQuery.toLowerCase();
        const matchPrompt = q.prompt.toLowerCase().includes(lower);
        const matchId = q.id.toLowerCase().includes(lower);
        const matchExp = (q.explanationVi || '').toLowerCase().includes(lower);
        const matchSec = (q.section || '').toLowerCase().includes(lower);
        if (!matchPrompt && !matchId && !matchExp && !matchSec) return false;
      }
      return true;
    });
  }, [questions, selectedStatus, selectedSkill, selectedLevel, selectedSource, debouncedSearchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedQuestions = React.useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [filteredQuestions, safeCurrentPage, PAGE_SIZE]);

  // Handle TTS playback for listening questions
  const handlePlayAudio = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;
    if (playingAudioId === id) {
      window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);
    setPlayingAudioId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Run validation on raw input before import
  const handleValidateBatch = () => {
    setValidationReport(null);
    setImportNotification(null);

    let parsedQuestions: Partial<TestQuestion>[] = [];
    if (importFormat === 'json') {
      const res = parseQuestionsFromJSON(importRawText);
      if (res.parseError) {
        setImportNotification({ type: 'error', message: res.parseError });
        return;
      }
      parsedQuestions = res.questions;
    } else {
      const res = parseQuestionsFromCSV(importRawText);
      if (res.parseError) {
        setImportNotification({ type: 'error', message: res.parseError });
        return;
      }
      parsedQuestions = res.questions;
    }

    if (parsedQuestions.length === 0) {
      setImportNotification({ type: 'error', message: 'Không tìm thấy câu hỏi hợp lệ trong dữ liệu nhập.' });
      return;
    }

    const report = validateQuestionBatch(parsedQuestions, questions);
    setValidationReport(report);
  };

  // Confirm import
  const handleConfirmImport = (targetStatus: ReviewStatus = 'pending_review') => {
    if (!validationReport || validationReport.validCount === 0) return;

    let parsedQuestions: Partial<TestQuestion>[] = [];
    if (importFormat === 'json') {
      parsedQuestions = parseQuestionsFromJSON(importRawText).questions;
    } else {
      parsedQuestions = parseQuestionsFromCSV(importRawText).questions;
    }

    // Filter only valid ones
    const validIds = new Set(
      validationReport.results.filter((r: any) => r.isValid).map((r: any) => r.questionId)
    );
    const validBatch = parsedQuestions.filter((q) => q.id && validIds.has(q.id));

    const now = new Date().toISOString();
    const updated = [...questions];

    validBatch.forEach((incoming) => {
      const fullQuestion: TestQuestion = {
        id: incoming.id!,
        questionNumber: updated.length + 1,
        section: incoming.section || 'Ingested Question Pool',
        prompt: incoming.prompt!,
        options: incoming.options!,
        correctAnswerIndex: incoming.correctAnswerIndex ?? 0,
        explanationVi: incoming.explanationVi!,
        category: incoming.category || 'General Ingestion',
        cefr: incoming.cefr || 'B1',
        skill: incoming.skill || 'grammar',
        contextPassage: incoming.contextPassage,
        audioText: incoming.audioText,
        source: incoming.source || {
          category: 'original_project',
          attribution: 'LingoPeak Curriculum Ingestion Pipeline',
          licenseOrPermission: 'Standard Editorial License',
          creationMethod: 'imported',
          contentVersion: '1.0.0'
        },
        review: {
          status: targetStatus,
          reviewerId: 'admin-qa-lead',
          reviewerName: 'Hội đồng Khảo thí LingoPeak',
          reviewedAt: now,
          reviewNotes: 'Nhập tự động qua pipeline xử lý dữ liệu.',
          aiValidationPassed: false
        },
        metadata: {
          createdAt: now,
          updatedAt: now,
          isProductionReady: targetStatus === 'approved'
        }
      };

      const existingIdx = updated.findIndex((q) => q.id === fullQuestion.id);
      if (existingIdx >= 0) {
        updated[existingIdx] = fullQuestion;
      } else {
        updated.push(fullQuestion);
      }
    });

    setQuestions(updated);
    setImportNotification({
      type: 'success',
      message: `Đã nạp thành công ${validBatch.length} câu hỏi vào ngân hàng với trạng thái: ${
        targetStatus === 'approved' ? 'Đã phê duyệt (Approved)' : 'Chờ thẩm định (Pending Review)'
      }.`
    });
    setValidationReport(null);
    setImportRawText('');
    setTimeout(() => setShowImportModal(false), 1500);
  };

  // Update Review Status
  const handleUpdateStatus = (id: string, newStatus: ReviewStatus, notes?: string) => {
    const now = new Date().toISOString();
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          return {
            ...q,
            review: {
              ...q.review,
              status: newStatus,
              reviewerId: 'examiner-primary',
              reviewerName: 'Ban Thẩm định Khảo thí LingoPeak',
              reviewedAt: now,
              reviewNotes: notes || q.review?.reviewNotes || `Cập nhật trạng thái sang ${newStatus}`
            },
            metadata: {
              ...(q.metadata || { createdAt: now }),
              updatedAt: now,
              isProductionReady: newStatus === 'approved'
            }
          };
        }
        return q;
      })
    );

    if (activeReviewQuestion?.id === id) {
      setActiveReviewQuestion((prev) =>
        prev
          ? {
              ...prev,
              review: {
                ...prev.review,
                status: newStatus,
                reviewedAt: now,
                reviewNotes: notes || prev.review?.reviewNotes || ''
              }
            }
          : null
      );
    }
  };

  // Run AI Pedagogical Review
  const handleRunAiReview = async (q: TestQuestion) => {
    try {
      setAiReviewLoading(true);
      setAiReviewResult(null);

      const res = await fetch('/api/questions/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });

      if (!res.ok) throw new Error('Không thể kết nối dịch vụ AI Review');
      const data = await res.json();
      setAiReviewResult(data);

      // Save suggestion note to question draft
      if (data.aiValidationPassed) {
        setQuestions((prev) =>
          prev.map((item) =>
            item.id === q.id
              ? {
                  ...item,
                  review: {
                    ...item.review,
                    status: item.review?.status || 'pending_review',
                    aiValidationPassed: true,
                    aiReviewNotes: data.defensibleReason || 'AI xác nhận đáp án chuẩn xác.'
                  }
                }
              : item
          )
        );
      }
    } catch (err: any) {
      setAiReviewResult({
        aiValidationPassed: false,
        evaluationStatus: 'evaluation_failed',
        error: err?.message || 'Không thể kết nối dịch vụ AI Review',
        feedbackVi: 'Đánh giá AI thất bại hoặc dịch vụ tạm thời không khả dụng. Câu hỏi cần được thẩm định trực tiếp bởi chuyên gia sư phạm.',
        disclaimer: 'Lưu ý: Không tự động duyệt hoặc chấm điểm giả khi dịch vụ AI gặp sự cố.'
      });
    } finally {
      setAiReviewLoading(false);
    }
  };

  // Sample JSON to load into importer
  const loadSampleJSON = () => {
    const sample = [
      {
        id: 'sample-import-001',
        prompt: 'The research report provides clear ______ into consumer behavioral shifts during economic volatility.',
        options: ['insights', 'inspects', 'instances', 'intents'],
        correctAnswerIndex: 0,
        explanationVi: 'Collocation học thuật chuẩn: "provide insights into something" (cung cấp góc nhìn sâu sắc, thấu hiểu về điều gì).',
        category: 'Academic Collocations',
        cefr: 'B2',
        skill: 'vocab',
        source: {
          category: 'original_project',
          attribution: 'LingoPeak Academic Editorial',
          licenseOrPermission: 'Standard Educational License',
          creationMethod: 'human_authored',
          contentVersion: '1.0.0'
        }
      },
      {
        id: 'sample-import-002',
        prompt: 'Hardly ______ the presentation when the senior director asked a critical question.',
        options: ['had he finished', 'he had finished', 'did he finish', 'he finished'],
        correctAnswerIndex: 0,
        explanationVi: 'Cấu trúc đảo ngữ thì Quá khứ hoàn thành: "Hardly + had + S + V3/ed + when + S + V2/ed".',
        category: 'Advanced Inversion',
        cefr: 'B2',
        skill: 'grammar',
        source: {
          category: 'original_project',
          attribution: 'LingoPeak Grammar Lab',
          licenseOrPermission: 'Standard Educational License',
          creationMethod: 'human_authored',
          contentVersion: '1.0.0'
        }
      }
    ];
    setImportFormat('json');
    setImportRawText(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-400/30 backdrop-blur-xs rounded-lg text-[11px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              QUESTION QUALITY & REVIEW PIPELINE
            </span>
            <span className="text-xs text-slate-300">Quy trình thẩm định khảo thí LingoPeak</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Quản Lý & Kiểm Định Ngân Hàng Đề
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Kiểm soát chất lượng nội dung giáo dục theo chuẩn CEFR & ETS/Cambridge. Mọi câu hỏi
            được thẩm định đáp án duy nhất, phương án nhiễu hợp lý, minh bạch bản quyền và ngăn
            chặn câu hỏi chưa duyệt lọt vào bài luyện tập của học viên.
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setValidationReport(null);
              setImportNotification(null);
              setShowImportModal(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Nạp Lô Câu Hỏi (Batch Ingestion JSON/CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase">Tổng Ngân Hàng</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Câu hỏi đã lập hồ sơ</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase">Đã Phê Duyệt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{approvedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Phục vụ học viên luyện tập</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold uppercase">Chờ Thẩm Định</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Cách ly khỏi bài thi học viên</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-xs font-bold uppercase">Từ Chối / Sửa</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{rejectedCount + draftCount}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Cần bổ sung / hiệu đính</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo nội dung câu hỏi, mã ID, từ khóa giải thích..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">Mọi trạng thái ({totalCount})</option>
              <option value="approved">Đã duyệt (Approved: {approvedCount})</option>
              <option value="pending_review">Chờ duyệt (Pending: {pendingCount})</option>
              <option value="rejected">Bị từ chối (Rejected: {rejectedCount})</option>
              <option value="draft">Bản nháp (Draft: {draftCount})</option>
            </select>

            {/* CEFR Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">Mọi cấp độ CEFR</option>
              <option value="A1">CEFR A1</option>
              <option value="A2">CEFR A2</option>
              <option value="B1">CEFR B1</option>
              <option value="B2">CEFR B2</option>
            </select>

            {/* Skill Filter */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">Mọi kỹ năng</option>
              <option value="grammar">Ngữ pháp (Grammar)</option>
              <option value="vocab">Từ vựng (Vocabulary)</option>
              <option value="listening">Luyện nghe (Listening)</option>
              <option value="ielts_reading">IELTS Reading</option>
              <option value="toeic_reading">TOEIC Reading</option>
            </select>

            {/* Source Category */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">Mọi nguồn cấp phép</option>
              <option value="original_project">Bản quyền gốc LingoPeak</option>
              <option value="ai_assisted_reviewed">AI hỗ trợ đã thẩm định</option>
              <option value="licensed_third_party">Tài liệu OER / CC-BY có phép</option>
              <option value="official_sample">Đề mẫu công khai hợp lệ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question Table / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
          <span>DANH SÁCH CÂU HỎI ({filteredQuestions.length})</span>
          <span>Chỉ các câu hỏi "Approved" mới xuất hiện trong bài thi học viên</span>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            Không tìm thấy câu hỏi phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          paginatedQuestions.map((q) => {
            const status = q.review?.status || 'pending_review';
            const isApproved = status === 'approved';
            const isPending = status === 'pending_review';
            const isRejected = status === 'rejected';

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
                  isApproved
                    ? 'border-slate-200 hover:border-blue-300'
                    : isPending
                    ? 'border-amber-300 bg-amber-50/15'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {q.id}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                      {q.cefr || 'B1'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {q.skill || 'grammar'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {q.category}
                    </span>
                  </div>

                  {/* Review Status Badge */}
                  <div className="flex items-center gap-2">
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã duyệt (Approved)
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Chờ thẩm định (Pending)
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        Từ chối (Rejected)
                      </span>
                    )}
                  </div>
                </div>

                {/* Prompt & Passage preview */}
                <div className="py-3 space-y-2">
                  {q.contextPassage && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 font-serif leading-relaxed border border-slate-200/60 max-h-24 overflow-y-auto">
                      <span className="font-sans font-bold text-[10px] uppercase text-slate-400 block mb-1">
                        Đoạn văn đọc hiểu tham chiếu (Context Passage):
                      </span>
                      {q.contextPassage}
                    </div>
                  )}

                  {q.audioText && (
                    <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-200/60 text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Headphones className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="italic line-clamp-1">"{q.audioText}"</span>
                      </div>
                      <button
                        onClick={() => handlePlayAudio(q.audioText!, q.id)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        {playingAudioId === q.id ? 'Dừng' : 'Nghe audio'}
                      </button>
                    </div>
                  )}

                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {q.prompt}
                  </p>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctAnswerIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                            isCorrect
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold'
                              : 'bg-slate-50 border-slate-200/80 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-md">
                              Chính xác
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Source Note */}
                  <div className="pt-2 text-xs text-slate-600 space-y-1">
                    <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                      <strong className="text-slate-800">Giải thích sư phạm: </strong>
                      {q.explanationVi}
                    </p>
                    {q.source && (
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                        <span>Nguồn: {q.source.attribution} ({q.source.licenseOrPermission})</span>
                        {q.review?.reviewerName && (
                          <span>Thẩm định: {q.review.reviewerName}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviewer Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setActiveReviewQuestion(q);
                      setAiReviewResult(null);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    Xem chi tiết & Thẩm định AI
                  </button>

                  <div className="flex items-center gap-2">
                    {!isApproved && (
                      <button
                        onClick={() => handleUpdateStatus(q.id, 'approved', 'Phê duyệt bởi Trưởng ban Khảo thí')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Phê duyệt (Approve)
                      </button>
                    )}
                    {!isRejected && (
                      <button
                        onClick={() => handleUpdateStatus(q.id, 'rejected', 'Chưa đáp ứng tiêu chí khảo thí')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Từ chối (Reject)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">
              Trang {safeCurrentPage} / {totalPages} (Hiển thị {(safeCurrentPage - 1) * PAGE_SIZE + 1} - {Math.min(safeCurrentPage * PAGE_SIZE, filteredQuestions.length)} / {filteredQuestions.length} câu)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Trước
              </button>
              <span className="px-2 font-bold text-slate-700">
                {safeCurrentPage}
              </span>
              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail & AI Audit Modal */}
      {activeReviewQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Hồ Sơ Thẩm Định Câu Hỏi: {activeReviewQuestion.id}
                </h3>
              </div>
              <button
                onClick={() => setActiveReviewQuestion(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase text-[10px]">Đề bài (Prompt):</label>
                <div className="text-sm font-semibold text-slate-900 mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {activeReviewQuestion.prompt}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase text-[10px]">Các phương án lựa chọn:</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {activeReviewQuestion.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border ${
                        idx === activeReviewQuestion.correctAnswerIndex
                          ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase text-[10px]">Giải thích sư phạm:</label>
                <p className="mt-1 p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed border border-slate-200">
                  {activeReviewQuestion.explanationVi}
                </p>
              </div>

              {/* Source & Attribution Metadata */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60 space-y-1">
                <div className="font-bold text-blue-900">Thông tin Bản quyền & Giấy phép:</div>
                <div className="text-slate-600">
                  Phân loại nguồn: <span className="font-semibold">{activeReviewQuestion.source?.category}</span>
                </div>
                <div className="text-slate-600">
                  Tác quyền: <span className="font-semibold">{activeReviewQuestion.source?.attribution}</span>
                </div>
                <div className="text-slate-600">
                  Điều khoản: <span className="font-semibold">{activeReviewQuestion.source?.licenseOrPermission}</span>
                </div>
              </div>

              {/* AI Review Audit Trigger */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-800">Kiểm Định Sư Phạm Tự Động (Gemini QA Audit)</span>
                  </div>
                  <button
                    onClick={() => handleRunAiReview(activeReviewQuestion)}
                    disabled={aiReviewLoading}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {aiReviewLoading ? 'Đang phân tích...' : 'Chạy kiểm định AI'}
                  </button>
                </div>

                {aiReviewResult && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Điểm sư phạm ước tính:</span>
                      <span className="font-black text-indigo-700 text-sm">
                        {aiReviewResult.pedagogicalScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Đánh giá tính bảo vệ của đáp án: </span>
                      <span className="text-emerald-700 font-medium">
                        {aiReviewResult.defensibleReason || 'Đáp án duy nhất và có tính bảo vệ cao.'}
                      </span>
                    </div>
                    {aiReviewResult.distractorCritique && (
                      <div>
                        <span className="font-semibold text-slate-700">Chất lượng phương án nhiễu: </span>
                        <span className="text-slate-600">{aiReviewResult.distractorCritique}</span>
                      </div>
                    )}
                    {aiReviewResult.disclaimer && (
                      <p className="text-[11px] text-amber-700 italic bg-amber-50 p-2 rounded-lg border border-amber-200">
                        {aiReviewResult.disclaimer}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveReviewQuestion(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleUpdateStatus(activeReviewQuestion.id, 'approved', 'Đã phê duyệt qua hồ sơ kiểm định');
                    setActiveReviewQuestion(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Xác nhận Phê duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Ingestion Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Nạp Lô Câu Hỏi Mới (Batch Question Ingestion)
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Nhập cấu trúc dữ liệu JSON hoặc CSV. Hệ thống sẽ chạy bộ tiền kiểm định cấu trúc
              (Deterministic Structural Validator) để phát hiện ID trùng lặp, đáp án ngoài phạm vi,
              phương án nhiễu rỗng hoặc thiếu giải thích trước khi lưu trữ.
            </p>

            <div className="flex items-center gap-3">
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  onClick={() => setImportFormat('json')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    importFormat === 'json' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  JSON Batch
                </button>
                <button
                  onClick={() => setImportFormat('csv')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    importFormat === 'csv' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  CSV Format
                </button>
              </div>

              <button
                onClick={loadSampleJSON}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Tải mẫu JSON thử nghiệm
              </button>
            </div>

            <textarea
              rows={8}
              value={importRawText}
              onChange={(e) => setImportRawText(e.target.value)}
              placeholder={
                importFormat === 'json'
                  ? '[\n  {\n    "id": "q-sample-1",\n    "prompt": "...",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswerIndex": 0,\n    "explanationVi": "..."\n  }\n]'
                  : 'id,prompt,optionA,optionB,optionC,optionD,correctAnswerIndex,explanationVi,category,cefr,skill'
              }
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />

            {importNotification && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  importNotification.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {importNotification.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{importNotification.message}</span>
              </div>
            )}

            {/* Validation Diagnostic Report */}
            {validationReport && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">Kết Quả Tiền Kiểm Định (Deterministic Validation):</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700">Hợp lệ: {validationReport.validCount}</span>
                    <span className="text-rose-700">Lỗi cấu trúc: {validationReport.invalidCount}</span>
                    <span className="text-amber-700">Trùng lặp: {validationReport.duplicateCount}</span>
                  </div>
                </div>

                {validationReport.invalidCount > 0 && (
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 space-y-1">
                    <div className="font-bold">Chi tiết các lỗi cần khắc phục:</div>
                    {validationReport.results
                      .filter((r: any) => !r.isValid)
                      .map((r: any, idx: number) => (
                        <div key={idx} className="text-[11px]">
                          • <strong>ID {r.questionId}:</strong>{' '}
                          {r.issues.map((i: any) => i.message).join(' | ')}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={handleValidateBatch}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Kiểm định cấu trúc (Validate)
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={!validationReport || validationReport.validCount === 0}
                  onClick={() => handleConfirmImport('pending_review')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Nạp làm Chờ duyệt ({validationReport?.validCount || 0})
                </button>

                <button
                  disabled={!validationReport || validationReport.validCount === 0}
                  onClick={() => handleConfirmImport('approved')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Duyệt & Nạp Trực Tiếp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
