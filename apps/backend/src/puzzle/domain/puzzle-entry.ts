import type { Puzzle } from "./puzzle.js";

export type PuzzleEntryDirection = "across" | "down";

export type PuzzleEntry = {
  id: string;
  // Currently it's a string, but if we change the ID model one day, this type will automatically match.
  puzzleId: Puzzle["id"];
  word: string;
  clue: string;
  direction: PuzzleEntryDirection;
  row: number;
  column: number;
  length: number;
  number: number;
};