import { WordPlacement } from "./word-placement.js";

export type GridCell = {
  row: number;
  col: number;
  letter: string | null;
  isBlocked: boolean;
};

export type Grid = GridCell[][];

export type CrosswordGrid = {
  rows: number;
  cols: number;
  cells: Grid;
  placements: WordPlacement[];
};