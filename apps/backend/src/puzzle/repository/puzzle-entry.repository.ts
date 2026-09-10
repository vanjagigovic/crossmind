import type { DatabaseTransaction } from "../../db/database.service.js";
import type { CreatePuzzleEntryData, PuzzleEntry } from "../domain/puzzle-entry.js";

export interface PuzzleEntryRepository {
  createMany(
    entries: CreatePuzzleEntryData[],
    tx?: DatabaseTransaction,
  ): Promise<PuzzleEntry[]>;

  findByPuzzleId(puzzleId: string): Promise<PuzzleEntry[]>;
}
