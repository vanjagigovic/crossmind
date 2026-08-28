import type { Grid } from "../../crossword/domain/grid.js";

export type PuzzleDifficulty = "easy" | "medium" | "hard";

export type PuzzleStatus =
  | "draft"
  | "generating"
  | "ready"
  | "published"
  | "archived";

export type Puzzle = {
  id: string;
  title: string;
  theme: string;
  difficulty: PuzzleDifficulty;
  status: PuzzleStatus;
  rows: number;
  columns: number;
  grid: Grid;
};

export type CreatePuzzleData = {
  title: string;
  theme: string;
  difficulty: PuzzleDifficulty;
  status: PuzzleStatus;
  rows: number;
  columns: number;
  grid: Grid;
};

export type UpdatePuzzleData = Partial<CreatePuzzleData>;