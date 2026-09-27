import { describe, expect, it } from 'vitest';
import { CrosswordWord } from '../domain/word.js';
import { countCrossings } from '../helpers/count-crossings.js';
import { CrosswordGenerator } from './crossword-generator.js';

describe('CrosswordGenerator', () => {
  const generator = new CrosswordGenerator({
    rows: 7,
    cols: 7,
    candidateCount: 1,
    random: () => 0,
  });

  it('generates a crossword from compatible words', () => {
    const words = [
      { answer: 'CAT', clue: 'A small animal' },
      { answer: 'RAT', clue: 'A rodent' },
    ];

    const result = generator.generate(words, 2);
    expect(result.placedWords).toHaveLength(2);

    expect(result.placedWords).toEqual(expect.arrayContaining(words));
    expect(result.unplacedWords).toEqual([]);
    expect(result.grid.placements).toHaveLength(2);
  });

  it('returns an empty result for an empty word list', () => {
    const result = generator.generate([], 0);

    expect(result.grid.rows).toBe(7);
    expect(result.grid.cols).toBe(7);
    expect(result.grid.placements).toEqual([]);
    expect(result.placedWords).toEqual([]);
    expect(result.unplacedWords).toEqual([]);
  });

  it('centers a single word horizontally', () => {
    const word = { answer: 'CAT', clue: 'A small animal' };

    const result = generator.generate([word], 1);

    expect(result.placedWords).toEqual([word]);
    expect(result.unplacedWords).toEqual([]);
    expect(result.grid.placements).toEqual([
      { word, row: 3, col: 2, direction: 'across' },
    ]);
  });

  it('places the longest word first', () => {
    const longestWord = { answer: 'CATER', clue: 'A provider of food' };
    const words = [{ answer: 'CAT', clue: 'A small animal' }, longestWord];

    const result = generator.generate(words, 2);

    expect(result.grid.placements[0].word).toBe(longestWord);
    expect(result.grid.placements[0].direction).toBe('across');
  });

  it('places crossing words when possible', () => {
    const result = generator.generate(
      [
        { answer: 'CAT', clue: 'A small animal' },
        { answer: 'RAT', clue: 'A rodent' },
      ],
      2,
    );

    expect(countCrossings(result.grid, result.grid.placements[1])).toBe(1);
  });

  it('returns words without a crossing in unplacedWords', () => {
    const cat = { answer: 'CAT', clue: 'A small animal' };
    const dog = { answer: 'DOG', clue: 'A pet' };

    const result = generator.generate([cat, dog], 1);

    expect(result.placedWords).toHaveLength(1);
    expect(result.unplacedWords).toHaveLength(1);

    expect([...result.placedWords, ...result.unplacedWords]).toEqual(
      expect.arrayContaining([cat, dog]),
    );
  });

  it('does not mutate the original input array', () => {
    const words: CrosswordWord[] = [
      { answer: 'CAT', clue: 'A small animal' },
      { answer: 'CATER', clue: 'A provider of food' },
    ];
    const originalWords = structuredClone(words);

    generator.generate(words, 2);

    expect(words).toEqual(originalWords);
  });

  it('generates different candidates when randomness changes', () => {
    const words: CrosswordWord[] = [
      { answer: 'CAT', clue: 'A small animal' },
      { answer: 'RAT', clue: 'A rodent' },
      { answer: 'ART', clue: 'A creative work' },
    ];

    const firstGenerator = new CrosswordGenerator({
      rows: 7,
      cols: 7,
      candidateCount: 10,
      random: () => 0.1,
    });

    const secondGenerator = new CrosswordGenerator({
      rows: 7,
      cols: 7,
      candidateCount: 10,
      random: () => 0.9,
    });

    const firstResult = firstGenerator.generate(words, 3);
    const secondResult = secondGenerator.generate(words, 3);

    expect(firstResult.grid.placements).not.toEqual(
      secondResult.grid.placements,
    );
  });

  it('evaluates multiple candidates and keeps the best result', () => {
    const words: CrosswordWord[] = [
      { answer: 'CAT', clue: 'A small animal' },
      { answer: 'RAT', clue: 'A rodent' },
      { answer: 'ART', clue: 'A creative work' },
    ];

    const result = new CrosswordGenerator({
      rows: 7,
      cols: 7,
      candidateCount: 20,
      random: Math.random,
    }).generate(words, 3);

    expect(result.placedWords.length).toBeGreaterThan(0);

    expect(result.grid.placements.length).toBe(result.placedWords.length);
  });
});
