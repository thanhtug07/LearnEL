import {
  INITIAL_COURSES,
  INITIAL_VOCABULARY,
  INITIAL_GRAMMAR_TOPICS,
  INITIAL_PRACTICE_TESTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_SPEAKING_TOPICS,
  INITIAL_WRITING_PROMPTS
} from '../src/data/seedData';
import { VERIFIED_QUESTION_BANK } from '../src/data/verifiedQuestionBank';
import { CEFRLevel, TestQuestion, Exercise } from '../src/types';

interface ValidationError {
  entityType: string;
  id: string;
  field: string;
  code: string;
  message: string;
  severity: 'fatal' | 'warning';
}

const errors: ValidationError[] = [];

function addError(entityType: string, id: string, field: string, code: string, message: string, severity: 'fatal' | 'warning' = 'fatal') {
  errors.push({ entityType, id, field, code, message, severity });
}

const VALID_CEFR: Set<string> = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

function normalizePrompt(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('>>> RUNNING COMPREHENSIVE CONTENT INTEGRITY AUDIT <<<\n');

// ============================================================================
// 1. AUDIT COURSES
// ============================================================================
const courseIds = new Set<string>();
const lessonIds = new Set<string>();
const exerciseIds = new Set<string>();

INITIAL_COURSES.forEach((c) => {
  if (courseIds.has(c.id)) {
    addError('Course', c.id, 'id', 'DUPLICATE_COURSE_ID', `Duplicate course ID '${c.id}'`);
  }
  courseIds.add(c.id);

  if (!VALID_CEFR.has(c.level)) {
    addError('Course', c.id, 'level', 'INVALID_CEFR', `Invalid CEFR level '${c.level}'`);
  }

  if (!c.title || c.title.trim().length < 5) {
    addError('Course', c.id, 'title', 'INVALID_TITLE', `Course title is too short or missing`);
  }
  if (!c.titleVi || c.titleVi.trim().length < 5) {
    addError('Course', c.id, 'titleVi', 'INVALID_TITLE_VI', `Course Vietnamese title is too short or missing`);
  }

  let totalCourseLessons = 0;
  c.modules.forEach((m) => {
    if (!m.id) addError('CourseModule', `${c.id}::unknown`, 'id', 'MISSING_MODULE_ID', `Module is missing ID in course ${c.id}`);
    m.lessons.forEach((l) => {
      totalCourseLessons++;
      if (lessonIds.has(l.id)) {
        addError('Lesson', l.id, 'id', 'DUPLICATE_LESSON_ID', `Duplicate lesson ID '${l.id}'`);
      }
      lessonIds.add(l.id);

      if (!l.theoryContent?.explanationVi || l.theoryContent.explanationVi.trim().length < 10) {
        addError('Lesson', l.id, 'theoryContent', 'EMPTY_THEORY', `Lesson ${l.id} has empty or trivial theory content`, 'warning');
      }

      l.exercises.forEach((ex, idx) => {
        if (exerciseIds.has(ex.id)) {
          addError('Exercise', ex.id, 'id', 'DUPLICATE_EXERCISE_ID', `Duplicate exercise ID '${ex.id}'`);
        }
        exerciseIds.add(ex.id);

        if (!ex.prompt || ex.prompt.trim().length < 5) {
          addError('Exercise', ex.id, 'prompt', 'INVALID_PROMPT', `Exercise ${ex.id} prompt is missing or too short`);
        }

        if (ex.type === 'multiple_choice') {
          if (!ex.options || ex.options.length < 2) {
            addError('Exercise', ex.id, 'options', 'INSUFFICIENT_OPTIONS', `Exercise ${ex.id} has fewer than 2 options`);
          } else {
            const hasEmptyOpt = ex.options.some((o) => !o || o.trim() === '');
            if (hasEmptyOpt) {
              addError('Exercise', ex.id, 'options', 'EMPTY_OPTION', `Exercise ${ex.id} contains empty option string`);
            }
            if (ex.correctAnswer) {
              if (typeof ex.correctAnswer === 'string' && !ex.options.includes(ex.correctAnswer)) {
                addError('Exercise', ex.id, 'correctAnswer', 'ANSWER_NOT_IN_OPTIONS', `Exercise ${ex.id} correct answer '${ex.correctAnswer}' is not present in options`);
              } else if (Array.isArray(ex.correctAnswer)) {
                for (const ans of ex.correctAnswer) {
                  if (!ex.options.includes(ans)) {
                    addError('Exercise', ex.id, 'correctAnswer', 'ANSWER_NOT_IN_OPTIONS', `Exercise ${ex.id} correct answer '${ans}' is not present in options`);
                  }
                }
              }
            }
          }
        }

        if (!ex.explanationVi || ex.explanationVi.trim().length < 5) {
          addError('Exercise', ex.id, 'explanationVi', 'EMPTY_EXPLANATION', `Exercise ${ex.id} explanation is missing or too short`);
        }
      });
    });
  });

  if (c.totalLessons !== totalCourseLessons) {
    addError('Course', c.id, 'totalLessons', 'LESSON_COUNT_MISMATCH', `Course declared totalLessons=${c.totalLessons} but contains ${totalCourseLessons} lessons`);
  }
});

// ============================================================================
// 2. AUDIT PRACTICE TESTS
// ============================================================================
const testIds = new Set<string>();
const allTestQuestionIds = new Set<string>();
const promptMap = new Map<string, string>(); // normPrompt -> id

INITIAL_PRACTICE_TESTS.forEach((t) => {
  if (testIds.has(t.id)) {
    addError('PracticeTest', t.id, 'id', 'DUPLICATE_TEST_ID', `Duplicate test ID '${t.id}'`);
  }
  testIds.add(t.id);

  if (t.totalQuestions !== t.questions.length) {
    addError('PracticeTest', t.id, 'totalQuestions', 'QUESTION_COUNT_MISMATCH', `Test ${t.id} declared totalQuestions=${t.totalQuestions} but contains ${t.questions.length} questions`);
  }

  // Type consistency: Mini-mock vs Full Test
  if ((t.type === 'full_toeic' && t.questions.length < 50) || (t.type === 'full_ielts' && t.questions.length < 20)) {
    addError(
      'PracticeTest',
      t.id,
      'type',
      'MISLABELED_FULL_EXAM',
      `Test '${t.id}' is labeled as '${t.type}' but only contains ${t.questions.length} questions. Must be labeled as 'mini_test' or 'topic_quiz'.`,
      'fatal'
    );
  }

  t.questions.forEach((q) => {
    if (allTestQuestionIds.has(q.id)) {
      addError('TestQuestion', q.id, 'id', 'DUPLICATE_QUESTION_ID', `Question ID '${q.id}' is duplicated across tests`);
    }
    allTestQuestionIds.add(q.id);

    // Prompt validation
    if (!q.prompt || q.prompt.trim().length < 10) {
      addError('TestQuestion', q.id, 'prompt', 'INVALID_PROMPT', `Prompt is missing or too short (length: ${q.prompt?.length || 0})`);
    }
    if (/^question\s*\d+$/i.test(q.prompt.trim())) {
      addError('TestQuestion', q.id, 'prompt', 'PLACEHOLDER_PROMPT', `Prompt '${q.prompt}' is a placeholder without educational content`);
    }

    // Normalized prompt duplicate check
    const norm = normalizePrompt(q.prompt);
    if (promptMap.has(norm)) {
      addError('TestQuestion', q.id, 'prompt', 'DUPLICATE_PROMPT', `Prompt is identical to question '${promptMap.get(norm)}'`, 'warning');
    } else {
      promptMap.set(norm, q.id);
    }

    // Options validation
    if (!Array.isArray(q.options) || q.options.length < 2) {
      addError('TestQuestion', q.id, 'options', 'INSUFFICIENT_OPTIONS', `Question has fewer than 2 options`);
    } else {
      const trimmed = q.options.map((o) => (typeof o === 'string' ? o.trim() : ''));
      if (trimmed.some((o) => !o)) {
        addError('TestQuestion', q.id, 'options', 'EMPTY_OPTION', `Question contains empty option choice`);
      }
      const uniqueOptions = new Set(trimmed.map((o) => o.toLowerCase()));
      if (uniqueOptions.size !== trimmed.length) {
        addError('TestQuestion', q.id, 'options', 'DUPLICATE_OPTIONS', `Question contains duplicate choices in options`);
      }
    }

    // Correct Answer Index validation
    if (typeof q.correctAnswerIndex !== 'number' || !Number.isInteger(q.correctAnswerIndex)) {
      addError('TestQuestion', q.id, 'correctAnswerIndex', 'INVALID_INDEX_TYPE', `correctAnswerIndex must be an integer`);
    } else if (Array.isArray(q.options) && (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length)) {
      addError('TestQuestion', q.id, 'correctAnswerIndex', 'INDEX_OUT_OF_BOUNDS', `correctAnswerIndex (${q.correctAnswerIndex}) is out of bounds for ${q.options.length} options`);
    }

    // Explanation validation
    if (!q.explanationVi || q.explanationVi.trim().length < 8) {
      addError('TestQuestion', q.id, 'explanationVi', 'INSUFFICIENT_EXPLANATION', `Vietnamese explanation is missing or trivial (< 8 characters)`);
    }
  });
});

// ============================================================================
// 3. AUDIT VERIFIED QUESTION BANK
// ============================================================================
const bankIds = new Set<string>();

VERIFIED_QUESTION_BANK.forEach((q) => {
  if (bankIds.has(q.id)) {
    addError('VerifiedQuestionBank', q.id, 'id', 'DUPLICATE_BANK_ID', `Duplicate ID in verified question bank '${q.id}'`);
  }
  bankIds.add(q.id);

  if (q.cefr && !VALID_CEFR.has(q.cefr)) {
    addError('VerifiedQuestionBank', q.id, 'cefr', 'INVALID_CEFR', `Invalid CEFR level '${q.cefr}' in verified bank`);
  }

  if (!q.options || q.options.length < 2) {
    addError('VerifiedQuestionBank', q.id, 'options', 'INSUFFICIENT_OPTIONS', `Question has fewer than 2 options`);
  } else if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
    addError('VerifiedQuestionBank', q.id, 'correctAnswerIndex', 'INDEX_OUT_OF_BOUNDS', `Index out of range`);
  }

  if (!q.source?.licenseOrPermission) {
    addError('VerifiedQuestionBank', q.id, 'source.licenseOrPermission', 'MISSING_LICENSE', `Question is missing licensing/provenance metadata`, 'warning');
  }
});

