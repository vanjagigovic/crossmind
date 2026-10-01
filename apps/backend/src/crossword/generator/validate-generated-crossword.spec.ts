import { describe, expect, it } from 'vitest';

import type { CrosswordWord } from '../domain/word.js';
import { createCrosswordGrid } from '../helpers/grid-helper.js';
import { placeWord } from '../helpers/place-word.js';
import { buildPuzzleEntries } from '../../puzzle/service/build-puzzle-entries.js';
import { validateGeneratedCrossword } from './validate-generated-crossword.js';

describe('validateGeneratedCrossword', () => {
  it('accepts a valid generated crossword', () => {
    const result = createValidSingleWordCrossword();

    expect(() => validate(result)).not.toThrow();
  });

  it('rejects grid metadata that differs from the requested dimensions', () => {
    const result = createValidCrossword();
    result.grid.rows = 4;

    expect(() => validate(result)).toThrow(/grid dimensions/);
  });

  it('rejects a row with the wrong number of cells', () => {
    const result = createValidCrossword();
    result.grid.cells[0].pop();

    expect(() => validate(result)).toThrow(/grid dimensions/);
  });

  it('rejects a placement whose start is outside the grid', () => {
    const result = createValidCrossword();
    result.grid.placements[0].row = -1;

    expect(() => validate(result)).toThrow(/extends beyond the grid/);
  });

  it('rejects a word that extends past the grid edge', () => {
    const result = createValidCrossword();
    result.grid.placements[0].col = 4;

    expect(() => validate(result)).toThrow(/extends beyond the grid/);
  });

  it('rejects a placement character that differs from its grid cell', () => {
    const result = createValidCrossword();
    result.grid.cells[2][1].letter = 'X';

    expect(() => validate(result)).toThrow(/does not match its grid cells/);
  });

  it('rejects an unsupported placement direction', () => {
    const result = createValidCrossword();
    result.grid.placements[0].direction = 'diagonal' as never;

    expect(() => validate(result)).toThrow(/unsupported direction/);
  });

  it('rejects an incomplete requested word count', () => {
    const result = createValidCrossword();

    expect(() => validate(result, 3)).toThrow(/could not place all 3/);
  });

  it('accepts a crossing where the shared letters agree', () => {
    const result = createValidCrossword();

    expect(() => validate(result)).not.toThrow();
  });

  it('rejects a crossing where the shared letters disagree', () => {
    const result = createValidCrossword();
    const incompatibleWord = { answer: 'DIG', clue: 'A letter' };
    result.words.push(incompatibleWord);
    result.placedWords[1] = incompatibleWord;
    result.grid.placements[1] = {
      word: incompatibleWord,
      row: 1,
      col: 2,
      direction: 'down',
    };

    expect(() => validate(result)).toThrow(/does not match its grid cells/);
  });

  it('derives puzzle entries from the validated placements', () => {
    const result = createValidCrossword();
    validate(result);

    const entries = buildPuzzleEntries('puzzle-1', result.grid.placements);

    expect(entries).toHaveLength(2);
    expect(entries.find((entry) => entry.word === 'CAT')).toMatchObject({
      puzzleId: 'puzzle-1',
      word: 'CAT',
      clue: 'A small animal',
      direction: 'across',
      row: 2,
      column: 1,
      length: 3,
    });
    expect(entries.find((entry) => entry.word === 'RAT')).toMatchObject({
      puzzleId: 'puzzle-1',
      word: 'RAT',
      clue: 'A rodent',
      direction: 'down',
      row: 1,
      column: 2,
      length: 3,
    });
  });
});

function createValidCrossword() {
  const words: CrosswordWord[] = [
    { answer: 'CAT', clue: 'A small animal' },
    { answer: 'RAT', clue: 'A rodent' },
  ];
  const grid = createCrosswordGrid(5, 5);
  const placements = [
    { word: words[0], row: 2, col: 1, direction: 'across' as const },
    { word: words[1], row: 1, col: 2, direction: 'down' as const },
  ];

  for (const placement of placements) {
    placeWord(grid, placement);
  }

  return {
    grid,
    placedWords: [...words],
    words,
  };
}

function validate(
  result: ReturnType<typeof createValidCrossword>,
  targetWordCount = result.placedWords.length,
) {
  return validateGeneratedCrossword(result, {
    rows: 5,
    cols: 5,
    targetWordCount,
    candidateWords: result.words,
  });
}

function createValidSingleWordCrossword() {
  const word: CrosswordWord = { answer: 'CAT', clue: 'A small animal' };
  const grid = createCrosswordGrid(5, 5);
  placeWord(grid, {
    word,
    row: 2,
    col: 1,
    direction: 'across',
  });

  return {
    grid,
    placedWords: [word],
    words: [word],
  };
}
