import { CrosswordGrid } from "../domain/grid.js";
import { WordPlacement } from "../domain/word-placement.js";

export function hasCrossing(
  grid: CrosswordGrid,
  placement: WordPlacement,
): boolean {
  const { answer } = placement.word;
  const { row, col, direction } = placement;

  return grid.placements.some((existingPlacement) => {
    if (existingPlacement.direction === direction) {
      return false;
    }

    for (let index = 0; index < answer.length; index++) {
      const currentRow = direction === 'across' ? row : row + index;
      const currentCol = direction === 'across' ? col + index : col;

      const existingAnswer = existingPlacement.word.answer;

      for (let existingIndex = 0; existingIndex < existingAnswer.length; existingIndex++) {
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
          return true;
        }
      }
    }

    return false;
  });
}