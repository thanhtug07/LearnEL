import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Clock,
  Sparkles,
  Check,
  CheckCircle2,
  Bookmark,
  HelpCircle,
  Volume2
} from 'lucide-react';
import { speakEnglish } from '../../utils/speech';

interface ReadingPassage {
  id: string;
  title: string;
  titleVi: string;
  type: string;
  cefr: string;
  estimatedMinutes: number;
  text: string;
  vocabularyTooltips: Record<string, { ipa: string; pos: string; vi: string }>;
  questions: {
    id: string;
    prompt: string;
    options: string[];
    correctAnswer: string;
    explanationVi: string;
  }[];
}

const READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'pass-a1-habits',
    title: 'Healthy Daily Habits and Morning Routines',
    titleVi: 'Thói Quen Lành Mạnh & Lịch Trình Buổi Sáng Tích Cực',
    type: 'CEFR A1 Everyday Reading',
    cefr: 'A1',
    estimatedMinutes: 3,
    text: `Starting your day with good habits can make you feel happy and energetic. Many healthy people wake up early at six o'clock every morning. First, they drink a large glass of warm water. Next, they do light exercise or take a fifteen-minute walk in the neighborhood park. Eating a balanced breakfast with fruit, eggs, and bread gives your brain the energy it needs for work and study. Finally, planning your daily tasks in a notebook helps you stay calm and organized throughout the day.`,
    vocabularyTooltips: {
      energetic: { ipa: '/ˌen.əˈdʒet.ɪk/', pos: 'adj', vi: 'tràn đầy năng lượng, nhiệt huyết' },
      balanced: { ipa: '/ˈbæl.ənst/', pos: 'adj', vi: 'cân bằng, điều độ dinh dưỡng' },
      organized: { ipa: '/ˈɔː.ɡən.aɪzd/', pos: 'adj', vi: 'có tổ chức, ngăn nắp, khoa học' }
    },
    questions: [
      {
        id: 'rq-a1-1',
        prompt: 'What do many healthy people do first after waking up?',
        options: [
          'They drink a large glass of warm water',
          'They watch television for two hours',
          'They eat sweet chocolate candies',
          'They go back to bed immediately'
        ],
        correctAnswer: 'They drink a large glass of warm water',
        explanationVi: 'Đoạn văn nêu rõ: "First, they drink a large glass of warm water".'
      },
      {
        id: 'rq-a1-2',
        prompt: 'How does planning daily tasks in a notebook help you?',
        options: [
          'It helps you stay calm and organized throughout the day',
          'It makes you feel tired quickly',
          'It makes you forget your breakfast',
          'It replaces the need for exercise'
        ],
        correctAnswer: 'It helps you stay calm and organized throughout the day',
        explanationVi: 'Bài đọc viết: "planning your daily tasks in a notebook helps you stay calm and organized throughout the day".'
      }
    ]
  },
  {
    id: 'pass-a2-travel',
    title: 'Traveling on a Budget: Discovering Local Markets',
    titleVi: 'Du Lịch Tiết Kiệm: Trải Nghiệm & Khám Phá Chợ Địa Phương',
    type: 'CEFR A2 Lifestyle & Travel',
    cefr: 'A2',
    estimatedMinutes: 3,
    text: `Traveling does not always have to be expensive. One of the best ways to explore a new city while saving money is by visiting local outdoor markets. Unlike expensive tourist restaurants, street vendors at local markets offer authentic traditional cuisine at affordable prices. Furthermore, walking through food stalls gives travelers a unique opportunity to interact with friendly local residents and practice everyday conversational phrases. Always remember to carry small bills and comfortable walking shoes.`,
    vocabularyTooltips: {
      affordable: { ipa: '/əˈfɔː.də.bəl/', pos: 'adj', vi: 'giá cả phải chăng, hợp túi tiền' },
      authentic: { ipa: '/ɔːˈθen.tɪk/', pos: 'adj', vi: 'chính gốc, đích thực, truyền thống' },
      vendors: { ipa: '/ˈven.dəs/', pos: 'noun', vi: 'những người bán hàng rong/quầy hàng' }
    },
    questions: [
      {
        id: 'rq-a2-1',
        prompt: 'Why are local outdoor markets recommended for budget travelers?',
        options: [
          'They offer authentic traditional cuisine at affordable prices',
          'They are exclusively open at midnight',
          'They only accept credit cards from luxury hotels',
          'They sell expensive foreign goods'
        ],
        correctAnswer: 'They offer authentic traditional cuisine at affordable prices',
        explanationVi: 'Bài đọc khẳng định: "street vendors at local markets offer authentic traditional cuisine at affordable prices".'
      },
      {
        id: 'rq-a2-2',
        prompt: 'What advice is given to travelers visiting outdoor markets?',
        options: [
          'Carry small bills and wear comfortable walking shoes',
          'Never talk to local vendors',
          'Hire an expensive limousine',
          'Only visit modern supermarkets'
        ],
        correctAnswer: 'Carry small bills and wear comfortable walking shoes',
        explanationVi: 'Câu cuối bài đọc khuyên: "Always remember to carry small bills and comfortable walking shoes".'
      }
    ]
  },
  {
    id: 'pass-b1-remote-work',
    title: 'The Evolution of Modern Hybrid Workspaces',
    titleVi: 'Sự Phát Triển Của Mô Hình Làm Việc Kết Hợp (Hybrid Work)',
    type: 'CEFR B1 Workplace & Technology',
    cefr: 'B1',
    estimatedMinutes: 4,
    text: `In recent years, the concept of the standard office workplace has transformed significantly. Many international corporations have adopted a hybrid work model, allowing employees to split their working hours between their homes and centralized corporate offices. Employees frequently report that reduced commuting times contribute positively to their work-life balance and psychological well-being. However, human resource directors also point out that managing virtual teams requires deliberate communication strategies and reliable digital collaboration platforms to maintain team cohesion.`,
    vocabularyTooltips: {
      significantly: { ipa: '/sɪɡˈnɪf.ɪ.kənt.li/', pos: 'adv', vi: 'một cách đáng kể, rõ rệt' },
      commuting: { ipa: '/kəˈmjuː.tɪŋ/', pos: 'noun', vi: 'việc di chuyển đi lại giữa nhà và nơi làm việc' },
      cohesion: { ipa: '/kəʊˈhiː.ʒən/', pos: 'noun', vi: 'sự gắn kết, tính liên kết chặt chẽ' }
    },
    questions: [
      {
        id: 'rq-b1-1',
        prompt: 'What major benefit of the hybrid work model is reported by employees?',
        options: [
          'Reduced commuting times contribute to work-life balance',
          'Complete elimination of all work meetings',
          'Guaranteed salary increases every month',
          'Working without any computers or internet'
        ],
        correctAnswer: 'Reduced commuting times contribute to work-life balance',
        explanationVi: 'Bài đọc nêu: "Employees frequently report that reduced commuting times contribute positively to their work-life balance".'
      },
      {
        id: 'rq-b1-2',
        prompt: 'What challenge do HR directors emphasize regarding virtual teams?',
        options: [
          'Maintaining team cohesion requires deliberate communication strategies',
          'Virtual workers cannot use electricity',
          'Offices can no longer purchase paper',
          'Employees forget their job titles'
        ],
        correctAnswer: 'Maintaining team cohesion requires deliberate communication strategies',
        explanationVi: 'Đoạn văn kết luận: "managing virtual teams requires deliberate communication strategies and reliable digital collaboration platforms to maintain team cohesion".'
      }
    ]
  },
  {
    id: 'pass-2',
    title: 'Autonomous Fulfillment in Cross-Border Logistics',
    titleVi: 'Hệ Thống Tự Động Hóa Trong Logistics Xuyên Biên Giới',
    type: 'TOEIC Business Reading',
    cefr: 'B2',
    estimatedMinutes: 4,
    text: `Global supply chains have increasingly leveraged robotic automated storage and retrieval systems (ASRS) to accelerate warehouse turnaround times. Prior to automation, cross-docking facilities struggled with sorting bottlenecks during peak holiday quarters. Modern autonomous guided vehicles now coordinate seamlessly with radio-frequency inventory tags, diminishing shipment error rates to under 0.05 percent. For international retailers, this technological deployment yields exceptional operational cost savings.`,
    vocabularyTooltips: {
      turnaround: { ipa: '/ˈtɜːn.ə.raʊnd/', pos: 'noun', vi: 'thời gian hoàn thành chu kỳ xử lý' },
      bottlenecks: { ipa: '/ˈbɒt.əl.neks/', pos: 'noun', vi: 'điểm nghẽn, sự ứ đọng quy trình' },
      diminishing: { ipa: '/dɪˈmɪn.ɪ.ʃɪŋ/', pos: 'adj', vi: 'làm giảm bớt, hạ thấp' }
    },
    questions: [
      {
        id: 'rq-3',
        prompt: 'What was the primary difficulty before the introduction of automated systems?',
        options: [
          'Sorting bottlenecks during peak seasons.',
          'Lack of international shipping routes.',
          'Complete failure of radio frequencies.',
          'High government taxes.'
        ],
        correctAnswer: 'Sorting bottlenecks during peak seasons.',
        explanationVi: 'Bài đọc nêu: "cross-docking facilities struggled with sorting bottlenecks during peak holiday quarters".'
      }
    ]
  },
  {
    id: 'pass-1',
    title: 'The Proliferation of Decentralized Renewable Microgrids',
    titleVi: 'Sự Phát Triển Nhanh Chóng Của Mạng Lưới Điện Tái Tạo Cục Bộ',
    type: 'IELTS Academic Reading',
    cefr: 'C1',
    estimatedMinutes: 5,
    text: `In contemporary energy architecture, decentralized renewable microgrids represent a radical paradigm shift. Unlike conventional centralized grids that transmit electricity across vast geographical distances with substantial thermal dissipation, microgrids generate, store, and distribute power locally. By integrating photovoltaic arrays with lithium-iron-phosphate battery storage, these autonomous units insulate communities from macroscopic transmission failures.

Furthermore, economic analysts emphasize that the modular scalability of microgrids democratizes energy generation. Emerging economies that historically lacked the capital expenditure required for conventional power plants can now deploy localized grids incrementally. Notwithstanding these advantages, intermittency remains a persistent engineering challenge, necessitating sophisticated machine-learning algorithms to anticipate demand fluctuations.`,
    vocabularyTooltips: {
      proliferation: { ipa: '/prəˌlɪf.əˈreɪ.ʃən/', pos: 'noun', vi: 'sự sinh sôi, phát triển nhanh chóng' },
      decentralized: { ipa: '/diːˈsen.trə.laɪzd/', pos: 'adj', vi: 'phi tập trung, phân tán' },
      dissipation: { ipa: '/ˌdɪs.ɪˈpeɪ.ʃən/', pos: 'noun', vi: 'sự hao tán, tiêu tán năng lượng' },
      insulate: { ipa: '/ˈɪn.sjə.leɪt/', pos: 'verb', vi: 'bảo vệ, cách ly khỏi ảnh hưởng tiêu cực' },
      intermittency: { ipa: '/ˌɪn.təˈmɪt.ənt.si/', pos: 'noun', vi: 'tính chập chờn, không liên tục' }
    },
    questions: [
      {
        id: 'rq-1',
        prompt: 'According to paragraph 1, how do microgrids fundamentally differ from conventional centralized grids?',
        options: [
          'They rely exclusively on imported fossil fuels.',
          'They generate and distribute power locally rather than transmitting across vast distances.',
          'They require complete manual oversight from centralized authorities.',
          'They are prone to higher thermal energy loss.'
        ],
        correctAnswer: 'They generate and distribute power locally rather than transmitting across vast distances.',
        explanationVi: 'Đoạn 1 nêu: "Unlike conventional centralized grids that transmit electricity across vast geographical distances... microgrids generate, store, and distribute power locally".'
      },
      {
        id: 'rq-2',
        prompt: 'What primary engineering obstacle continues to affect renewable microgrids?',
        options: [
          'Total lack of lithium battery technology.',
          'Excessive public opposition.',
          'Power generation intermittency.',
          'Incompatibility with computer algorithms.'
        ],
        correctAnswer: 'Power generation intermittency.',
        explanationVi: 'Đoạn 2 nêu rõ: "intermittency remains a persistent engineering challenge".'
      }
    ]
  },
  {
    id: 'pass-c2-linguistics',
    title: 'Epistemological Shifts in Cognitive Linguistics and Language Acquisition',
    titleVi: 'Chuyển Dịch Nhận Thức Luận Trong Ngôn Ngữ Học Tri Nhận',
    type: 'CEFR C2 Advanced Linguistics',
    cefr: 'C2',
    estimatedMinutes: 6,
    text: `The intellectual trajectory of contemporary linguistics has witnessed a pronounced departure from generative modularity toward embodied constructionist paradigms. Rather than postulating an innate, autonomous Universal Grammar detached from general sensorimotor cognition, cognitive linguists assert that grammatical structures emerge organically through domain-general cognitive faculties. Usage-based models elucidate how statistical regularities in communicative discourse undergo entrenchment and automatization via neural plasticity.

Consequently, second language acquisition is increasingly reconceptualized as a dynamic complex system wherein idiosyncratic communicative interactions shape idiosyncratic neural representations. These theoretical insights fundamentally challenge prescriptive pedagogical conventions, demonstrating that semantic competence cannot be divorced from contextual pragmatic embodiment.`,
    vocabularyTooltips: {
      epistemological: { ipa: '/ɪˌpɪs.tə.məˈlɒdʒ.ɪ.kəl/', pos: 'adj', vi: 'thuộc về nhận thức luận, lý thuyết về bản chất tri thức' },
      entrenchment: { ipa: '/ɪnˈtrentʃ.mənt/', pos: 'noun', vi: 'sự hằn sâu, khắc sâu vào cấu trúc nhận thức' },
      prescriptive: { ipa: '/prɪˈskrɪp.tɪv/', pos: 'adj', vi: 'mang tính quy chuẩn, áp đặt quy tắc cứng nhắc' }
    },
    questions: [
      {
        id: 'rq-c2-1',
        prompt: 'According to the passage, how do cognitive linguists view the origin of grammatical structures?',
        options: [
          'They emerge organically through domain-general cognitive faculties',
          'They are mechanically determined by a genetic computer chip',
          'They are exclusively dictated by dictionary publishers',
          'They bear no connection to communicative discourse'
        ],
        correctAnswer: 'They emerge organically through domain-general cognitive faculties',
        explanationVi: 'Bài đọc nêu: "cognitive linguists assert that grammatical structures emerge organically through domain-general cognitive faculties".'
      },
      {
        id: 'rq-c2-2',
        prompt: 'How has second language acquisition been reconceptualized in modern linguistics?',
        options: [
          'As a dynamic complex system shaped by communicative interactions',
          'As a rigid rote-memorization discipline',
          'As an impossible biological feat for adults',
          'As completely detached from neural plasticity'
        ],
        correctAnswer: 'As a dynamic complex system shaped by communicative interactions',
        explanationVi: 'Tác giả khẳng định: "second language acquisition is increasingly reconceptualized as a dynamic complex system wherein idiosyncratic communicative interactions shape idiosyncratic neural representations".'
      }
    ]
  }
];

