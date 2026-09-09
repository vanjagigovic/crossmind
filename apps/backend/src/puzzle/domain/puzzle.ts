import type { CrosswordGrid } from "../../crossword/domain/grid.js";
import type { CrosswordDifficulty } from "../../crossword/domain/difficulty.js";

export type PuzzleDifficulty = CrosswordDifficulty;

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
  grid: CrosswordGrid;
};

export type CreatePuzzleData = {
  title: string;
  theme: string;
  difficulty: PuzzleDifficulty;
  status: PuzzleStatus;
  rows: number;
  columns: number;
  grid: CrosswordGrid;
};

export type UpdatePuzzleData = Partial<CreatePuzzleData>;

export type GeneratePuzzleData = {
  title: string;
  theme: string;
  difficulty: PuzzleDifficulty;
  rows: number;
  columns: number;
  wordCount: number;
};