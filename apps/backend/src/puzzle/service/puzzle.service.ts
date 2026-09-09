import { Inject, Injectable } from "@nestjs/common";

import {
  CrosswordGenerator,
  CrosswordGeneratorOptions,
} from "../../crossword/generator/crossword-generator.js";
import { CROSSWORD_CONTENT_PROVIDER } from "../../crossword/content/crossword-content-provider.js";
import type { CrosswordContentProvider } from "../../crossword/content/crossword-content-provider.js";
import { normalizeCrosswordWords } from "../../crossword/content/normalize-crossword-word.js";
import type {
  CreatePuzzleData,
  GeneratePuzzleData,
  Puzzle,
  UpdatePuzzleData,
} from "../domain/puzzle.js";

import type { PuzzleRepository } from "../repository/puzzle.repository.js";

export const PUZZLE_REPOSITORY = Symbol("PUZZLE_REPOSITORY");
export const CROSSWORD_GENERATOR_FACTORY = Symbol("CROSSWORD_GENERATOR_FACTORY");

export type CrosswordGeneratorFactory = (
  options: CrosswordGeneratorOptions,
) => CrosswordGenerator;

@Injectable()
export class PuzzleService {
  constructor(
    @Inject(PUZZLE_REPOSITORY)
    private readonly puzzleRepository: PuzzleRepository,
    @Inject(CROSSWORD_GENERATOR_FACTORY)
    private readonly crosswordGeneratorFactory: CrosswordGeneratorFactory,
    @Inject(CROSSWORD_CONTENT_PROVIDER)
    private readonly crosswordContentProvider: CrosswordContentProvider,
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

  async generate(data: GeneratePuzzleData): Promise<Puzzle> {
    const words = await this.crosswordContentProvider.generateWords({
      theme: data.theme,
      difficulty: data.difficulty,
      wordCount: data.wordCount,
    });

    const generator = this.crosswordGeneratorFactory({
      rows: data.rows,
      cols: data.columns,
    });
    const { grid } = generator.generate(normalizeCrosswordWords(words));

    return this.puzzleRepository.create({
      title: data.title,
      theme: data.theme,
      difficulty: data.difficulty,
      status: "ready",
      rows: data.rows,
      columns: data.columns,
      grid,
    });
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