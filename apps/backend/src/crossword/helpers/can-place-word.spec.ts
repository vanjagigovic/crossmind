import { describe, expect, it } from 'vitest';
import { canPlaceWord } from './can-place-word.js';
import { createCrosswordGrid } from './grid-helper.js';
import { placeWord } from './place-word.js';

describe('canPlaceWord', () => {
  it('returns true when a word fits horizontally', () => {
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

    expect(canPlaceWord(grid, placement)).toBe(true);
  });

  it('returns true when a word fits vertically', () => {
    const grid = createCrosswordGrid(5, 5);

    const placement = {
      word: {
        answer: 'CAT',
        clue: 'A small domesticated animal',
      },
      row: 1,
      col: 2,
      direction: 'down' as const,
    };

    expect(canPlaceWord(grid, placement)).toBe(true);
  });

  it('returns false when a word goes outside the grid', () => {
    const grid = createCrosswordGrid(5, 5);

    const placement = {
      word: {
        answer: 'CAT',
        clue: 'A small domesticated animal',
      },
      row: 2,
      col: 4,
      direction: 'across' as const,
    };

    expect(canPlaceWord(grid, placement)).toBe(false);
  });

  it('returns false when a word conflicts with an existing letter', () => {
    const grid = createCrosswordGrid(5, 5);

    grid.cells[2][2].letter = 'X';

    const placement = {
      word: {
        answer: 'CAT',
        clue: 'A small domesticated animal',
      },
      row: 2,
      col: 1,
      direction: 'across' as const,
    };

    expect(canPlaceWord(grid, placement)).toBe(false);
  });
  it('returns false when a word does not cross an existing word', () => {
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

    expect(canPlaceWord(grid, placement)).toBe(false);
  });
  it('returns true when a word crosses an existing word with a matching letter', () => {
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

    expect(canPlaceWord(grid, placement)).toBe(true);
  });

  it('rejects same-direction overlap even when it also crosses a perpendicular word', () => {
    const grid = createCrosswordGrid(7, 7);
    const cat = {
      word: { answer: 'CAT', clue: 'A feline' },
      row: 0,
      col: 2,
      direction: 'across' as const,
    };
    const art = {
      word: { answer: 'ART', clue: 'A creative work' },
      row: 0,
      col: 3,
      direction: 'down' as const,
    };

    placeWord(grid, cat);
    expect(canPlaceWord(grid, art)).toBe(true);
    placeWord(grid, art);

    expect(
      canPlaceWord(grid, {
        word: { answer: 'CATAA', clue: 'A word' },
        row: 0,
        col: 2,
        direction: 'across',
      }),
    ).toBe(false);
  });

  it('allows a non-overlapping same-direction word that crosses another entry', () => {
    const grid = createCrosswordGrid(7, 7);

    placeWord(grid, {
      word: { answer: 'CAT', clue: 'A feline' },
      row: 1,
      col: 1,
      direction: 'across',
    });
    placeWord(grid, {
      word: { answer: 'RAT', clue: 'A rodent' },
      row: 0,
      col: 2,
      direction: 'down',
    });
    placeWord(grid, {
      word: { answer: 'BAB', clue: 'A name' },
      row: 4,
      col: 4,
      direction: 'down',
    });

    expect(
      canPlaceWord(grid, {
        word: { answer: 'OAT', clue: 'A grain' },
        row: 5,
        col: 3,
        direction: 'across',
      }),
    ).toBe(true);
  });

  it('rejects a perpendicular crossing with a conflicting letter', () => {
    const grid = createCrosswordGrid(5, 5);

    placeWord(grid, {
      word: { answer: 'CAT', clue: 'A feline' },
      row: 2,
      col: 1,
      direction: 'across',
    });

    expect(
      canPlaceWord(grid, {
        word: { answer: 'RIT', clue: 'Conflicting letters' },
        row: 1,
        col: 2,
        direction: 'down',
      }),
    ).toBe(false);
  });
  it('returns false when a word touches another word without crossing', () => {
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
      row: 1,
      col: 1,
      direction: 'across' as const,
    };

    expect(canPlaceWord(grid, placement)).toBe(false);
  });
  it('returns false when a vertical word touches another word without crossing', () => {
    const grid = createCrosswordGrid(5, 5);

    placeWord(grid, {
      word: {
        answer: 'CAT',
        clue: 'A small domesticated animal',
      },
      row: 1,
      col: 2,
      direction: 'down',
    });

    const placement = {
      word: {
        answer: 'DOG',
        clue: 'A common pet',
      },
      row: 1,
      col: 1,
      direction: 'down' as const,
    };

    expect(canPlaceWord(grid, placement)).toBe(false);
  });
  it('returns false when a word overlaps an existing word in the same direction', () => {
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
        answer: 'CAT',
        clue: 'A small domesticated animal',
      },
      row: 2,
      col: 1,
      direction: 'across' as const,
    };

    expect(canPlaceWord(grid, placement)).toBe(false);
  });
});
