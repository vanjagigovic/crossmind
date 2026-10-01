import { describe, expect, it } from 'vitest';

import { createCrosswordGrid } from './grid-helper.js';
import { placeWord } from './place-word.js';
import { isBetterCrosswordScore, scoreCrossword } from './score-crossword.js';

describe('scoreCrossword', () => {
  it('counts occupied cells', () => {
    const grid = createCrosswordGrid(7, 7);

    placeWord(grid, {
      word: {
        answer: 'CAT',
        clue: 'A small animal',
      },
      row: 3,
      col: 2,
      direction: 'across',
    });

    expect(scoreCrossword(grid).occupiedCells).toBe(3);
  });

  it('prefers a crossword with more placed words', () => {
    expect(
      isBetterCrosswordScore(
        {
          placedWords: 4,
          crossings: 2,
          occupiedCells: 10,
          boundingBoxDensity: 0.5,
        },
        {
          placedWords: 3,
          crossings: 5,
          occupiedCells: 20,
          boundingBoxDensity: 0.8,
        },
      ),
    ).toBe(true);
  });

  it('prefers more occupied cells when word count is equal', () => {
    expect(
      isBetterCrosswordScore(
        {
          placedWords: 5,
          crossings: 2,
          occupiedCells: 30,
          boundingBoxDensity: 0.5,
        },
        {
          placedWords: 5,
          crossings: 8,
          occupiedCells: 20,
          boundingBoxDensity: 0.9,
        },
      ),
    ).toBe(true);
  });
});
