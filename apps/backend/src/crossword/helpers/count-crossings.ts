import { CrosswordGrid } from '../domain/grid.js';
import { WordPlacement } from '../domain/word-placement.js';

export function countCrossings(
  grid: CrosswordGrid,
  placement: WordPlacement,
): number {
  const { answer } = placement.word;
  const { row, col, direction } = placement;

  let crossings = 0;

  for (let index = 0; index < answer.length; index++) {
    const currentRow = direction === 'across' ? row : row + index;
    const currentCol = direction === 'across' ? col + index : col;

    for (const existingPlacement of grid.placements) {
      if (existingPlacement.direction === direction) {
        continue;
      }

      const existingAnswer = existingPlacement.word.answer;

      for (
        let existingIndex = 0;
        existingIndex < existingAnswer.length;
        existingIndex++
      ) {
        const existingRow =
          existingPlacement.direction === 'across'
            ? existingPlacement.row
            : existingPlacement.row + existingIndex;

        const existingCol =
          existingPlacement.direction === 'across'
            ? existingPlacement.col + existingIndex
            : existingPlacement.col;

        if (
          currentRow === existingRow &&
          currentCol === existingCol &&
          answer[index] === existingAnswer[existingIndex]
        ) {
          crossings++;
        }
      }
    }
  }

  return crossings;
}