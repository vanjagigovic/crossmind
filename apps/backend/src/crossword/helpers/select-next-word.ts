import { CrosswordGrid } from '../domain/grid.js';
import { CrosswordWord } from '../domain/word.js';

import { findCrossingPlacements } from './find-crossing-placements.js';

export type WordWithPlacements = {
  word: CrosswordWord;
  placements: ReturnType<typeof findCrossingPlacements>;
};

export function selectNextWord(
  grid: CrosswordGrid,
  words: CrosswordWord[],
): WordWithPlacements | null {
  if (words.length === 0) {
    return null;
  }

  let bestCandidate: WordWithPlacements | null = null;

  for (const word of words) {
    const placements = findCrossingPlacements(grid, word);

    if (
      bestCandidate === null ||
      placements.length < bestCandidate.placements.length
    ) {
      bestCandidate = {
        word,
        placements,
      };
    }

    if (placements.length === 0) {
      break;
    }
  }

  return bestCandidate;
}
