import { describe, expect, it } from 'vitest';
import { createCrosswordGrid } from './grid-helper.js';
import { countCrossings } from './count-crossings.js';
import { placeWord } from './place-word.js';

describe('countCrossings', () => {
    it('should count crossings between placements', () => {
        const grid = createCrosswordGrid(15, 15);

        const firstPlacement = {
            word: {
                answer: 'HOUSE',
                clue: 'A place where people live',
            },
            row: 7,
            col: 5,
            direction: 'across' as const,
        };

        placeWord(grid, firstPlacement);

        const secondPlacement = {
            word: {
                answer: 'HORSE',
                clue: 'An animal used for riding',
            },
            row: 6,
            col: 6,
            direction: 'down' as const,
        };

        expect(countCrossings(grid, secondPlacement)).toBe(1);
    });

    it('should return zero when there are no crossings', () => {
        const grid = createCrosswordGrid(15, 15);

        const firstPlacement = {
            word: {
                answer: 'HOUSE',
                clue: 'A place where people live',
            },
            row: 7,
            col: 5,
            direction: 'across' as const,
        };

        placeWord(grid, firstPlacement);

        const secondPlacement = {
            word: {
                answer: 'DOG',
                clue: 'A common pet',
            },
            row: 2,
            col: 2,
            direction: 'down' as const,
        };

        expect(countCrossings(grid, secondPlacement)).toBe(0);
    });

});