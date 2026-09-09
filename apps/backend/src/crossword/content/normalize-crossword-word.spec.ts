import { describe, expect, it } from "vitest";

import { normalizeCrosswordWords } from "./normalize-crossword-word.js";

describe("normalizeCrosswordWords", () => {
  it("uppercases a lowercase answer", () => {
    const result = normalizeCrosswordWords([{ answer: "cat", clue: "A small animal" }]);

    expect(result).toEqual([{ answer: "CAT", clue: "A small animal" }]);
  });

  it("trims surrounding whitespace from the answer and clue", () => {
    const result = normalizeCrosswordWords([
      { answer: "  cat  ", clue: "  A small animal  " },
    ]);

    expect(result).toEqual([{ answer: "CAT", clue: "A small animal" }]);
  });

  it("filters out answers containing invalid characters", () => {
    const result = normalizeCrosswordWords([
      { answer: "CAT-DOG", clue: "Invalid answer" },
      { answer: "CAT 5", clue: "Invalid answer" },
      { answer: "CAT", clue: "Valid answer" },
    ]);

    expect(result).toEqual([{ answer: "CAT", clue: "Valid answer" }]);
  });

  it("filters out words with an empty or whitespace-only clue", () => {
    const result = normalizeCrosswordWords([
      { answer: "CAT", clue: "" },
      { answer: "DOG", clue: "   " },
      { answer: "BIRD", clue: "An animal that can fly" },
    ]);

    expect(result).toEqual([{ answer: "BIRD", clue: "An animal that can fly" }]);
  });

  it("leaves an already-valid CrosswordWord unchanged", () => {
    const word = { answer: "CAT", clue: "A small animal" };

    const result = normalizeCrosswordWords([word]);

    expect(result).toEqual([word]);
  });
});
