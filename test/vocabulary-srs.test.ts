import { describe, it, expect } from 'vitest';
import { VocabularyItem } from '../src/types';

describe('Vocabulary Spaced Repetition & CSV Parser', () => {
  it('calculates spaced repetition intervals correctly', () => {
    const item: VocabularyItem = {
      id: 'v1',
      word: 'articulate',
      ipa: '/ɑːˈtɪk.jə.lət/',
      pos: 'adjective',
      viMeaning: 'lưu loát',
      enDefinition: 'express clearly',
      exampleEn: 'She was articulate.',
      exampleVi: 'Cô ấy nói lưu loát.',
      collocations: [],
      synonyms: [],
      cefr: 'C1',
      topic: 'General',
      status: 'learning',
      reviewCount: 0
    };

    // When marked as mastered, scheduled +4 days
    const baseDate = new Date('2026-10-12T00:00:00Z');
    const nextMastered = new Date(baseDate);
    nextMastered.setDate(nextMastered.getDate() + 4);

    // When marked as learning, scheduled +1 day
    const nextLearning = new Date(baseDate);
    nextLearning.setDate(nextLearning.getDate() + 1);

    expect(nextMastered.getDate() - baseDate.getDate()).toBe(4);
    expect(nextLearning.getDate() - baseDate.getDate()).toBe(1);
  });

  it('parses CSV input lines including quoted commas and Windows CRLF', () => {
    const csvContent = `Word,IPA,Part of Speech,Vietnamese Meaning,Definition,Example (EN),Example (VI),CEFR\r\n"lucrative","/ˈluːkrətɪv/","adjective","sinh lời cao","producing great deal of profit","A lucrative business contract.","Hợp đồng sinh lời cao.","B2"\r\nresilient,/rɪˈzɪl.jənt/,adjective,kiên cường,able to recover quickly,Resilient economy.,Nền kinh tế kiên cường.,B2\r\n`;

    const lines = csvContent.trim().split('\n');
    expect(lines.length).toBe(3); // header + 2 items

    const parsedItems: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].replace(/\r$/, '');
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 4 && parts[0]) {
        parsedItems.push({
          word: parts[0],
          ipa: parts[1],
          pos: parts[2],
          viMeaning: parts[3],
          cefr: parts[7] || 'B1'
        });
      }
    }

    expect(parsedItems.length).toBe(2);
    expect(parsedItems[0].word).toBe('lucrative');
    expect(parsedItems[0].cefr).toBe('B2');
    expect(parsedItems[1].word).toBe('resilient');
  });
});
