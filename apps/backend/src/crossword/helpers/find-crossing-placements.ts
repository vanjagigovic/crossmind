import { CrosswordGrid } from "../domain/grid.js";
import { CrosswordWord } from "../domain/word.js";
import { Direction, WordPlacement } from "../domain/word-placement.js";
import { canPlaceWord } from "./can-place-word.js";

const directions: Direction[] = ["across", "down"];

export function findCrossingPlacements(
  grid: CrosswordGrid,
  word: CrosswordWord,
): WordPlacement[] {
  const placements: WordPlacement[] = [];
  const seenPlacements = new Set<string>();

  for (const gridRow of grid.cells) {
    for (const cell of gridRow) {
      if (cell.letter === null) {
        continue;
      }

      for (let index = 0; index < word.answer.length; index++) {
        if (word.answer[index] !== cell.letter) {
          continue;
        }

        for (const direction of directions) {
          const placement: WordPlacement = {
            word,
            row: direction === "across" ? cell.row : cell.row - index,
            col: direction === "across" ? cell.col - index : cell.col,
            direction,
          };
          const key = `${placement.row}:${placement.col}:${placement.direction}`;

          if (!seenPlacements.has(key) && canPlaceWord(grid, placement)) {
            seenPlacements.add(key);
            placements.push(placement);
          }
        }
      }
    }
  }

  return placements;
}