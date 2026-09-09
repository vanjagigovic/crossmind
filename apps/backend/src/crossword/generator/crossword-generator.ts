import { CrosswordWord } from "../domain/word.js";
import { canPlaceWord } from "../helpers/can-place-word.js";
import { findCrossingPlacements } from "../helpers/find-crossing-placements.js";
import { createCrosswordGrid } from "../helpers/grid-helper.js";
import { placeWord } from "../helpers/place-word.js";
import { selectBestPlacement } from "../helpers/select-best-placement.js";
import { CrosswordGenerationResult } from "./crossword-generation-result.js";

export type CrosswordGeneratorOptions = {
  rows: number;
  cols: number;
};

export class CrosswordGenerator {
  constructor(private readonly options: CrosswordGeneratorOptions) {}

  generate(words: CrosswordWord[]): CrosswordGenerationResult {
    const grid = createCrosswordGrid(this.options.rows, this.options.cols);
    const sortedWords = [...words].sort(
      (firstWord, secondWord) => secondWord.answer.length - firstWord.answer.length,
    );
    const placedWords: CrosswordWord[] = [];
    const unplacedWords: CrosswordWord[] = [];
    const firstWord = sortedWords.shift();

    if (!firstWord) {
      return { grid, placedWords, unplacedWords };
    }

    const firstPlacement = {
      word: firstWord,
      row: Math.floor(this.options.rows / 2),
      col: Math.floor((this.options.cols - firstWord.answer.length) / 2),
      direction: "across" as const,
    };

    if (canPlaceWord(grid, firstPlacement)) {
      placeWord(grid, firstPlacement);
      placedWords.push(firstWord);
    } else {
      unplacedWords.push(firstWord);
    }

    for (const word of sortedWords) {
      const placement = selectBestPlacement(
        grid,
        findCrossingPlacements(grid, word),
      );

      if (placement) {
        placeWord(grid, placement);
        placedWords.push(word);
      } else {
        unplacedWords.push(word);
      }
    }

    return { grid, placedWords, unplacedWords };
  }
}