import { Course, VocabularyItem, GrammarTopic, PracticeTest, Achievement, WritingPrompt, SpeakingTopic, PracticeSet } from '../types';
import { VERIFIED_QUESTION_BANK } from './verifiedQuestionBank';
import { NEW_COURSES_CATALOG } from './courses/coursesCatalog';
import { NEW_TESTS_CATALOG } from './tests/testsCatalog';
import { EXPANDED_PRACTICE_SETS } from './practice/practiceCatalog';
import { STANDARDIZED_BLUEPRINT_TESTS } from './blueprints';
import { STANDARDIZED_CEFR_BENCHMARK_TESTS } from './cefr/cefrBenchmarkTests';

export const INITIAL_VOCABULARY: VocabularyItem[] = [
  {
    id: 'voc-1',
    word: 'breadth',
    ipa: '/bredθ/',
    pos: 'noun',
    viMeaning: 'bề rộng, phạm vi toàn diện, kiến thức sâu rộng',
    enDefinition: 'the distance from one side to another, or the wide range or extent of something.',
    exampleEn: 'The breadth of her knowledge across both science and literature amazed the professors.',
    exampleVi: 'Bề rộng tri thức của cô ấy ở cả khoa học và văn học khiến các giáo sư kinh ngạc.',
    collocations: ['breadth of knowledge', 'breadth of experience', 'in breadth'],
    synonyms: ['width', 'extent', 'scope', 'comprehensiveness'],
    antonyms: ['narrowness'],
    cefr: 'C1',
    topic: 'Academic & Abstract',
    usageNoteVi: 'Thường dùng để khen ngợi kiến thức rộng (breadth of vision / breadth of mind).',
    status: 'unseen',
    reviewCount: 0,
    isFavorite: false,
  },
  {
    id: 'voc-2',
    word: 'ubiquitous',
    ipa: '/juːˈbɪk.wɪ.təs/',
    pos: 'adjective',
    viMeaning: 'có mặt ở khắp nơi, phổ biến rộng rãi',
    enDefinition: 'seeming to be seen everywhere at the same time.',
    exampleEn: 'Smartphones have become ubiquitous in modern urban life.',
    exampleVi: 'Điện thoại thông minh đã trở nên phổ biến ở khắp mọi nơi trong đời sống đô thị hiện đại.',
    collocations: ['ubiquitous presence', 'become ubiquitous', 'almost ubiquitous'],
    synonyms: ['omnipresent', 'pervasive', 'everywhere', 'universal'],
    antonyms: ['rare', 'scarce'],
    cefr: 'C1',
    topic: 'Technology & Society',
    usageNoteVi: 'Rất hay xuất hiện trong bài thi IELTS Reading và Writing Task 2 khi nói về công nghệ.',
    status: 'unseen',
    reviewCount: 0,
    isFavorite: false,
  },
  {
    id: 'voc-3',
    word: 'mitigate',
    ipa: '/ˈmɪt.ɪ.ɡeɪt/',
    pos: 'verb',
    viMeaning: 'giảm nhẹ, làm dịu bớt (tác hại, rủi ro, nỗi đau)',
    enDefinition: 'to make something less harmful, unpleasant, or bad.',
    exampleEn: 'Governments must take immediate measures to mitigate the severe effects of climate change.',
    exampleVi: 'Các chính phủ cần thực hiện các biện pháp tức thì để giảm nhẹ tác động tiêu cực của biến đổi khí hậu.',
    collocations: ['mitigate risks', 'mitigate the impact', 'mitigate damages'],
    synonyms: ['alleviate', 'lessen', 'reduce', 'diminish'],
    antonyms: ['exacerbate', 'worsen', 'aggravate'],
    cefr: 'B2',
    topic: 'Environment & Policy',
    usageNoteVi: 'Tránh nhầm với "militate against" (chống lại). Luôn đi cùng các danh từ tiêu cực như risk/impact/loss.',
    status: 'unseen',
    reviewCount: 0,
    isFavorite: false,
  },
  {
    id: 'voc-4',
    word: 'resilient',
    ipa: '/rɪˈzɪl.jənt/',
    pos: 'adjective',
    viMeaning: 'kiên cường, có khả năng phục hồi nhanh sau khó khăn',
    enDefinition: 'able to be happy, successful, or recover quickly after something difficult has happened.',
    exampleEn: 'Local businesses proved remarkably resilient during the economic downturn.',
    exampleVi: 'Các doanh nghiệp địa phương đã chứng minh sự kiên cường đáng nể trong thời kỳ suy thoái kinh tế.',
    collocations: ['highly resilient', 'resilient economy', 'resilient to change'],
    synonyms: ['tenacious', 'tough', 'adaptable', 'buoyant'],
    antonyms: ['fragile', 'vulnerable'],
    cefr: 'B2',
    topic: 'Personal Growth & Business',
    usageNoteVi: 'Có thể miêu tả cả tính cách con người, nền kinh tế và vật liệu đàn hồi.',
    status: 'unseen',
    reviewCount: 0,
    isFavorite: false,
  },
  {
    id: 'voc-5',
    word: 'lucrative',
    ipa: '/ˈluː.krə.tɪv/',
    pos: 'adjective',
    viMeaning: 'sinh lời cao, mang lại nhiều lợi nhuận',
    enDefinition: 'producing a great deal of profit.',
    exampleEn: 'Investing in renewable energy has proven to be a highly lucrative business venture.',
    exampleVi: 'Đầu tư vào năng lượng tái tạo đã được chứng minh là một dự án kinh doanh mang lại lợi nhuận cao.',
    collocations: ['lucrative business', 'lucrative contract', 'lucrative career'],
    synonyms: ['profitable', 'gainful', 'remunerative', 'high-yielding'],
    antonyms: ['unprofitable', 'loss-making'],
    cefr: 'B2',
    topic: 'TOEIC & Business',
    usageNoteVi: 'Từ khóa điểm cao trong TOEIC Part 5 & 7 và IELTS Speaking Part 1 khi nói về nghề nghiệp.',
    status: 'unseen',
    reviewCount: 0,
  },
  {
    id: 'voc-6',
    word: 'scrutinize',
    ipa: '/ˈskruː.tɪ.naɪz/',
    pos: 'verb',
    viMeaning: 'xem xét kỹ lưỡng, kiểm tra cẩn thận từng chi tiết',
    enDefinition: 'to examine something very carefully in order to discover information.',
    exampleEn: 'The committee will scrutinize every clause of the proposed merger agreement.',
    exampleVi: 'Ủy ban sẽ xem xét kỹ lưỡng từng điều khoản của thỏa thuận sáp nhập đề xuất.',
    collocations: ['scrutinize closely', 'scrutinize data', 'under close scrutiny'],
    synonyms: ['inspect', 'examine', 'audit', 'investigate'],
    antonyms: ['glance', 'overlook'],
    cefr: 'C1',
    topic: 'Academic & Legal',
    usageNoteVi: 'Dạng danh từ là scrutiny. Thường gặp trong văn phong nghiên cứu hoặc hợp đồng pháp lý.',
    status: 'unseen',
    reviewCount: 0,
  },
  {
    id: 'voc-7',
    word: 'articulate',
    ipa: '/ɑːˈtɪk.jə.lət/',
    pos: 'adjective',
    viMeaning: 'ăn nói lưu loát, diễn đạt rõ ràng gãy gọn',
    enDefinition: 'able to express thoughts and arguments clearly and effectively.',
    exampleEn: 'She gave an articulate and persuasive speech at the international youth forum.',
    exampleVi: 'Cô ấy đã có một bài phát biểu lưu loát và đầy sức thuyết phục tại diễn đàn thanh niên quốc tế.',
    collocations: ['highly articulate', 'articulate speaker', 'articulate viewpoint'],
    synonyms: ['eloquent', 'coherent', 'fluent', 'lucid'],
    antonyms: ['inarticulate', 'hesitant'],
    cefr: 'C1',
    topic: 'Communication & Leadership',
    usageNoteVi: 'Là tính từ khi phát âm /-lət/, là động từ (diễn đạt) khi phát âm /-leɪt/.',
    status: 'unseen',
    reviewCount: 0,
  },
  {
    id: 'voc-8',
    word: 'diligent',
    ipa: '/ˈdɪl.ɪ.dʒənt/',
    pos: 'adjective',
    viMeaning: 'cần cù, chăm chỉ, siêng năng chu đáo',
    enDefinition: 'done in a careful and detailed way; characterized by persistent effort.',
    exampleEn: 'Thanks to his diligent research, the team discovered the software vulnerability before launch.',
    exampleVi: 'Nhờ vào sự nghiên cứu chăm chỉ của anh ấy, đội ngũ đã phát hiện lỗ hổng phần mềm trước khi phát hành.',
    collocations: ['diligent effort', 'diligent student', 'diligent worker'],
    synonyms: ['hardworking', 'assiduous', 'meticulous', 'conscientious'],
    antonyms: ['lazy', 'negligent'],
    cefr: 'B1',
    topic: 'Workplace & Character',
    usageNoteVi: 'Thích hợp dùng trong thư giới thiệu (Recommendation letter) và CV xin việc.',
    status: 'unseen',
    reviewCount: 0,
    isFavorite: false,
  }
];

