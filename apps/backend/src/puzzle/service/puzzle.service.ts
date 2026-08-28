import { Inject, Injectable } from "@nestjs/common";

import type {
  CreatePuzzleData,
  Puzzle,
  UpdatePuzzleData,
} from "../domain/puzzle.js";

import type { PuzzleRepository } from "../repository/puzzle.repository.js";

export const PUZZLE_REPOSITORY = Symbol("PUZZLE_REPOSITORY");

@Injectable()
export class PuzzleService {
  constructor(
    @Inject(PUZZLE_REPOSITORY)
    private readonly puzzleRepository: PuzzleRepository,
  ) {}

  async findById(id: string): Promise<Puzzle | null> {
    return this.puzzleRepository.findById(id);
  }

  async findAll(): Promise<Puzzle[]> {
    return this.puzzleRepository.findAll();
  }

  async create(data: CreatePuzzleData): Promise<Puzzle> {
    return this.puzzleRepository.create(data);
  }

  async update(
    id: string,
    data: UpdatePuzzleData,
  ): Promise<Puzzle | null> {
    return this.puzzleRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.puzzleRepository.delete(id);
  }
}