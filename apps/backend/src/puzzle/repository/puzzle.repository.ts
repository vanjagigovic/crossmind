import type { DatabaseTransaction } from '../../db/database.service.js';
import type { CreatePuzzleData, Puzzle } from '../domain/puzzle.js';

export interface PuzzleRepository {
  findById(id: string): Promise<Puzzle | null>;

  findAll(): Promise<Puzzle[]>;

  create(data: CreatePuzzleData, tx?: DatabaseTransaction): Promise<Puzzle>;

  delete(id: string): Promise<void>;
}
