import type { CrosswordGrid } from "../../crossword/domain/grid.js";
import type { CrosswordWord } from "../../crossword/domain/word.js";

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
  words: CrosswordWord[];
};