import { CrosswordGrid } from "../domain/grid.js";
import { WordPlacement } from "../domain/word-placement.js";

export function placeWord(
  grid: CrosswordGrid,
  placement: WordPlacement,
): CrosswordGrid {
  const { answer } = placement.word;
  const { row, col, direction } = placement;

  for (let index = 0; index < answer.length; index++) {
    const currentRow = direction === 'across' ? row : row + index;
    const currentCol = direction === 'across' ? col + index : col;

    grid.cells[currentRow][currentCol].letter = answer[index];
  }

  grid.placements.push(placement);

  return grid;
}