import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it, vi } from 'vitest';

import { createCrosswordGrid } from '../../crossword/helpers/grid-helper.js';
import type { Puzzle } from '../domain/puzzle.js';
import { GeneratePuzzleDto } from './dto/generate-puzzle.dto.js';
import { PuzzleController } from './puzzle.controller.js';
import type { PuzzleService } from '../service/puzzle.service.js';

describe('PuzzleController', () => {
  const puzzle: Puzzle = {
    id: 'puzzle-1',
    title: 'Test Puzzle',
    theme: 'Testing',
    difficulty: 'easy',
    language: 'en' as const,
    status: 'draft',
    rows: 5,
    columns: 5,
    grid: createCrosswordGrid(5, 5),
  };

  const puzzleService = {
    findAll: vi.fn(),
    findById: vi.fn(),
    generate: vi.fn(),
    delete: vi.fn(),
  } satisfies Partial<Record<keyof PuzzleService, ReturnType<typeof vi.fn>>>;

  const controller = new PuzzleController(
    puzzleService as unknown as PuzzleService,
  );

  it('should return all puzzles', async () => {
    puzzleService.findAll.mockResolvedValue([puzzle]);

    const result = await controller.findAll();

    expect(result).toEqual([puzzle]);
    expect(puzzleService.findAll).toHaveBeenCalledOnce();
  });

  it('should return a puzzle by id', async () => {
    puzzleService.findById.mockResolvedValue(puzzle);

    const result = await controller.findById('puzzle-1');

    expect(result).toEqual(puzzle);
    expect(puzzleService.findById).toHaveBeenCalledWith('puzzle-1');
  });

  it('should return a puzzle with its entries', async () => {
    const puzzleWithEntries = {
      ...puzzle,
      entries: [
        {
          id: 'entry-1',
          puzzleId: 'puzzle-1',
          word: 'CAT',
          clue: 'A small animal',
          direction: 'across' as const,
          row: 0,
          column: 0,
          length: 3,
          number: 1,
        },
      ],
    };

    puzzleService.findById.mockResolvedValue(puzzleWithEntries);

    const result = await controller.findById('puzzle-1');

    expect(result).toEqual(puzzleWithEntries);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({
      direction: 'across',
      clue: 'A small animal',
      row: 0,
      column: 0,
      length: 3,
      number: 1,
    });
  });

  it('should throw NotFoundException when puzzle does not exist', async () => {
    puzzleService.findById.mockResolvedValue(null);

    await expect(controller.findById('missing-id')).rejects.toThrow(
      'Puzzle with id "missing-id" not found',
    );

    expect(puzzleService.findById).toHaveBeenCalledWith('missing-id');
  });

  it('should generate a puzzle', async () => {
    const data = {
      title: 'Animal Puzzle',
      theme: 'Animals',
      difficulty: 'medium' as const,
      language: 'en' as const,
      rows: 5,
      columns: 5,
      wordCount: 5,
    };
    const generatedPuzzle = { ...puzzle, ...data, status: 'ready' as const };

    puzzleService.generate.mockResolvedValue(generatedPuzzle);

    const result = await controller.generate(data);

    expect(result).toEqual(generatedPuzzle);
    expect(puzzleService.generate).toHaveBeenCalledWith(data);
  });

  it('rejects a missing title', async () => {
    const errors = await validate(
      plainToInstance(
        GeneratePuzzleDto,
        validGeneratePuzzleData({ title: undefined }),
      ),
    );

    expect(errors).not.toEqual([]);
  });

  it('rejects an invalid difficulty', async () => {
    const errors = await validate(
      plainToInstance(
        GeneratePuzzleDto,
        validGeneratePuzzleData({ difficulty: 'expert' }),
      ),
    );

    expect(errors).not.toEqual([]);
  });

  it('rejects non-positive dimensions', async () => {
    const errors = await validate(
      plainToInstance(
        GeneratePuzzleDto,
        validGeneratePuzzleData({ rows: 0, columns: -1 }),
      ),
    );

    expect(errors).not.toEqual([]);
  });

  it('rejects a non-positive word count', async () => {
    const errors = await validate(
      plainToInstance(
        GeneratePuzzleDto,
        validGeneratePuzzleData({ wordCount: 0 }),
      ),
    );

    expect(errors).not.toEqual([]);
  });

  it('should delete a puzzle', async () => {
    puzzleService.delete.mockResolvedValue(undefined);

    await controller.delete('puzzle-1');

    expect(puzzleService.delete).toHaveBeenCalledWith('puzzle-1');
  });
});

function validGeneratePuzzleData(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Animal Puzzle',
    theme: 'Animals',
    difficulty: 'easy',
    rows: 5,
    columns: 5,
    wordCount: 5,
    ...overrides,
  };
}
