import { CrosswordGrid } from '../domain/grid.js';
import { CrosswordWord } from '../domain/word.js';

export type CrosswordGenerationStats = {
  nodesVisited: number;
  backtracks: number;
  placementEvaluations: number;
};

export type CrosswordGenerationResult = {
  grid: CrosswordGrid;
  placedWords: CrosswordWord[];
  unplacedWords: CrosswordWord[];
  stats?: CrosswordGenerationStats;
};
