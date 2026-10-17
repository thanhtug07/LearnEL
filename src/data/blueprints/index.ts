import { PracticeTest } from '../../types';
import {
  TOEIC_2SKILLS_LISTENING_50Q,
  TOEIC_2SKILLS_READING_50Q,
  TOEIC_4SKILLS_LISTENING_50Q,
  TOEIC_4SKILLS_READING_50Q
} from './toeicListeningQuestions';
import { TOEIC_SPEAKING_50TASKS } from './toeicSpeakingTasks';
import { TOEIC_WRITING_50TASKS } from './toeicWritingTasks';
import { IELTS_LISTENING_25Q } from './ieltsListeningQuestions';
import { IELTS_READING_25Q } from './ieltsReadingQuestions';
import { IELTS_WRITING_25TASKS } from './ieltsWritingTasks';
import { IELTS_SPEAKING_25TASKS } from './ieltsSpeakingTasks';

export {
  TOEIC_2SKILLS_LISTENING_50Q,
  TOEIC_2SKILLS_READING_50Q,
  TOEIC_4SKILLS_LISTENING_50Q,
  TOEIC_4SKILLS_READING_50Q,
  TOEIC_SPEAKING_50TASKS,
  TOEIC_WRITING_50TASKS,
  IELTS_LISTENING_25Q,
  IELTS_READING_25Q,
  IELTS_WRITING_25TASKS,
  IELTS_SPEAKING_25TASKS
};

// 1. TOEIC 2 Skills Blueprint (100 Questions)
export const TEST_TOEIC_2SKILLS_100Q: PracticeTest = {
  id: 'test-toeic-2skills-standard-100',
  title: 'TOEIC 2 Skills Full Benchmark Exam (100 Questions)',
  titleVi: 'Đề Thi Thử TOEIC 2 Kỹ Năng Chuẩn ETS (Listening & Reading - 100 Câu)',
  type: 'full_toeic',
  durationMinutes: 120,
  totalQuestions: 100,
  targetLevel: 'TOEIC 250 - 990',
  descriptionVi: 'Bộ đề thi chuẩn hóa TOEIC 2 Kỹ năng gồm 50 câu Listening (Part 1-4) có audio và transcript, cùng 50 câu Reading (Part 5-7) bao quát ngữ pháp, từ vựng và đọc hiểu đa văn bản.',
  questions: [...TOEIC_2SKILLS_LISTENING_50Q, ...TOEIC_2SKILLS_READING_50Q],
  blueprint: {
    blueprintId: 'toeic_2skills',
    standardName: 'TOEIC Listening & Reading Benchmark Exam',
    totalItems: 100,
    skillsBreakdown: [
      {
        skill: 'listening',
        questionCount: 50,
        durationMinutes: 45,
        sectionNames: [
          'Part 1 - Photographs',
          'Part 2 - Question-Response',
          'Part 3 - Conversations',
          'Part 4 - Short Talks'
        ]
      },
      {
        skill: 'reading',
        questionCount: 50,
        durationMinutes: 75,
        sectionNames: [
          'Part 5 - Incomplete Sentences',
          'Part 6 - Text Completion',
          'Part 7 - Reading Comprehension'
        ]
      }
    ]
  }
};

// 1b. TOEIC 2 Skills Blueprint - Volume 2 (100 Questions)
export const TEST_TOEIC_2SKILLS_VOL2_100Q: PracticeTest = {
  id: 'test-toeic-2skills-vol2-100',
  title: 'TOEIC 2 Skills Official Practice Vol 2 (100 Questions)',
  titleVi: 'Đề Thi Thử TOEIC 2 Kỹ Năng Chuẩn ETS - Tập 2 (Listening & Reading - 100 Câu)',
  type: 'full_toeic',
  durationMinutes: 120,
  totalQuestions: 100,
  targetLevel: 'TOEIC 250 - 990',
  descriptionVi: 'Bộ đề thi số 2 chuẩn hóa TOEIC 2 Kỹ năng gồm 50 câu Listening độc lập (Part 1-4) có audio và transcript, cùng 50 câu Reading (Part 5-7) từ vựng kinh tế & hợp đồng thương mại.',
  questions: [...TOEIC_4SKILLS_LISTENING_50Q, ...TOEIC_4SKILLS_READING_50Q],
  blueprint: {
    blueprintId: 'toeic_2skills',
    standardName: 'TOEIC Listening & Reading Official Practice Vol 2',
    totalItems: 100,
    skillsBreakdown: [
      {
        skill: 'listening',
        questionCount: 50,
        durationMinutes: 45,
        sectionNames: [
          'Part 1 - Photographs',
          'Part 2 - Question-Response',
          'Part 3 - Conversations',
          'Part 4 - Short Talks'
        ]
      },
      {
        skill: 'reading',
        questionCount: 50,
        durationMinutes: 75,
        sectionNames: [
          'Part 5 - Incomplete Sentences',
          'Part 6 - Text Completion',
          'Part 7 - Reading Comprehension'
        ]
      }
    ]
  }
};

