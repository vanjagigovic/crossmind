import "reflect-metadata";

import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { describe, expect, it, vi } from "vitest";

import { createCrosswordGrid } from "../../crossword/helpers/grid-helper.js";
import type { Puzzle } from "../domain/puzzle.js";
import { CreatePuzzleDto } from "./dto/create-puzzle.dto.js";
import { GeneratePuzzleDto } from "./dto/generate-puzzle.dto.js";
import { PuzzleController } from "./puzzle.controller.js";
import type { PuzzleService } from "../service/puzzle.service.js";
import { UpdatePuzzleDto } from "./dto/update-puzzle.dto.js";

describe("PuzzleController", () => {
  const puzzle: Puzzle = {
    id: "puzzle-1",
    title: "Test Puzzle",
    theme: "Testing",
    difficulty: "easy",
    status: "draft",
    rows: 5,
    columns: 5,
    grid: createCrosswordGrid(5, 5),
  };

  const puzzleService = {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    generate: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } satisfies Partial<Record<keyof PuzzleService, ReturnType<typeof vi.fn>>>;

  const controller = new PuzzleController(
    puzzleService as unknown as PuzzleService,
  );

  it("should return all puzzles", async () => {
    puzzleService.findAll.mockResolvedValue([puzzle]);

    const result = await controller.findAll();

    expect(result).toEqual([puzzle]);
    expect(puzzleService.findAll).toHaveBeenCalledOnce();
  });

  it("should return a puzzle by id", async () => {
    puzzleService.findById.mockResolvedValue(puzzle);

    const result = await controller.findById("puzzle-1");

    expect(result).toEqual(puzzle);
    expect(puzzleService.findById).toHaveBeenCalledWith("puzzle-1");
  });

  it("should throw NotFoundException when puzzle does not exist", async () => {
    puzzleService.findById.mockResolvedValue(null);

    await expect(controller.findById("missing-id")).rejects.toThrow(
      'Puzzle with id "missing-id" not found',
    );

    expect(puzzleService.findById).toHaveBeenCalledWith("missing-id");
  });

  it("should create a puzzle", async () => {
    const data = validCreatePuzzleData();

    puzzleService.create.mockResolvedValue(puzzle);

    const result = await controller.create(data);

    expect(result).toEqual(puzzle);
    expect(puzzleService.create).toHaveBeenCalledWith(data);
  });

  it("accepts a valid CrosswordGrid when creating a puzzle", async () => {
    await expectValid(CreatePuzzleDto, validCreatePuzzleData());
  });

  it("rejects an old array-shaped grid when creating a puzzle", async () => {
    await expectInvalid(CreatePuzzleDto, validCreatePuzzleData({ grid: [] }));
  });

  it("rejects a missing grid when creating a puzzle", async () => {
    await expectInvalid(CreatePuzzleDto, validCreatePuzzleData({ grid: undefined }));
  });

  it("rejects invalid grid rows and columns when creating a puzzle", async () => {
    await expectInvalid(
      CreatePuzzleDto,
      validCreatePuzzleData({
        grid: { ...createCrosswordGrid(5, 5), rows: 0, cols: -1 },
      }),
    );
  });

  it("rejects malformed grid cells when creating a puzzle", async () => {
    await expectInvalid(
      CreatePuzzleDto,
      validCreatePuzzleData({
        grid: { ...createCrosswordGrid(5, 5), cells: [[{ row: -1 }]] },
      }),
    );
  });

  it("rejects malformed placements when creating a puzzle", async () => {
    await expectInvalid(
      CreatePuzzleDto,
      validCreatePuzzleData({
        grid: {
          ...createCrosswordGrid(5, 5),
          placements: [{ word: { answer: "CAT" }, row: 0, col: 0, direction: "across" }],
        },
      }),
    );
  });

  it("rejects placements with an invalid direction when creating a puzzle", async () => {
    await expectInvalid(
      CreatePuzzleDto,
      validCreatePuzzleData({
        grid: {
          ...createCrosswordGrid(5, 5),
          placements: [
            {
              word: { answer: "CAT", clue: "A small animal" },
              row: 0,
              col: 0,
              direction: "diagonal",
            },
          ],
        },
      }),
    );
  });

  it("accepts a valid CrosswordGrid when updating a puzzle", async () => {
    await expectValid(UpdatePuzzleDto, { grid: createCrosswordGrid(5, 5) });
  });

  it("rejects an old array-shaped grid when updating a puzzle", async () => {
    await expectInvalid(UpdatePuzzleDto, { grid: [] });
  });

  it("rejects a malformed grid when updating a puzzle", async () => {
    await expectInvalid(UpdatePuzzleDto, {
      grid: { ...createCrosswordGrid(5, 5), cells: "not-an-array" },
    });
  });

  it("should generate a puzzle", async () => {
    const data = {
      title: "Animal Puzzle",
      theme: "Animals",
      difficulty: "medium" as const,
      rows: 5,
      columns: 5,
      wordCount: 5,
    };
    const generatedPuzzle = { ...puzzle, ...data, status: "ready" as const };

    puzzleService.generate.mockResolvedValue(generatedPuzzle);

    const result = await controller.generate(data);

    expect(result).toEqual(generatedPuzzle);
    expect(puzzleService.generate).toHaveBeenCalledWith(data);
  });

  it("rejects a missing title", async () => {
    const errors = await validate(
      plainToInstance(GeneratePuzzleDto, validGeneratePuzzleData({ title: undefined })),
    );

    expect(errors).not.toEqual([]);
  });

  it("rejects an invalid difficulty", async () => {
    const errors = await validate(
      plainToInstance(GeneratePuzzleDto, validGeneratePuzzleData({ difficulty: "expert" })),
    );

    expect(errors).not.toEqual([]);
  });

  it("rejects non-positive dimensions", async () => {
    const errors = await validate(
      plainToInstance(GeneratePuzzleDto, validGeneratePuzzleData({ rows: 0, columns: -1 })),
    );

    expect(errors).not.toEqual([]);
  });

  it("rejects a non-positive word count", async () => {
    const errors = await validate(
      plainToInstance(GeneratePuzzleDto, validGeneratePuzzleData({ wordCount: 0 })),
    );

    expect(errors).not.toEqual([]);
  });

  it("should update a puzzle", async () => {
    const data = {
      title: "Updated Puzzle",
    };

    const updatedPuzzle = {
      ...puzzle,
      title: "Updated Puzzle",
    };

    puzzleService.update.mockResolvedValue(updatedPuzzle);

    const result = await controller.update("puzzle-1", data);

    expect(result).toEqual(updatedPuzzle);
    expect(puzzleService.update).toHaveBeenCalledWith(
      "puzzle-1",
      data,
    );
  });

  it("should throw NotFoundException when updating a non-existent puzzle", async () => {
    puzzleService.update.mockResolvedValue(null);

    await expect(
      controller.update("missing-id", { title: "Updated Puzzle" }),
    ).rejects.toThrow('Puzzle with id "missing-id" not found');

    expect(puzzleService.update).toHaveBeenCalledWith(
      "missing-id",
      { title: "Updated Puzzle" },
    );
  });

  it("should delete a puzzle", async () => {
    puzzleService.delete.mockResolvedValue(undefined);

    await controller.delete("puzzle-1");

    expect(puzzleService.delete).toHaveBeenCalledWith("puzzle-1");
  });
});

function validGeneratePuzzleData(overrides: Record<string, unknown> = {}) {
  return {
    title: "Animal Puzzle",
    theme: "Animals",
    difficulty: "easy",
    rows: 5,
    columns: 5,
    wordCount: 5,
    ...overrides,
  };
}

function validCreatePuzzleData(overrides: Record<string, unknown> = {}) {
  return {
    title: "New Puzzle",
    theme: "Testing",
    difficulty: "medium" as const,
    status: "draft" as const,
    rows: 5,
    columns: 5,
    grid: createCrosswordGrid(5, 5),
    ...overrides,
  };
}

async function expectValid<T extends object>(dto: new () => T, data: object) {
  await expect(validate(plainToInstance(dto, data))).resolves.toEqual([]);
}

async function expectInvalid<T extends object>(dto: new () => T, data: object) {
  await expect(validate(plainToInstance(dto, data))).resolves.not.toEqual([]);
}