export const ReadingView: React.FC = () => {
  const { addCustomVocabulary, language, addXP, addMinutesStudied, logSkillActivity } = useApp();

  const [activePassageIndex, setActivePassageIndex] = useState(0);
  const [selectedWordTooltip, setSelectedWordTooltip] = useState<{ word: string; data: any } | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const currentPassage = READING_PASSAGES[activePassageIndex];

  const handleSaveWordToVocab = (word: string, data: any) => {
    // Guard against duplicate flashcards from repeated clicks.
    if (savedWords.has(word)) return;
    addCustomVocabulary({
      word,
      ipa: data.ipa,
      pos: data.pos,
      viMeaning: data.vi,
      enDefinition: `Academic word from reading passage: ${currentPassage.title}`,
      exampleEn: `Learned from ${currentPassage.title}.`,
      exampleVi: 'Được lưu từ bài đọc hiểu LingoPeak.',
      collocations: [],
      synonyms: [],
      cefr: currentPassage.cefr as any,
      topic: 'Reading Vocab',
      status: 'learning'
    });
    setSavedWords((prev) => new Set(prev).add(word));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {language === 'vi' ? 'Luyện Đọc Hiểu Chuyên Sâu (Reading Hub)' : 'Reading Comprehension Hub'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {language === 'vi'
            ? 'Đọc văn bản học thuật IELTS & bài đọc doanh nghiệp TOEIC, tra từ vựng tức thì và làm bài tập đọc hiểu.'
            : 'Academic articles and business case studies with interactive vocabulary tooltips and quizzes.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {READING_PASSAGES.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePassageIndex(idx);
              setSelectedWordTooltip(null);
              setIsAnswerChecked(false);
              setUserAnswers({});
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              activePassageIndex === idx
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p.type} • {p.titleVi}
          </button>
        ))}
      </div>

      {/* Main Reading Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md uppercase">
              {currentPassage.cefr} • {currentPassage.type}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentPassage.estimatedMinutes} phút đọc</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {currentPassage.title}
          </h2>
          <div className="text-xs text-blue-700 font-semibold">{currentPassage.titleVi}</div>
        </div>

        {/* Reading Passage Body with Word Highlights */}
        <div className="p-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-slate-800 text-xs sm:text-sm leading-relaxed space-y-4 font-serif">
          <p className="whitespace-pre-line">
            {currentPassage.text.split(' ').map((wordRaw, wIdx) => {
              const cleanWord = wordRaw.replace(/[^a-zA-Z]/g, '').toLowerCase();
              const tooltipData = currentPassage.vocabularyTooltips[cleanWord];

              if (tooltipData) {
                return (
                  <span key={wIdx}>
                    <button
                      onClick={() => setSelectedWordTooltip({ word: cleanWord, data: tooltipData })}
                      className="font-bold text-blue-600 underline decoration-blue-300 decoration-2 hover:bg-blue-100 rounded px-1 transition-colors cursor-pointer"
                    >
                      {wordRaw}
                    </button>{' '}
                  </span>
                );
              }
              return wordRaw + ' ';
            })}
          </p>
        </div>

        {/* Word Definition Popup / Tooltip bar */}
        {selectedWordTooltip && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-blue-950 uppercase">{selectedWordTooltip.word}</span>
                <span className="text-xs font-mono text-slate-500">{selectedWordTooltip.data.ipa}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded font-semibold">
                  {selectedWordTooltip.data.pos}
                </span>
                <button
                  onClick={() => speakEnglish(selectedWordTooltip.word)}
                  className="p-1 text-slate-400 hover:text-blue-700"
                  title="Phát âm từ"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-xs text-slate-700 font-medium">
                Nghĩa tiếng Việt: <span className="font-bold text-slate-900">{selectedWordTooltip.data.vi}</span>
              </div>
            </div>

            <button
              onClick={() => handleSaveWordToVocab(selectedWordTooltip.word, selectedWordTooltip.data)}
              disabled={savedWords.has(selectedWordTooltip.word)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-emerald-600 disabled:cursor-default text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{savedWords.has(selectedWordTooltip.word) ? 'Đã lưu vào Spaced Repetition' : 'Lưu vào Flashcards'}</span>
            </button>
          </div>
        )}

        {/* Comprehension Quiz */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Câu Hỏi Đọc Hiểu Văn Bản (Reading Quiz)</span>
          </h3>

          <div className="space-y-4">
            {currentPassage.questions.map((q, qIndex) => {
              const selected = userAnswers[q.id];
              const isCorrect = selected === q.correctAnswer;

              return (
                <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                  <div className="font-bold text-slate-900 text-sm">
                    {qIndex + 1}. {q.prompt}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isOptionSelected = selected === opt;
                      let style = 'bg-white border-slate-200 text-slate-700 hover:border-blue-400';

                      if (isAnswerChecked) {
                        if (opt === q.correctAnswer) {
                          style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                        } else if (isOptionSelected && !isCorrect) {
                          style = 'bg-red-50 border-red-400 text-red-900';
                        }
                      } else if (isOptionSelected) {
                        style = 'bg-blue-50 border-blue-600 text-blue-900 font-bold';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isAnswerChecked}
                          onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswerChecked && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700">
                      <span className="font-bold text-blue-600">Giải thích: </span>
                      <span>{q.explanationVi}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            {!isAnswerChecked ? (
              <button
                disabled={Object.keys(userAnswers).length === 0}
                onClick={() => {
                  setIsAnswerChecked(true);
                  addXP(35);
                  addMinutesStudied(currentPassage.estimatedMinutes);
                  logSkillActivity('reading', currentPassage.title, currentPassage.estimatedMinutes, 35);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Kiểm tra câu trả lời
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsAnswerChecked(false);
                  setUserAnswers({});
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Làm lại bài đọc
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
