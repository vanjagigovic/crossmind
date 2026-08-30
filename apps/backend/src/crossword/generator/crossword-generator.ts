import { CrosswordGrid } from '../domain/grid.js';
import { CrosswordWord } from '../domain/word.js';
import { Direction, WordPlacement } from '../domain/word-placement.js';
import { canPlaceWord } from '../helpers/can-place-word.js';
import { createCrosswordGrid } from '../helpers/grid-helper.js';
import { placeWord } from '../helpers/place-word.js';
import { CrosswordGenerationResult } from './crossword-generation-result.js';
import { selectBestPlacement } from '../helpers/select-best-placement.js';

export type CrosswordGeneratorOptions = {
  rows: number;
  cols: number;
};

export class CrosswordGenerator {
  constructor(private readonly options: CrosswordGeneratorOptions) { }

  generate(words: CrosswordWord[]): CrosswordGenerationResult {
    const grid = createCrosswordGrid(
      this.options.rows,
      this.options.cols,
    );

    const placedWords: CrosswordWord[] = [];
    const unplacedWords: CrosswordWord[] = [];

    if (words.length === 0) {
      return {
        grid,
        placedWords,
        unplacedWords,
      };
    }
    const sortedWords = [...words].sort(
      (first, second) => second.answer.length - first.answer.length,
    );

    const firstWord = sortedWords[0];

    const firstPlacement: WordPlacement = {
      word: firstWord,
      row: Math.floor(this.options.rows / 2),
      col: Math.floor(
        (this.options.cols - firstWord.answer.length) / 2,
      ),
      direction: 'across',
    };

    if (canPlaceWord(grid, firstPlacement)) {
      placeWord(grid, firstPlacement);
      placedWords.push(firstWord);
    }

    for (const word of sortedWords.slice(1)) {
      const placement = this.findPlacement(grid, word);

      if (placement) {
        placeWord(grid, placement);
        placedWords.push(word);
      } else {
        unplacedWords.push(word);
      }
    }

    return {
      grid,
      placedWords,
      unplacedWords,
    };
  }

  private findPlacement(
    grid: CrosswordGrid,
    word: CrosswordWord,
  ): WordPlacement | null {
    const crossingPlacements = this.findCrossingPlacements(grid, word);

    return selectBestPlacement(grid, crossingPlacements);
  }

  private findCrossingPlacements(
    grid: CrosswordGrid,
    word: CrosswordWord,
  ): WordPlacement[] {
    const placements: WordPlacement[] = [];

    for (const existingPlacement of grid.placements) {
      const existingAnswer = existingPlacement.word.answer;

      for (
        let existingIndex = 0;
        existingIndex < existingAnswer.length;
        existingIndex++
      ) {
        for (
          let wordIndex = 0;
          wordIndex < word.answer.length;
          wordIndex++
        ) {
          if (existingAnswer[existingIndex] !== word.answer[wordIndex]) {
            continue;
          }

          const existingRow =
            existingPlacement.direction === 'across'
              ? existingPlacement.row
              : existingPlacement.row + existingIndex;

          const existingCol =
            existingPlacement.direction === 'across'
              ? existingPlacement.col + existingIndex
              : existingPlacement.col;

          const direction: Direction =
            existingPlacement.direction === 'across' ? 'down' : 'across';

          const row =
            direction === 'across'
              ? existingRow
              : existingRow - wordIndex;

          const col =
            direction === 'across'
              ? existingCol - wordIndex
              : existingCol;

          const placement: WordPlacement = {
            word,
            row,
            col,
            direction,
          };

          if (canPlaceWord(grid, placement)) {
            placements.push(placement);
          }
        }
      }
    }

    return placements;
  }
}