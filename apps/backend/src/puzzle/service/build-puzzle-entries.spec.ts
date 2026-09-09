import { describe, expect, it } from "vitest";

import type { WordPlacement } from "../../crossword/domain/word-placement.js";
import { buildPuzzleEntries } from "./build-puzzle-entries.js";

describe("buildPuzzleEntries", () => {
  it("maps a placement to a puzzle entry", () => {
    const placements: WordPlacement[] = [
      { word: { answer: "CAT", clue: "A small animal" }, row: 2, col: 1, direction: "across" },
    ];

    const entries = buildPuzzleEntries("puzzle-1", placements);

    expect(entries).toEqual([
      {
        puzzleId: "puzzle-1",
        word: "CAT",
        clue: "A small animal",
        direction: "across",
        row: 2,
        column: 1,
        length: 3,
        number: 1,
      },
    ]);
  });

  it("numbers starting cells top-to-bottom, then left-to-right", () => {
    const placements: WordPlacement[] = [
      { word: { answer: "DOG", clue: "A pet" }, row: 3, col: 0, direction: "across" },
      { word: { answer: "CAT", clue: "A small animal" }, row: 0, col: 2, direction: "down" },
      { word: { answer: "BIRD", clue: "Can fly" }, row: 0, col: 0, direction: "across" },
    ];

    const entries = buildPuzzleEntries("puzzle-1", placements);

    expect(entries.find((entry) => entry.word === "BIRD")?.number).toBe(1);
    expect(entries.find((entry) => entry.word === "CAT")?.number).toBe(2);
    expect(entries.find((entry) => entry.word === "DOG")?.number).toBe(3);
  });

  it("gives across and down entries starting at the same cell the same number", () => {
    const placements: WordPlacement[] = [
      { word: { answer: "CAT", clue: "A small animal" }, row: 0, col: 0, direction: "across" },
      { word: { answer: "COW", clue: "A farm animal" }, row: 0, col: 0, direction: "down" },
    ];

    const entries = buildPuzzleEntries("puzzle-1", placements);

    expect(entries[0].number).toBe(1);
    expect(entries[1].number).toBe(1);
  });

  it("does not use placement array order to determine numbers", () => {
    const placements: WordPlacement[] = [
      { word: { answer: "DOG", clue: "A pet" }, row: 3, col: 0, direction: "across" },
      { word: { answer: "BIRD", clue: "Can fly" }, row: 0, col: 0, direction: "across" },
    ];

    const entries = buildPuzzleEntries("puzzle-1", placements);

    expect(entries.find((entry) => entry.word === "BIRD")?.number).toBe(1);
    expect(entries.find((entry) => entry.word === "DOG")?.number).toBe(2);
  });

  it("returns an empty array for no placements", () => {
    expect(buildPuzzleEntries("puzzle-1", [])).toEqual([]);
  });
});
