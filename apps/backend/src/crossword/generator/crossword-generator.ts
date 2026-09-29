import { CrosswordWord } from '../domain/word.js';
import { canPlaceWord } from '../helpers/can-place-word.js';
import { findCrossingPlacements } from '../helpers/find-crossing-placements.js';
import { createCrosswordGrid } from '../helpers/grid-helper.js';
import { placeWord } from '../helpers/place-word.js';
import {
  isBetterCrosswordScore,
  scoreCrossword,
} from '../helpers/score-crossword.js';
import { selectNextWord } from '../helpers/select-next-word.js';
import {
  CrosswordGenerationResult,
  CrosswordGenerationStats,
} from './crossword-generation-result.js';

export type CrosswordGenerationStrategy = 'mrv' | 'baseline';

export type CrosswordGeneratorOptions = {
  rows: number;
  cols: number;
  candidateCount?: number;
  searchNodeLimit?: number;
  random?: () => number;
  selectionStrategy?: CrosswordGenerationStrategy;
};

type StartDirection = 'across' | 'down';

type GridSnapshot = {
  cells: ReturnType<typeof createCrosswordGrid>['cells'];
  placements: ReturnType<typeof createCrosswordGrid>['placements'];
};

export class CrosswordGenerator {
  private readonly candidateCount: number;
  private readonly random: () => number;
  private readonly searchNodeLimit: number;
  private readonly selectionStrategy: CrosswordGenerationStrategy;

  constructor(private readonly options: CrosswordGeneratorOptions) {
    this.candidateCount = options.candidateCount ?? 30;
    this.random = options.random ?? Math.random;
    this.searchNodeLimit = options.searchNodeLimit ?? 2000;
    this.selectionStrategy = options.selectionStrategy ?? 'mrv';
  }

  generate(
    words: CrosswordWord[],
    targetWordCount: number,
  ): CrosswordGenerationResult {
    if (words.length === 0 || targetWordCount <= 0) {
      const grid = createCrosswordGrid(this.options.rows, this.options.cols);

      return {
        grid,
        placedWords: [],
        unplacedWords: [],
      };
    }

    const uniqueWords = this.deduplicateWords(words);

    if (uniqueWords.length < targetWordCount) {
      const grid = createCrosswordGrid(this.options.rows, this.options.cols);

      return {
        grid,
        placedWords: [],
        unplacedWords: [...uniqueWords],
      };
    }

    let bestResult: CrosswordGenerationResult | null = null;
    const stats: CrosswordGenerationStats = {
      nodesVisited: 0,
      backtracks: 0,
      placementEvaluations: 0,
    };

    let bestScore = {
      placedWords: -1,
      crossings: -1,
      occupiedCells: -1,
      boundingBoxDensity: -1,
    };

    for (
      let candidateIndex = 0;
      candidateIndex < this.candidateCount;
      candidateIndex++
    ) {
      const candidate = this.generateCandidate(
        uniqueWords,
        targetWordCount,
        stats,
      );

      const score = scoreCrossword(candidate.grid);

      if (bestResult === null || isBetterCrosswordScore(score, bestScore)) {
        bestResult = candidate;
        bestScore = score;
      }

      if (candidate.placedWords.length === targetWordCount) {
        break;
      }
    }

    return {
      ...bestResult!,
      stats,
    };
  }

  private generateCandidate(
    words: CrosswordWord[],
    targetWordCount: number,
    stats: CrosswordGenerationStats,
  ): CrosswordGenerationResult {
    const grid = createCrosswordGrid(this.options.rows, this.options.cols);

    const sortedWords = this.shuffleWords(words);
    const firstWord = sortedWords[0];

    if (!firstWord) {
      return {
        grid,
        placedWords: [],
        unplacedWords: [],
      };
    }

    const firstPlacement = this.createFirstPlacement(firstWord);

    if (!canPlaceWord(grid, firstPlacement)) {
      return {
        grid,
        placedWords: [],
        unplacedWords: sortedWords,
      };
    }

    placeWord(grid, firstPlacement);

    const remainingWords = sortedWords.slice(1);
    const placedWords = [firstWord];

    let bestResult: CrosswordGenerationResult = {
      grid: this.cloneGrid(grid),
      placedWords: [...placedWords],
      unplacedWords: [...remainingWords],
    };

    let candidateNodesVisited = 0;

    const visitNode = (): boolean => {
      if (candidateNodesVisited >= this.searchNodeLimit) {
        return false;
      }

      candidateNodesVisited++;
      stats.nodesVisited++;
      return true;
    };

    const updateBest = (candidate: CrosswordGenerationResult): void => {
      const candidateScore = scoreCrossword(candidate.grid);
      const bestScore = scoreCrossword(bestResult.grid);

      if (isBetterCrosswordScore(candidateScore, bestScore)) {
        bestResult = candidate;
      }
    };

    this.searchPlacements(
      grid,
      remainingWords,
      placedWords,
      [],
      targetWordCount,
      visitNode,
      updateBest,
      stats,
    );

    return bestResult;
  }

