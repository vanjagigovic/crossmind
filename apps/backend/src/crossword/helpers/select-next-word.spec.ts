import { beforeEach, describe, expect, it, vi } from 'vitest';
import { selectNextWord } from './select-next-word.js';
import { createCrosswordGrid } from './grid-helper.js';
import { findCrossingPlacements } from './find-crossing-placements.js';

vi.mock('./find-crossing-placements.js', () => ({
  findCrossingPlacements: vi.fn(),
}));

describe('selectNextWord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('selects the word with the fewest legal placements', () => {
    const grid = createCrosswordGrid(15, 15);

    const firstWord = {
      answer: 'FUNCTION',
      clue: 'Reusable block of code',
    };

    const secondWord = {
      answer: 'SYNTAX',
      clue: 'Rules for writing code',
    };

    const thirdWord = {
      answer: 'COMPILER',
      clue: 'Translates source code',
    };

    vi.mocked(findCrossingPlacements)
      .mockReturnValueOnce([{} as never, {} as never, {} as never])
      .mockReturnValueOnce([{} as never])
      .mockReturnValueOnce([{} as never, {} as never]);

    const result = selectNextWord(grid, [firstWord, secondWord, thirdWord]);

    expect(result?.word).toBe(secondWord);
    expect(result?.placements).toHaveLength(1);
  });

  it('selects a word with zero placements immediately', () => {
    vi.mocked(findCrossingPlacements).mockClear();
    const grid = createCrosswordGrid(15, 15);

    const firstWord = {
      answer: 'FUNCTION',
      clue: 'Reusable block of code',
    };

    const secondWord = {
      answer: 'SYNTAX',
      clue: 'Rules for writing code',
    };

    vi.mocked(findCrossingPlacements)
      .mockReturnValueOnce([{} as never, {} as never])
      .mockReturnValueOnce([]);

    const result = selectNextWord(grid, [firstWord, secondWord]);

    expect(result?.word).toBe(secondWord);
    expect(result?.placements).toHaveLength(0);

    expect(findCrossingPlacements).toHaveBeenCalledTimes(2);
  });
});
