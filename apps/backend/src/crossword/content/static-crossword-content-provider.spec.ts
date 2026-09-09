import { describe, expect, it } from "vitest";

import { StaticCrosswordContentProvider } from "./static-crossword-content-provider.js";

describe("StaticCrosswordContentProvider", () => {
  const provider = new StaticCrosswordContentProvider();

  it("returns the requested number of words", async () => {
    const words = await provider.generateWords({
      theme: "Animals",
      difficulty: "easy",
      wordCount: 3,
    });

    expect(words).toHaveLength(3);
  });

  it("returns the same words for the same request", async () => {
    const request = { theme: "Animals", difficulty: "easy" as const, wordCount: 4 };

    const first = await provider.generateWords(request);
    const second = await provider.generateWords(request);

    expect(first).toEqual(second);
  });

  it("cycles through the word pool when wordCount exceeds it", async () => {
    const words = await provider.generateWords({
      theme: "Animals",
      difficulty: "hard",
      wordCount: 12,
    });

    expect(words).toHaveLength(12);
    expect(words[10]).toEqual(words[0]);
  });

  it("returns every word with an answer and a clue", async () => {
    const words = await provider.generateWords({
      theme: "Animals",
      difficulty: "medium",
      wordCount: 5,
    });

    for (const word of words) {
      expect(word.answer).toBeTruthy();
      expect(word.clue).toBeTruthy();
    }
  });
});
