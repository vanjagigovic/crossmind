import { describe, expect, it, vi } from "vitest";

import type { Puzzle } from "../domain/puzzle.js";
import { PuzzleController } from "./puzzle.controller.js";
import type { PuzzleService } from "../service/puzzle.service.js";

describe("PuzzleController", () => {
  const puzzle: Puzzle = {
    id: "puzzle-1",
    title: "Test Puzzle",
    theme: "Testing",
    difficulty: "easy",
    status: "draft",
    rows: 5,
    columns: 5,
    grid: [],
  };

  const puzzleService = {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
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
    const data = {
      title: "New Puzzle",
      theme: "Testing",
      difficulty: "medium" as const,
      status: "draft" as const,
      rows: 5,
      columns: 5,
      grid: [],
    };

    puzzleService.create.mockResolvedValue(puzzle);

    const result = await controller.create(data);

    expect(result).toEqual(puzzle);
    expect(puzzleService.create).toHaveBeenCalledWith(data);
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