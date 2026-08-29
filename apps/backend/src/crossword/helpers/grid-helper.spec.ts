import { describe, expect, it } from 'vitest';
import { createCrosswordGrid } from './grid-helper.js';

describe('createCrosswordGrid', () => {
  it('creates a grid with the requested dimensions', () => {
    const grid = createCrosswordGrid(3, 4);

    expect(grid.rows).toBe(3);
    expect(grid.cols).toBe(4);
    expect(grid.cells).toHaveLength(3);
    expect(grid.cells[0]).toHaveLength(4);
  });

  it('creates empty and unblocked cells', () => {
    const grid = createCrosswordGrid(2, 2);

    expect(grid.cells[0][0]).toEqual({
      row: 0,
      col: 0,
      letter: null,
      isBlocked: false,
    });
  });

  it('creates cells with the correct coordinates', () => {
    const grid = createCrosswordGrid(2, 3);

    expect(grid.cells[0][0].row).toBe(0);
    expect(grid.cells[0][0].col).toBe(0);

    expect(grid.cells[1][2].row).toBe(1);
    expect(grid.cells[1][2].col).toBe(2);
  });
});