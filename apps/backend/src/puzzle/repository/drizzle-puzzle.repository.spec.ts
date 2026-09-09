import "dotenv/config";

import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseService } from "../../db/database.service.js";
import { db, pool } from "../../db/db.js";
import { puzzles } from "../../db/schema/index.js";
import { createCrosswordGrid } from "../../crossword/helpers/grid-helper.js";
import { DrizzlePuzzleRepository } from "./drizzle-puzzle.repository.js";

describe("DrizzlePuzzleRepository", () => {
    const database = new DatabaseService();
    const repository = new DrizzlePuzzleRepository(database);
    const createGrid = (rows: number, columns: number) => createCrosswordGrid(rows, columns);

    beforeEach(async () => {
        await db.delete(puzzles);
    });

    afterAll(async () => {
        await pool.end();
    });

    it("finds a puzzle by id", async () => {
        const [createdPuzzle] = await db
            .insert(puzzles)
            .values({
                title: "Test Puzzle",
                theme: "Animals",
                difficulty: "easy",
                status: "draft",
                rows: 3,
                columns: 3,
                grid: createGrid(3, 3),
            })
            .returning();

        const puzzle = await repository.findById(createdPuzzle.id);

        expect(puzzle).toEqual({
            id: createdPuzzle.id,
            title: "Test Puzzle",
            theme: "Animals",
            difficulty: "easy",
            status: "draft",
            rows: 3,
            columns: 3,
            grid: createGrid(3, 3),
        });
    });

    it("returns null when puzzle does not exist", async () => {
        const puzzle = await repository.findById(
            "00000000-0000-0000-0000-000000000000",
        );

        expect(puzzle).toBeNull();
    });
    it("finds all puzzles", async () => {
        await db.insert(puzzles).values([
            {
                title: "Animals",
                theme: "Animals",
                difficulty: "easy",
                status: "ready",
                rows: 3,
                columns: 3,
                grid: createGrid(3, 3),
            },
            {
                title: "Space",
                theme: "Space",
                difficulty: "hard",
                status: "draft",
                rows: 2,
                columns: 2,
                grid: createGrid(2, 2),
            },
        ]);

        const result = await repository.findAll();

        expect(result).toHaveLength(2);

        const animals = result.find((puzzle) => puzzle.title === "Animals");
        const space = result.find((puzzle) => puzzle.title === "Space");

        expect(animals).toMatchObject({
            title: "Animals",
            theme: "Animals",
            difficulty: "easy",
            status: "ready",
        });

        expect(space).toMatchObject({
            title: "Space",
            theme: "Space",
            difficulty: "hard",
            status: "draft",
        });
    });
    it("creates a puzzle", async () => {
        const data = {
            title: "New Puzzle",
            theme: "Nature",
            difficulty: "medium" as const,
            status: "draft" as const,
            rows: 3,
            columns: 3,
            grid: createGrid(3, 3),
        };

        const puzzle = await repository.create(data);

        expect(puzzle).toEqual({
            id: expect.any(String),
            title: "New Puzzle",
            theme: "Nature",
            difficulty: "medium",
            status: "draft",
            rows: 3,
            columns: 3,
            grid: createGrid(3, 3),
        });
    });

    it("updates a puzzle", async () => {
        const [createdPuzzle] = await db
            .insert(puzzles)
            .values({
                title: "Original Title",
                theme: "Original Theme",
                difficulty: "easy",
                status: "draft",
                rows: 3,
                columns: 3,
                grid: createGrid(3, 3),
            })
            .returning();

        const updatedPuzzle = await repository.update(createdPuzzle.id, {
            title: "Updated Title",
            status: "ready",
        });

        expect(updatedPuzzle).toMatchObject({
            id: createdPuzzle.id,
            title: "Updated Title",
            theme: "Original Theme",
            difficulty: "easy",
            status: "ready",
            rows: 3,
            columns: 3,
        });
    });
    it("returns null when updating a puzzle that does not exist", async () => {
        const result = await repository.update(
            "00000000-0000-0000-0000-000000000000",
            {
                title: "Updated Title",
            },
        );

        expect(result).toBeNull();
    });

    it("deletes a puzzle", async () => {
        const [createdPuzzle] = await db
            .insert(puzzles)
            .values({
                title: "Puzzle to Delete",
                theme: "Animals",
                difficulty: "easy",
                status: "draft",
                rows: 3,
                columns: 3,
                grid: createGrid(3, 3),
            })
            .returning();

        await repository.delete(createdPuzzle.id);

        const deletedPuzzle = await repository.findById(createdPuzzle.id);

        expect(deletedPuzzle).toBeNull();
    });
});