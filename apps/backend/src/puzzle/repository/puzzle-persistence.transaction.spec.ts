import "dotenv/config";

import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import { DatabaseService } from "../../db/database.service.js";
import { db, pool } from "../../db/db.js";
import { puzzleEntries, puzzles } from "../../db/schema/index.js";
import { createCrosswordGrid } from "../../crossword/helpers/grid-helper.js";
import { DrizzlePuzzleRepository } from "./drizzle-puzzle.repository.js";
import { DrizzlePuzzleEntryRepository } from "./drizzle-puzzle-entry.repository.js";

describe("Puzzle and puzzle entry transactional persistence", () => {
  const database = new DatabaseService();
  const puzzleRepository = new DrizzlePuzzleRepository(database);
  const puzzleEntryRepository = new DrizzlePuzzleEntryRepository(database);

  beforeEach(async () => {
    await db.delete(puzzleEntries);
    await db.delete(puzzles);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("commits both the puzzle and its entries together", async () => {
    const puzzle = await database.transaction(async (tx) => {
      const createdPuzzle = await puzzleRepository.create(
        {
          title: "Atomic Puzzle",
          theme: "Animals",
          difficulty: "easy",
          language: "en",
          status: "ready",
          rows: 5,
          columns: 5,
          grid: createCrosswordGrid(5, 5),
        },
        tx,
      );

      await puzzleEntryRepository.createMany(
        [
          {
            puzzleId: createdPuzzle.id,
            word: "CAT",
            clue: "A small animal",
            direction: "across",
            row: 0,
            column: 0,
            length: 3,
            number: 1,
          },
        ],
        tx,
      );

      return createdPuzzle;
    });

    const persistedEntries = await db
      .select()
      .from(puzzleEntries)
      .where(eq(puzzleEntries.puzzleId, puzzle.id));

    expect(persistedEntries).toHaveLength(1);
  });

  it("rolls back the puzzle when persisting entries fails", async () => {
    await expect(
      database.transaction(async (tx) => {
        const createdPuzzle = await puzzleRepository.create(
          {
            title: "Rollback Puzzle",
            theme: "Animals",
            difficulty: "easy",
            language: "en",
            status: "ready",
            rows: 5,
            columns: 5,
            grid: createCrosswordGrid(5, 5),
          },
          tx,
        );

        // Invalid direction violates the database enum, forcing the transaction to fail.
        await puzzleEntryRepository.createMany(
          [
            {
              puzzleId: createdPuzzle.id,
              word: "CAT",
              clue: "A small animal",
              direction: "diagonal" as never,
              row: 0,
              column: 0,
              length: 3,
              number: 1,
            },
          ],
          tx,
        );
      }),
    ).rejects.toThrow();

    const persistedPuzzles = await db
      .select()
      .from(puzzles)
      .where(eq(puzzles.title, "Rollback Puzzle"));

    expect(persistedPuzzles).toHaveLength(0);
  });
});