  private searchPlacements(
    grid: ReturnType<typeof createCrosswordGrid>,
    remainingWords: CrosswordWord[],
    placedWords: CrosswordWord[],
    unplacedWords: CrosswordWord[],
    targetWordCount: number,
    visitNode: () => boolean,
    updateBest: (candidate: CrosswordGenerationResult) => void,
    stats: CrosswordGenerationStats,
  ): void {
    if (!visitNode()) {
      return;
    }

    updateBest({
      grid: this.cloneGrid(grid),
      placedWords: [...placedWords],
      unplacedWords: [...unplacedWords, ...remainingWords],
    });

    if (placedWords.length === targetWordCount) {
      return;
    }

    if (placedWords.length + remainingWords.length < targetWordCount) {
      return;
    }

    if (remainingWords.length === 0) {
      return;
    }

    const nextWord = this.selectNextWord(grid, remainingWords);

    if (!nextWord) {
      return;
    }

    const { word, placements } = nextWord;

    const rest = remainingWords.filter(
      (remainingWord) => remainingWord !== word,
    );

    if (placements.length === 0) {
      this.searchPlacements(
        grid,
        rest,
        placedWords,
        [...unplacedWords, word],
        targetWordCount,
        visitNode,
        updateBest,
        stats,
      );

      return;
    }

    for (const placement of placements) {
      if (placedWords.length >= targetWordCount) {
        break;
      }

      stats.placementEvaluations++;

      const snapshot = this.snapshotGrid(grid);

      placeWord(grid, placement);

      this.searchPlacements(
        grid,
        rest,
        [...placedWords, word],
        unplacedWords,
        targetWordCount,
        visitNode,
        updateBest,
        stats,
      );

      this.restoreGrid(grid, snapshot);
      stats.backtracks++;

      if (placedWords.length >= targetWordCount) {
        break;
      }
    }

    if (placedWords.length + rest.length >= targetWordCount) {
      this.searchPlacements(
        grid,
        rest,
        placedWords,
        [...unplacedWords, word],
        targetWordCount,
        visitNode,
        updateBest,
        stats,
      );
    }
  }

  private selectNextWord(
    grid: ReturnType<typeof createCrosswordGrid>,
    words: CrosswordWord[],
  ) {
    if (this.selectionStrategy === 'baseline') {
      const word = words[0];

      return {
        word,
        placements: findCrossingPlacements(grid, word),
      };
    }

    return selectNextWord(grid, words);
  }

  private deduplicateWords(words: CrosswordWord[]): CrosswordWord[] {
    const seen = new Set<string>();
    const uniqueWords: CrosswordWord[] = [];

    for (const word of words) {
      const key = word.answer.trim().toUpperCase();

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      uniqueWords.push(word);
    }

    return uniqueWords;
  }

  private snapshotGrid(
    grid: ReturnType<typeof createCrosswordGrid>,
  ): GridSnapshot {
    return {
      cells: grid.cells.map((row) => row.map((cell) => ({ ...cell }))),
      placements: [...grid.placements],
    };
  }

  private restoreGrid(
    grid: ReturnType<typeof createCrosswordGrid>,
    snapshot: GridSnapshot,
  ): void {
    for (let row = 0; row < grid.cells.length; row++) {
      for (let col = 0; col < grid.cells[row].length; col++) {
        Object.assign(grid.cells[row][col], snapshot.cells[row][col]);
      }
    }

    grid.placements.splice(0, grid.placements.length, ...snapshot.placements);
  }

  private cloneGrid(grid: ReturnType<typeof createCrosswordGrid>) {
    return {
      rows: grid.rows,
      cols: grid.cols,
      cells: grid.cells.map((row) => row.map((cell) => ({ ...cell }))),
      placements: [...grid.placements],
    };
  }

  private createFirstPlacement(word: CrosswordWord) {
    const direction: StartDirection = this.random() < 0.5 ? 'across' : 'down';

    if (direction === 'across') {
      return {
        word,
        row: Math.floor(this.options.rows / 2),
        col: Math.floor((this.options.cols - word.answer.length) / 2),
        direction,
      } as const;
    }

    return {
      word,
      row: Math.floor((this.options.rows - word.answer.length) / 2),
      col: Math.floor(this.options.cols / 2),
      direction,
    } as const;
  }

  private shuffleWords(words: CrosswordWord[]): CrosswordWord[] {
    const shuffled = [...words];

    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(this.random() * (index + 1));

      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }

    return shuffled.sort(
      (firstWord, secondWord) =>
        secondWord.answer.length - firstWord.answer.length,
    );
  }
}
