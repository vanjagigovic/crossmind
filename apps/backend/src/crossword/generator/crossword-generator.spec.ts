import { describe, expect, it } from "vitest";
import { CrosswordWord } from "../domain/word.js";
import { countCrossings } from "../helpers/count-crossings.js";
import { CrosswordGenerator } from "./crossword-generator.js";

describe("CrosswordGenerator", () => {
  const generator = new CrosswordGenerator({ rows: 7, cols: 7 });

  it("generates a crossword from compatible words", () => {
    const words = [
      { answer: "CAT", clue: "A small animal" },
      { answer: "RAT", clue: "A rodent" },
    ];

    const result = generator.generate(words);

    expect(result.placedWords).toEqual(words);
    expect(result.unplacedWords).toEqual([]);
    expect(result.grid.placements).toHaveLength(2);
  });

  it("returns an empty result for an empty word list", () => {
    const result = generator.generate([]);

    expect(result.grid.rows).toBe(7);
    expect(result.grid.cols).toBe(7);
    expect(result.grid.placements).toEqual([]);
    expect(result.placedWords).toEqual([]);
    expect(result.unplacedWords).toEqual([]);
  });

  it("centers a single word horizontally", () => {
    const word = { answer: "CAT", clue: "A small animal" };

    const result = generator.generate([word]);

    expect(result.placedWords).toEqual([word]);
    expect(result.unplacedWords).toEqual([]);
    expect(result.grid.placements).toEqual([
      { word, row: 3, col: 2, direction: "across" },
    ]);
  });

  it("places the longest word first", () => {
    const longestWord = { answer: "CATER", clue: "A provider of food" };
    const words = [
      { answer: "CAT", clue: "A small animal" },
      longestWord,
    ];

    const result = generator.generate(words);

    expect(result.grid.placements[0].word).toBe(longestWord);
    expect(result.grid.placements[0].direction).toBe("across");
  });

  it("places crossing words when possible", () => {
    const result = generator.generate([
      { answer: "CAT", clue: "A small animal" },
      { answer: "RAT", clue: "A rodent" },
    ]);

    expect(countCrossings(result.grid, result.grid.placements[1])).toBe(1);
  });

  it("returns words without a crossing in unplacedWords", () => {
    const dog = { answer: "DOG", clue: "A pet" };

    const result = generator.generate([
      { answer: "CAT", clue: "A small animal" },
      dog,
    ]);

    expect(result.placedWords).toHaveLength(1);
    expect(result.unplacedWords).toEqual([dog]);
  });

  it("uses a deterministic placement when multiple crossings are possible", () => {
    const result = generator.generate([
      { answer: "CAT", clue: "A small animal" },
      { answer: "RAT", clue: "A rodent" },
    ]);

    expect(result.grid.placements[1]).toMatchObject({
      row: 1,
      col: 4,
      direction: "down",
    });
  });

  it("does not mutate the original input array", () => {
    const words: CrosswordWord[] = [
      { answer: "CAT", clue: "A small animal" },
      { answer: "CATER", clue: "A provider of food" },
    ];
    const originalWords = structuredClone(words);

    generator.generate(words);

    expect(words).toEqual(originalWords);
  });
});