import { describe, expect, it } from 'vitest';
import { createCrosswordGrid } from './grid-helper.js';
import { placeWord } from './place-word.js';
import { hasAdjacentWord } from './has-adjacent-word.js';

describe('hasAdjacentWord', () => {
    it('returns false when there are no adjacent words', () => {
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

        expect(hasAdjacentWord(grid, placement)).toBe(false);
    });

    it('returns true when a placement touches an existing word', () => {
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

        expect(hasAdjacentWord(grid, placement)).toBe(true);
    });

    it('returns false when adjacent cell belongs to a crossing word', () => {
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

        expect(hasAdjacentWord(grid, placement)).toBe(false);
    });
});