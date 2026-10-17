import { INITIAL_PRACTICE_TESTS } from '../src/data/seedData';
import {
  computeCategoryInventories,
  classifyTestCategory,
  isTestValidAndAuthentic
} from '../src/services/examPipelineService';

console.log('=== EXAM PRACTICE HUB INVENTORY AUDIT ===\n');
console.log(`Total Practice Tests in INITIAL_PRACTICE_TESTS: ${INITIAL_PRACTICE_TESTS.length}\n`);

const inventories = computeCategoryInventories(INITIAL_PRACTICE_TESTS);

console.log('---------------------------------------------------------------------------------------------------------');
console.log(
  'Category'.padEnd(25) +
    'Valid'.padEnd(10) +
    'Placeholder'.padEnd(15) +
    'Total'.padEnd(10) +
    'Goal'.padEnd(10) +
    'Deficit'.padEnd(12) +
    'Status'
);
console.log('---------------------------------------------------------------------------------------------------------');

Object.values(inventories)
  .filter((inv) => inv.key !== 'all')
  .forEach((inv) => {
    console.log(
      inv.nameVi.slice(0, 24).padEnd(25) +
        String(inv.validCount).padEnd(10) +
        String(inv.placeholderCount).padEnd(15) +
        String(inv.totalCount).padEnd(10) +
        String(inv.targetGoal).padEnd(10) +
        String(inv.deficit).padEnd(12) +
        inv.statusTextVi
    );
  });

console.log('---------------------------------------------------------------------------------------------------------\n');
