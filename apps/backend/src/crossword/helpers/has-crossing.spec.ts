import { describe, expect, it } from 'vitest';
import { createCrosswordGrid } from "./grid-helper.js";
import { hasCrossing } from "./has-crossing.js";
import { placeWord } from "./place-word.js";

describe('hasCrossing', () => {
  it('returns false when the grid is empty', () => {
    const grid = createCrosswordGrid(5, 5);

    const placement = {
      word: {
        answer: 'CAT',
        clue: 'A small domesticated animal',
      },
      row: 2,
      col: 1,
      direction: 'across' as const,
    };

    expect(hasCrossing(grid, placement)).toBe(false);
  });

  it('returns true when a word crosses an existing word', () => {
    const grid = createCrosswordGrid(5, 5);

    placeWord(grid, {
      word: {
        answer: 'CAT',
        clue: 'A small domesticated animal',
      },
      row: 2,
      col: 1,
      direction: 'across',
    });

    const placement = {
      word: {
        answer: 'RAT',
        clue: 'A small rodent',
      },
      row: 1,
      col: 2,
      direction: 'down' as const,
    };

    expect(hasCrossing(grid, placement)).toBe(true);
  });

  it('returns false when the placement does not share a letter', () => {
    const grid = createCrosswordGrid(5, 5);

    placeWord(grid, {
      word: {
        answer: 'CAT',
        clue: 'A small domesticated animal',
      },
      row: 2,
      col: 1,
      direction: 'across',
    });

    const placement = {
      word: {
        answer: 'DOG',
        clue: 'A common pet',
      },
      row: 0,
      col: 0,
      direction: 'down' as const,
    };

    expect(hasCrossing(grid, placement)).toBe(false);
  });

  it('returns false when letters occupy the same cells but do not match', () => {
    const grid = createCrosswordGrid(5, 5);

    placeWord(grid, {
      word: {
        answer: 'CAT',
        clue: 'A small domesticated animal',
      },
      row: 2,
      col: 1,
      direction: 'across',
    });

    const placement = {
      word: {
        answer: 'RAT',
        clue: 'A small rodent',
      },
      row: 1,
      col: 1,
      direction: 'down' as const,
    };

    expect(hasCrossing(grid, placement)).toBe(false);
  });
});