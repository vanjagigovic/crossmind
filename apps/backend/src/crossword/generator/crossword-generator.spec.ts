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

        expect(result.grid.rows).toBe(15);
        expect(result.grid.cols).toBe(15);
        expect(result.grid.placements).toHaveLength(2);
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

        const [firstPlacement, secondPlacement] = result.grid.placements;

        expect(firstPlacement.direction).toBe('across');
        expect(secondPlacement.direction).toBe('down');
    });

    it('should return an empty grid when no words are provided', () => {
        const generator = new CrosswordGenerator({
            rows: 15,
            cols: 15,
        });

        const result = generator.generate([]);

        expect(result.grid.rows).toBe(15);
        expect(result.grid.cols).toBe(15);
        expect(result.grid.placements).toHaveLength(0);
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

        expect(result.grid.placements).toHaveLength(1);
        expect(result.grid.placements[0].word).toEqual(word);
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

        expect(result.grid.placements).toHaveLength(1);
        expect(result.grid.placements[0].word.answer).toBe('CAT');
    });

    it('should return unplaced words', () => {
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

        expect(result.placedWords).toHaveLength(1);
        expect(result.unplacedWords).toHaveLength(1);

        expect(result.placedWords[0].answer).toBe('CAT');
        expect(result.unplacedWords[0].answer).toBe('DOG');
    });
    it('should place words on a shared cell when they cross', () => {
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

        const [firstPlacement, secondPlacement] = result.grid.placements;

        expect(firstPlacement.direction).not.toBe(secondPlacement.direction);

        const crossingExists = result.grid.cells.some((row) =>
            row.some((cell) => cell.letter !== null),
        );

        expect(crossingExists).toBe(true);
    });

    it('should cross words when they share letters', () => {
        const generator = new CrosswordGenerator({
            rows: 15,
            cols: 15,
        });

        const words = [
            {
                answer: 'HOUSE',
                clue: 'A place where people live',
            },
            {
                answer: 'HORSE',
                clue: 'An animal used for riding',
            },
        ];

        const result = generator.generate(words);

        expect(result.placedWords).toHaveLength(2);
        expect(result.unplacedWords).toHaveLength(0);

        const [firstPlacement, secondPlacement] = result.grid.placements;

        expect(firstPlacement.direction).not.toBe(secondPlacement.direction);
    });
});