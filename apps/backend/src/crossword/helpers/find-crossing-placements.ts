import { CrosswordGrid } from '../domain/grid.js';
import { CrosswordWord } from '../domain/word.js';
import { Direction, WordPlacement } from '../domain/word-placement.js';

import { canPlaceWord } from './can-place-word.js';

export function findCrossingPlacements(
  grid: CrosswordGrid,
  word: CrosswordWord,
): WordPlacement[] {
  const placements: WordPlacement[] = [];

  for (const existingPlacement of grid.placements) {
    const existingAnswer = existingPlacement.word.answer;

    for (
      let existingIndex = 0;
      existingIndex < existingAnswer.length;
      existingIndex++
    ) {
      for (
        let wordIndex = 0;
        wordIndex < word.answer.length;
        wordIndex++
      ) {
        if (existingAnswer[existingIndex] !== word.answer[wordIndex]) {
          continue;
        }

        const existingRow =
          existingPlacement.direction === 'across'
            ? existingPlacement.row
            : existingPlacement.row + existingIndex;

        const existingCol =
          existingPlacement.direction === 'across'
            ? existingPlacement.col + existingIndex
            : existingPlacement.col;

        const direction: Direction =
          existingPlacement.direction === 'across' ? 'down' : 'across';

        const row =
          direction === 'across'
            ? existingRow
            : existingRow - wordIndex;

        const col =
          direction === 'across'
            ? existingCol - wordIndex
            : existingCol;

        const placement: WordPlacement = {
          word,
          row,
          col,
          direction,
        };

        if (canPlaceWord(grid, placement)) {
          placements.push(placement);
        }
      }
    }
  }

  return placements;
}