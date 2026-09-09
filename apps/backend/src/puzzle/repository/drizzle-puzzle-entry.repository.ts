import { Injectable } from "@nestjs/common";

import { DatabaseService } from "../../db/database.service.js";
import type { DatabaseTransaction } from "../../db/database.service.js";
import { puzzleEntries } from "../../db/schema/index.js";
import type { CreatePuzzleEntryData, PuzzleEntry } from "../domain/puzzle-entry.js";
import type { PuzzleEntryRepository } from "./puzzle-entry.repository.js";

@Injectable()
export class DrizzlePuzzleEntryRepository implements PuzzleEntryRepository {
  constructor(private readonly database: DatabaseService) {}

  async createMany(
    entries: CreatePuzzleEntryData[],
    tx?: DatabaseTransaction,
  ): Promise<PuzzleEntry[]> {
    if (entries.length === 0) {
      return [];
    }

    const result = await (tx ?? this.database.client)
      .insert(puzzleEntries)
      .values(entries)
      .returning();

    return result.map((entry) => this.toDomain(entry));
  }

  private toDomain(entry: typeof puzzleEntries.$inferSelect): PuzzleEntry {
    return {
      id: entry.id,
      puzzleId: entry.puzzleId,
      word: entry.word,
      clue: entry.clue,
      direction: entry.direction,
      row: entry.row,
      column: entry.column,
      length: entry.length,
      number: entry.number,
    };
  }
}
