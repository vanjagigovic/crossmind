import { CrosswordGrid } from "../domain/grid.js";
import { WordPlacement } from "../domain/word-placement.js";

export function countCrossings(
  grid: CrosswordGrid,
  placement: WordPlacement,
): number {
  let crossings = 0;

  for (const existingPlacement of grid.placements) {
    if (existingPlacement.direction === placement.direction) {
      continue;
    }

    for (let index = 0; index < placement.word.answer.length; index++) {
      const row = placement.direction === "across" ? placement.row : placement.row + index;
      const col = placement.direction === "across" ? placement.col + index : placement.col;

      for (
        let existingIndex = 0;
        existingIndex < existingPlacement.word.answer.length;
        existingIndex++
      ) {
        const existingRow =
          existingPlacement.direction === "across"
            ? existingPlacement.row
            : existingPlacement.row + existingIndex;
        const existingCol =
          existingPlacement.direction === "across"
            ? existingPlacement.col + existingIndex
            : existingPlacement.col;

        if (
          row === existingRow &&
          col === existingCol &&
          placement.word.answer[index] === existingPlacement.word.answer[existingIndex]
        ) {
          crossings++;
        }
      }
    }
  }

  return crossings;
}