import { describe, expect, it, vi } from "vitest";

import type {
  CreatePuzzleData,
  GeneratePuzzleData,
  Puzzle,
  UpdatePuzzleData,
} from "../domain/puzzle.js";

import type { PuzzleRepository } from "../repository/puzzle.repository.js";
import type { CrosswordContentProvider } from "../../crossword/content/crossword-content-provider.js";

import {
  CrosswordGeneratorFactory,
  PuzzleService,
} from "./puzzle.service.js";

describe("PuzzleService", () => {
  const puzzleRepository: PuzzleRepository = {
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const generatorGenerate = vi.fn();
  const crosswordGeneratorFactory = vi.fn(() => ({
    generate: generatorGenerate,
  })) as unknown as CrosswordGeneratorFactory;
  const crosswordContentProvider: CrosswordContentProvider = {
    generateWords: vi.fn(),
  };

  const service = new PuzzleService(
    puzzleRepository,
    crosswordGeneratorFactory,
    crosswordContentProvider,
  );

  it("should find a puzzle by id", async () => {
    const puzzle = {
      id: "puzzle-1",
    } as Puzzle;

    vi.mocked(puzzleRepository.findById).mockResolvedValue(puzzle);

    const result = await service.findById("puzzle-1");

    expect(puzzleRepository.findById).toHaveBeenCalledWith("puzzle-1");
    expect(result).toEqual(puzzle);
  });

  it("should return all puzzles", async () => {
    const puzzles = [
      { id: "puzzle-1" },
      { id: "puzzle-2" },
    ] as Puzzle[];

    vi.mocked(puzzleRepository.findAll).mockResolvedValue(puzzles);

    const result = await service.findAll();

    expect(puzzleRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual(puzzles);
  });

  it("should create a puzzle", async () => {
    const data = {
      title: "Test Puzzle",
    } as CreatePuzzleData;

    const puzzle = {
      id: "puzzle-1",
      ...data,
    } as Puzzle;

    vi.mocked(puzzleRepository.create).mockResolvedValue(puzzle);

    const result = await service.create(data);

    expect(puzzleRepository.create).toHaveBeenCalledWith(data);
    expect(result).toEqual(puzzle);
  });

  it("generates and persists a ready puzzle", async () => {
    const data: GeneratePuzzleData = {
      title: "Animal Puzzle",
      theme: "Animals",
      difficulty: "medium",
      rows: 5,
      columns: 5,
      wordCount: 1,
    };
    const words = [{ answer: "CAT", clue: "A small animal" }];
    const grid = {
      rows: 5,
      cols: 5,
      cells: [],
      placements: [
        {
          word: words[0],
          row: 2,
          col: 1,
          direction: "across" as const,
        },
      ],
    };
    const persistedPuzzle = { id: "puzzle-1", ...data, status: "ready", grid } as Puzzle;

    vi.mocked(crosswordContentProvider.generateWords).mockResolvedValue(words);
    generatorGenerate.mockReturnValue({
      grid,
      placedWords: words,
      unplacedWords: [],
    });
    vi.mocked(puzzleRepository.create).mockResolvedValue(persistedPuzzle);

    const result = await service.generate(data);

    expect(crosswordContentProvider.generateWords).toHaveBeenCalledWith({
      theme: data.theme,
      difficulty: data.difficulty,
      wordCount: data.wordCount,
    });
    expect(crosswordGeneratorFactory).toHaveBeenCalledWith({ rows: 5, cols: 5 });
    expect(generatorGenerate).toHaveBeenCalledWith(words);
    expect(puzzleRepository.create).toHaveBeenCalledWith({
      title: data.title,
      theme: data.theme,
      difficulty: data.difficulty,
      status: "ready",
      rows: data.rows,
      columns: data.columns,
      grid,
    });
    expect(result).toBe(persistedPuzzle);
  });

  it("normalizes provider words before passing them to the generator", async () => {
    const data: GeneratePuzzleData = {
      title: "Animal Puzzle",
      theme: "Animals",
      difficulty: "medium",
      rows: 5,
      columns: 5,
      wordCount: 2,
    };
    const grid = { rows: 5, cols: 5, cells: [], placements: [] };

    vi.mocked(crosswordContentProvider.generateWords).mockResolvedValue([
      { answer: "  cat  ", clue: "  A small animal  " },
      { answer: "INVALID-ANSWER", clue: "Should be dropped" },
    ]);
    generatorGenerate.mockReturnValue({ grid, placedWords: [], unplacedWords: [] });
    vi.mocked(puzzleRepository.create).mockResolvedValue({ id: "puzzle-1" } as Puzzle);

    await service.generate(data);

    expect(generatorGenerate).toHaveBeenCalledWith([
      { answer: "CAT", clue: "A small animal" },
    ]);
  });

  it("should update a puzzle", async () => {
    const data = {
      title: "Updated Puzzle",
    } as UpdatePuzzleData;

    const puzzle = {
      id: "puzzle-1",
      ...data,
    } as Puzzle;

    vi.mocked(puzzleRepository.update).mockResolvedValue(puzzle);

    const result = await service.update("puzzle-1", data);

    expect(puzzleRepository.update).toHaveBeenCalledWith(
      "puzzle-1",
      data,
    );
    expect(result).toEqual(puzzle);
  });

  it("should delete a puzzle", async () => {
    vi.mocked(puzzleRepository.delete).mockResolvedValue(undefined);

    await service.delete("puzzle-1");

    expect(puzzleRepository.delete).toHaveBeenCalledWith("puzzle-1");
  });
});