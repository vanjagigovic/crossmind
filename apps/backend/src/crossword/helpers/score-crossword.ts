import { CrosswordGrid } from '../domain/grid.js';

export type CrosswordScore = {
  placedWords: number;
  crossings: number;
  occupiedCells: number;
  boundingBoxDensity: number;
};

export function scoreCrossword(grid: CrosswordGrid): CrosswordScore {
  const occupiedCells = grid.cells
    .flat()
    .filter((cell) => cell.letter !== null).length;

  const crossings = grid.placements.reduce((total, placement) => {
    return total + countPlacementCrossings(grid, placement);
  }, 0);

  if (occupiedCells === 0) {
    return {
      placedWords: grid.placements.length,
      crossings: 0,
      occupiedCells: 0,
      boundingBoxDensity: 0,
    };
  }

  const occupied = grid.cells.flat().filter((cell) => cell.letter !== null);

  const minRow = Math.min(...occupied.map((cell) => cell.row));
  const maxRow = Math.max(...occupied.map((cell) => cell.row));
  const minCol = Math.min(...occupied.map((cell) => cell.col));
  const maxCol = Math.max(...occupied.map((cell) => cell.col));

  const boundingBoxArea = (maxRow - minRow + 1) * (maxCol - minCol + 1);

  return {
    placedWords: grid.placements.length,
    crossings,
    occupiedCells,
    boundingBoxDensity: occupiedCells / boundingBoxArea,
  };
}

function countPlacementCrossings(
  grid: CrosswordGrid,
  placement: CrosswordGrid['placements'][number],
): number {
  let crossings = 0;

  for (const otherPlacement of grid.placements) {
    if (otherPlacement === placement) {
      continue;
    }

    if (otherPlacement.direction === placement.direction) {
      continue;
    }

    for (let index = 0; index < placement.word.answer.length; index++) {
      const row =
        placement.direction === 'across'
          ? placement.row
          : placement.row + index;

      const col =
        placement.direction === 'across'
          ? placement.col + index
          : placement.col;

      for (
        let otherIndex = 0;
        otherIndex < otherPlacement.word.answer.length;
        otherIndex++
      ) {
        const otherRow =
          otherPlacement.direction === 'across'
            ? otherPlacement.row
            : otherPlacement.row + otherIndex;

        const otherCol =
          otherPlacement.direction === 'across'
            ? otherPlacement.col + otherIndex
            : otherPlacement.col;

        if (row === otherRow && col === otherCol) {
          crossings++;
        }
      }
    }
  }

  return crossings;
}

export function isBetterCrosswordScore(
  candidate: CrosswordScore,
  current: CrosswordScore,
): boolean {
  if (candidate.placedWords !== current.placedWords) {
    return candidate.placedWords > current.placedWords;
  }

  if (candidate.occupiedCells !== current.occupiedCells) {
    return candidate.occupiedCells > current.occupiedCells;
  }

  if (candidate.crossings !== current.crossings) {
    return candidate.crossings > current.crossings;
  }

  return candidate.boundingBoxDensity > current.boundingBoxDensity;
}
