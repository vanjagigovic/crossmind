import { describe, expect, it } from "vitest";
import { findCrossingPlacements } from "./find-crossing-placements.js";
import { createCrosswordGrid } from "./grid-helper.js";
import { placeWord } from "./place-word.js";

describe("findCrossingPlacements", () => {
  it("finds valid down placements for an across word", () => {
    const grid = createCrosswordGrid(5, 5);
    placeWord(grid, {
      word: { answer: "CAT", clue: "A small animal" },
      row: 2,
      col: 1,
      direction: "across",
    });

    expect(findCrossingPlacements(grid, { answer: "RAT", clue: "A rodent" })).toContainEqual({
      word: { answer: "RAT", clue: "A rodent" },
      row: 1,
      col: 2,
      direction: "down",
    });
  });

  it("finds valid across placements for a down word", () => {
    const grid = createCrosswordGrid(5, 5);
    placeWord(grid, {
      word: { answer: "CAT", clue: "A small animal" },
      row: 1,
      col: 2,
      direction: "down",
    });

    expect(findCrossingPlacements(grid, { answer: "RAT", clue: "A rodent" })).toContainEqual({
      word: { answer: "RAT", clue: "A rodent" },
      row: 2,
      col: 1,
      direction: "across",
    });
  });

  it("excludes invalid candidates and does not mutate the grid", () => {
    const grid = createCrosswordGrid(5, 5);
    placeWord(grid, {
      word: { answer: "CAT", clue: "A small animal" },
      row: 2,
      col: 1,
      direction: "across",
    });
    grid.cells[1][2].isBlocked = true;
    grid.cells[0][3].isBlocked = true;
    const gridBeforeFinding = structuredClone(grid);

    expect(findCrossingPlacements(grid, { answer: "RAT", clue: "A rodent" })).toEqual([]);
    expect(grid).toEqual(gridBeforeFinding);
  });

  it("returns no candidates when no letters cross", () => {
    const grid = createCrosswordGrid(5, 5);
    placeWord(grid, {
      word: { answer: "CAT", clue: "A small animal" },
      row: 2,
      col: 1,
      direction: "across",
    });

    expect(findCrossingPlacements(grid, { answer: "DOG", clue: "A pet" })).toEqual([]);
  });
});