import { describe, expect, it, vi } from "vitest";

import type {
  CreatePuzzleData,
  GeneratePuzzleData,
  Puzzle,
  UpdatePuzzleData,
} from "../domain/puzzle.js";

import type { PuzzleRepository } from "../repository/puzzle.repository.js";
import type { PuzzleEntryRepository } from "../repository/puzzle-entry.repository.js";
import type { CrosswordContentProvider } from "../../crossword/content/crossword-content-provider.js";
import type { DatabaseService, DatabaseTransaction } from "../../db/database.service.js";

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
  const puzzleEntryRepository: PuzzleEntryRepository = {
    createMany: vi.fn().mockResolvedValue([]),
    findByPuzzleId: vi.fn().mockResolvedValue([]),
  };
  const fakeTx = {} as DatabaseTransaction;
  const databaseService = {
    transaction: vi.fn((fn: (tx: DatabaseTransaction) => unknown) => fn(fakeTx)),
  } as unknown as DatabaseService;
  const generatorGenerate = vi.fn();
  const crosswordGeneratorFactory = vi.fn(() => ({
    generate: generatorGenerate,
  })) as unknown as CrosswordGeneratorFactory;
  const crosswordContentProvider: CrosswordContentProvider = {
    generateWords: vi.fn(),
  };

  const service = new PuzzleService(
    puzzleRepository,
    puzzleEntryRepository,
    crosswordGeneratorFactory,
    crosswordContentProvider,
    databaseService,
  );

  it("should find a puzzle by id", async () => {
    const puzzle = {
      id: "puzzle-1",
    } as Puzzle;
    const entries = [
      {
        id: "entry-1",
        puzzleId: "puzzle-1",
        word: "CAT",
        clue: "A small animal",
        direction: "across" as const,
        row: 0,
        column: 0,
        length: 3,
        number: 1,
      },
    ];

    vi.mocked(puzzleRepository.findById).mockResolvedValue(puzzle);
    vi.mocked(puzzleEntryRepository.findByPuzzleId).mockResolvedValue(entries);

    const result = await service.findById("puzzle-1");

    expect(puzzleRepository.findById).toHaveBeenCalledWith("puzzle-1");
    expect(puzzleEntryRepository.findByPuzzleId).toHaveBeenCalledWith("puzzle-1");
    expect(result).toEqual({ ...puzzle, entries });
  });

  it("returns null when the puzzle does not exist", async () => {
    vi.mocked(puzzleRepository.findById).mockResolvedValue(null);

    const result = await service.findById("missing-id");

    expect(result).toBeNull();
  });

  it("returns an empty entries array when a puzzle has no entries", async () => {
    const puzzle = { id: "puzzle-1" } as Puzzle;

    vi.mocked(puzzleRepository.findById).mockResolvedValue(puzzle);
    vi.mocked(puzzleEntryRepository.findByPuzzleId).mockResolvedValue([]);

    const result = await service.findById("puzzle-1");

    expect(result).toEqual({ ...puzzle, entries: [] });
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
    expect(databaseService.transaction).toHaveBeenCalled();
    expect(puzzleRepository.create).toHaveBeenCalledWith(
      {
        title: data.title,
        theme: data.theme,
        difficulty: data.difficulty,
        status: "ready",
        rows: data.rows,
        columns: data.columns,
        grid,
      },
      fakeTx,
    );
    expect(puzzleEntryRepository.createMany).toHaveBeenCalledWith(
      [
        {
          puzzleId: persistedPuzzle.id,
          word: "CAT",
          clue: "A small animal",
          direction: "across",
          row: 2,
          column: 1,
          length: 3,
          number: 1,
        },
      ],
      fakeTx,
    );
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

  it("does not persist puzzle entries for unplaced words", async () => {
    const data: GeneratePuzzleData = {
      title: "Animal Puzzle",
      theme: "Animals",
      difficulty: "medium",
      rows: 5,
      columns: 5,
      wordCount: 1,
    };
    const grid = { rows: 5, cols: 5, cells: [], placements: [] };

    vi.mocked(crosswordContentProvider.generateWords).mockResolvedValue([
      { answer: "CAT", clue: "A small animal" },
    ]);
    generatorGenerate.mockReturnValue({
      grid,
      placedWords: [],
      unplacedWords: [{ answer: "CAT", clue: "A small animal" }],
    });
    vi.mocked(puzzleRepository.create).mockResolvedValue({ id: "puzzle-1" } as Puzzle);

    await service.generate(data);

    expect(puzzleEntryRepository.createMany).toHaveBeenCalledWith([], fakeTx);
  });

  it("propagates a failure to persist entries so the transaction rejects", async () => {
    const data: GeneratePuzzleData = {
      title: "Animal Puzzle",
      theme: "Animals",
      difficulty: "medium",
      rows: 5,
      columns: 5,
      wordCount: 1,
    };
    const grid = {
      rows: 5,
      cols: 5,
      cells: [],
      placements: [
        { word: { answer: "CAT", clue: "A small animal" }, row: 0, col: 0, direction: "across" as const },
      ],
    };

    vi.mocked(crosswordContentProvider.generateWords).mockResolvedValue([
      { answer: "CAT", clue: "A small animal" },
    ]);
    generatorGenerate.mockReturnValue({ grid, placedWords: [], unplacedWords: [] });
    vi.mocked(puzzleRepository.create).mockResolvedValue({ id: "puzzle-1" } as Puzzle);
    vi.mocked(puzzleEntryRepository.createMany).mockRejectedValueOnce(
      new Error("insert failed"),
    );

    await expect(service.generate(data)).rejects.toThrow("insert failed");
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