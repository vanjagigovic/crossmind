import { CrosswordGrid } from '../domain/grid.js';
import { CrosswordWord } from '../domain/word.js';

export type CrosswordGenerationResult = {
  grid: CrosswordGrid;
  placedWords: CrosswordWord[];
  unplacedWords: CrosswordWord[];
};