// 2. TOEIC 4 Skills Blueprint (200 Items)
export const TEST_TOEIC_4SKILLS_200Q: PracticeTest = {
  id: 'test-toeic-4skills-complete-200',
  title: 'TOEIC 4 Skills Comprehensive Assessment (200 Items)',
  titleVi: 'Đề Thi Thử TOEIC 4 Kỹ Năng Toàn Diện (Listening, Reading, Speaking, Writing - 200 Mục Thi)',
  type: 'full_toeic',
  durationMinutes: 200,
  totalQuestions: 200,
  targetLevel: 'TOEIC 4 Skills All Levels',
  descriptionVi: 'Hệ thống khảo thí TOEIC 4 kỹ năng hoàn chỉnh gồm 50 câu Listening, 50 câu Reading, 50 nhiệm vụ Speaking có ghi âm trực tiếp và 50 bài Writing có trình soạn thảo & rubric đánh giá.',
  questions: [
    ...TOEIC_4SKILLS_LISTENING_50Q,
    ...TOEIC_4SKILLS_READING_50Q,
    ...TOEIC_SPEAKING_50TASKS,
    ...TOEIC_WRITING_50TASKS
  ],
  blueprint: {
    blueprintId: 'toeic_4skills',
    standardName: 'TOEIC 4 Skills Comprehensive Assessment',
    totalItems: 200,
    skillsBreakdown: [
      {
        skill: 'listening',
        questionCount: 50,
        durationMinutes: 45,
        sectionNames: [
          'Part 1 - Photographs',
          'Part 2 - Question-Response',
          'Part 3 - Conversations',
          'Part 4 - Short Talks'
        ]
      },
      {
        skill: 'reading',
        questionCount: 50,
        durationMinutes: 75,
        sectionNames: [
          'Part 5 - Incomplete Sentences',
          'Part 6 - Text Completion',
          'Part 7 - Reading Comprehension'
        ]
      },
      {
        skill: 'speaking',
        questionCount: 50,
        durationMinutes: 20,
        sectionNames: [
          'Part 1 - Read a Text Aloud',
          'Part 2 - Describe a Picture',
          'Part 3 - Respond to Questions',
          'Part 4 - Respond using Information Provided',
          'Part 5 - Propose a Solution & Express an Opinion'
        ]
      },
      {
        skill: 'writing',
        questionCount: 50,
        durationMinutes: 60,
        sectionNames: [
          'Part 1 - Write a Sentence Based on a Picture',
          'Part 2 - Respond to a Written Request',
          'Part 3 - Write an Opinion Essay'
        ]
      }
    ]
  }
};

// 3. IELTS Custom Practice Blueprint (100 Items)
export const TEST_IELTS_CUSTOM_100Q: PracticeTest = {
  id: 'test-ielts-custom-mock-100',
  title: 'IELTS 4 Skills Practice Mock (100 Items - LingoPeak Edition)',
  titleVi: 'Đề Luyện Thi IELTS 4 Kỹ Năng Tùy Chỉnh (LingoPeak Custom Edition - 100 Mục Thi)',
  type: 'full_ielts',
  durationMinutes: 150,
  totalQuestions: 100,
  targetLevel: 'IELTS Band 5.0 - 9.0',
  descriptionVi: 'Cấu hình luyện thi tùy chỉnh của LingoPeak gồm 25 câu Listening, 25 câu Reading học thuật, 25 bài Writing (Task 1 & Task 2) và 25 nhiệm vụ Speaking theo chuẩn 4 tiêu chí rubric. (Lưu ý: Đây là cấu hình luyện tập độc quyền của LingoPeak, không phải số câu chuẩn của kỳ thi IELTS chính thức).',
  questions: [
    ...IELTS_LISTENING_25Q,
    ...IELTS_READING_25Q,
    ...IELTS_WRITING_25TASKS,
    ...IELTS_SPEAKING_25TASKS
  ],
  blueprint: {
    blueprintId: 'ielts_custom_mock',
    standardName: 'IELTS 4 Skills Practice Simulation (LingoPeak Custom)',
    officialDisclaimer: 'Đây là cấu hình luyện thi tùy chỉnh của LingoPeak gồm 100 mục thi (25 Listening, 25 Reading, 25 Writing, 25 Speaking), không phải số câu chuẩn của kỳ thi IELTS chính thức.',
    totalItems: 100,
    skillsBreakdown: [
      {
        skill: 'listening',
        questionCount: 25,
        durationMinutes: 30,
        sectionNames: [
          'Section 1 - Social Dialogue',
          'Section 2 - Social Monologue',
          'Section 3 - Academic Discussion',
          'Section 4 - Academic Lecture'
        ]
      },
      {
        skill: 'reading',
        questionCount: 25,
        durationMinutes: 60,
        sectionNames: [
          'Reading Passage 1',
          'Reading Passage 2',
          'Reading Passage 3'
        ]
      },
      {
        skill: 'writing',
        questionCount: 25,
        durationMinutes: 45,
        sectionNames: [
          'Writing Task 1 - Academic Report',
          'Writing Task 2 - Academic Discursive Essay'
        ]
      },
      {
        skill: 'speaking',
        questionCount: 25,
        durationMinutes: 15,
        sectionNames: [
          'Speaking Part 1 - Introduction & Interview',
          'Speaking Part 2 - Individual Long Turn (Cue Card)',
          'Speaking Part 3 - Two-Way Discussion'
        ]
      }
    ]
  }
};

export const STANDARDIZED_BLUEPRINT_TESTS: PracticeTest[] = [
  TEST_TOEIC_2SKILLS_100Q,
  TEST_TOEIC_4SKILLS_200Q,
  TEST_IELTS_CUSTOM_100Q
];
