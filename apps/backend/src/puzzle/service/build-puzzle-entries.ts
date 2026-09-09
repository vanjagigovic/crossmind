import type { WordPlacement } from "../../crossword/domain/word-placement.js";
import type { CreatePuzzleEntryData } from "../domain/puzzle-entry.js";

// Numbers starting cells in reading order (top-to-bottom, left-to-right); shared start cells share a number.
export function buildPuzzleEntries(
  puzzleId: string,
  placements: WordPlacement[],
): CreatePuzzleEntryData[] {
  const numbersByCell = new Map<string, number>();
  const sortedPlacements = [...placements].sort(
    (first, second) => first.row - second.row || first.col - second.col,
  );
  let nextNumber = 1;

  return sortedPlacements.map((placement) => {
    const cellKey = `${placement.row}:${placement.col}`;
    let number = numbersByCell.get(cellKey);

    if (number === undefined) {
      number = nextNumber++;
      numbersByCell.set(cellKey, number);
    }

    return {
      puzzleId,
      word: placement.word.answer,
      clue: placement.word.clue,
      direction: placement.direction,
      row: placement.row,
      column: placement.col,
      length: placement.word.answer.length,
      number,
    };
  });
}
