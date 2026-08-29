import { describe, expect, it } from 'vitest';
import { canPlaceWord } from './can-place-word.js';
import { createCrosswordGrid } from './grid-helper.js';
import { placeWord } from './place-word.js';

describe('canPlaceWord', () => {
    it('returns true when a word fits horizontally', () => {
        const grid = createCrosswordGrid(5, 5);

        const placement = {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 2,
            col: 1,
            direction: 'across' as const,
        };

        expect(canPlaceWord(grid, placement)).toBe(true);
    });

    it('returns true when a word fits vertically', () => {
        const grid = createCrosswordGrid(5, 5);

        const placement = {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 1,
            col: 2,
            direction: 'down' as const,
        };

        expect(canPlaceWord(grid, placement)).toBe(true);
    });

    it('returns false when a word goes outside the grid', () => {
        const grid = createCrosswordGrid(5, 5);

        const placement = {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 2,
            col: 4,
            direction: 'across' as const,
        };

        expect(canPlaceWord(grid, placement)).toBe(false);
    });

    it('returns false when a word conflicts with an existing letter', () => {
        const grid = createCrosswordGrid(5, 5);

        grid.cells[2][2].letter = 'X';

        const placement = {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 2,
            col: 1,
            direction: 'across' as const,
        };

        expect(canPlaceWord(grid, placement)).toBe(false);
    });
    it('returns false when a word does not cross an existing word', () => {
        const grid = createCrosswordGrid(5, 5);

        placeWord(grid, {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 2,
            col: 1,
            direction: 'across',
        });

        const placement = {
            word: {
                answer: 'DOG',
                clue: 'A common pet',
            },
            row: 0,
            col: 0,
            direction: 'down' as const,
        };

        expect(canPlaceWord(grid, placement)).toBe(false);
    });
    it('returns true when a word crosses an existing word with a matching letter', () => {
        const grid = createCrosswordGrid(5, 5);

        placeWord(grid, {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 2,
            col: 1,
            direction: 'across',
        });

        const placement = {
            word: {
                answer: 'RAT',
                clue: 'A small rodent',
            },
            row: 1,
            col: 2,
            direction: 'down' as const,
        };

        expect(canPlaceWord(grid, placement)).toBe(true);
    });
    it('returns false when a word touches another word without crossing', () => {
        const grid = createCrosswordGrid(5, 5);

        placeWord(grid, {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 2,
            col: 1,
            direction: 'across',
        });

        const placement = {
            word: {
                answer: 'DOG',
                clue: 'A common pet',
            },
            row: 1,
            col: 1,
            direction: 'across' as const,
        };

        expect(canPlaceWord(grid, placement)).toBe(false);
    });
    it('returns false when a vertical word touches another word without crossing', () => {
        const grid = createCrosswordGrid(5, 5);

        placeWord(grid, {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 1,
            col: 2,
            direction: 'down',
        });

        const placement = {
            word: {
                answer: 'DOG',
                clue: 'A common pet',
            },
            row: 1,
            col: 1,
            direction: 'down' as const,
        };

        expect(canPlaceWord(grid, placement)).toBe(false);
    });
    it('returns false when a word overlaps an existing word in the same direction', () => {
        const grid = createCrosswordGrid(5, 5);

        placeWord(grid, {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 2,
            col: 1,
            direction: 'across',
        });

        const placement = {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 2,
            col: 1,
            direction: 'across' as const,
        };

        expect(canPlaceWord(grid, placement)).toBe(false);
    });
});