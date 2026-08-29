import { describe, expect, it } from 'vitest';
import { createCrosswordGrid } from './grid-helper.js';
import { placeWord } from './place-word.js';

describe('placeWord', () => {
    it('places a word horizontally', () => {
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

        placeWord(grid, placement);

        expect(grid.cells[2][1].letter).toBe('C');
        expect(grid.cells[2][2].letter).toBe('A');
        expect(grid.cells[2][3].letter).toBe('T');
    });

    it('places a word vertically', () => {
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

        placeWord(grid, placement);

        expect(grid.cells[1][2].letter).toBe('C');
        expect(grid.cells[2][2].letter).toBe('A');
        expect(grid.cells[3][2].letter).toBe('T');
    });

    it('preserves existing letters when words cross', () => {
        const grid = createCrosswordGrid(5, 5);

        const firstPlacement = {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 2,
            col: 1,
            direction: 'across' as const,
        };

        placeWord(grid, firstPlacement);

        const secondPlacement = {
            word: {
                answer: 'RAT',
                clue: 'A small rodent',
            },
            row: 1,
            col: 2,
            direction: 'down' as const,
        };

        placeWord(grid, secondPlacement);

        expect(grid.cells[2][1].letter).toBe('C');
        expect(grid.cells[2][2].letter).toBe('A');
        expect(grid.cells[2][3].letter).toBe('T');

        expect(grid.cells[1][2].letter).toBe('R');
        expect(grid.cells[3][2].letter).toBe('T');
    });

    it('stores the word placement in the grid', () => {
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

        placeWord(grid, placement);

        expect(grid.placements).toHaveLength(1);
        expect(grid.placements[0]).toEqual(placement);
    });
});