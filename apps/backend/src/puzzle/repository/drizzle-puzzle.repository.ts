import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DatabaseService } from "../../db/database.service.js";
import { puzzles } from "../../db/schema/index.js";
import type {
  CreatePuzzleData,
  Puzzle,
  UpdatePuzzleData,
} from "../domain/puzzle.js";
import type { PuzzleRepository } from "./puzzle.repository.js";

@Injectable()
export class DrizzlePuzzleRepository implements PuzzleRepository {
  constructor(private readonly database: DatabaseService) {}

  async findById(id: string): Promise<Puzzle | null> {
    const result = await this.database.client
      .select()
      .from(puzzles)
      .where(eq(puzzles.id, id))
      .limit(1);

    const puzzle = result[0];

    if (!puzzle) {
      return null;
    }

    return this.toDomain(puzzle);
  }

  async findAll(): Promise<Puzzle[]> {
    const result = await this.database.client.select().from(puzzles);

    return result.map((puzzle) => this.toDomain(puzzle));
  }

  async create(data: CreatePuzzleData): Promise<Puzzle> {
    const result = await this.database.client
      .insert(puzzles)
      .values(data)
      .returning();

    return this.toDomain(result[0]);
  }

  async update(
    id: string,
    data: UpdatePuzzleData,
  ): Promise<Puzzle | null> {
    const result = await this.database.client
      .update(puzzles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(puzzles.id, id))
      .returning();

    const puzzle = result[0];

    if (!puzzle) {
      return null;
    }

    return this.toDomain(puzzle);
  }

  async delete(id: string): Promise<void> {
    await this.database.client
      .delete(puzzles)
      .where(eq(puzzles.id, id));
  }

  private toDomain(puzzle: typeof puzzles.$inferSelect): Puzzle {
    return {
      id: puzzle.id,
      title: puzzle.title,
      theme: puzzle.theme,
      difficulty: puzzle.difficulty,
      status: puzzle.status,
      rows: puzzle.rows,
      columns: puzzle.columns,
      grid: puzzle.grid,
    };
  }
}