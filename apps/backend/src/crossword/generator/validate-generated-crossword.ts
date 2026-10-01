import type { CrosswordWord } from '../domain/word.js';
import type { WordPlacement } from '../domain/word-placement.js';
import { canPlaceWord } from '../helpers/can-place-word.js';
import { createCrosswordGrid } from '../helpers/grid-helper.js';
import { placeWord } from '../helpers/place-word.js';
import type { CrosswordGenerationResult } from './crossword-generation-result.js';

type GeneratedCrosswordValidationOptions = {
  rows: number;
  cols: number;
  targetWordCount: number;
  candidateWords: CrosswordWord[];
};

export function validateGeneratedCrossword(
  result: Pick<CrosswordGenerationResult, 'grid' | 'placedWords'>,
  options: GeneratedCrosswordValidationOptions,
): void {
  const { grid, placedWords } = result;
  const { rows, cols, targetWordCount, candidateWords } = options;

  if (
    !grid ||
    grid.rows !== rows ||
    grid.cols !== cols ||
    !Array.isArray(grid.cells) ||
    grid.cells.length !== rows ||
    grid.cells.some((row) => !Array.isArray(row) || row.length !== cols)
  ) {
    fail('grid dimensions do not match the requested dimensions');
  }

  if (
    !Array.isArray(grid.placements) ||
    !Array.isArray(placedWords) ||
    placedWords.length !== targetWordCount ||
    grid.placements.length !== targetWordCount
  ) {
    fail(`could not place all ${targetWordCount} requested words`);
  }

  const candidateByAnswer = new Map(
    candidateWords.map((word) => [normalizeAnswer(word.answer), word]),
  );
  const seenAnswers = new Set<string>();
  const reconstructedGrid = createCrosswordGrid(rows, cols);

  for (
    let placementIndex = 0;
    placementIndex < grid.placements.length;
    placementIndex++
  ) {
    const placement = grid.placements[placementIndex] as WordPlacement | null;
    const expectedWord = placedWords[placementIndex];

    if (!placement || typeof placement !== 'object' || !expectedWord) {
      fail(`placement ${placementIndex} is malformed`);
    }

    const { word, row, col, direction } = placement;

    if (
      !word ||
      typeof word.answer !== 'string' ||
      word.answer.length === 0 ||
      typeof word.clue !== 'string' ||
      word.clue.trim().length === 0
    ) {
      fail(`placement ${placementIndex} has invalid word content`);
    }

    const answerKey = normalizeAnswer(word.answer);

    if (seenAnswers.has(answerKey)) {
      fail(`placement ${placementIndex} duplicates a normalized answer`);
    }
    seenAnswers.add(answerKey);

    const candidate = candidateByAnswer.get(answerKey);

    if (
      !candidate ||
      candidate.answer !== word.answer ||
      candidate.clue !== word.clue ||
      expectedWord.answer !== word.answer ||
      expectedWord.clue !== word.clue
    ) {
      fail(`placement ${placementIndex} does not match the generated words`);
    }

    if (direction !== 'across' && direction !== 'down') {
      fail(`placement ${placementIndex} has an unsupported direction`);
    }

    if (!Number.isInteger(row) || !Number.isInteger(col)) {
      fail(`placement ${placementIndex} has invalid coordinates`);
    }

    if (word.answer.length !== Array.from(word.answer).length) {
      fail(`placement ${placementIndex} contains unsupported characters`);
    }

    const rowStep = direction === 'down' ? 1 : 0;
    const colStep = direction === 'across' ? 1 : 0;
    const endRow = row + rowStep * (word.answer.length - 1);
    const endCol = col + colStep * (word.answer.length - 1);

    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= cols ||
      endRow < 0 ||
      endRow >= rows ||
      endCol < 0 ||
      endCol >= cols
    ) {
      fail(`placement ${placementIndex} extends beyond the grid`);
    }

    for (let index = 0; index < word.answer.length; index++) {
      const currentRow = row + rowStep * index;
      const currentCol = col + colStep * index;
      const cell = grid.cells[currentRow][currentCol];

      if (
        !cell ||
        cell.row !== currentRow ||
        cell.col !== currentCol ||
        cell.isBlocked ||
        cell.letter !== word.answer[index]
      ) {
        fail(`placement ${placementIndex} does not match its grid cells`);
      }
    }

    if (!canPlaceWord(reconstructedGrid, placement)) {
      fail(`placement ${placementIndex} conflicts with the crossword rules`);
    }

    placeWord(reconstructedGrid, placement);
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid.cells[row][col];

      if (
        !cell ||
        cell.row !== row ||
        cell.col !== col ||
        (cell.letter !== null && typeof cell.letter !== 'string') ||
        typeof cell.isBlocked !== 'boolean' ||
        cell.letter !== reconstructedGrid.cells[row][col].letter
      ) {
        fail(`grid cell ${row}:${col} is inconsistent with its placements`);
      }
    }
  }
}

function normalizeAnswer(answer: string): string {
  return answer.trim().normalize('NFC').toUpperCase().normalize('NFC');
}

function fail(message: string): never {
  throw new Error(`Generated crossword validation failed: ${message}.`);
}
