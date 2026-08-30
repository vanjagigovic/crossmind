import { describe, expect, it } from 'vitest';
import { selectBestPlacement } from './select-best-placement.js';
import { createCrosswordGrid } from './grid-helper.js';
import { placeWord } from './place-word.js';
import { countCrossings } from './count-crossings.js';

describe('selectBestPlacement', () => {
    it('returns null when there are no placements', () => {
        const grid = createCrosswordGrid(10, 10);

        expect(selectBestPlacement(grid, [])).toBeNull();
    });

    it('returns the placement with the most crossings', () => {
        const grid = createCrosswordGrid(10, 10);

        placeWord(grid, {
            word: {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            row: 4,
            col: 3,
            direction: 'across',
        });

        placeWord(grid, {
            word: {
                answer: 'RED',
                clue: 'A color',
            },
            row: 6,
            col: 3,
            direction: 'across',
        });

        const oneCrossingPlacement = {
            word: {
                answer: 'CART',
                clue: 'A vehicle',
            },
            row: 1,
            col: 5,
            direction: 'down' as const,
        };

        const twoCrossingPlacement = {
            word: {
                answer: 'CART',
                clue: 'A vehicle',
            },
            row: 4,
            col: 3,
            direction: 'down' as const,
        };

        expect(countCrossings(grid, oneCrossingPlacement)).toBe(1);
        expect(countCrossings(grid, twoCrossingPlacement)).toBe(2);

        const bestPlacement = selectBestPlacement(grid, [
            oneCrossingPlacement,
            twoCrossingPlacement,
        ]);

        expect(bestPlacement).toBe(twoCrossingPlacement);
    });
});