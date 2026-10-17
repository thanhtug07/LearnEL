import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GrammarTopic, Exercise } from '../../types';
import {
  BookMarked,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { EmptyState } from '../common/ViewFeedbackStates';

export const GrammarView: React.FC = () => {
  const { grammarTopics, updateGrammarMastery, language } = useApp();

  const [selectedTopicId, setSelectedTopicId] = useState<string>(grammarTopics[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedExerciseAnswers, setSelectedExerciseAnswers] = useState<Record<string, string>>({});
  const [exerciseChecked, setExerciseChecked] = useState<Record<string, boolean>>({});
  const [masteryGain, setMasteryGain] = useState<Record<string, number>>({});

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredTopics = React.useMemo(() => {
    const qLower = debouncedSearchQuery.toLowerCase().trim();
    return grammarTopics.filter((t) => {
      const matchesSearch =
        !qLower ||
        t.title.toLowerCase().includes(qLower) ||
        t.titleVi.toLowerCase().includes(qLower);
      const matchesLvl = selectedLevel === 'all' || t.level === selectedLevel;
      return matchesSearch && matchesLvl;
    });
  }, [grammarTopics, debouncedSearchQuery, selectedLevel]);

  const activeTopic = grammarTopics.find((t) => t.id === selectedTopicId) || grammarTopics[0];

  const handleSelectOption = (exId: string, opt: string) => {
    if (exerciseChecked[exId]) return;
    setSelectedExerciseAnswers((prev) => ({ ...prev, [exId]: opt }));
  };

  const handleCheckExercise = (exercise: Exercise) => {
    const chosen = selectedExerciseAnswers[exercise.id];
    if (!chosen) return;
    setExerciseChecked((prev) => ({ ...prev, [exercise.id]: true }));

    const isCorrect = chosen.trim().toLowerCase() === String(exercise.correctAnswer).trim().toLowerCase();
    if (isCorrect && activeTopic) {
      const next = Math.min(100, activeTopic.masteryPercentage + 15);
      const gained = next - activeTopic.masteryPercentage;
      updateGrammarMastery(activeTopic.id, next);
      setMasteryGain((prev) => ({ ...prev, [exercise.id]: gained }));
    } else {
      setMasteryGain((prev) => ({ ...prev, [exercise.id]: 0 }));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {language === 'vi' ? 'Thư Viện Ngữ Pháp Toàn Diện (A1 - C2)' : 'Grammar Master Center'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {language === 'vi'
            ? 'Giải thích cặn kẽ bằng tiếng Việt, cấu trúc chuẩn xác và bài tập củng cố tức thì.'
            : 'Structured grammar rules, formula breakdowns, error contrasts, and instant drill exercises.'}
        </p>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Topic List & Search */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={language === 'vi' ? 'Tìm chủ điểm ngữ pháp...' : 'Search grammar topic...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Level filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {['all', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                    selectedLevel === lvl
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Topics List with Empty State */}
          {filteredTopics.length === 0 ? (
            <EmptyState
              title={language === 'vi' ? 'Không tìm thấy chủ điểm ngữ pháp' : 'No grammar topics found'}
              description={
                language === 'vi'
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc chọn lại cấp độ.'
                  : 'Try changing your search term or CEFR level.'
              }
              actionLabel={language === 'vi' ? 'Đặt lại bộ lọc' : 'Reset filter'}
              onAction={() => {
                setSearchQuery('');
                setSelectedLevel('all');
              }}
            />
          ) : (
            <div className="space-y-2">
              {filteredTopics.map((topic) => {
                const isSelected = topic.id === activeTopic?.id;
                return (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                        {topic.level} • {topic.category}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        {topic.masteryPercentage}% Thành thạo
                      </span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 mt-2">{topic.title}</h3>
                    <div className="text-[11px] text-slate-500 mt-0.5">{topic.titleVi}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (2 spans): Active Topic Details */}
        {activeTopic && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
              {/* Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md uppercase">
                    CẤP ĐỘ {activeTopic.level}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{activeTopic.category}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {activeTopic.title}
                </h2>
                <div className="text-xs sm:text-sm text-blue-700 font-semibold">{activeTopic.titleVi}</div>
              </div>

              {/* Formula banner */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1 font-mono text-xs">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-sans font-bold">
                  CÔNG THỨC CHUẨN (FORMULA)
                </div>
                <div className="text-amber-300 font-semibold leading-relaxed">{activeTopic.formula}</div>
              </div>

              {/* Explanation in Vietnamese */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  BẢN CHẤT & QUY TẮC SỬ DỤNG
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {activeTopic.explanationVi}
                </p>
              </div>

              {/* Correct Examples */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>VÍ DỤ ĐÚNG CHUẨN</span>
                </h4>
                <div className="space-y-2">
                  {activeTopic.correctExamples.map((ex, i) => (
                    <div key={i} className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs">
                      <div className="font-semibold text-emerald-950">{ex.en}</div>
                      <div className="text-emerald-700 text-[11px] mt-0.5">{ex.vi}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incorrect Examples & Common Mistakes */}
              {activeTopic.incorrectExamples && activeTopic.incorrectExamples.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>LỖI SAI ĐIỂN HÌNH CẦN TRÁNH</span>
                  </h4>
                  <div className="space-y-2">
                    {activeTopic.incorrectExamples.map((ex, i) => (
                      <div key={i} className="p-3 bg-red-50/40 border border-red-100 rounded-xl text-xs space-y-1">
                        <div className="text-red-700 line-through">Sai: {ex.wrong}</div>
                        <div className="text-emerald-800 font-semibold">Đúng: {ex.right}</div>
                        <div className="text-slate-600 text-[11px] italic">Lưu ý: {ex.noteVi}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Exercises */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Bài Tập Thực Hành Củng Cố</span>
                </h3>

                <div className="space-y-4">
                  {activeTopic.exercises.map((ex) => {
                    const chosen = selectedExerciseAnswers[ex.id];
                    const isChecked = exerciseChecked[ex.id];
                    const isCorrect = chosen?.trim().toLowerCase() === String(ex.correctAnswer).trim().toLowerCase();

                    return (
                      <div key={ex.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-3">
                        <div className="font-bold text-slate-900">{ex.prompt}</div>

                        {ex.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {ex.options.map((opt, oIdx) => {
                              const isSelected = chosen === opt;
                              let style = 'bg-white border-slate-200 text-slate-700 hover:border-blue-400';

                              if (isChecked) {
                                if (opt === ex.correctAnswer) {
                                  style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                                } else if (isSelected && !isCorrect) {
                                  style = 'bg-red-50 border-red-400 text-red-900';
                                }
                              } else if (isSelected) {
                                style = 'bg-blue-50 border-blue-600 text-blue-900 font-bold';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  disabled={isChecked}
                                  onClick={() => handleSelectOption(ex.id, opt)}
                                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${style}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          {!isChecked ? (
                            <button
                              disabled={!chosen}
                              onClick={() => handleCheckExercise(ex)}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Kiểm tra đáp án
                            </button>
                          ) : (
                            <div className="p-3 bg-white border border-slate-200 rounded-xl w-full">
                              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                                {isCorrect ? (
                                  <span className="text-emerald-700">
                                    {masteryGain[ex.id] > 0
                                      ? `Chính xác! (+${masteryGain[ex.id]}% Thành thạo)`
                                      : 'Chính xác! (Đã đạt mức thành thạo tối đa)'}
                                  </span>
                                ) : (
                                  <span className="text-red-700">Chưa chính xác!</span>
                                )}
                              </div>
                              <div className="text-slate-600">{ex.explanationVi}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
