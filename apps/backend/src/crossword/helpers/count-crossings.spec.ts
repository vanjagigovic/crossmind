import { describe, expect, it } from "vitest";
import { countCrossings } from "./count-crossings.js";
import { createCrosswordGrid } from "./grid-helper.js";
import { placeWord } from "./place-word.js";

describe("countCrossings", () => {
  it("counts valid intersections without mutating the grid", () => {
    const grid = createCrosswordGrid(10, 10);
    placeWord(grid, {
      word: { answer: "CAT", clue: "A small animal" },
      row: 4,
      col: 3,
      direction: "across",
    });
    placeWord(grid, {
      word: { answer: "RED", clue: "A color" },
      row: 6,
      col: 3,
      direction: "across",
    });
    const candidate = {
      word: { answer: "CART", clue: "A vehicle" },
      row: 4,
      col: 3,
      direction: "down" as const,
    };
    const gridBeforeCounting = structuredClone(grid);

    expect(countCrossings(grid, candidate)).toBe(2);
    expect(grid).toEqual(gridBeforeCounting);
  });
});