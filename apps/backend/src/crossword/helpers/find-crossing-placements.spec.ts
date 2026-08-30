import { describe, expect, it } from 'vitest';

import { CrosswordWord } from '../domain/word.js';

import { createCrosswordGrid } from './grid-helper.js';
import { findCrossingPlacements } from './find-crossing-placements.js';
import { placeWord } from './place-word.js';

describe('findCrossingPlacements', () => {
  it('should find a valid crossing placement', () => {
    const grid = createCrosswordGrid(15, 15);

    const firstWord: CrosswordWord = {
      answer: 'CAT',
      clue: 'A small domesticated animal',
    };

    const secondWord: CrosswordWord = {
      answer: 'CAR',
      clue: 'A road vehicle',
    };

    placeWord(grid, {
      word: firstWord,
      row: 7,
      col: 6,
      direction: 'across',
    });

    const placements = findCrossingPlacements(grid, secondWord);

    expect(placements).toContainEqual({
      word: secondWord,
      row: 7,
      col: 6,
      direction: 'down',
    });
  });

  it('should find multiple valid crossing placements', () => {
    const grid = createCrosswordGrid(15, 15);

    const firstWord: CrosswordWord = {
      answer: 'CAT',
      clue: 'A small domesticated animal',
    };

    const secondWord: CrosswordWord = {
      answer: 'CAR',
      clue: 'A road vehicle',
    };

    placeWord(grid, {
      word: firstWord,
      row: 7,
      col: 6,
      direction: 'across',
    });

    const placements = findCrossingPlacements(grid, secondWord);

    expect(placements.length).toBeGreaterThan(1);
  });

  it('should return an empty array when there is no possible crossing', () => {
    const grid = createCrosswordGrid(15, 15);

    const firstWord: CrosswordWord = {
      answer: 'CAT',
      clue: 'A small domesticated animal',
    };

    const secondWord: CrosswordWord = {
      answer: 'DOG',
      clue: 'A common pet',
    };

    placeWord(grid, {
      word: firstWord,
      row: 7,
      col: 6,
      direction: 'across',
    });

    const placements = findCrossingPlacements(grid, secondWord);

    expect(placements).toEqual([]);
  });

  it('should not modify the grid', () => {
    const grid = createCrosswordGrid(15, 15);

    const firstWord: CrosswordWord = {
      answer: 'CAT',
      clue: 'A small domesticated animal',
    };

    const secondWord: CrosswordWord = {
      answer: 'CAR',
      clue: 'A road vehicle',
    };

    placeWord(grid, {
      word: firstWord,
      row: 7,
      col: 6,
      direction: 'across',
    });

    const placementsBefore = [...grid.placements];
    const cellsBefore = grid.cells.map((row) => row.map((cell) => ({ ...cell })));

    findCrossingPlacements(grid, secondWord);

    expect(grid.placements).toEqual(placementsBefore);
    expect(grid.cells).toEqual(cellsBefore);
  });
});