import { describe, it, expect } from 'vitest';
import { parseVocabularyCSV, calculateNextReviewInterval } from '../src/context/AppContext';
import { VocabularyItem } from '../src/types';

describe('Vocabulary Spaced Repetition & Production CSV Parser', () => {
  it('calculates spaced repetition intervals correctly using production SRS algorithm', () => {
    // Unseen words
    expect(calculateNextReviewInterval('unseen')).toBe(0);

    // Learning words should be reviewed the next day (+1 day)
    expect(calculateNextReviewInterval('learning')).toBe(1);

    // Mastered words should be spaced out (minimum +4 days)
    expect(calculateNextReviewInterval('mastered', 1)).toBe(4);
    expect(calculateNextReviewInterval('mastered', 4)).toBe(8);
  });

  it('parses CSV input lines using production parseVocabularyCSV including quoted commas and Windows CRLF', () => {
    const csvContent = `Word,IPA,Part of Speech,Vietnamese Meaning,Definition,Example (EN),Example (VI),CEFR\r\n"lucrative","/ˈluːkrətɪv/","adjective","sinh lời cao","producing great deal of profit","A lucrative business contract.","Hợp đồng sinh lời cao.","B2"\r\nresilient,/rɪˈzɪl.jənt/,adjective,kiên cường,able to recover quickly,Resilient economy.,Nền kinh tế kiên cường.,B2\r\n`;

    const parsedItems = parseVocabularyCSV(csvContent);

    expect(parsedItems.length).toBe(2);

    expect(parsedItems[0].word).toBe('lucrative');
    expect(parsedItems[0].ipa).toBe('/ˈluːkrətɪv/');
    expect(parsedItems[0].pos).toBe('adjective');
    expect(parsedItems[0].viMeaning).toBe('sinh lời cao');
    expect(parsedItems[0].enDefinition).toBe('producing great deal of profit');
    expect(parsedItems[0].exampleEn).toBe('A lucrative business contract.');
    expect(parsedItems[0].exampleVi).toBe('Hợp đồng sinh lời cao.');
    expect(parsedItems[0].cefr).toBe('B2');
    expect(parsedItems[0].status).toBe('learning');
    expect(parsedItems[0].reviewCount).toBe(0);

    expect(parsedItems[1].word).toBe('resilient');
    expect(parsedItems[1].ipa).toBe('/rɪˈzɪl.jənt/');
    expect(parsedItems[1].pos).toBe('adjective');
    expect(parsedItems[1].viMeaning).toBe('kiên cường');
    expect(parsedItems[1].cefr).toBe('B2');
  });

  it('handles empty or malformed CSV gracefully without crashing', () => {
    expect(parseVocabularyCSV('')).toEqual([]);
    expect(parseVocabularyCSV('Only header line\n')).toEqual([]);
    expect(parseVocabularyCSV('Word,IPA,POS,Meaning\n\n\n')).toEqual([]);
  });
});
