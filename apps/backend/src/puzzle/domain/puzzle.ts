import type { CrosswordGrid } from "../../crossword/domain/grid.js";
import type { CrosswordDifficulty } from "../../crossword/domain/difficulty.js";
import type { PuzzleEntry } from "./puzzle-entry.js";
import type { CrosswordLanguage } from "../../crossword/domain/language.js";

export type PuzzleDifficulty = CrosswordDifficulty;
export type PuzzleLanguage = CrosswordLanguage

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
  language: PuzzleLanguage;
  status: PuzzleStatus;
  rows: number;
  columns: number;
  grid: CrosswordGrid;
};

export type CreatePuzzleData = {
  title: string;
  theme: string;
  difficulty: PuzzleDifficulty;
  language: PuzzleLanguage;
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
  language: PuzzleLanguage;
};

export type PuzzleWithEntries = Puzzle & {
  entries: PuzzleEntry[];
};