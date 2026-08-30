import { CrosswordGrid } from '../domain/grid.js';
import { WordPlacement } from '../domain/word-placement.js';
import { countCrossings } from './count-crossings.js';

export function selectBestPlacement(
    grid: CrosswordGrid,
    placements: WordPlacement[],
): WordPlacement | null {
    if (placements.length === 0) {
        return null;
    }

    return placements.reduce((bestPlacement, placement) => {
        const bestScore = countCrossings(grid, bestPlacement);
        const currentScore = countCrossings(grid, placement);

        return currentScore > bestScore ? placement : bestPlacement;
    });
}