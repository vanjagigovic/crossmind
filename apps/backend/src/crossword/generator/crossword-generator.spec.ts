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

  it('excludes words that cannot fit from MRV and returns them unplaced', () => {
    const words = [
      { answer: 'ELEPHANT', clue: 'A large mammal' },
      { answer: 'CAT', clue: 'A small animal' },
      { answer: 'RAT', clue: 'A rodent' },
    ];
    const candidateGenerator = new CrosswordGenerator({
      rows: 7,
      cols: 7,
      candidateCount: 1,
      random: () => 0,
    });
    const selectNextWordSpy = vi.spyOn(
      candidateGenerator as any,
      'selectNextWord',
    );

    const result = candidateGenerator.generate(words, 2);

    expect(result.placedWords.map((word) => word.answer)).toEqual(
      expect.arrayContaining(['CAT', 'RAT']),
    );
    expect(result.placedWords).toHaveLength(2);
    expect(result.unplacedWords.map((word) => word.answer)).toContain(
      'ELEPHANT',
    );
    expect(selectNextWordSpy).toHaveBeenCalled();
    expect(
      selectNextWordSpy.mock.calls.some(
        ([, candidates]) =>
          Array.isArray(candidates) &&
          candidates.some((word: CrosswordWord) => word.answer === 'ELEPHANT'),
      ),
    ).toBe(false);
    expectGridMatchesPlacements(result, 7, 7);
  });

  it('uses the only direction that fits a rectangular grid', () => {
    const result = new CrosswordGenerator({
      rows: 4,
      cols: 7,
      candidateCount: 1,
      random: () => 0.9,
    }).generate([{ answer: 'MONKEY', clue: 'A primate' }], 1);

    expect(result.grid.placements[0]).toMatchObject({
      row: 2,
      col: 0,
      direction: 'across',
    });
    expectGridMatchesPlacements(result, 4, 7);
  });

  it('tries another viable seed after the first seed reaches a dead end', () => {
    const result = new CrosswordGenerator({
      rows: 7,
      cols: 7,
      candidateCount: 2,
      random: () => 0,
    }).generate(
      [
        { answer: 'BUMPY', clue: 'Uneven' },
        { answer: 'CAT', clue: 'A small animal' },
        { answer: 'RAT', clue: 'A rodent' },
      ],
      2,
    );

    expect(result.placedWords.map((word) => word.answer).sort()).toEqual([
      'CAT',
      'RAT',
    ]);
    expect(result.unplacedWords.map((word) => word.answer)).toContain('BUMPY');
    expectGridMatchesPlacements(result, 7, 7);
  });

  it('does not count canonically equivalent answers as separate words', () => {
    const words = [
      { answer: 'niño', clue: 'A child' },
      { answer: 'NIÑO', clue: 'Another clue' },
    ];

    const result = generator.generate(words, 2);

    expect(result.placedWords).toEqual([]);
    expect(result.unplacedWords).toHaveLength(1);
    expect(result.unplacedWords[0].clue).toBe('A child');
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

  it('preserves grid and placement invariants across seeded generations', () => {
    const words: CrosswordWord[] = [
      { answer: 'CAT', clue: 'A small animal' },
      { answer: 'RAT', clue: 'A rodent' },
    ];

    for (let seed = 1; seed <= 10; seed++) {
      const result = new CrosswordGenerator({
        rows: 7,
        cols: 7,
        candidateCount: 4,
        random: createSeededRandom(seed),
      }).generate(words, 2);

      expect(result.placedWords).toHaveLength(2);
      expect(result.grid.placements.map(({ word }) => word)).toEqual(
        result.placedWords,
      );
      expect(
        new Set(
          result.placedWords.map((word) =>
            word.answer.trim().normalize('NFC').toUpperCase().normalize('NFC'),
          ),
        ).size,
      ).toBe(result.placedWords.length);
      expect(countCrossings(result.grid, result.grid.placements[1])).toBe(1);
      expectGridMatchesPlacements(result, 7, 7);
    }
  });
});

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;

    return (state >>> 0) / 4_294_967_296;
  };
}

function expectGridMatchesPlacements(
  result: ReturnType<CrosswordGenerator['generate']>,
  rows: number,
  cols: number,
) {
  expect(result.grid.rows).toBe(rows);
  expect(result.grid.cols).toBe(cols);
  expect(result.grid.cells).toHaveLength(rows);
  expect(result.grid.cells.every((row) => row.length === cols)).toBe(true);

  const expectedLetters = Array.from({ length: rows }, () =>
    Array<string | null>(cols).fill(null),
  );
  const acrossEdges = new Set<string>();
  const downEdges = new Set<string>();

  for (const placement of result.grid.placements) {
    for (let index = 0; index < placement.word.answer.length; index++) {
      const row = placement.row + (placement.direction === 'down' ? index : 0);
      const col =
        placement.col + (placement.direction === 'across' ? index : 0);

      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(rows);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(cols);

      const expectedLetter = placement.word.answer[index];
      const existingLetter = expectedLetters[row][col];
      expect(existingLetter === null || existingLetter === expectedLetter).toBe(
        true,
      );
      expectedLetters[row][col] = expectedLetter;

      if (index < placement.word.answer.length - 1) {
        const nextRow = row + (placement.direction === 'down' ? 1 : 0);
        const nextCol = col + (placement.direction === 'across' ? 1 : 0);
        const edge = `${row}:${col}|${nextRow}:${nextCol}`;

        if (placement.direction === 'across') {
          acrossEdges.add(edge);
        } else {
          downEdges.add(edge);
        }
      }
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (
        col + 1 < cols &&
        expectedLetters[row][col] !== null &&
        expectedLetters[row][col + 1] !== null
      ) {
        expect(acrossEdges.has(`${row}:${col}|${row}:${col + 1}`)).toBe(true);
      }

      if (
        row + 1 < rows &&
        expectedLetters[row][col] !== null &&
        expectedLetters[row + 1][col] !== null
      ) {
        expect(downEdges.has(`${row}:${col}|${row + 1}:${col}`)).toBe(true);
      }
    }
  }

  expect(
    result.grid.cells.map((gridRow) => gridRow.map((cell) => cell.letter)),
  ).toEqual(expectedLetters);
}
