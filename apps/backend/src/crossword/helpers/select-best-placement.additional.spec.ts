import { describe, expect, it } from "vitest";
import { selectBestPlacement } from "./select-best-placement.js";
import { createCrosswordGrid } from "./grid-helper.js";
import { placeWord } from "./place-word.js";

describe("selectBestPlacement tie breaking", () => {
  it("returns null for an empty list", () => {
    expect(selectBestPlacement(createCrosswordGrid(5, 5), [])).toBeNull();
  });

  it("uses row, column, and direction to break ties deterministically", () => {
    const grid = createCrosswordGrid(5, 5);
    placeWord(grid, {
      word: { answer: "CAT", clue: "A small animal" },
      row: 2,
      col: 1,
      direction: "across",
    });
    const firstByPosition = {
      word: { answer: "RAT", clue: "A rodent" },
      row: 1,
      col: 2,
      direction: "down" as const,
    };
    const secondByPosition = {
      word: { answer: "CAR", clue: "A vehicle" },
      row: 2,
      col: 1,
      direction: "down" as const,
    };

    expect(selectBestPlacement(grid, [secondByPosition, firstByPosition])).toBe(firstByPosition);
  });
});