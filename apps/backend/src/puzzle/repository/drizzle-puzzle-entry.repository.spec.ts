import "dotenv/config";

import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseService } from "../../db/database.service.js";
import { db, pool } from "../../db/db.js";
import { puzzleEntries, puzzles } from "../../db/schema/index.js";
import { createCrosswordGrid } from "../../crossword/helpers/grid-helper.js";
import { DrizzlePuzzleEntryRepository } from "./drizzle-puzzle-entry.repository.js";

describe("DrizzlePuzzleEntryRepository", () => {
  const database = new DatabaseService();
  const repository = new DrizzlePuzzleEntryRepository(database);

  beforeEach(async () => {
    await db.delete(puzzleEntries);
    await db.delete(puzzles);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("creates multiple puzzle entries", async () => {
    const [puzzle] = await db
      .insert(puzzles)
      .values({
        title: "Test Puzzle",
        theme: "Animals",
        difficulty: "easy",
        status: "ready",
        rows: 5,
        columns: 5,
        grid: createCrosswordGrid(5, 5),
      })
      .returning();

    const entries = await repository.createMany([
      {
        puzzleId: puzzle.id,
        word: "CAT",
        clue: "A small animal",
        direction: "across",
        row: 0,
        column: 0,
        length: 3,
        number: 1,
      },
      {
        puzzleId: puzzle.id,
        word: "COW",
        clue: "A farm animal",
        direction: "down",
        row: 0,
        column: 0,
        length: 3,
        number: 1,
      },
    ]);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({
      id: expect.any(String),
      puzzleId: puzzle.id,
      word: "CAT",
      clue: "A small animal",
      direction: "across",
      row: 0,
      column: 0,
      length: 3,
      number: 1,
    });
    expect(entries[1]).toMatchObject({ word: "COW", direction: "down" });
  });

  it("returns an empty array when given no entries", async () => {
    const entries = await repository.createMany([]);

    expect(entries).toEqual([]);
  });

  it("finds entries by puzzle id ordered by number", async () => {
    const [puzzle] = await db
      .insert(puzzles)
      .values({
        title: "Test Puzzle",
        theme: "Animals",
        difficulty: "easy",
        status: "ready",
        rows: 5,
        columns: 5,
        grid: createCrosswordGrid(5, 5),
      })
      .returning();

    await repository.createMany([
      {
        puzzleId: puzzle.id,
        word: "COW",
        clue: "A farm animal",
        direction: "down",
        row: 1,
        column: 0,
        length: 3,
        number: 2,
      },
      {
        puzzleId: puzzle.id,
        word: "CAT",
        clue: "A small animal",
        direction: "across",
        row: 0,
        column: 0,
        length: 3,
        number: 1,
      },
    ]);

    const entries = await repository.findByPuzzleId(puzzle.id);

    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.number)).toEqual([1, 2]);
    expect(entries[0]).toMatchObject({ word: "CAT", direction: "across" });
  });

  it("returns an empty array when the puzzle has no entries", async () => {
    const [puzzle] = await db
      .insert(puzzles)
      .values({
        title: "Test Puzzle",
        theme: "Animals",
        difficulty: "easy",
        status: "ready",
        rows: 5,
        columns: 5,
        grid: createCrosswordGrid(5, 5),
      })
      .returning();

    const entries = await repository.findByPuzzleId(puzzle.id);

    expect(entries).toEqual([]);
  });
});
