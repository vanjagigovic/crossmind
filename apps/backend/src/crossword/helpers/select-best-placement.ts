import { CrosswordGrid } from "../domain/grid.js";
import { WordPlacement } from "../domain/word-placement.js";
import { countCrossings } from "./count-crossings.js";

export function selectBestPlacement(
  grid: CrosswordGrid,
  placements: WordPlacement[],
): WordPlacement | null {
  let bestPlacement: WordPlacement | null = null;
  let highestCrossingCount = -1;

  for (const placement of placements) {
    const crossingCount = countCrossings(grid, placement);

    if (
      crossingCount > highestCrossingCount ||
      (crossingCount === highestCrossingCount &&
        bestPlacement !== null &&
        comparePlacements(placement, bestPlacement) < 0)
    ) {
      bestPlacement = placement;
      highestCrossingCount = crossingCount;
    }
  }

  return bestPlacement;
}

function comparePlacements(
  firstPlacement: WordPlacement,
  secondPlacement: WordPlacement,
): number {
  return (
    firstPlacement.row - secondPlacement.row ||
    firstPlacement.col - secondPlacement.col ||
    firstPlacement.direction.localeCompare(secondPlacement.direction)
  );
}