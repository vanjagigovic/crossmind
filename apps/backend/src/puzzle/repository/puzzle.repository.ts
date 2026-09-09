import type { DatabaseTransaction } from "../../db/database.service.js";
import type {
  CreatePuzzleData,
  Puzzle,
  UpdatePuzzleData,
} from "../domain/puzzle.js";

export interface PuzzleRepository {
  findById(id: string): Promise<Puzzle | null>;

  findAll(): Promise<Puzzle[]>;

  create(data: CreatePuzzleData, tx?: DatabaseTransaction): Promise<Puzzle>;

  update(id: string, data: UpdatePuzzleData): Promise<Puzzle | null>;

  delete(id: string): Promise<void>;
}