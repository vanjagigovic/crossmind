import { Inject, Injectable } from "@nestjs/common";

import {
  CrosswordGenerator,
  CrosswordGeneratorOptions,
} from "../../crossword/generator/crossword-generator.js";
import { CROSSWORD_CONTENT_PROVIDER } from "../../crossword/content/crossword-content-provider.js";
import type { CrosswordContentProvider } from "../../crossword/content/crossword-content-provider.js";
import { normalizeCrosswordWords } from "../../crossword/content/normalize-crossword-word.js";
import { DatabaseService } from "../../db/database.service.js";
import type {
  CreatePuzzleData,
  GeneratePuzzleData,
  Puzzle,
  PuzzleWithEntries,
  UpdatePuzzleData,
} from "../domain/puzzle.js";

import type { PuzzleRepository } from "../repository/puzzle.repository.js";
import type { PuzzleEntryRepository } from "../repository/puzzle-entry.repository.js";
import { buildPuzzleEntries } from "./build-puzzle-entries.js";

export const PUZZLE_REPOSITORY = Symbol("PUZZLE_REPOSITORY");
export const PUZZLE_ENTRY_REPOSITORY = Symbol("PUZZLE_ENTRY_REPOSITORY");
export const CROSSWORD_GENERATOR_FACTORY = Symbol("CROSSWORD_GENERATOR_FACTORY");

export type CrosswordGeneratorFactory = (
  options: CrosswordGeneratorOptions,
) => CrosswordGenerator;

@Injectable()
export class PuzzleService {
  constructor(
    @Inject(PUZZLE_REPOSITORY)
    private readonly puzzleRepository: PuzzleRepository,
    @Inject(PUZZLE_ENTRY_REPOSITORY)
    private readonly puzzleEntryRepository: PuzzleEntryRepository,
    @Inject(CROSSWORD_GENERATOR_FACTORY)
    private readonly crosswordGeneratorFactory: CrosswordGeneratorFactory,
    @Inject(CROSSWORD_CONTENT_PROVIDER)
    private readonly crosswordContentProvider: CrosswordContentProvider,
    private readonly databaseService: DatabaseService,
  ) {}

  async findById(id: string): Promise<PuzzleWithEntries | null> {
    const puzzle = await this.puzzleRepository.findById(id);

    if (!puzzle) {
      return null;
    }

    const entries = await this.puzzleEntryRepository.findByPuzzleId(id);

    return { ...puzzle, entries };
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
      language: data.language,
    });

    const generator = this.crosswordGeneratorFactory({
      rows: data.rows,
      cols: data.columns,
    });
    const { grid } = generator.generate(normalizeCrosswordWords(words));

    return this.databaseService.transaction(async (tx) => {
      const puzzle = await this.puzzleRepository.create(
        {
          title: data.title,
          theme: data.theme,
          difficulty: data.difficulty,
          language: data.language,
          status: "ready",
          rows: data.rows,
          columns: data.columns,
          grid,
        },
        tx,
      );

      const entries = buildPuzzleEntries(puzzle.id, grid.placements);

      await this.puzzleEntryRepository.createMany(entries, tx);

      return puzzle;
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