// ============================================================================
// 4. REPORT AUDIT SUMMARY
// ============================================================================
const fatalErrors = errors.filter((e) => e.severity === 'fatal');
const warningErrors = errors.filter((e) => e.severity === 'warning');

console.log('=== AUDIT RESULTS SUMMARY ===');
console.log(`Total Courses checked: ${INITIAL_COURSES.length} (${lessonIds.size} lessons, ${exerciseIds.size} exercises)`);
console.log(`Total Practice Tests checked: ${INITIAL_PRACTICE_TESTS.length} (${allTestQuestionIds.size} test questions)`);
console.log(`Total Verified Bank items checked: ${VERIFIED_QUESTION_BANK.length}`);
console.log(`Unique Question Prompts: ${promptMap.size}`);
console.log(`Fatal Errors Found: ${fatalErrors.length}`);
console.log(`Warnings Found: ${warningErrors.length}\n`);

if (errors.length > 0) {
  console.log('--- ISSUES DETECTED ---');
  errors.forEach((err, idx) => {
    console.log(`[${idx + 1}] [${err.severity.toUpperCase()}] ${err.entityType} (${err.id}) -> ${err.field}: ${err.message} (${err.code})`);
  });
}

if (fatalErrors.length > 0) {
  console.error(`\nFAILED: Found ${fatalErrors.length} fatal integrity issue(s). Exiting with code 1.`);
  process.exit(1);
} else {
  console.log('\nPASSED: Content integrity audit passed with 0 fatal errors.');
  process.exit(0);
}
