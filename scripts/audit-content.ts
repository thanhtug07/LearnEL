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

console.log('=== LINGOPEAK CONTENT INVENTORY AUDIT ===\n');

// 1. Courses audit
let totalModules = 0;
let totalLessons = 0;
let totalExercises = 0;
const courseIds = new Set<string>();
const moduleIds = new Set<string>();
const lessonIds = new Set<string>();
const exerciseIds = new Set<string>();
const duplicateCourseIds: string[] = [];
const duplicateLessonIds: string[] = [];
const duplicateExerciseIds: string[] = [];

INITIAL_COURSES.forEach((c) => {
  if (courseIds.has(c.id)) duplicateCourseIds.push(c.id);
  courseIds.add(c.id);

  c.modules.forEach((m) => {
    totalModules++;
    moduleIds.add(m.id);

    m.lessons.forEach((l) => {
      totalLessons++;
      if (lessonIds.has(l.id)) duplicateLessonIds.push(l.id);
      lessonIds.add(l.id);

      l.exercises.forEach((ex) => {
        totalExercises++;
        if (exerciseIds.has(ex.id)) duplicateExerciseIds.push(ex.id);
        exerciseIds.add(ex.id);
      });
    });
  });
});

console.log(`Courses Count: ${INITIAL_COURSES.length}`);
console.log(`Total Modules: ${totalModules}`);
console.log(`Total Lessons: ${totalLessons}`);
console.log(`Total Exercises: ${totalExercises}`);
console.log(`Duplicate Course IDs: ${duplicateCourseIds.length} ${JSON.stringify(duplicateCourseIds)}`);
console.log(`Duplicate Lesson IDs: ${duplicateLessonIds.length} ${JSON.stringify(duplicateLessonIds)}`);
console.log(`Duplicate Exercise IDs: ${duplicateExerciseIds.length} ${JSON.stringify(duplicateExerciseIds)}`);

// 2. Tests audit
console.log(`\nTests Count: ${INITIAL_PRACTICE_TESTS.length}`);
let totalTestQuestions = 0;
const testQuestionIds = new Set<string>();
const duplicateTestQuestionIds: string[] = [];
const promptSet = new Map<string, string>(); // prompt -> questionId
const duplicatePrompts: { prompt: string; ids: string[] }[] = [];

INITIAL_PRACTICE_TESTS.forEach((t) => {
  console.log(`  - Test [${t.id}] "${t.title}": declared total = ${t.totalQuestions}, actual questions = ${t.questions.length}`);
  totalTestQuestions += t.questions.length;

  t.questions.forEach((q) => {
    if (testQuestionIds.has(q.id)) duplicateTestQuestionIds.push(q.id);
    testQuestionIds.add(q.id);

    const normPrompt = q.prompt.toLowerCase().replace(/[^\w\s]/g, '').trim();
    if (promptSet.has(normPrompt)) {
      duplicatePrompts.push({ prompt: q.prompt, ids: [promptSet.get(normPrompt)!, q.id] });
    } else {
      promptSet.set(normPrompt, q.id);
    }
  });
});

console.log(`Total Test Questions: ${totalTestQuestions}`);
console.log(`Duplicate Test Question IDs: ${duplicateTestQuestionIds.length}`);
console.log(`Duplicate Prompts: ${duplicatePrompts.length}`);

// 3. Verified Question Bank Audit
console.log(`\nVerified Question Bank Count: ${VERIFIED_QUESTION_BANK.length}`);
const bankIds = new Set<string>();
const duplicateBankIds: string[] = [];
VERIFIED_QUESTION_BANK.forEach((q) => {
  if (bankIds.has(q.id)) duplicateBankIds.push(q.id);
  bankIds.add(q.id);
});
console.log(`Unique Bank Question IDs: ${bankIds.size}, Duplicates: ${duplicateBankIds.length}`);

// 4. Vocabulary & Grammar
console.log(`\nVocabulary Items: ${INITIAL_VOCABULARY.length}`);
console.log(`Grammar Topics: ${INITIAL_GRAMMAR_TOPICS.length}`);
console.log(`Achievements: ${INITIAL_ACHIEVEMENTS.length}`);
console.log(`Writing Prompts: ${INITIAL_WRITING_PROMPTS.length}`);
console.log(`Speaking Topics: ${INITIAL_SPEAKING_TOPICS.length}`);
