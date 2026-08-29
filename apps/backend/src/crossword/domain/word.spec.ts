import { describe, expect, it } from 'vitest';
import { CrosswordWord } from './word.js';

describe('CrosswordWord', () => {
  it('represents a crossword word with an answer and clue', () => {
    const word: CrosswordWord = {
      answer: 'REACT',
      clue: 'A JavaScript library for building user interfaces',
    };

    expect(word.answer).toBe('REACT');
    expect(word.clue).toBe(
      'A JavaScript library for building user interfaces',
    );
  });
});