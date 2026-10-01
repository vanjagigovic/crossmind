import { describe, expect, it } from 'vitest';

import { selectBestPlacement } from './select-best-placement.js';
import { createCrosswordGrid } from './grid-helper.js';
import { placeWord } from './place-word.js';

describe('selectBestPlacement', () => {
  it('returns null for an empty list', () => {
    expect(selectBestPlacement(createCrosswordGrid(5, 5), [])).toBeNull();
  });

  it('uses the injected random generator to break crossing ties', () => {
    const grid = createCrosswordGrid(5, 5);

    placeWord(grid, {
      word: { answer: 'CAT', clue: 'A small animal' },
      row: 2,
      col: 1,
      direction: 'across',
    });

    const firstPlacement = {
      word: { answer: 'RAT', clue: 'A rodent' },
      row: 1,
      col: 2,
      direction: 'down' as const,
    };

    const secondPlacement = {
      word: { answer: 'CAR', clue: 'A vehicle' },
      row: 2,
      col: 1,
      direction: 'down' as const,
    };

    const result = selectBestPlacement(
      grid,
      [secondPlacement, firstPlacement],
      () => 0,
    );

    expect(result).toBe(firstPlacement);
  });

  it('can select the other placement when randomness changes the tie-break', () => {
    const grid = createCrosswordGrid(5, 5);

    placeWord(grid, {
      word: { answer: 'CAT', clue: 'A small animal' },
      row: 2,
      col: 1,
      direction: 'across',
    });

    const firstPlacement = {
      word: { answer: 'RAT', clue: 'A rodent' },
      row: 1,
      col: 2,
      direction: 'down' as const,
    };

    const secondPlacement = {
      word: { answer: 'CAR', clue: 'A vehicle' },
      row: 2,
      col: 1,
      direction: 'down' as const,
    };

    const result = selectBestPlacement(
      grid,
      [secondPlacement, firstPlacement],
      () => 0.9,
    );

    expect(result).toBe(secondPlacement);
  });
});
