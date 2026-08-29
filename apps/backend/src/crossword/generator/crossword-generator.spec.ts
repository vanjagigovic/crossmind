import { CrosswordGenerator } from './crossword-generator.js';

describe('CrosswordGenerator', () => {
    it('should generate a crossword with the provided words', () => {
        const generator = new CrosswordGenerator({
            rows: 15,
            cols: 15,
        });

        const words = [
            {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            {
                answer: 'CAR',
                clue: 'A road vehicle',
            },
        ];

        const result = generator.generate(words);

        expect(result.rows).toBe(15);
        expect(result.cols).toBe(15);
        expect(result.placements).toHaveLength(2);
    });

    it('should place words so they cross', () => {
        const generator = new CrosswordGenerator({
            rows: 15,
            cols: 15,
        });

        const words = [
            {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            {
                answer: 'CAR',
                clue: 'A road vehicle',
            },
        ];

        const result = generator.generate(words);

        const [firstPlacement, secondPlacement] = result.placements;

        expect(firstPlacement.direction).toBe('across');
        expect(secondPlacement.direction).toBe('down');
    });

    it('should return an empty grid when no words are provided', () => {
        const generator = new CrosswordGenerator({
            rows: 15,
            cols: 15,
        });

        const result = generator.generate([]);

        expect(result.rows).toBe(15);
        expect(result.cols).toBe(15);
        expect(result.placements).toHaveLength(0);
    });

    it('should place a single word', () => {
        const generator = new CrosswordGenerator({
            rows: 15,
            cols: 15,
        });

        const word = {
            answer: 'CAT',
            clue: 'A small domesticated animal',
        };

        const result = generator.generate([word]);

        expect(result.placements).toHaveLength(1);
        expect(result.placements[0].word).toEqual(word);
    });

    it('should skip words that cannot be placed', () => {
        const generator = new CrosswordGenerator({
            rows: 15,
            cols: 15,
        });

        const words = [
            {
                answer: 'CAT',
                clue: 'A small domesticated animal',
            },
            {
                answer: 'DOG',
                clue: 'A common pet',
            },
        ];

        const result = generator.generate(words);

        expect(result.placements).toHaveLength(1);
        expect(result.placements[0].word.answer).toBe('CAT');
    });
});