import { describe, expect, it } from 'vitest';
import { WordPlacement } from './word-placement.js';

describe('WordPlacement', () => {
  it('represents a word placement on the crossword grid', () => {
    const placement: WordPlacement = {
      word: {
        answer: 'REACT',
        clue: 'A JavaScript library for building user interfaces',
      },
      row: 2,
      col: 3,
      direction: 'across',
    };

    expect(placement.word.answer).toBe('REACT');
    expect(placement.row).toBe(2);
    expect(placement.col).toBe(3);
    expect(placement.direction).toBe('across');
  });
});