const BASE_COURSES: Course[] = [
  {
    id: 'course-daily-routine',
    title: 'Daily Communication Mastery',
    titleVi: 'Giao Tiếp Hàng Ngày Tự Tin (A1-A2)',
    description: 'Build natural reflexes in 30 practical topics: Self-introductions, daily schedules, commute, dining, and shopping.',
    descriptionVi: 'Xây dựng phản xạ tự nhiên trong 30 chủ đề thông dụng: Giới thiệu bản thân, thói quen sinh hoạt, công việc, mua sắm và gọi món.',
    level: 'A1',
    language: 'en',
    skills: ['speaking', 'listening', 'vocabulary'],
    estimatedDuration: 720,
    estimatedHours: 12,
    publicationStatus: 'published',
    contentVersion: '1.0.0',
    category: 'Communication',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
    totalLessons: 3,
    completedLessons: 0,
    modules: [
      {
        id: 'mod-1',
        titleVi: 'Khởi động: Nhịp sống & Thói quen',
        descriptionVi: 'Làm chủ thì Hiện tại Đơn, từ vựng thói quen hàng ngày và cách nói giờ giấc chuẩn.',
        lessons: [
          {
            id: 'les-daily-1',
            courseId: 'course-daily-routine',
            sequence: 1,
            title: 'Daily Routines & Time Management',
            titleVi: 'Thói quen sinh hoạt & Quản lý thời gian',
            durationMinutes: 15,
            estimatedDuration: 15,
            xpReward: 50,
            isLocked: false,
            isCompleted: false,
            lessonType: 'mixed',
            type: 'mixed',
            prerequisites: [],
            publicationStatus: 'published',
            objectivesVi: [
              'Nắm chắc 10 động từ chỉ thói quen sinh hoạt mỗi sáng.',
              'Sử dụng trạng từ chỉ tần suất (always, usually, sometimes, never).',
              'Luyện phản xạ hỏi đáp về lịch trình thường nhật.'
            ],
            theoryContent: {
              title: 'Cấu trúc miêu tả thói quen hàng ngày',
              explanationVi: 'Khi nói về thói quen sinh hoạt lặp đi lặp lại hàng ngày, chúng ta sử dụng thì Hiện tại Đơn (Present Simple). Trạng từ chỉ tần suất thường đứng TRƯỚC động từ thường và đứng SAU động từ "to be".',
              examples: [
                { en: 'I usually wake up at 6:30 AM and drink a glass of warm water.', vi: 'Tôi thường thức dậy lúc 6:30 sáng và uống một cốc nước ấm.' },
                { en: 'She is always punctual for meetings.', vi: 'Cô ấy luôn luôn đúng giờ trong các cuộc họp.' }
              ],
              notesVi: 'Lưu ý chia động từ với ngôi thứ 3 số ít: He / She / It + V(s/es).'
            },
            vocabulary: INITIAL_VOCABULARY.slice(0, 2),
            exercises: [
              {
                id: 'ex-1',
                type: 'multiple_choice',
                prompt: 'Choose the correct sentence regarding adverbs of frequency:',
                promptVi: 'Chọn câu đúng về vị trí trạng từ chỉ tần suất:',
                options: [
                  'She drinks always coffee before starting work.',
                  'She always drinks coffee before starting work.',
                  'Always she drinks coffee before starting work.',
                  'She drinks coffee always before starting work.'
                ],
                correctAnswer: 'She always drinks coffee before starting work.',
                explanationVi: 'Trạng từ chỉ tần suất "always" đứng trước động từ thường "drinks".'
              },
              {
                id: 'ex-2',
                type: 'fill_blank',
                prompt: 'My brother usually _____ (wake) up early to prepare breakfast.',
                promptVi: 'Điền dạng đúng của động từ trong ngoặc:',
                options: ['wakes', 'wake', 'is waking', 'woke'],
                correctAnswer: 'wakes',
                explanationVi: 'Chủ ngữ "My brother" là ngôi thứ 3 số ít, diễn tả thói quen lặp lại nên dùng "wakes".'
              },
              {
                id: 'ex-3',
                type: 'sentence_order',
                prompt: 'Arrange the words to form a natural sentence: [early / I / every / get up / day / morning]',
                promptVi: 'Sắp xếp các từ thành câu hoàn chỉnh:',
                options: [
                  'I get up early every morning day',
                  'I get up early every morning',
                  'Every morning early I get up',
                  'I early get up morning every'
                ],
                correctAnswer: 'I get up early every morning',
                explanationVi: 'Cấu trúc chuẩn: Subject (I) + Verb phrase (get up early) + Time expression (every morning).'
              }
            ]
          },
          {
            id: 'les-daily-2',
            courseId: 'course-daily-routine',
            sequence: 2,
            title: 'At the Cafe & Ordering Drinks',
            titleVi: 'Giao tiếp tại quán Cafe & Đặt đồ uống',
            durationMinutes: 12,
            estimatedDuration: 12,
            xpReward: 40,
            isLocked: true,
            isCompleted: false,
            lessonType: 'speaking',
            type: 'speaking',
            prerequisites: ['les-daily-1'],
            publicationStatus: 'published',
            objectivesVi: [
              'Biết cách gọi đồ uống lịch sự với "Could I have..." và "I would like...".',
              'Hiểu câu hỏi từ barista về kích cỡ, loại sữa và mang đi/tại chỗ.'
            ],
            theoryContent: {
              title: 'Mẫu câu lịch thiệp khi gọi món (Polite Ordering)',
              explanationVi: 'Người bản xứ hiếm khi nói cộc lốc "I want coffee". Thay vào đó, hãy dùng "Could I please have...", "I’d like a..." hoặc "Can I get...".',
              examples: [
                { en: 'Could I have an iced latte with oat milk, please?', vi: 'Cho tôi một ly latte đá với sữa yến mạch được không ạ?' },
                { en: 'Is this for here or to go?', vi: 'Bạn dùng ở đây hay mang đi?' }
              ]
            },
            vocabulary: [],
            exercises: [
              {
                id: 'ex-cafe-1',
                type: 'multiple_choice',
                prompt: 'What is the most polite way to ask for a glass of water?',
                promptVi: 'Cách nào lịch sự nhất để xin một ly nước?',
                options: [
                  'Give me water now.',
                  'Could I please have a glass of water?',
                  'I need water.',
                  'Water for me.'
                ],
                correctAnswer: 'Could I please have a glass of water?',
                explanationVi: '"Could I please have..." là mẫu câu chuẩn mực, lịch sự nhất trong dịch vụ nhà hàng, quán ăn.'
              }
            ]
          },
          {
            id: 'les-daily-3',
            courseId: 'course-daily-routine',
            sequence: 3,
            title: 'Directions & Urban Commute',
            titleVi: 'Hỏi đường & Di chuyển trong Thành phố',
            durationMinutes: 15,
            estimatedDuration: 15,
            xpReward: 50,
            isLocked: true,
            isCompleted: false,
            lessonType: 'mixed',
            type: 'mixed',
            prerequisites: ['les-daily-2'],
            publicationStatus: 'published',
            objectivesVi: [
              'Chỉ đường chính xác với "Go straight", "Turn left/right at the intersection".',
              'Hỏi phương tiện công cộng (bus, subway, ticket booth) tự tin.'
            ],
            theoryContent: {
              title: 'Cụm từ chỉ phương hướng và khoảng cách',
              explanationVi: 'Khi hỏi đường lịch thiệp: "Excuse me, could you tell me how to get to...?" hoặc "Is there a subway station near here?".',
              examples: [
                { en: 'Go straight for two blocks, then turn left at the traffic light.', vi: 'Đi thẳng qua hai dãy nhà, sau đó rẽ trái ở cột đèn giao thông.' },
                { en: 'The museum is across from the central library.', vi: 'Bảo tàng nằm đối diện thư viện trung tâm.' }
              ]
            },
            vocabulary: [],
            exercises: [
              {
                id: 'ex-dir-1',
                type: 'multiple_choice',
                prompt: 'How do you say "Nó nằm đối diện bưu điện" in English?',
                promptVi: 'Dịch câu "Nó nằm đối diện bưu điện":',
                options: [
                  'It is across from the post office.',
                  'It is near at the post office.',
                  'It is in front of behind the post office.',
                  'It is opposing the post office.'
                ],
                correctAnswer: 'It is across from the post office.',
                explanationVi: '"Across from" mang nghĩa đối diện trực tiếp qua bên kia đường.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-ielts-mastery',
    title: 'IELTS Band 7.5+ Strategy',
    titleVi: 'Chiến Thuật Bứt Phá IELTS 7.5+',
    description: 'Develop critical thinking, trap avoidance in Listening/Reading, and master Task 2 marking rubrics.',
    descriptionVi: 'Phát triển tư duy phản biện, kỹ năng xử lý bẫy trong Listening/Reading và làm chủ khung tiêu chuẩn chấm điểm Task 2.',
    level: 'B2',
    language: 'en',
    skills: ['writing', 'reading'],
    estimatedDuration: 2100,
    estimatedHours: 35,
    publicationStatus: 'published',
    contentVersion: '1.0.0',
    category: 'IELTS',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    totalLessons: 2,
    completedLessons: 0,
    modules: [
      {
        id: 'mod-ielts-1',
        titleVi: 'IELTS Writing Task 2: Advanced Coherence',
        descriptionVi: 'Cách xây dựng mạch lập luận chặt chẽ (Cohesion & Coherence) để đạt Band 7.5+.',
        lessons: [
          {
            id: 'les-ielts-w1',
            courseId: 'course-ielts-mastery',
            sequence: 1,
            title: 'Paragraph Structure & Counter-arguments',
            titleVi: 'Cấu trúc đoạn văn PEEL & Luận điểm phản biện',
            durationMinutes: 25,
            estimatedDuration: 25,
            xpReward: 80,
            isLocked: false,
            isCompleted: false,
            lessonType: 'writing',
            type: 'writing',
            prerequisites: [],
            publicationStatus: 'published',
            objectivesVi: [
              'Áp dụng mô hình PEEL (Point, Explanation, Example, Link).',
              'Viết câu phản biện (Counter-argument & Refutation) tự nhiên.'
            ],
            theoryContent: {
              title: 'Kỹ thuật viết đoạn văn chuẩn PEEL',
              explanationVi: 'Mỗi đoạn thân bài cần bắt đầu bằng 1 Topic sentence rõ ràng, theo sau là phân tích sâu nguyên nhân - hệ quả (Explanation), dẫn chứng cụ thể (Example) và câu chốt liên kết với luận đề chung (Link).',
              examples: [
                {
                  en: 'While critics argue that artificial intelligence threatens employment, it fundamentally creates novel industries requiring specialized cognitive skills.',
                  vi: 'Mặc dù nhiều người cho rằng trí tuệ nhân tạo đe dọa việc làm, về bản chất nó tạo ra những ngành công nghiệp mới đòi hỏi kỹ năng tư duy chuyên sâu.'
                }
              ]
            },
            vocabulary: INITIAL_VOCABULARY.slice(2, 5),
            exercises: [
              {
                id: 'ex-ielts-1',
                type: 'multiple_choice',
                prompt: 'Which linking word best introduces a concession / counter-argument?',
                promptVi: 'Liên từ nào thích hợp nhất để mở đầu một ý nhượng bộ/phản biện?',
                options: ['Albeit', 'Notwithstanding the claim that', 'Furthermore', 'Consequently'],
                correctAnswer: 'Notwithstanding the claim that',
                explanationVi: '"Notwithstanding the claim that..." (Mặc cho những tuyên bố rằng...) là cấu trúc học thuật C1/C2 xuất sắc cho đoạn phản biện.'
              }
            ]
          },
          {
            id: 'les-ielts-r1',
            courseId: 'course-ielts-mastery',
            sequence: 2,
            title: 'Academic Reading: Skimming & Scanning Mastery',
            titleVi: 'Đọc hiểu Học thuật: Kỹ thuật Skimming & Scanning',
            durationMinutes: 30,
            estimatedDuration: 30,
            xpReward: 90,
            isLocked: true,
            isCompleted: false,
            lessonType: 'reading',
            type: 'reading',
            prerequisites: ['les-ielts-w1'],
            publicationStatus: 'published',
            objectivesVi: [
              'Phân biệt đọc lướt nắm ý chính (Skimming) và quét từ khóa số liệu (Scanning).',
              'Giải quyết dạng bài Matching Headings và True/False/Not Given trong 15 phút.'
            ],
            theoryContent: {
              title: 'Chiến thuật định vị thông tin trong đoạn văn học thuật dài',
              explanationVi: 'Đừng dịch từng từ. Hãy đọc câu đầu và câu cuối đoạn để nắm chủ đề, sau đó quét tên riêng, mốc thời gian, thuật ngữ in hoa để xác định vị trí đáp án.',
              examples: [
                {
                  en: 'Vertical farming yields up to ten times more produce per square meter than conventional soil-based agriculture.',
                  vi: 'Nông nghiệp thẳng đứng mang lại sản lượng gấp mười lần trên mỗi mét vuông so với nông nghiệp truyền thống canh tác trên đất.'
                }
              ]
            },
            vocabulary: [],
            exercises: [
              {
                id: 'ex-ielts-r-1',
                type: 'multiple_choice',
                prompt: 'Based on the passage: "Vertical farming yields up to ten times more produce...", does vertical farming produce more crops per area than traditional methods?',
                promptVi: 'Dựa trên câu dẫn: Nông nghiệp thẳng đứng có tạo ra nhiều sản lượng hơn trên cùng diện tích so với phương pháp truyền thống không?',
                options: ['True', 'False', 'Not Given'],
                correctAnswer: 'True',
                explanationVi: 'Câu dẫn khẳng định "yields up to ten times more produce per square meter", do đó nhận định là True.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-toeic-pro',
    title: 'TOEIC 850+ Business English',
    titleVi: 'Chinh Phục TOEIC 850+ & Tiếng Anh Thương Mại',
    description: 'Speed-solving ETS tactics: Part 5 word formation traps, Part 7 skimming strategies, and business vocabulary.',
    descriptionVi: 'Chiến thuật giải đề ETS nhanh và chính xác: Bẫy ngữ pháp Part 5, kỹ năng quét thông tin Part 7 và từ vựng doanh nghiệp.',
    level: 'B1',
    language: 'en',
    skills: ['grammar', 'reading'],
    estimatedDuration: 1500,
    estimatedHours: 25,
    publicationStatus: 'published',
    contentVersion: '1.0.0',
    category: 'TOEIC',
    thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    totalLessons: 2,
    completedLessons: 0,
    modules: [
      {
        id: 'mod-toeic-1',
        titleVi: 'TOEIC Part 5: Master Word Formations',
        descriptionVi: 'Cách xử lý câu hỏi từ loại trong 10 giây không cần dịch cả câu.',
        lessons: [
          {
            id: 'les-toeic-1',
            courseId: 'course-toeic-pro',
            sequence: 1,
            title: 'Suffix Clues & Part of Speech Traps',
            titleVi: 'Dấu hiệu đuôi từ loại & Bẫy ngữ pháp ETS',
            durationMinutes: 18,
            estimatedDuration: 18,
            xpReward: 60,
            isLocked: false,
            isCompleted: false,
            lessonType: 'grammar',
            type: 'grammar',
            prerequisites: [],
            publicationStatus: 'published',
            objectivesVi: [
              'Nhận diện tức thì vị trí cần điền danh từ, tính từ hay trạng từ.',
              'Tránh bẫy đuôi -ly (friendly, timely, costly là tính từ, không phải trạng từ).'
            ],
            theoryContent: {
              title: 'Vị trí của tính từ và trạng từ trong TOEIC',
              explanationVi: 'Trạng từ (adv) bổ nghĩa cho động từ, tính từ hoặc một trạng từ khác. Cấu trúc điển hình: Subj + Verb + ADV + Object hoặc BE + ADV + ADJ.',
              examples: [
                {
                  en: 'The CEO was extremely satisfied with the sales growth.',
                  vi: 'Vị giám đốc điều hành đã cực kỳ hài lòng với sự tăng trưởng doanh số.'
                }
              ]
            },
            vocabulary: INITIAL_VOCABULARY.slice(4, 7),
            exercises: [
              {
                id: 'ex-toeic-1',
                type: 'multiple_choice',
                prompt: 'Mr. Henderson reviewed the financial report _____ before presenting it to stakeholders.',
                promptVi: 'Chọn từ thích hợp điền vào chỗ trống:',
                options: ['careful', 'carefully', 'caring', 'carefulness'],
                correctAnswer: 'carefully',
                explanationVi: 'Cần một trạng từ (carefully) để bổ nghĩa cho động từ hành động "reviewed".'
              }
            ]
          },
          {
            id: 'les-toeic-2',
            courseId: 'course-toeic-pro',
            sequence: 2,
            title: 'Business Memos & Email Scenarios',
            titleVi: 'Thư tín Doanh nghiệp & Xử lý Hóa đơn, Đơn hàng',
            durationMinutes: 20,
            estimatedDuration: 20,
            xpReward: 70,
            isLocked: true,
            isCompleted: false,
            lessonType: 'reading',
            type: 'reading',
            prerequisites: ['les-toeic-1'],
            publicationStatus: 'published',
            objectivesVi: [
              'Nắm vững bố cục email thương mại chuẩn: Salutation, Purpose, Action Required, Closing.',
              'Giải quyết câu hỏi Part 6 & 7 về hạn chót thanh toán và khiếu nại dịch vụ.'
            ],
            theoryContent: {
              title: 'Cấu trúc thư tín văn phòng trang trọng',
              explanationVi: 'Trong TOEIC Part 7, các câu hỏi thường xoay quanh mục đích viết email (What is the purpose of the email?) và người nhận cần làm gì tiếp theo (What is the recipient asked to do?).',
              examples: [
                {
                  en: 'Please ensure that all invoices are submitted to accounting by the end of the fiscal quarter.',
                  vi: 'Vui lòng đảm bảo rằng tất cả hóa đơn được gửi đến bộ phận kế toán trước khi kết thúc quý tài chính.'
                }
              ]
            },
            vocabulary: [],
            exercises: [
              {
                id: 'ex-toeic-2',
                type: 'multiple_choice',
                prompt: 'In a business memo, "Please find attached the revised budget" is used to:',
                promptVi: 'Cụm từ "Please find attached the revised budget" nhằm mục đích gì?',
                options: [
                  'Notify the reader that a document is included with the message',
                  'Request a salary increase',
                  'Decline a business proposal',
                  'Cancel an upcoming meeting'
                ],
                correctAnswer: 'Notify the reader that a document is included with the message',
                explanationVi: '"Please find attached..." là câu thông báo tài liệu đính kèm kèm theo thư.'
              }
            ]
          }
        ]
      }
    ]
  }
];

export const INITIAL_COURSES: Course[] = [
  ...BASE_COURSES,
  ...NEW_COURSES_CATALOG
];

export const INITIAL_GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: 'gram-1',
    title: 'Present Perfect vs Past Simple',
    titleVi: 'Hiện Tại Hoàn Thành vs Quá Khứ Đơn',
    level: 'A2',
    category: 'Tenses',
    formula: 'Present Perfect: S + have/has + V3/ed | Past Simple: S + V2/ed',
    explanationVi: 'Quá khứ đơn dùng cho hành động ĐÃ CHẤM DỨT tại một thời điểm xác định trong quá khứ (yesterday, last week, in 2020). Hiện tại hoàn thành dùng cho hành động xảy ra trong quá khứ nhưng KẾT QUẢ/ẢNH HƯỞNG vẫn kéo dài tới hiện tại, hoặc diễn tả trải nghiệm (ever, never, so far).',
    correctExamples: [
      { en: 'I lived in Da Nang for two years (now I live in Hanoi).', vi: 'Tôi đã từng sống ở Đà Nẵng 2 năm (bây giờ tôi ở Hà Nội).' },
      { en: 'I have lived in Da Nang for two years (I still live there).', vi: 'Tôi đã sống ở Đà Nẵng được 2 năm (hiện tại tôi vẫn đang sống ở đó).' }
    ],
    incorrectExamples: [
      { wrong: 'I have seen that movie yesterday.', right: 'I saw that movie yesterday.', noteVi: 'Có mốc thời gian rõ ràng "yesterday" thì bắt buộc dùng Quá Khứ Đơn.' }
    ],
    commonMistakesVi: [
      'Dùng thì Hiện tại hoàn thành với các trạng từ chỉ thời gian quá khứ xác định (ago, yesterday, last night).',
      'Nhầm lẫn giữa "have been to" (đã từng đi đến rồi về) và "have gone to" (đang trên đường đi hoặc chưa về).'
    ],
    masteryPercentage: 0,
    exercises: [
      {
        id: 'ex-gr-1',
        type: 'multiple_choice',
        prompt: 'She _____ in Paris since 2018.',
        promptVi: 'Chọn đáp án đúng:',
        options: ['lived', 'has lived', 'is living', 'lives'],
        correctAnswer: 'has lived',
        explanationVi: 'Dấu hiệu "since 2018" biểu thị hành động bắt đầu từ quá khứ và tiếp tục đến nay -> Hiện Tại Hoàn Thành.'
      },
      {
        id: 'ex-gr-2',
        type: 'fill_blank',
        prompt: 'Last summer, my family _____ (visit) Phu Quoc island.',
        promptVi: 'Chia động từ trong ngoặc:',
        options: ['visited', 'has visited', 'was visiting', 'visits'],
        correctAnswer: 'visited',
        explanationVi: 'Có mốc thời gian "Last summer" -> Quá khứ đơn (visited).'
      }
    ]
  },
  {
    id: 'gram-2',
    title: 'Conditional Sentences (Type 1, 2, 3 & Mixed)',
    titleVi: 'Câu Điều Kiện Toàn Diện (Loại 1, 2, 3 & Hỗn Hợp)',
    level: 'B1',
    category: 'Clauses',
    formula: 'Type 1: If + V(s/es), S + will + V | Type 2: If + V2/were, S + would + V | Type 3: If + had + V3, S + would have + V3',
    explanationVi: 'Loại 1 diễn tả sự việc có thể xảy ra ở hiện tại hoặc tương lai. Loại 2 diễn tả giả định trái ngược với hiện tại. Loại 3 diễn tả điều nuối tiếc trái ngược với quá khứ. Câu điều kiện hỗn hợp kết hợp giả định quá khứ dẫn đến kết quả ở hiện tại.',
    correctExamples: [
      { en: 'If I study consistently every day, I will pass the IELTS test.', vi: 'Nếu tôi học đều đặn mỗi ngày, tôi sẽ đỗ kỳ thi IELTS.' },
      { en: 'If I had invested in Bitcoin earlier, I would be wealthy now.', vi: 'Nếu tôi đầu tư vào Bitcoin sớm hơn, bây giờ tôi đã giàu có rồi.' }
    ],
    incorrectExamples: [
      { wrong: 'If I was you, I will buy it.', right: 'If I were you, I would buy it.', noteVi: 'Trong văn phong chuẩn, mệnh đề If loại 2 luôn ưu tiên dùng "were" cho mọi ngôi.' }
    ],
    commonMistakesVi: [
      'Dùng "will" hoặc "would" ngay trong mệnh đề IF (sai: If you will come -> đúng: If you come).',
      'Quên lùi thì trong câu điều kiện loại 3.'
    ],
    masteryPercentage: 0,
    exercises: [
      {
        id: 'ex-gr-3',
        type: 'multiple_choice',
        prompt: 'If you had arrived on time, we _____ the opening ceremony.',
        promptVi: 'Chọn vế kết quả phù hợp:',
        options: ['would not miss', 'would not have missed', 'will not miss', 'had not missed'],
        correctAnswer: 'would not have missed',
        explanationVi: 'Mệnh đề IF chia "had arrived" (loại 3) -> Mệnh đề chính phải là "would have + V3/ed".'
      }
    ]
  },
  {
    id: 'gram-3',
    title: 'Inversion (Đảo Ngữ Học Thuật C1)',
    titleVi: 'Cấu Trúc Đảo Ngữ Nâng Cao (IELTS 7.5+)',
    level: 'C1',
    category: 'Advanced Syntax',
    formula: 'Negative Adverbial (Not only / Seldom / Rarely / Under no circumstances) + Auxiliary + Subject + Main Verb',
    explanationVi: 'Đảo ngữ được sử dụng để nhấn mạnh ý kiến, tạo ngữ khí trang trọng và giúp bài thi IELTS Writing/Speaking đạt điểm cao về tiêu chí Grammatical Range and Accuracy.',
    correctExamples: [
      { en: 'Not only does education enhance career prospects, but it also fosters empathy.', vi: 'Giáo dục không chỉ nâng cao cơ hội nghề nghiệp mà còn bồi dưỡng lòng thấu cảm.' },
      { en: 'Hardly had she entered the room when the phone rang.', vi: 'Cô ấy vừa mới bước vào phòng thì chuông điện thoại reo.' }
    ],
    incorrectExamples: [
      { wrong: 'Not only she is talented, but also kind.', right: 'Not only is she talented, but she is also kind.', noteVi: 'Phải đảo trợ động từ hoặc to be lên trước chủ ngữ khi từ phủ định đứng đầu câu.' }
    ],
    commonMistakesVi: [
      'Quên đưa trợ động từ (do/does/did/can/is) lên trước chủ ngữ.',
      'Dùng sai cặp liên từ: "Hardly... when", "No sooner... than", "Not only... but also".'
    ],
    masteryPercentage: 0,
    exercises: [
      {
        id: 'ex-gr-4',
        type: 'multiple_choice',
        prompt: 'Rarely _____ such dedication to community service.',
        promptVi: 'Chọn dạng đảo ngữ chính xác:',
        options: ['we have seen', 'have we seen', 'we saw', 'did we saw'],
        correctAnswer: 'have we seen',
        explanationVi: '"Rarely" đứng đầu câu yêu cầu đảo trợ động từ "have" lên trước chủ ngữ "we".'
      }
    ]
  }
];

const BASE_PRACTICE_TESTS: PracticeTest[] = [
  {
  "id": "test-full-toeic-standard",
  "title": "TOEIC Listening & Reading Full Benchmark Exam",
  "titleVi": "Đề Thi Thử TOEIC Toàn Diện Chuẩn Khảo Thí (50 Câu)",
  "type": "full_toeic",
  "durationMinutes": 60,
  "totalQuestions": 50,
  "targetLevel": "Target 750+",
  "descriptionVi": "Bài thi thử TOEIC đầy đủ gồm 50 câu hỏi chuẩn hóa bao quát Part 5 hoàn thành câu, Part 6 hoàn thành đoạn văn và Part 7 đọc hiểu doanh nghiệp.",
  "questions": [
    {
      "id": "q-full-toeic-1",
      "questionNumber": 1,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of contract negotiations (Part 5 - Question 1), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: finalize the scheduled agreement before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on agreement"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 1: Động từ chính xác cần điền phù hợp với văn cảnh công sở (contract negotiations) là \"finalize the scheduled agreement\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-2",
      "questionNumber": 2,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of budget allocation (Part 5 - Question 2), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: allocate the scheduled expenditure before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on expenditure"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 2: Động từ chính xác cần điền phù hợp với văn cảnh công sở (budget allocation) là \"allocate the scheduled expenditure\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-3",
      "questionNumber": 3,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of logistics dispatch (Part 5 - Question 3), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: expedite the scheduled shipment before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on shipment"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 3: Động từ chính xác cần điền phù hợp với văn cảnh công sở (logistics dispatch) là \"expedite the scheduled shipment\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-4",
      "questionNumber": 4,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of personnel recruitment (Part 5 - Question 4), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: appoint the scheduled candidate before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on candidate"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 4: Động từ chính xác cần điền phù hợp với văn cảnh công sở (personnel recruitment) là \"appoint the scheduled candidate\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-5",
      "questionNumber": 5,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of annual performance review (Part 5 - Question 5), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: evaluate the scheduled productivity before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on productivity"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 5: Động từ chính xác cần điền phù hợp với văn cảnh công sở (annual performance review) là \"evaluate the scheduled productivity\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-6",
      "questionNumber": 6,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of corporate compliance (Part 5 - Question 6), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: adhere to the scheduled regulations before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on regulations"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 6: Động từ chính xác cần điền phù hợp với văn cảnh công sở (corporate compliance) là \"adhere to the scheduled regulations\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-7",
      "questionNumber": 7,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of client retention (Part 5 - Question 7), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: foster the scheduled loyalty before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on loyalty"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 7: Động từ chính xác cần điền phù hợp với văn cảnh công sở (client retention) là \"foster the scheduled loyalty\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-8",
      "questionNumber": 8,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of facility maintenance (Part 5 - Question 8), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: inspect the scheduled infrastructure before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on infrastructure"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 8: Động từ chính xác cần điền phù hợp với văn cảnh công sở (facility maintenance) là \"inspect the scheduled infrastructure\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-9",
      "questionNumber": 9,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of market expansion (Part 5 - Question 9), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: penetrate the scheduled demographic before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on demographic"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 9: Động từ chính xác cần điền phù hợp với văn cảnh công sở (market expansion) là \"penetrate the scheduled demographic\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-10",
      "questionNumber": 10,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of procurement policies (Part 5 - Question 10), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: authorize the scheduled requisition before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on requisition"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 10: Động từ chính xác cần điền phù hợp với văn cảnh công sở (procurement policies) là \"authorize the scheduled requisition\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-11",
      "questionNumber": 11,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of contract negotiations (Part 5 - Question 11), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: finalize the scheduled agreement before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on agreement"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 11: Động từ chính xác cần điền phù hợp với văn cảnh công sở (contract negotiations) là \"finalize the scheduled agreement\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-12",
      "questionNumber": 12,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of budget allocation (Part 5 - Question 12), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: allocate the scheduled expenditure before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on expenditure"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 12: Động từ chính xác cần điền phù hợp với văn cảnh công sở (budget allocation) là \"allocate the scheduled expenditure\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-13",
      "questionNumber": 13,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of logistics dispatch (Part 5 - Question 13), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: expedite the scheduled shipment before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on shipment"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 13: Động từ chính xác cần điền phù hợp với văn cảnh công sở (logistics dispatch) là \"expedite the scheduled shipment\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-14",
      "questionNumber": 14,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of personnel recruitment (Part 5 - Question 14), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: appoint the scheduled candidate before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on candidate"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 14: Động từ chính xác cần điền phù hợp với văn cảnh công sở (personnel recruitment) là \"appoint the scheduled candidate\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-15",
      "questionNumber": 15,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of annual performance review (Part 5 - Question 15), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: evaluate the scheduled productivity before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on productivity"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 15: Động từ chính xác cần điền phù hợp với văn cảnh công sở (annual performance review) là \"evaluate the scheduled productivity\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-16",
      "questionNumber": 16,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of corporate compliance (Part 5 - Question 16), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: adhere to the scheduled regulations before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on regulations"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 16: Động từ chính xác cần điền phù hợp với văn cảnh công sở (corporate compliance) là \"adhere to the scheduled regulations\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-17",
      "questionNumber": 17,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of client retention (Part 5 - Question 17), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: foster the scheduled loyalty before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on loyalty"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 17: Động từ chính xác cần điền phù hợp với văn cảnh công sở (client retention) là \"foster the scheduled loyalty\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-18",
      "questionNumber": 18,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of facility maintenance (Part 5 - Question 18), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: inspect the scheduled infrastructure before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on infrastructure"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 18: Động từ chính xác cần điền phù hợp với văn cảnh công sở (facility maintenance) là \"inspect the scheduled infrastructure\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-19",
      "questionNumber": 19,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of market expansion (Part 5 - Question 19), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: penetrate the scheduled demographic before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on demographic"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 19: Động từ chính xác cần điền phù hợp với văn cảnh công sở (market expansion) là \"penetrate the scheduled demographic\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-20",
      "questionNumber": 20,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of procurement policies (Part 5 - Question 20), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: authorize the scheduled requisition before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on requisition"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 20: Động từ chính xác cần điền phù hợp với văn cảnh công sở (procurement policies) là \"authorize the scheduled requisition\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-21",
      "questionNumber": 21,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of contract negotiations (Part 5 - Question 21), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: finalize the scheduled agreement before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on agreement"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 21: Động từ chính xác cần điền phù hợp với văn cảnh công sở (contract negotiations) là \"finalize the scheduled agreement\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-22",
      "questionNumber": 22,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of budget allocation (Part 5 - Question 22), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: allocate the scheduled expenditure before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on expenditure"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 22: Động từ chính xác cần điền phù hợp với văn cảnh công sở (budget allocation) là \"allocate the scheduled expenditure\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-23",
      "questionNumber": 23,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of logistics dispatch (Part 5 - Question 23), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: expedite the scheduled shipment before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on shipment"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 23: Động từ chính xác cần điền phù hợp với văn cảnh công sở (logistics dispatch) là \"expedite the scheduled shipment\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-24",
      "questionNumber": 24,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of personnel recruitment (Part 5 - Question 24), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: appoint the scheduled candidate before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on candidate"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 24: Động từ chính xác cần điền phù hợp với văn cảnh công sở (personnel recruitment) là \"appoint the scheduled candidate\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-25",
      "questionNumber": 25,
      "section": "Part 5 - Incomplete Sentences",
      "prompt": "In terms of annual performance review (Part 5 - Question 25), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: evaluate the scheduled productivity before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on productivity"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 25: Động từ chính xác cần điền phù hợp với văn cảnh công sở (annual performance review) là \"evaluate the scheduled productivity\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-26",
      "questionNumber": 26,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of corporate compliance (Part 5 - Question 26), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: adhere to the scheduled regulations before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on regulations"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 26: Động từ chính xác cần điền phù hợp với văn cảnh công sở (corporate compliance) là \"adhere to the scheduled regulations\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-27",
      "questionNumber": 27,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of client retention (Part 5 - Question 27), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: foster the scheduled loyalty before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on loyalty"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 27: Động từ chính xác cần điền phù hợp với văn cảnh công sở (client retention) là \"foster the scheduled loyalty\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-28",
      "questionNumber": 28,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of facility maintenance (Part 5 - Question 28), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: inspect the scheduled infrastructure before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on infrastructure"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 28: Động từ chính xác cần điền phù hợp với văn cảnh công sở (facility maintenance) là \"inspect the scheduled infrastructure\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-29",
      "questionNumber": 29,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of market expansion (Part 5 - Question 29), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: penetrate the scheduled demographic before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on demographic"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 29: Động từ chính xác cần điền phù hợp với văn cảnh công sở (market expansion) là \"penetrate the scheduled demographic\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-30",
      "questionNumber": 30,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of procurement policies (Part 5 - Question 30), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: authorize the scheduled requisition before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on requisition"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 30: Động từ chính xác cần điền phù hợp với văn cảnh công sở (procurement policies) là \"authorize the scheduled requisition\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-31",
      "questionNumber": 31,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of contract negotiations (Part 5 - Question 31), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: finalize the scheduled agreement before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on agreement"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 31: Động từ chính xác cần điền phù hợp với văn cảnh công sở (contract negotiations) là \"finalize the scheduled agreement\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-32",
      "questionNumber": 32,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of budget allocation (Part 5 - Question 32), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: allocate the scheduled expenditure before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on expenditure"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 32: Động từ chính xác cần điền phù hợp với văn cảnh công sở (budget allocation) là \"allocate the scheduled expenditure\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-33",
      "questionNumber": 33,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of logistics dispatch (Part 5 - Question 33), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: expedite the scheduled shipment before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on shipment"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 33: Động từ chính xác cần điền phù hợp với văn cảnh công sở (logistics dispatch) là \"expedite the scheduled shipment\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-34",
      "questionNumber": 34,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of personnel recruitment (Part 5 - Question 34), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: appoint the scheduled candidate before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on candidate"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 34: Động từ chính xác cần điền phù hợp với văn cảnh công sở (personnel recruitment) là \"appoint the scheduled candidate\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-35",
      "questionNumber": 35,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of annual performance review (Part 5 - Question 35), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: evaluate the scheduled productivity before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on productivity"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 35: Động từ chính xác cần điền phù hợp với văn cảnh công sở (annual performance review) là \"evaluate the scheduled productivity\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-36",
      "questionNumber": 36,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of corporate compliance (Part 5 - Question 36), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: adhere to the scheduled regulations before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on regulations"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 36: Động từ chính xác cần điền phù hợp với văn cảnh công sở (corporate compliance) là \"adhere to the scheduled regulations\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-37",
      "questionNumber": 37,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of client retention (Part 5 - Question 37), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: foster the scheduled loyalty before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on loyalty"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 37: Động từ chính xác cần điền phù hợp với văn cảnh công sở (client retention) là \"foster the scheduled loyalty\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-38",
      "questionNumber": 38,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of facility maintenance (Part 5 - Question 38), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: inspect the scheduled infrastructure before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on infrastructure"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 38: Động từ chính xác cần điền phù hợp với văn cảnh công sở (facility maintenance) là \"inspect the scheduled infrastructure\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-39",
      "questionNumber": 39,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of market expansion (Part 5 - Question 39), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: penetrate the scheduled demographic before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on demographic"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 39: Động từ chính xác cần điền phù hợp với văn cảnh công sở (market expansion) là \"penetrate the scheduled demographic\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-40",
      "questionNumber": 40,
      "section": "Part 6 - Text Completion",
      "prompt": "In terms of procurement policies (Part 5 - Question 40), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: authorize the scheduled requisition before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on requisition"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 40: Động từ chính xác cần điền phù hợp với văn cảnh công sở (procurement policies) là \"authorize the scheduled requisition\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-41",
      "questionNumber": 41,
      "section": "Part 7 - Reading Comprehension",
      "prompt": "In terms of contract negotiations (Part 5 - Question 41), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: finalize the scheduled agreement before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on agreement"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 41: Động từ chính xác cần điền phù hợp với văn cảnh công sở (contract negotiations) là \"finalize the scheduled agreement\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-42",
      "questionNumber": 42,
      "section": "Part 7 - Reading Comprehension",
      "prompt": "In terms of budget allocation (Part 5 - Question 42), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: allocate the scheduled expenditure before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on expenditure"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 42: Động từ chính xác cần điền phù hợp với văn cảnh công sở (budget allocation) là \"allocate the scheduled expenditure\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-43",
      "questionNumber": 43,
      "section": "Part 7 - Reading Comprehension",
      "prompt": "In terms of logistics dispatch (Part 5 - Question 43), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: expedite the scheduled shipment before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on shipment"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 43: Động từ chính xác cần điền phù hợp với văn cảnh công sở (logistics dispatch) là \"expedite the scheduled shipment\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-44",
      "questionNumber": 44,
      "section": "Part 7 - Reading Comprehension",
      "prompt": "In terms of personnel recruitment (Part 5 - Question 44), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: appoint the scheduled candidate before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on candidate"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 44: Động từ chính xác cần điền phù hợp với văn cảnh công sở (personnel recruitment) là \"appoint the scheduled candidate\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-45",
      "questionNumber": 45,
      "section": "Part 7 - Reading Comprehension",
      "prompt": "In terms of annual performance review (Part 5 - Question 45), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: evaluate the scheduled productivity before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on productivity"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 45: Động từ chính xác cần điền phù hợp với văn cảnh công sở (annual performance review) là \"evaluate the scheduled productivity\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-46",
      "questionNumber": 46,
      "section": "Part 7 - Reading Comprehension",
      "prompt": "In terms of corporate compliance (Part 5 - Question 46), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: adhere to the scheduled regulations before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on regulations"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 46: Động từ chính xác cần điền phù hợp với văn cảnh công sở (corporate compliance) là \"adhere to the scheduled regulations\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-47",
      "questionNumber": 47,
      "section": "Part 7 - Reading Comprehension",
      "prompt": "In terms of client retention (Part 5 - Question 47), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: foster the scheduled loyalty before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on loyalty"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 47: Động từ chính xác cần điền phù hợp với văn cảnh công sở (client retention) là \"foster the scheduled loyalty\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-48",
      "questionNumber": 48,
      "section": "Part 7 - Reading Comprehension",
      "prompt": "In terms of facility maintenance (Part 5 - Question 48), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: inspect the scheduled infrastructure before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on infrastructure"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 48: Động từ chính xác cần điền phù hợp với văn cảnh công sở (facility maintenance) là \"inspect the scheduled infrastructure\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-49",
      "questionNumber": 49,
      "section": "Part 7 - Reading Comprehension",
      "prompt": "In terms of market expansion (Part 5 - Question 49), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: penetrate the scheduled demographic before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on demographic"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 49: Động từ chính xác cần điền phù hợp với văn cảnh công sở (market expansion) là \"penetrate the scheduled demographic\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-toeic-50",
      "questionNumber": 50,
      "section": "Part 7 - Reading Comprehension",
      "prompt": "In terms of procurement policies (Part 5 - Question 50), all departmental managers are instructed to review the official procedure thoroughly:",
      "options": [
        "Option A: authorize the scheduled requisition before the quarter end",
        "Option B: excessively postpone the required documentation",
        "Option C: dismiss the standard operating guidelines",
        "Option D: neglect previous audits on requisition"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Giải thích chi tiết cho câu 50: Động từ chính xác cần điền phù hợp với văn cảnh công sở (procurement policies) là \"authorize the scheduled requisition\". Các phương án còn lại mang nghĩa tiêu cực hoặc sai ngữ pháp.",
      "category": "Workplace & Business English",
      "cefr": "B2",
      "skill": "reading"
    }
  ]
},
  {
  "id": "test-full-ielts-academic-standard",
  "title": "IELTS Academic Reading & Language Assessment (Full Section)",
  "titleVi": "Đề Thi Thử IELTS Academic Chuẩn Khảo Thí (30 Câu)",
  "type": "full_ielts",
  "durationMinutes": 45,
  "totalQuestions": 30,
  "targetLevel": "Band 7.0 - 8.5",
  "descriptionVi": "Bài thi mô phỏng định dạng IELTS Academic Reading với 30 câu hỏi chuyên sâu từ Passage 1 đến Passage 3, kiểm tra kỹ năng Skimming, Scanning và suy luận logic.",
  "questions": [
    {
      "id": "q-full-ielts-1",
      "questionNumber": 1,
      "section": "Reading Passage 1",
      "prompt": "According to recent scientific treatises on Renewable Energy Paradigms (Academic Section 1), empirical research on photovoltaic efficiency demonstrates that:",
      "options": [
        "it systematically diminishes carbon dependency across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 1: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"photovoltaic efficiency\" chứng minh rằng phương án A (\"diminishes carbon dependency\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-2",
      "questionNumber": 2,
      "section": "Reading Passage 1",
      "prompt": "According to recent scientific treatises on Cognitive Neurobiology (Academic Section 2), empirical research on synaptic plasticity demonstrates that:",
      "options": [
        "it systematically facilitates adaptive memory retention across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 2: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"synaptic plasticity\" chứng minh rằng phương án A (\"facilitates adaptive memory retention\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-3",
      "questionNumber": 3,
      "section": "Reading Passage 1",
      "prompt": "According to recent scientific treatises on Urban Macroeconomics (Academic Section 3), empirical research on infrastructural amortization demonstrates that:",
      "options": [
        "it systematically stimulates regional productivity across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 3: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"infrastructural amortization\" chứng minh rằng phương án A (\"stimulates regional productivity\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-4",
      "questionNumber": 4,
      "section": "Reading Passage 1",
      "prompt": "According to recent scientific treatises on Atmospheric Climatology (Academic Section 4), empirical research on oceanic thermal inertia demonstrates that:",
      "options": [
        "it systematically modulates continental temperature extremes across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 4: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"oceanic thermal inertia\" chứng minh rằng phương án A (\"modulates continental temperature extremes\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-5",
      "questionNumber": 5,
      "section": "Reading Passage 1",
      "prompt": "According to recent scientific treatises on Behavioral Psychology (Academic Section 5), empirical research on intrinsic incentive structures demonstrates that:",
      "options": [
        "it systematically enhances prolonged task persistence across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 5: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"intrinsic incentive structures\" chứng minh rằng phương án A (\"enhances prolonged task persistence\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-6",
      "questionNumber": 6,
      "section": "Reading Passage 1",
      "prompt": "According to recent scientific treatises on Paleontological Taxonomy (Academic Section 6), empirical research on morphological differentiation demonstrates that:",
      "options": [
        "it systematically clarifies evolutionary divergence across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 6: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"morphological differentiation\" chứng minh rằng phương án A (\"clarifies evolutionary divergence\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-7",
      "questionNumber": 7,
      "section": "Reading Passage 1",
      "prompt": "According to recent scientific treatises on Renewable Energy Paradigms (Academic Section 7), empirical research on photovoltaic efficiency demonstrates that:",
      "options": [
        "it systematically diminishes carbon dependency across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 7: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"photovoltaic efficiency\" chứng minh rằng phương án A (\"diminishes carbon dependency\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-8",
      "questionNumber": 8,
      "section": "Reading Passage 1",
      "prompt": "According to recent scientific treatises on Cognitive Neurobiology (Academic Section 8), empirical research on synaptic plasticity demonstrates that:",
      "options": [
        "it systematically facilitates adaptive memory retention across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 8: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"synaptic plasticity\" chứng minh rằng phương án A (\"facilitates adaptive memory retention\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-9",
      "questionNumber": 9,
      "section": "Reading Passage 1",
      "prompt": "According to recent scientific treatises on Urban Macroeconomics (Academic Section 9), empirical research on infrastructural amortization demonstrates that:",
      "options": [
        "it systematically stimulates regional productivity across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 9: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"infrastructural amortization\" chứng minh rằng phương án A (\"stimulates regional productivity\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-10",
      "questionNumber": 10,
      "section": "Reading Passage 1",
      "prompt": "According to recent scientific treatises on Atmospheric Climatology (Academic Section 10), empirical research on oceanic thermal inertia demonstrates that:",
      "options": [
        "it systematically modulates continental temperature extremes across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 10: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"oceanic thermal inertia\" chứng minh rằng phương án A (\"modulates continental temperature extremes\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-11",
      "questionNumber": 11,
      "section": "Reading Passage 2",
      "prompt": "According to recent scientific treatises on Behavioral Psychology (Academic Section 11), empirical research on intrinsic incentive structures demonstrates that:",
      "options": [
        "it systematically enhances prolonged task persistence across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 11: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"intrinsic incentive structures\" chứng minh rằng phương án A (\"enhances prolonged task persistence\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-12",
      "questionNumber": 12,
      "section": "Reading Passage 2",
      "prompt": "According to recent scientific treatises on Paleontological Taxonomy (Academic Section 12), empirical research on morphological differentiation demonstrates that:",
      "options": [
        "it systematically clarifies evolutionary divergence across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 12: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"morphological differentiation\" chứng minh rằng phương án A (\"clarifies evolutionary divergence\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-13",
      "questionNumber": 13,
      "section": "Reading Passage 2",
      "prompt": "According to recent scientific treatises on Renewable Energy Paradigms (Academic Section 13), empirical research on photovoltaic efficiency demonstrates that:",
      "options": [
        "it systematically diminishes carbon dependency across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 13: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"photovoltaic efficiency\" chứng minh rằng phương án A (\"diminishes carbon dependency\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-14",
      "questionNumber": 14,
      "section": "Reading Passage 2",
      "prompt": "According to recent scientific treatises on Cognitive Neurobiology (Academic Section 14), empirical research on synaptic plasticity demonstrates that:",
      "options": [
        "it systematically facilitates adaptive memory retention across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 14: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"synaptic plasticity\" chứng minh rằng phương án A (\"facilitates adaptive memory retention\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-15",
      "questionNumber": 15,
      "section": "Reading Passage 2",
      "prompt": "According to recent scientific treatises on Urban Macroeconomics (Academic Section 15), empirical research on infrastructural amortization demonstrates that:",
      "options": [
        "it systematically stimulates regional productivity across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 15: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"infrastructural amortization\" chứng minh rằng phương án A (\"stimulates regional productivity\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-16",
      "questionNumber": 16,
      "section": "Reading Passage 2",
      "prompt": "According to recent scientific treatises on Atmospheric Climatology (Academic Section 16), empirical research on oceanic thermal inertia demonstrates that:",
      "options": [
        "it systematically modulates continental temperature extremes across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 16: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"oceanic thermal inertia\" chứng minh rằng phương án A (\"modulates continental temperature extremes\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-17",
      "questionNumber": 17,
      "section": "Reading Passage 2",
      "prompt": "According to recent scientific treatises on Behavioral Psychology (Academic Section 17), empirical research on intrinsic incentive structures demonstrates that:",
      "options": [
        "it systematically enhances prolonged task persistence across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 17: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"intrinsic incentive structures\" chứng minh rằng phương án A (\"enhances prolonged task persistence\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-18",
      "questionNumber": 18,
      "section": "Reading Passage 2",
      "prompt": "According to recent scientific treatises on Paleontological Taxonomy (Academic Section 18), empirical research on morphological differentiation demonstrates that:",
      "options": [
        "it systematically clarifies evolutionary divergence across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 18: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"morphological differentiation\" chứng minh rằng phương án A (\"clarifies evolutionary divergence\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-19",
      "questionNumber": 19,
      "section": "Reading Passage 2",
      "prompt": "According to recent scientific treatises on Renewable Energy Paradigms (Academic Section 19), empirical research on photovoltaic efficiency demonstrates that:",
      "options": [
        "it systematically diminishes carbon dependency across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 19: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"photovoltaic efficiency\" chứng minh rằng phương án A (\"diminishes carbon dependency\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-20",
      "questionNumber": 20,
      "section": "Reading Passage 2",
      "prompt": "According to recent scientific treatises on Cognitive Neurobiology (Academic Section 20), empirical research on synaptic plasticity demonstrates that:",
      "options": [
        "it systematically facilitates adaptive memory retention across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 20: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"synaptic plasticity\" chứng minh rằng phương án A (\"facilitates adaptive memory retention\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-21",
      "questionNumber": 21,
      "section": "Reading Passage 3",
      "prompt": "According to recent scientific treatises on Urban Macroeconomics (Academic Section 21), empirical research on infrastructural amortization demonstrates that:",
      "options": [
        "it systematically stimulates regional productivity across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 21: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"infrastructural amortization\" chứng minh rằng phương án A (\"stimulates regional productivity\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-22",
      "questionNumber": 22,
      "section": "Reading Passage 3",
      "prompt": "According to recent scientific treatises on Atmospheric Climatology (Academic Section 22), empirical research on oceanic thermal inertia demonstrates that:",
      "options": [
        "it systematically modulates continental temperature extremes across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 22: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"oceanic thermal inertia\" chứng minh rằng phương án A (\"modulates continental temperature extremes\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-23",
      "questionNumber": 23,
      "section": "Reading Passage 3",
      "prompt": "According to recent scientific treatises on Behavioral Psychology (Academic Section 23), empirical research on intrinsic incentive structures demonstrates that:",
      "options": [
        "it systematically enhances prolonged task persistence across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 23: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"intrinsic incentive structures\" chứng minh rằng phương án A (\"enhances prolonged task persistence\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-24",
      "questionNumber": 24,
      "section": "Reading Passage 3",
      "prompt": "According to recent scientific treatises on Paleontological Taxonomy (Academic Section 24), empirical research on morphological differentiation demonstrates that:",
      "options": [
        "it systematically clarifies evolutionary divergence across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 24: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"morphological differentiation\" chứng minh rằng phương án A (\"clarifies evolutionary divergence\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-25",
      "questionNumber": 25,
      "section": "Reading Passage 3",
      "prompt": "According to recent scientific treatises on Renewable Energy Paradigms (Academic Section 25), empirical research on photovoltaic efficiency demonstrates that:",
      "options": [
        "it systematically diminishes carbon dependency across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 25: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"photovoltaic efficiency\" chứng minh rằng phương án A (\"diminishes carbon dependency\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-26",
      "questionNumber": 26,
      "section": "Reading Passage 3",
      "prompt": "According to recent scientific treatises on Cognitive Neurobiology (Academic Section 26), empirical research on synaptic plasticity demonstrates that:",
      "options": [
        "it systematically facilitates adaptive memory retention across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 26: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"synaptic plasticity\" chứng minh rằng phương án A (\"facilitates adaptive memory retention\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-27",
      "questionNumber": 27,
      "section": "Reading Passage 3",
      "prompt": "According to recent scientific treatises on Urban Macroeconomics (Academic Section 27), empirical research on infrastructural amortization demonstrates that:",
      "options": [
        "it systematically stimulates regional productivity across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 27: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"infrastructural amortization\" chứng minh rằng phương án A (\"stimulates regional productivity\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-28",
      "questionNumber": 28,
      "section": "Reading Passage 3",
      "prompt": "According to recent scientific treatises on Atmospheric Climatology (Academic Section 28), empirical research on oceanic thermal inertia demonstrates that:",
      "options": [
        "it systematically modulates continental temperature extremes across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 28: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"oceanic thermal inertia\" chứng minh rằng phương án A (\"modulates continental temperature extremes\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-29",
      "questionNumber": 29,
      "section": "Reading Passage 3",
      "prompt": "According to recent scientific treatises on Behavioral Psychology (Academic Section 29), empirical research on intrinsic incentive structures demonstrates that:",
      "options": [
        "it systematically enhances prolonged task persistence across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 29: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"intrinsic incentive structures\" chứng minh rằng phương án A (\"enhances prolonged task persistence\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    },
    {
      "id": "q-full-ielts-30",
      "questionNumber": 30,
      "section": "Reading Passage 3",
      "prompt": "According to recent scientific treatises on Paleontological Taxonomy (Academic Section 30), empirical research on morphological differentiation demonstrates that:",
      "options": [
        "it systematically clarifies evolutionary divergence across longitudinal trials",
        "it completely invalidates established empirical methodology",
        "it exerts negligible influence upon environmental variables",
        "it contradicts all peer-reviewed contemporary consensus"
      ],
      "correctAnswerIndex": 0,
      "explanationVi": "Phân tích học thuật IELTS câu 30: Dẫn chứng trong văn bản khẳng định nghiên cứu về \"morphological differentiation\" chứng minh rằng phương án A (\"clarifies evolutionary divergence\") là nhận định chuẩn xác.",
      "category": "Academic Reading Comprehension",
      "cefr": "C1",
      "skill": "reading"
    }
  ]
},
  {
    id: 'test-placement',
    title: 'Comprehensive CEFR Placement Test',
    titleVi: 'Bài Kiểm Tra Đầu Vào Đa Kỹ Năng (A1 - C1)',
    type: 'placement_test',
    durationMinutes: 15,
    totalQuestions: 10,
    targetLevel: 'All Levels',
    descriptionVi: 'Đánh giá độ chuẩn xác về ngữ pháp, từ vựng và tư duy đọc hiểu để gợi ý lộ trình học thích hợp nhất cho bạn.',
    questions: [
      {
        id: 'q-pl-1',
        questionNumber: 1,
        section: 'Grammar Foundation',
        prompt: 'Look at the clouds! It _____ rain very soon.',
        options: ['will', 'is going to', 'rains', 'is raining'],
        correctAnswerIndex: 1,
        explanationVi: 'Có bằng chứng cụ thể trước mắt ("Look at the clouds") -> Dùng "be going to" để diễn tả dự đoán chắc chắn.',
        category: 'Future Forms'
      },
      {
        id: 'q-pl-2',
        questionNumber: 2,
        section: 'Grammar Foundation',
        prompt: 'Neither the manager nor the employees _____ informed about the policy change.',
        options: ['was', 'were', 'is', 'has been'],
        correctAnswerIndex: 1,
        explanationVi: 'Quy tắc hòa hợp chủ ngữ "Neither A nor B": Động từ chia theo chủ ngữ gần nhất (B = employees, số nhiều -> were).',
        category: 'Subject-Verb Agreement'
      },
      {
        id: 'q-pl-3',
        questionNumber: 3,
        section: 'Vocabulary in Context',
        prompt: 'The government took swift actions to _____ the impact of the economic recession.',
        options: ['provoke', 'mitigate', 'disrupt', 'amplify'],
        correctAnswerIndex: 1,
        explanationVi: '"Mitigate" có nghĩa là giảm nhẹ tác động tiêu cực.',
        category: 'Lexical Resource'
      },
      {
        id: 'q-pl-4',
        questionNumber: 4,
        section: 'Reading Comprehension',
        contextPassage: 'Technological disruption has fundamentally reshaped consumer expectations. Today, immediate responsiveness is no longer considered a luxury; rather, it has become an indispensable baseline expectation across e-commerce ecosystems.',
        prompt: 'According to the passage, what is true about immediate responsiveness?',
        options: [
          'It is exclusively available to premium subscribers.',
          'It has transitioned from a luxury to a fundamental requirement.',
          'It has reduced consumer engagement on e-commerce platforms.',
          'It is resisted by modern consumers.'
        ],
        correctAnswerIndex: 1,
        explanationVi: 'Đoạn văn nêu rõ: "immediate responsiveness is no longer considered a luxury; rather, it has become an indispensable baseline expectation" -> Đã chuyển từ xa xỉ thành yêu cầu căn bản.',
        category: 'Reading Comprehension'
      },
      {
        id: 'q-pl-5',
        questionNumber: 5,
        section: 'Advanced Grammar',
        prompt: 'Under no circumstances _____ to leave the exam hall before the supervisor signals.',
        options: ['students are allowed', 'are students allowed', 'were students allowing', 'allowed are students'],
        correctAnswerIndex: 1,
        explanationVi: 'Cụm đảo ngữ phủ định "Under no circumstances" yêu cầu đảo to be "are" lên trước "students".',
        category: 'Inversion'
      },
      {
        id: 'q-pl-6',
        questionNumber: 6,
        section: 'TOEIC Business Practice',
        prompt: 'The marketing department completed the project ahead of schedule, _____ the executive board.',
        options: ['delighted', 'delighting', 'delight', 'to delighting'],
        correctAnswerIndex: 1,
        explanationVi: 'Rút gọn mệnh đề quan hệ dạng chủ động thành phân từ hiện tại (present participle: delighting = which delighted...).',
        category: 'Participle Clauses'
      },
      {
        id: 'q-pl-7',
        questionNumber: 7,
        section: 'Collocations & Prepositions',
        prompt: 'She has always been deeply committed _____ environmental conservation.',
        options: ['for', 'to', 'with', 'about'],
        correctAnswerIndex: 1,
        explanationVi: 'Cấu trúc cố định: "committed to + N/V-ing" (tận tâm, cam kết với điều gì).',
        category: 'Prepositions'
      },
      {
        id: 'q-pl-8',
        questionNumber: 8,
        section: 'Academic Vocabulary',
        prompt: 'The new scientific findings were thoroughly _____ by an independent research committee.',
        options: ['scrutinized', 'evaded', 'bypassed', 'neglected'],
        correctAnswerIndex: 0,
        explanationVi: '"Scrutinized" nghĩa là kiểm tra, thẩm định kỹ lưỡng.',
        category: 'C1 Vocabulary'
      },
      {
        id: 'q-pl-9',
        questionNumber: 9,
        section: 'Conditionals',
        prompt: 'Had you warned me earlier, I _____ that risky contract.',
        options: ['would not sign', 'will not sign', 'would not have signed', 'had not signed'],
        correctAnswerIndex: 2,
        explanationVi: 'Đảo ngữ câu điều kiện loại 3 ("Had you warned me" = If you had warned me) -> Mệnh đề chính: would not have signed.',
        category: 'Conditionals'
      },
      {
        id: 'q-pl-10',
        questionNumber: 10,
        section: 'Idioms & Pragmatics',
        prompt: 'When negotiating high-stakes agreements, one must keep their cards close to their chest. This means:',
        options: [
          'Showing everyone your secret plans openly.',
          'Keeping your intentions and strategies confidential.',
          'Discarding all unnecessary playing cards.',
          'Leaving the negotiation room immediately.'
        ],
        correctAnswerIndex: 1,
        explanationVi: 'Thành ngữ "keep one’s cards close to one’s chest" có nghĩa là giữ kín kế hoạch/chiến lược, không để đối phương nắm bắt.',
        category: 'Idioms'
      }
    ]
  },
  {
    id: 'test-toeic-reading-750',
    title: 'TOEIC Reading Mini-Mock 2026',
    titleVi: 'Đề Thi Thử TOEIC Reading & Ngữ Pháp Thương Mại',
    type: 'mini_test',
    durationMinutes: 20,
    totalQuestions: 8,
    targetLevel: 'Target 750+',
    descriptionVi: 'Mô phỏng 100% cấu trúc Part 5 & Part 7 đề thi TOEIC thật với chủ đề công sở, email và hợp đồng kinh doanh.',
    questions: [
      {
        id: 't-toeic-1',
        questionNumber: 1,
        section: 'Part 5 - Incomplete Sentences',
        prompt: 'Employees who wish to enroll in the leadership workshop must submit their application forms _____ Friday noon.',
        options: ['until', 'by', 'since', 'during'],
        correctAnswerIndex: 1,
        explanationVi: '"By" dùng để chỉ thời hạn chót (deadline: trước hoặc đúng lúc). "Until" dùng cho hành động kéo dài liên tục tới thời điểm đó.',
        category: 'Prepositions of Time'
      },
      {
        id: 't-toeic-2',
        questionNumber: 2,
        section: 'Part 5 - Incomplete Sentences',
        prompt: 'The regional sales manager praised the team for their _____ performance during the promotional campaign.',
        options: ['exception', 'exceptional', 'exceptionally', 'excepting'],
        correctAnswerIndex: 1,
        explanationVi: 'Đứng trước danh từ "performance" cần một tính từ bổ nghĩa ("exceptional" = xuất chúng, vượt trội).',
        category: 'Word Forms'
      },
      {
        id: 't-toeic-3',
        questionNumber: 3,
        section: 'Part 5 - Incomplete Sentences',
        prompt: 'Please verify that all client invoices have been entered into the software system _____ before leaving today.',
        options: ['accuracy', 'accurate', 'accurately', 'accurateness'],
        correctAnswerIndex: 2,
        explanationVi: 'Cần trạng từ "accurately" để bổ nghĩa cho phân từ "have been entered".',
        category: 'Adverbs'
      },
      {
        id: 't-toeic-4',
        questionNumber: 4,
        section: 'Part 7 - Reading Comprehension',
        contextPassage: `MEMORANDUM
To: All Department Heads
From: Claire Vance, Operations Director
Date: October 12, 2026
Subject: System Maintenance & Cloud Migration

Please be advised that our central database servers will be undergoing scheduled maintenance this Saturday between 1:00 AM and 5:00 AM. During this four-hour maintenance window, employee portals and internal cloud storage will be temporarily inaccessible. 

We strongly urge all staff members to synchronize their local documents by 6:00 PM on Friday to prevent potential data discrepancies. The system is expected to be fully functional before normal business operations resume on Monday morning.`,
        prompt: 'What are staff members advised to do before Friday evening?',
        options: [
          'Contact Claire Vance directly.',
          'Save and synchronize local documents.',
          'Work remotely over the weekend.',
          'Shut down physical office computers.'
        ],
        correctAnswerIndex: 1,
        explanationVi: 'Bản ghi nhớ ghi: "We strongly urge all staff members to synchronize their local documents by 6:00 PM on Friday".',
        category: 'Text Comprehension'
      },
      {
        id: 't-toeic-5',
        questionNumber: 5,
        section: 'Part 7 - Reading Comprehension',
        contextPassage: `(Refer to the memorandum above)`,
        prompt: 'In the memorandum, the word "discrepancies" is closest in meaning to:',
        options: ['improvements', 'inconsistencies', 'agreements', 'expenditures'],
        correctAnswerIndex: 1,
        explanationVi: '"Discrepancies" nghĩa là sự sai lệch, bất nhất (= inconsistencies).',
        category: 'Vocabulary in Context'
      },
      {
        id: 't-toeic-6',
        questionNumber: 6,
        section: 'Part 5 - Incomplete Sentences',
        prompt: 'Ms. Thornton was _____ selected to lead the newly formed regional expansion initiative.',
        options: ['unanimous', 'unanimously', 'unanimity', 'unanimousness'],
        correctAnswerIndex: 1,
        explanationVi: 'Đứng giữa to be "was" và phân từ "selected" cần trạng từ "unanimously" (nhất trí).',
        category: 'Word Forms'
      },
      {
        id: 't-toeic-7',
        questionNumber: 7,
        section: 'Part 5 - Incomplete Sentences',
        prompt: 'The updated software security patch is _____ with all current company desktop models.',
        options: ['compatible', 'competing', 'comparable', 'competent'],
        correctAnswerIndex: 0,
        explanationVi: 'Cấu trúc "compatible with" nghĩa là tương thích với.',
        category: 'Lexical Collocations'
      },
      {
        id: 't-toeic-8',
        questionNumber: 8,
        section: 'Part 5 - Incomplete Sentences',
        prompt: 'Neither the accounting team nor the project supervisor _____ approved the emergency budget request.',
        options: ['has', 'have', 'having', 'to have'],
        correctAnswerIndex: 0,
        explanationVi: 'Quy tắc "Neither A nor B": Động từ chia theo chủ ngữ gần nhất B (project supervisor, số ít -> has).',
        category: 'Subject-Verb Agreement'
      }
    ]
  },
  {
    id: 'test-ielts-academic-mock',
    title: 'IELTS Academic Reading & Lexicon Mini-Mock',
    titleVi: 'Đề Thi Thử IELTS Academic Reading & Ngữ Pháp',
    type: 'mini_test',
    durationMinutes: 20,
    totalQuestions: 6,
    targetLevel: 'Band 7.0 - 8.5',
    descriptionVi: 'Mô phỏng 100% cấu trúc câu hỏi True/False/Not Given, trắc nghiệm và từ vựng học thuật của đề thi IELTS thật.',
    questions: [
      {
        id: 'ielts-q-1',
        questionNumber: 1,
        section: 'Reading Section 1',
        contextPassage: `The architectural transition toward sustainable urban design has intensified worldwide. Historically, metropolitan infrastructures prioritized vehicular convenience at the expense of ecological balance. Contemporary urban planners now advocate biophilic architecture—a paradigm that seamlessly integrates flora and natural daylight into high-density residential towers. Empirical studies indicate that biophilic environments diminish occupational stress and foster mental resilience among residents.`,
        prompt: 'According to the passage, historical urban designs prioritized:',
        options: [
          'Biophilic ecological balances.',
          'Vehicular convenience over ecological sustainability.',
          'Flora integration into office buildings.',
          'Solar daylight optimization.'
        ],
        correctAnswerIndex: 1,
        explanationVi: 'Bài đọc nêu rõ: "Historically, metropolitan infrastructures prioritized vehicular convenience at the expense of ecological balance".',
        category: 'Reading Comprehension'
      },
      {
        id: 'ielts-q-2',
        questionNumber: 2,
        section: 'Reading Section 1',
        contextPassage: `(Refer to the passage above)`,
        prompt: 'In the passage, the word "diminish" is closest in meaning to:',
        options: ['mitigate / reduce', 'accelerate', 'substantiate', 'provoke'],
        correctAnswerIndex: 0,
        explanationVi: '"Diminish" đồng nghĩa với "reduce" hoặc "mitigate" (làm giảm nhẹ).',
        category: 'Lexical Resource'
      },
      {
        id: 'ielts-q-3',
        questionNumber: 3,
        section: 'Grammar & Syntax',
        prompt: 'Not only _____ comprehensive research, but they also formulated groundbreaking environmental policies.',
        options: ['they conducted', 'did they conduct', 'they were conducting', 'conducted they'],
        correctAnswerIndex: 1,
        explanationVi: 'Cấu trúc đảo ngữ "Not only + auxiliary (did) + subject (they) + main verb (conduct)...".',
        category: 'Inversion'
      },
      {
        id: 'ielts-q-4',
        questionNumber: 4,
        section: 'Academic Collocations',
        prompt: 'The technological innovation had a _____ impact on remote educational accessibility.',
        options: ['profound', 'heavily', 'sharply', 'steeply'],
        correctAnswerIndex: 0,
        explanationVi: 'Collocation học thuật: "profound impact" (tác động sâu sắc). Cần tính từ trước danh từ "impact".',
        category: 'Academic Collocations'
      },
      {
        id: 'ielts-q-5',
        questionNumber: 5,
        section: 'Conditionals in Context',
        prompt: 'Had the clinical trials been postponed, the vaccine _____ ready for distribution by winter.',
        options: ['would not be', 'will not be', 'would not have been', 'had not been'],
        correctAnswerIndex: 2,
        explanationVi: 'Đảo ngữ câu điều kiện loại 3 ("Had the trials been postponed" = If they had been...) -> Vế sau: would not have been.',
        category: 'Conditionals'
      },
      {
        id: 'ielts-q-6',
        questionNumber: 6,
        section: 'Relative Clauses',
        prompt: 'The renewable energy consortium, _____ headquarters are based in Geneva, announced a multilateral initiative.',
        options: ['which', 'that', 'whose', 'where'],
        correctAnswerIndex: 2,
        explanationVi: '"Whose" là đại từ quan hệ chỉ sở hữu (trụ sở của tập đoàn = whose headquarters).',
        category: 'Relative Clauses'
      }
    ]
  }
];

export const INITIAL_PRACTICE_TESTS: PracticeTest[] = [
  ...STANDARDIZED_BLUEPRINT_TESTS,
  ...STANDARDIZED_CEFR_BENCHMARK_TESTS,
  ...BASE_PRACTICE_TESTS,
  ...NEW_TESTS_CATALOG
];

export const INITIAL_PRACTICE_SETS: PracticeSet[] = EXPANDED_PRACTICE_SETS;

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-step',
    titleVi: 'Bước Khởi Đầu',
    descVi: 'Hoàn thành bài học đầu tiên trên LingoPeak',
    iconName: 'Sparkles',
    category: 'overall',
    progress: 0,
    maxProgress: 1,
    unlocked: false
  },
  {
    id: 'ach-streak-3',
    titleVi: 'Chiến Binh Chăm Chỉ',
    descVi: 'Duy trì chuỗi học tập 3 ngày liên tiếp',
    iconName: 'Flame',
    category: 'streak',
    progress: 0,
    maxProgress: 3,
    unlocked: false
  },
  {
    id: 'ach-streak-7',
    titleVi: 'Thói Quen Vàng',
    descVi: 'Duy trì chuỗi học tập 7 ngày liên tiếp',
    iconName: 'Zap',
    category: 'streak',
    progress: 0,
    maxProgress: 7,
    unlocked: false
  },
  {
    id: 'ach-vocab-50',
    titleVi: 'Kho Báu Từ Vựng',
    descVi: 'Làm chủ 50 từ vựng theo phương pháp Spaced Repetition',
    iconName: 'BookOpen',
    category: 'vocab',
    progress: 0,
    maxProgress: 50,
    unlocked: false
  },
  {
    id: 'ach-exam-ace',
    titleVi: 'Kỳ Thủ Phòng Thi',
    descVi: 'Đạt trên 85% điểm trong một bài kiểm tra tính giờ',
    iconName: 'Award',
    category: 'test',
    progress: 0,
    maxProgress: 1,
    unlocked: false
  },
  {
    id: 'ach-speaking-pro',
    titleVi: 'Tự Tin Cất Lời',
    descVi: 'Hoàn thành 5 lượt luyện phát âm hoặc đối thoại với AI',
    iconName: 'Mic',
    category: 'speaking',
    progress: 0,
    maxProgress: 5,
    unlocked: false
  }
];

export const INITIAL_WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: 'w-ielts-1',
    title: 'Technology & Remote Work (IELTS Task 2)',
    category: 'IELTS_TASK_2',
    promptEn: 'Some people believe that technological developments will soon allow everyone to work and study remotely, leading to the decline of traditional offices and universities. To what extent do you agree or disagree?',
    promptVi: 'Nhiều người tin rằng sự phát triển công nghệ sẽ sớm cho phép tất cả mọi người làm việc và học tập từ xa, dẫn đến sự suy giảm của văn phòng và đại học truyền thống. Bạn đồng ý hay không đồng ý đến mức độ nào?',
    bandOrLevel: 'Band 7.5 Target',
    tipsVi: [
      'Xác định rõ quan điểm (Agree / Disagree / Balanced) ngay tại mở bài.',
      'Sử dụng các từ nối học thuật: "Indisputably", "Notwithstanding the merits of remote environments", "A hybrid paradigm".',
      'Đưa ra ví dụ thực tế về tính gắn kết xã hội và thực nghiệm khoa học cần phòng lab.'
    ],
    sampleAnswerEn: `In recent years, breakthroughs in telecommunications and collaborative software have radically transformed modern workspaces and academia. While remote arrangements offer undeniable convenience and flexibility, I largely disagree with the notion that physical institutions will be completely rendered obsolete.

Undoubtedly, remote connectivity yields substantial efficiencies. Professionals save countless commuting hours, while digital lecture halls democratize access to world-class educational curricula. However, spontaneous human collaboration and innovative brainstorming flourish most dynamically within physical environments. Furthermore, scientific disciplines require rigorous laboratory experiments that cannot be replicated through virtual screens alone.

In conclusion, although digital solutions will undoubtedly complement physical establishments, a hybrid equilibrium rather than total obsolescence remains the most realistic trajectory.`
  },
  {
    id: 'w-toeic-1',
    title: 'Business Email: Vendor Inconvenience (TOEIC)',
    category: 'TOEIC_EMAIL',
    promptEn: 'You are the purchasing manager at Zenith Corp. Write an email to your primary paper and office supplies vendor expressing concern over a delayed shipment and requesting an urgent resolution within 48 hours.',
    promptVi: 'Bạn là trưởng phòng mua sắm tại Zenith Corp. Viết một email gửi đến nhà cung cấp văn phòng phẩm bày tỏ sự quan ngại về lô hàng bị chậm trễ và yêu cầu hướng giải quyết khẩn cấp trong vòng 48 giờ.',
    bandOrLevel: 'TOEIC 180+/200',
    tipsVi: [
      'Mở đầu trang trọng: Dear Mr./Ms. [Tên] hoặc Dear Customer Relations Team.',
      'Nêu rõ mã đơn hàng (Order #PO-8821) và ngày đặt.',
      'Dùng giọng điệu chuyên nghiệp nhưng cương quyết (assertive yet professional).'
    ],
    sampleAnswerEn: `Subject: URGENT: Delivery Delay Notice - Purchase Order #ZN-40912

Dear Mr. Gallagher,

I am writing to bring to your immediate attention a critical issue regarding Purchase Order #ZN-40912, which was scheduled for delivery to our central warehouse yesterday, October 11th.

To date, our logistics department has not received the expected consignment, nor have we been notified of any transit disruptions. As this shipment includes critical promotional supplies for our upcoming annual conference, any further postponement will cause severe operational complications.

Could you please confirm the current whereabouts of our dispatch and provide an expedited delivery timetable within 24 hours? 

Thank you for your prompt cooperation.

Sincerely,
David Nguyen
Purchasing Director, Zenith Corp.`
  },
  {
    id: 'w-ielts-2',
    title: 'Renewable Electricity Generation Trends (IELTS Task 1 Report)',
    category: 'IELTS_TASK_1',
    promptEn: 'The graph illustrates the proportion of electricity generated from wind and solar power in four European nations between 2010 and 2025. Summarize the main features and make comparisons where relevant.',
    promptVi: 'Biểu đồ minh họa tỷ lệ điện năng được sản xuất từ năng lượng gió và mặt trời tại 4 quốc gia châu Âu từ 2010 đến 2025. Tóm tắt các đặc điểm chính và so sánh đối chiếu.',
    bandOrLevel: 'Band 8.0 Target',
    tipsVi: [
      'Viết câu tổng quan (Overview) nêu xu hướng tăng trưởng chung của toàn bộ các quốc gia.',
      'Sử dụng động từ miêu tả xu hướng: "witnessed an upward trajectory", "surged substantially".',
      'Đưa số liệu dẫn chứng cụ thể từ các mốc năm 2010 và 2025.'
    ],
    sampleAnswerEn: `The line graph details the percentage of electricity generated via wind and solar facilities across four distinct European countries over a fifteen-year period commencing in 2010.

Overall, all surveyed nations registered substantial increases in renewable electricity production. While Germany consistently commanded the highest generation shares throughout the timeframe, Spain experienced the most dramatic acceleration post-2018.

In 2010, Germany generated approximately 12% of its domestic electricity from wind and solar arrays. This proportion expanded steadily, culminating at nearly 38% by 2025. Similarly, Spain began at a modest 8% before experiencing an exponential surge between 2018 and 2025, ultimately reaching 34%. In contrast, Denmark and the Netherlands exhibited moderate yet continuous growth, concluding the period at 26% and 21% respectively.`
  },
  {
    id: 'w-toeic-2',
    title: 'Corporate Wellness & Productivity (TOEIC Part 3 Essay)',
    category: 'TOEIC_ESSAY',
    promptEn: 'Some enterprises provide extensive wellness stipends and flexible hours to retain top talent. Do you believe corporate wellness incentives directly boost employee productivity? Support your opinion with reasons and examples.',
    promptVi: 'Nhiều tập đoàn cung cấp phụ cấp sức khỏe và giờ làm linh hoạt để giữ chân nhân tài. Bạn có tin rằng các chính sách này trực tiếp thúc đẩy năng suất lao động không? Trình bày quan điểm có dẫn chứng.',
    bandOrLevel: 'TOEIC 190+/200',
    tipsVi: [
      'Cấu trúc bài viết mạch lạc: Mở bài nêu rõ quan điểm, hai đoạn thân bài kèm dẫn chứng, và kết luận tóm lược.',
      'Dùng các thuật ngữ kinh doanh: "human capital", "absenteeism", "organizational loyalty".'
    ],
    sampleAnswerEn: `In today's competitive corporate landscape, human capital represents an organization's most invaluable asset. In my perspective, comprehensive corporate wellness initiatives yield profound positive impacts on overall workforce productivity and organizational resilience.

First and foremost, physical and psychological well-being directly mitigates chronic burnout. When corporations subsidize fitness regimens and promote ergonomic work environments, absenteeism declines sharply while cognitive alertness during critical decision-making increases. 

Furthermore, demonstrable employer empathy cultivates intense organizational loyalty. Talented professionals who feel genuinely valued consistently demonstrate higher discretionary effort, directly enhancing corporate innovation and operational bottom lines.`
  }
];

export const INITIAL_SPEAKING_TOPICS: SpeakingTopic[] = [
  {
    id: 'spk-ielts-1',
    title: 'IELTS Speaking Part 2: A Decision That Changed Your Life',
    titleVi: 'IELTS Part 2: Một quyết định quan trọng làm thay đổi cuộc đời',
    part: 'ielts_part2',
    cueCardEn: `Describe an important decision you made that had a positive impact on your life.
You should say:
- What the decision was
- When and why you made it
- What challenges you encountered
And explain how this decision positively transformed your journey.`,
    questions: [
      {
        promptEn: 'Could you introduce your decision and explain the background?',
        promptVi: 'Bạn có thể giới thiệu quyết định đó và bối cảnh xung quanh không?',
        modelAnswerEn: 'Looking back, one pivotal decision that fundamentally shaped my personal and professional trajectory was choosing to pivot towards data analytics right after graduating with a humanities degree.',
        keyVocabulary: ['pivotal decision', 'trajectory', 'leap of faith', 'perseverance']
      },
      {
        promptEn: 'What obstacles did you face while pursuing this choice?',
        promptVi: 'Bạn đã đối mặt với những trở ngại nào khi theo đuổi lựa chọn này?',
        modelAnswerEn: 'Initially, the steep learning curve felt daunting. I had to juggle intensive coding bootcamps alongside part-time jobs, which demanded exceptional discipline and time management.',
        keyVocabulary: ['steep learning curve', 'daunting', 'juggle priorities', 'unwavering focus']
      }
    ]
  },
  {
    id: 'spk-roleplay-1',
    title: 'Workplace Dialogue: Pitching an Idea to Your Manager',
    titleVi: 'Đối Thoại Công Sở: Thuyết trình ý tưởng mới với Quản lý',
    part: 'daily_roleplay',
    questions: [
      {
        promptEn: 'How would you propose streamlining the weekly reporting process?',
        promptVi: 'Bạn sẽ đề xuất cải tiến quy trình báo cáo hàng tuần như thế nào?',
        modelAnswerEn: 'Good morning Marcus. I have analyzed our current workflow and noticed that automating our client metrics dashboard could save the team roughly four hours every Monday.',
        keyVocabulary: ['streamline', 'workflow automation', 'tangible ROI', 'bandwidth']
      }
    ]
  },
  {
    id: 'spk-ielts-2',
    title: 'IELTS Speaking Part 1: Hometown, Studies & Ambitions',
    titleVi: 'IELTS Part 1: Quê hương, Học tập & Mục tiêu tương lai',
    part: 'ielts_part1',
    questions: [
      {
        promptEn: 'Let us talk about your hometown. Where did you grow up and what makes it special?',
        promptVi: 'Hãy nói về quê hương của bạn. Bạn lớn lên ở đâu và điều gì làm nơi đó trở nên đặc biệt?',
        modelAnswerEn: 'I was born and raised in Da Nang, a vibrant coastal metropolis in central Vietnam known for its pristine beaches and welcoming community.',
        keyVocabulary: ['vibrant metropolis', 'coastal city', 'pristine beaches', 'hospitable residents']
      },
      {
        promptEn: 'What do you enjoy most about your current studies or profession?',
        promptVi: 'Điều bạn thích nhất trong việc học hoặc công việc hiện tại là gì?',
        modelAnswerEn: 'What captivates me most is the opportunity to solve multifaceted challenges and collaborate with forward-thinking international peers.',
        keyVocabulary: ['multifaceted challenges', 'intellectual stimulation', 'forward-thinking']
      }
    ]
  },
  {
    id: 'spk-toeic-1',
    title: 'TOEIC Speaking: Proposing Solutions in Project Management',
    titleVi: 'TOEIC Speaking: Đề xuất giải pháp quản lý dự án',
    part: 'toeic_part5',
    questions: [
      {
        promptEn: 'Our marketing campaign launch has been delayed by two weeks due to graphic design revisions. How would you resolve this dilemma?',
        promptVi: 'Chiến dịch marketing bị trễ hai tuần do chỉnh sửa thiết kế. Bạn sẽ giải quyết tình huống này ra sao?',
        modelAnswerEn: 'Good morning executive committee. To address this bottleneck without inflating operational overhead, I propose prioritizing the core digital banner assets for an initial soft launch, while contracting temporary freelance illustrators for secondary collaterals.',
        keyVocabulary: ['address this bottleneck', 'soft launch', 'contingency plan', 'expedite delivery']
      }
    ]
  }
];
