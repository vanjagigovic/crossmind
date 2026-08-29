import { describe, expect, it } from 'vitest';
import { CrosswordGrid } from './grid.js';

describe('CrosswordGrid', () => {
  it('represents a crossword grid with dimensions and cells', () => {
    const grid: CrosswordGrid = {
        rows: 2,
        cols: 2,
        cells: [
            [
                {
                    row: 0,
                    col: 0,
                    letter: null,
                    isBlocked: false,
                },
                {
                    row: 0,
                    col: 1,
                    letter: null,
                    isBlocked: false,
                },
            ],
            [
                {
                    row: 1,
                    col: 0,
                    letter: null,
                    isBlocked: false,
                },
                {
                    row: 1,
                    col: 1,
                    letter: null,
                    isBlocked: false,
                },
            ],
        ],
        placements: []
    };

    expect(grid.rows).toBe(2);
    expect(grid.cols).toBe(2);
    expect(grid.cells).toHaveLength(2);
    expect(grid.cells[0]).toHaveLength(2);
  });
});