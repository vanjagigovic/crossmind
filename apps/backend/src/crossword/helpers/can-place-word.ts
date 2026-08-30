import { CrosswordGrid } from '../domain/grid.js';
import { WordPlacement } from '../domain/word-placement.js';
import { hasAdjacentWord } from './has-adjacent-word.js';
import { hasCrossing } from './has-crossing.js';

export function canPlaceWord(
    grid: CrosswordGrid,
    placement: WordPlacement,
): boolean {
    const { answer } = placement.word;
    const { row, col, direction } = placement;

    for (let index = 0; index < answer.length; index++) {
        const currentRow = direction === 'across' ? row : row + index;
        const currentCol = direction === 'across' ? col + index : col;

        if (
            currentRow < 0 ||
            currentRow >= grid.rows ||
            currentCol < 0 ||
            currentCol >= grid.cols
        ) {
            return false;
        }

        const cell = grid.cells[currentRow][currentCol];

        if (cell.isBlocked) {
            return false;
        }

        if (cell.letter !== null && cell.letter !== answer[index]) {
            return false;
        }
    }

    const gridHasLetters = grid.cells.some((row) =>
        row.some((cell) => cell.letter !== null),
    );

    if (!gridHasLetters) {
        return true;
    }

    if (!hasCrossing(grid, placement)) {
        return false;
    }

    if (hasAdjacentWord(grid, placement)) {
        return false;
    }

    return true;
}