import "dotenv/config";

import { eq } from "drizzle-orm";

import { CrosswordGenerator } from "../crossword/generator/crossword-generator.js";
import type { CrosswordWord } from "../crossword/domain/word.js";
import { db, pool } from "../db/db.js";
import { DatabaseService } from "../db/database.service.js";
import { puzzleEntries } from "../db/schema/index.js";
import { DrizzlePuzzleEntryRepository } from "../puzzle/repository/drizzle-puzzle-entry.repository.js";
import { DrizzlePuzzleRepository } from "../puzzle/repository/drizzle-puzzle.repository.js";
import { buildPuzzleEntries } from "../puzzle/service/build-puzzle-entries.js";

const SEED_TITLE = "CrossMind Local Programming Puzzle";
const SEED_WORDS: CrosswordWord[] = [
  { answer: "DEBUG", clue: "Find and fix a program error" },
  { answer: "CODE", clue: "Instructions written for a computer" },
  { answer: "NODE", clue: "A JavaScript runtime" },
  { answer: "EDGE", clue: "A boundary case in software testing" },
  { answer: "BUG", clue: "A software defect" },
  { answer: "GIT", clue: "A distributed version control system" },
];

async function main() {
  const database = new DatabaseService();
  const puzzleRepository = new DrizzlePuzzleRepository(database);
  const puzzleEntryRepository = new DrizzlePuzzleEntryRepository(database);
  const { grid, unplacedWords } = new CrosswordGenerator({ rows: 11, cols: 11 }).generate(SEED_WORDS);

  if (unplacedWords.length > 0) {
    throw new Error(`Seed puzzle could not place: ${unplacedWords.map((word) => word.answer).join(", ")}`);
  }

  const existingPuzzle = (await puzzleRepository.findAll()).find(
    (puzzle) => puzzle.title === SEED_TITLE,
  );
  const puzzle = existingPuzzle ?? await database.transaction(async (tx) => {
    const createdPuzzle = await puzzleRepository.create(
      {
        title: SEED_TITLE,
        theme: "Programming",
        difficulty: "easy",
        language: "en",
        status: "ready",
        rows: grid.rows,
        columns: grid.cols,
        grid,
      },
      tx,
    );

    await puzzleEntryRepository.createMany(
      buildPuzzleEntries(createdPuzzle.id, grid.placements),
      tx,
    );

    return createdPuzzle;
  });

  const persistedPuzzle = await puzzleRepository.findById(puzzle.id);
  const persistedEntries = await db
    .select()
    .from(puzzleEntries)
    .where(eq(puzzleEntries.puzzleId, puzzle.id));

  if (!persistedPuzzle || persistedPuzzle.grid.placements.length !== SEED_WORDS.length) {
    throw new Error("Seed puzzle was not persisted with all expected placements.");
  }

  if (persistedEntries.length !== SEED_WORDS.length) {
    throw new Error("Seed puzzle entries were not persisted.");
  }

  console.log(`Puzzle ${existingPuzzle ? "found" : "created"}: ${puzzle.id}`);
  console.log(`Entries: ${persistedEntries.length}`);
}

try {
  await main();
} finally {
  await pool.end();
}