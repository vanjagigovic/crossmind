import { CrosswordGrid, Grid } from "../domain/grid.js";

export function createCrosswordGrid(
  rows: number,
  cols: number,
): CrosswordGrid {
  const cells: Grid = [];

  for (let row = 0; row < rows; row++) {
    const currentRow = [];

    for (let col = 0; col < cols; col++) {
      currentRow.push({
        row,
        col,
        letter: null,
        isBlocked: false,
      });
    }

    cells.push(currentRow);
  }

  return {
    rows,
    cols,
    cells,
    placements: [],
  };
}