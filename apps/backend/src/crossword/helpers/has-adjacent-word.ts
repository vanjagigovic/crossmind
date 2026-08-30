import { CrosswordGrid } from '../domain/grid.js';
import { WordPlacement } from '../domain/word-placement.js';

export function hasAdjacentWord(
    grid: CrosswordGrid,
    placement: WordPlacement,
): boolean {
    const { answer } = placement.word;
    const { row, col, direction } = placement;

    for (let index = 0; index < answer.length; index++) {
        const currentRow =
            direction === 'across' ? row : row + index;

        const currentCol =
            direction === 'across' ? col + index : col;

        if (grid.cells[currentRow][currentCol].letter !== null) {
            continue;
        }

        const adjacentCells =
            direction === 'across'
                ? [
                      [currentRow - 1, currentCol],
                      [currentRow + 1, currentCol],
                  ]
                : [
                      [currentRow, currentCol - 1],
                      [currentRow, currentCol + 1],
                  ];

        for (const [adjacentRow, adjacentCol] of adjacentCells) {
            if (
                adjacentRow < 0 ||
                adjacentRow >= grid.rows ||
                adjacentCol < 0 ||
                adjacentCol >= grid.cols
            ) {
                continue;
            }

            const cell = grid.cells[adjacentRow][adjacentCol];

            if (cell.letter === null) {
                continue;
            }

            return true;
        }
    }

    return false;
}