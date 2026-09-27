import { CrosswordGrid } from '../domain/grid.js';
import { WordPlacement } from '../domain/word-placement.js';
import { countCrossings } from './count-crossings.js';

export type RandomGenerator = () => number;

export function selectBestPlacement(
  grid: CrosswordGrid,
  placements: WordPlacement[],
  random: RandomGenerator = Math.random,
): WordPlacement | null {
  let bestPlacement: WordPlacement | null = null;
  let highestCrossingCount = -1;

  for (const placement of placements) {
    const crossingCount = countCrossings(grid, placement);

    if (crossingCount > highestCrossingCount) {
      bestPlacement = placement;
      highestCrossingCount = crossingCount;
      continue;
    }

    if (
      crossingCount === highestCrossingCount &&
      bestPlacement !== null &&
      random() < 0.5
    ) {
      bestPlacement = placement;
    }
  }

  return bestPlacement;
}
