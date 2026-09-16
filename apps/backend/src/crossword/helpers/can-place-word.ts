import { CrosswordGrid } from "../domain/grid.js";
import { WordPlacement } from "../domain/word-placement.js";
import { hasCrossing } from "./has-crossing.js";

function isInsideGrid(
  grid: CrosswordGrid,
  row: number,
  col: number,
): boolean {
  return (
    row >= 0 &&
    row < grid.rows &&
    col >= 0 &&
    col < grid.cols
  );
}

export function canPlaceWord(
  grid: CrosswordGrid,
  placement: WordPlacement,
): boolean {
  const { answer } = placement.word;
  const { row, col, direction } = placement;

  const rowStep = direction === "down" ? 1 : 0;
  const colStep = direction === "across" ? 1 : 0;

  const endRow = row + rowStep * (answer.length - 1);
  const endCol = col + colStep * (answer.length - 1);

  // The complete word must fit inside the grid.
  if (
    !isInsideGrid(grid, row, col) ||
    !isInsideGrid(grid, endRow, endCol)
  ) {
    return false;
  }

  // There must not be another letter immediately before the word.
  const beforeRow = row - rowStep;
  const beforeCol = col - colStep;

  if (
    isInsideGrid(grid, beforeRow, beforeCol) &&
    grid.cells[beforeRow][beforeCol].letter !== null
  ) {
    return false;
  }

  // There must not be another letter immediately after the word.
  const afterRow = endRow + rowStep;
  const afterCol = endCol + colStep;

  if (
    isInsideGrid(grid, afterRow, afterCol) &&
    grid.cells[afterRow][afterCol].letter !== null
  ) {
    return false;
  }

  for (let index = 0; index < answer.length; index++) {
    const currentRow = row + rowStep * index;
    const currentCol = col + colStep * index;

    const cell = grid.cells[currentRow][currentCol];

    if (cell.isBlocked) {
      return false;
    }

    if (
      cell.letter !== null &&
      cell.letter !== answer[index]
    ) {
      return false;
    }

    // If this cell already contains the correct letter,
    // it can be a crossing with an existing word.
    if (cell.letter !== null) {
      continue;
    }

    // Empty cells cannot have neighbouring letters beside the word.
    if (direction === "across") {
      for (const neighbourRow of [currentRow - 1, currentRow + 1]) {
        if (
          isInsideGrid(grid, neighbourRow, currentCol) &&
          grid.cells[neighbourRow][currentCol].letter !== null
        ) {
          return false;
        }
      }
    } else {
      for (const neighbourCol of [currentCol - 1, currentCol + 1]) {
        if (
          isInsideGrid(grid, currentRow, neighbourCol) &&
          grid.cells[currentRow][neighbourCol].letter !== null
        ) {
          return false;
        }
      }
    }
  }

  const gridHasLetters = grid.cells.some((gridRow) =>
    gridRow.some((cell) => cell.letter !== null),
  );

  if (gridHasLetters && !hasCrossing(grid, placement)) {
    return false;
  }

  return true;
}