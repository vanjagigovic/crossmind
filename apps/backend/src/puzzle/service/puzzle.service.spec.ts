import { describe, expect, it, vi } from "vitest";

import type {
  CreatePuzzleData,
  Puzzle,
  UpdatePuzzleData,
} from "../domain/puzzle.js";

import type { PuzzleRepository } from "../repository/puzzle.repository.js";

import { PuzzleService } from "./puzzle.service.js";

describe("PuzzleService", () => {
  const puzzleRepository: PuzzleRepository = {
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const service = new PuzzleService(puzzleRepository);

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