import { describe, expect, it } from 'vitest';

import { StaticCrosswordContentProvider } from './static-crossword-content-provider.js';

describe('StaticCrosswordContentProvider', () => {
  const provider = new StaticCrosswordContentProvider();

  it('returns the requested number of words', async () => {
    const words = await provider.generateWords({
      theme: 'Animals',
      difficulty: 'easy',
      candidateCount: 3,
      language: 'en',
    });

    expect(words).toHaveLength(3);
  });

  it('returns the same words for the same request', async () => {
    const request = {
      theme: 'Animals',
      difficulty: 'easy' as const,
      language: 'en' as const,
      candidateCount: 4,
    };

    const first = await provider.generateWords(request);
    const second = await provider.generateWords(request);

    expect(first).toEqual(second);
  });

  it('cycles through the word pool when wordCount exceeds it', async () => {
    const words = await provider.generateWords({
      theme: 'Animals',
      difficulty: 'hard',
      language: 'en',
      candidateCount: 27,
    });

    expect(words).toHaveLength(27);
    expect(words[26]).toEqual(words[0]);
  });

  it('returns every word with an answer and a clue', async () => {
    const words = await provider.generateWords({
      theme: 'Animals',
      difficulty: 'medium',
      language: 'en',
      candidateCount: 5,
    });

    for (const word of words) {
      expect(word.answer).toBeTruthy();
      expect(word.clue).toBeTruthy();
    }
  });
});
