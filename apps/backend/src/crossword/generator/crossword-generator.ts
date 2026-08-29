import { CrosswordGrid } from '../domain/grid.js';
import { CrosswordWord } from '../domain/word.js';
import { Direction, WordPlacement } from '../domain/word-placement.js';
import { canPlaceWord } from '../helpers/can-place-word.js';
import { createCrosswordGrid } from '../helpers/grid-helper.js';
import { placeWord } from '../helpers/place-word.js';

export type CrosswordGeneratorOptions = {
  rows: number;
  cols: number;
};

export class CrosswordGenerator {
  constructor(private readonly options: CrosswordGeneratorOptions) {}

  generate(words: CrosswordWord[]): CrosswordGrid {
    const grid = createCrosswordGrid(
      this.options.rows,
      this.options.cols,
    );

    if (words.length === 0) {
      return grid;
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
    }

    for (const word of sortedWords.slice(1)) {
      const placement = this.findPlacement(grid, word);

      if (placement) {
        placeWord(grid, placement);
      }
    }

    return grid;
  }

  private findPlacement(
    grid: CrosswordGrid,
    word: CrosswordWord,
  ): WordPlacement | null {
    const directions: Direction[] = ['across', 'down'];

    for (const direction of directions) {
      for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
          const placement: WordPlacement = {
            word,
            row,
            col,
            direction,
          };

          if (canPlaceWord(grid, placement)) {
            return placement;
          }
        }
      }
    }

    return null;
  }
}