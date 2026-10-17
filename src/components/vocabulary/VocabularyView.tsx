import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VocabularyItem } from '../../types';
import { speakEnglish } from '../../utils/speech';
import {
  Volume2,
  RotateCw,
  Check,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Bookmark,
  Sparkles,
  Shuffle,
  BookOpen,
  HelpCircle,
  X,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VocabularyView: React.FC = () => {
  const {
    vocabulary,
    updateVocabStatus,
    toggleVocabFavorite,
    deleteVocabulary,
    addCustomVocabulary,
    exportVocabularyCSV,
    importVocabularyCSV,
    language
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'unseen' | 'learning' | 'mastered' | 'favorites'>('all');
  const [selectedCefr, setSelectedCefr] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [listPage, setListPage] = useState(1);
  const LIST_PAGE_SIZE = 15;
  const [viewMode, setViewMode] = useState<'flashcard' | 'list'>('flashcard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importNotice, setImportNotice] = useState('');

  // Form state for adding custom word
  const [newWord, setNewWord] = useState('');
  const [newIpa, setNewIpa] = useState('');
  const [newPos, setNewPos] = useState('noun');
  const [newViMeaning, setNewViMeaning] = useState('');
  const [newEnDef, setNewEnDef] = useState('');
  const [newExampleEn, setNewExampleEn] = useState('');
  const [newExampleVi, setNewExampleVi] = useState('');
  const [newCefr, setNewCefr] = useState('B2');

  // Debounce search query (300ms)
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setListPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Filtered vocabulary list (memoized)
  const filteredList = React.useMemo(() => {
    const qLower = debouncedSearchQuery.toLowerCase().trim();
    return vocabulary.filter((item) => {
      const matchesSearch = !qLower ||
        item.word.toLowerCase().includes(qLower) ||
        item.viMeaning.toLowerCase().includes(qLower);
      const matchesFilter =
        filterMode === 'all'
          ? true
          : filterMode === 'favorites'
          ? item.isFavorite
          : item.status === filterMode;
      const matchesCefr = selectedCefr === 'all' || item.cefr === selectedCefr;
      return matchesSearch && matchesFilter && matchesCefr;
    });
  }, [vocabulary, debouncedSearchQuery, filterMode, selectedCefr]);

  // Safely clamp active index within filtered list bounds
  const safeIndex = filteredList.length > 0 ? Math.min(currentIndex, filteredList.length - 1) : 0;
  const currentItem: VocabularyItem | undefined = filteredList[safeIndex];

  // Stats calculation (memoized)
  const { knowItCount, stillLearningCount, remainingCount } = React.useMemo(() => {
    let know = 0;
    let learning = 0;
    let unseen = 0;
    for (const v of vocabulary) {
      if (v.status === 'mastered') know++;
      else if (v.status === 'learning') learning++;
      else unseen++;
    }
    return { knowItCount: know, stillLearningCount: learning, remainingCount: unseen };
  }, [vocabulary]);

  // Paginated list slice for list mode
  const totalListPages = Math.max(1, Math.ceil(filteredList.length / LIST_PAGE_SIZE));
  const safeListPage = Math.min(listPage, totalListPages);
  const paginatedList = React.useMemo(() => {
    const start = (safeListPage - 1) * LIST_PAGE_SIZE;
    return filteredList.slice(start, start + LIST_PAGE_SIZE);
  }, [filteredList, safeListPage, LIST_PAGE_SIZE]);

  // After a status change the active filter may drop the current card. If it does
  // the next card shifts into the same index, so advancing would skip a card.
  const advanceAfterStatusChange = (newStatus: 'learning' | 'mastered') => {
    setIsFlipped(false);
    const staysVisible = filterMode === 'all' || filterMode === 'favorites' || filterMode === newStatus;
    if (!staysVisible) return;
    if (safeIndex < filteredList.length - 1) {
      setCurrentIndex(safeIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleKnowIt = () => {
    if (!currentItem) return;
    updateVocabStatus(currentItem.id, 'mastered');
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
    advanceAfterStatusChange('mastered');
  };

  const handleStillLearning = () => {
    if (!currentItem) return;
    updateVocabStatus(currentItem.id, 'learning');
    advanceAfterStatusChange('learning');
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * Math.max(1, filteredList.length)));
  };

  const handleSaveCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord || !newViMeaning) return;
    addCustomVocabulary({
      word: newWord.trim(),
      ipa: newIpa.trim(),
      pos: newPos,
      viMeaning: newViMeaning.trim(),
      enDefinition: newEnDef.trim() || 'Custom definition',
      exampleEn: newExampleEn.trim() || `Example with ${newWord}`,
      exampleVi: newExampleVi.trim() || 'Ví dụ minh họa',
      collocations: [],
      synonyms: [],
      cefr: newCefr as any,
      topic: 'Personal List',
      status: 'learning'
    });
    setShowAddModal(false);
    // Reset form
    setNewWord('');
    setNewIpa('');
    setNewViMeaning('');
    setNewEnDef('');
    setNewExampleEn('');
    setNewExampleVi('');
  };

  const handleProcessImport = () => {
    if (!importCsvText) return;
    const count = importVocabularyCSV(importCsvText);
    if (count <= 0) {
      setImportNotice('Không tìm thấy từ vựng hợp lệ trong tệp CSV. Vui lòng kiểm tra lại định dạng cột.');
      return;
    }
    setImportNotice(`Đã thêm thành công ${count} từ vựng mới.`);
    setTimeout(() => {
      setShowImportModal(false);
      setImportNotice('');
      setImportCsvText('');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {language === 'vi' ? 'Hệ Thống Từ Vựng & Flashcards' : 'Vocabulary & Spaced Repetition'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'vi'
              ? 'Ghi nhớ dài hạn theo thuật toán lặp lại ngắt quãng (Spaced Repetition System).'
              : 'Retain academic vocabulary permanently with active recall and spaced intervals.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Thêm từ' : 'Add Word'}</span>
          </button>
          <button
            onClick={exportVocabularyCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Xuất file CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Nhập từ CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'flashcard' ? 'list' : 'flashcard')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{viewMode === 'flashcard' ? (language === 'vi' ? 'Dạng Danh Sách' : 'List View') : (language === 'vi' ? 'Flashcard' : 'Card View')}</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards matching Reference Image #3 */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl mx-auto">
        {/* Know it */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{knowItCount}</div>
          <div className="text-xs font-bold text-slate-500 mt-1 flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>KNOW IT</span>
          </div>
        </div>

        {/* Still learning */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-500">{stillLearningCount}</div>
          <div className="text-xs font-bold text-slate-500 mt-1 flex items-center justify-center gap-1">
            <RotateCw className="w-3.5 h-3.5 text-amber-500" />
            <span>STILL LEARNING</span>
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-700">{remainingCount}</div>
          <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            REMAINING
          </div>
        </div>
      </div>

      {viewMode === 'flashcard' ? (
        /* FLASHCARD MODE */
        <div className="space-y-6">
          {currentItem ? (
            <div className="max-w-2xl mx-auto">
              {/* Main Card with Dark Navy/Sapphire background matching Reference Image #3 */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[320px] sm:min-h-[360px] rounded-3xl bg-gradient-to-br from-[#0B1930] via-[#0F274E] to-[#132A55] text-white p-8 flex flex-col justify-between items-center text-center shadow-xl shadow-blue-950/20 cursor-pointer relative overflow-hidden transition-all duration-300 hover:scale-[1.01]"
              >
                {/* Subtle background glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top card metadata */}
                <div className="w-full flex items-center justify-between text-xs text-blue-200/80 z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold tracking-wider uppercase text-[11px] text-blue-300">
                      ENGLISH • {currentItem.cefr}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-400/20 text-[10px]">
                      {currentItem.pos}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVocabFavorite(currentItem.id);
                      }}
                      className="p-1 text-blue-200 hover:text-amber-400 transition-colors"
                      title="Lưu từ yêu thích"
                    >
                      <Bookmark className={`w-4 h-4 ${currentItem.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakEnglish(currentItem.word);
                      }}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Phát âm tiếng Anh"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Word Body */}
                <div className="my-auto py-6 z-10 space-y-3">
                  {!isFlipped ? (
                    <>
                      <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-serif">
                        {currentItem.word}
                      </h2>
                      <div className="text-emerald-400 font-medium text-sm flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{currentItem.topic}</span>
                        <span className="text-blue-300/60">•</span>
                        <span className="text-blue-300">{currentItem.ipa}</span>
                      </div>
                      <div className="text-xs text-blue-200/60 font-medium tracking-wide pt-4 animate-pulse">
                        {language === 'vi' ? 'Chạm vào thẻ để lật xem nghĩa' : 'Tap to reveal definition'}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 max-w-lg text-left">
                      <div>
                        <div className="text-xl sm:text-2xl font-bold text-amber-300">
                          {currentItem.viMeaning}
                        </div>
                        <div className="text-xs text-blue-200/90 mt-1 italic leading-relaxed">
                          "{currentItem.enDefinition}"
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                        <div className="text-white font-medium">{currentItem.exampleEn}</div>
                        <div className="text-blue-300/80 text-[11px] mt-0.5">{currentItem.exampleVi}</div>
                      </div>

                      {currentItem.collocations && currentItem.collocations.length > 0 && (
                        <div className="text-xs text-blue-200/90">
                          <span className="text-amber-400 font-semibold">{language === 'vi' ? 'Cụm từ hay: ' : 'Collocations: '}</span>
                          {currentItem.collocations.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer */}
                <div className="w-full flex items-center justify-between text-[11px] text-blue-300/70 z-10 border-t border-white/10 pt-3">
                  <span>Thẻ {filteredList.length > 0 ? safeIndex + 1 : 0} / {filteredList.length}</span>
                  <span>Đã ôn tập: {currentItem.reviewCount} lần</span>
                </div>
              </div>

              {/* Action Buttons matching Reference Image #3 */}
              <div className="grid grid-cols-2 gap-4 mt-5">
                {/* Still learning button */}
                <button
                  onClick={handleStillLearning}
                  className="py-3 px-6 rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4 text-amber-500" />
                  <span>{language === 'vi' ? 'Chưa thuộc (Ôn lại)' : 'Still learning'}</span>
                </button>

                {/* Know it button */}
                <button
                  onClick={handleKnowIt}
                  className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>{language === 'vi' ? 'Đã thuộc (Nhớ rõ)' : 'Know it'}</span>
                </button>
              </div>

              {/* Bottom Quick Selectors matching Reference Image #3 */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    filterMode === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All cards
                </button>
                <button
                  onClick={() => { setFilterMode('learning'); setCurrentIndex(0); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    filterMode === 'learning' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Adaptive +
                </button>
                <button
                  onClick={() => { setFilterMode('unseen'); setCurrentIndex(0); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    filterMode === 'unseen' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Unseen
                </button>
                <button
                  onClick={() => { setFilterMode('favorites'); setCurrentIndex(0); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    filterMode === 'favorites' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Favorites
                </button>
                <button
                  onClick={handleShuffle}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy từ vựng nào</h3>
              <p className="text-xs text-slate-500 mt-1">Hãy thử xóa bộ lọc tìm kiếm hoặc thêm từ mới.</p>
              <button
                onClick={() => { setSearchQuery(''); setFilterMode('all'); setSelectedCefr('all'); }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </div>
      ) : (
        /* LIST / DICTIONARY MODE */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Search & CEFR filter bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'vi' ? 'Tìm từ hoặc nghĩa tiếng Việt...' : 'Search word or meaning...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['all', 'A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedCefr(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedCefr === lvl
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Table of vocabulary */}
          <div className="divide-y divide-slate-100">
            {paginatedList.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">{item.word}</span>
                    <span className="text-xs text-slate-500 font-mono">{item.ipa}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                      {item.cefr}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.pos}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">{item.viMeaning}</div>
                  <div className="text-xs text-slate-500">{item.exampleEn}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => speakEnglish(item.word)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleVocabFavorite(item.id)}
                    className="p-2 text-slate-400 hover:text-amber-500 rounded-lg transition-colors cursor-pointer"
                    title={item.isFavorite ? 'Bỏ lưu yêu thích' : 'Lưu yêu thích'}
                  >
                    <Bookmark className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => deleteVocabulary(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa từ khỏi danh sách"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vocabulary Pagination */}
          {totalListPages > 1 && (
            <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/40">
              <span className="text-slate-500 font-medium">
                Trang {safeListPage} / {totalListPages} ({filteredList.length} từ)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={safeListPage <= 1}
                  onClick={() => setListPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors cursor-pointer"
                >
                  Trước
                </button>
                <span className="px-2 font-bold text-slate-700">{safeListPage}</span>
                <button
                  disabled={safeListPage >= totalListPages}
                  onClick={() => setListPage((p) => Math.min(totalListPages, p + 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors cursor-pointer"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Custom Word */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Thêm Từ Vựng Mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCustomWord} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Từ tiếng Anh (Word) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: substantiate"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phiên âm IPA</label>
                  <input
                    type="text"
                    placeholder="/səbˈstæn.ʃi.eɪt/"
                    value={newIpa}
                    onChange={(e) => setNewIpa(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Từ loại (POS)</label>
                  <select
                    value={newPos}
                    onChange={(e) => setNewPos(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="noun">noun (danh từ)</option>
                    <option value="verb">verb (động từ)</option>
                    <option value="adjective">adjective (tính từ)</option>
                    <option value="adverb">adverb (trạng từ)</option>
                    <option value="phrase">phrase (cụm từ)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nghĩa tiếng Việt *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: chứng minh, minh chứng có căn cứ"
                  value={newViMeaning}
                  onChange={(e) => setNewViMeaning(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ví dụ tiếng Anh</label>
                <input
                  type="text"
                  placeholder="We need concrete data to substantiate our claim."
                  value={newExampleEn}
                  onChange={(e) => setNewExampleEn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Lưu từ vựng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Nhập Từ Vựng từ CSV</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mt-4 text-xs">
              <p className="text-slate-500">
                Dán nội dung CSV với định dạng các cột:
                <code className="block mt-1 p-2 bg-slate-50 rounded text-slate-800 font-mono text-[11px]">
                  Word, IPA, Part of Speech, Vietnamese Meaning, Definition, Example (EN), Example (VI), CEFR
                </code>
              </p>
              <textarea
                rows={6}
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                placeholder={`tangible,/ˈtændʒəbl/,adjective,hữu hình có thể sờ thấy,real and not imaginary,We need tangible results.,Chúng ta cần kết quả hữu hình.,B2`}
                className="w-full p-3 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-500"
              />
              {importNotice && <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold">{importNotice}</div>}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleProcessImport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Xác nhận nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
