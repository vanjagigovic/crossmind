import { CrosswordWord } from "./word.js";

export type Direction = 'across' | 'down';

export type WordPlacement = {
  word: CrosswordWord;
  row: number;
  col: number;
  direction: Direction;
};