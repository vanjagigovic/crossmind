import "dotenv/config";

import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseService } from "../../db/database.service.js";
import { db, pool } from "../../db/db.js";
import { puzzles } from "../../db/schema/index.js";
import { DrizzlePuzzleRepository } from "./drizzle-puzzle.repository.js";

describe("DrizzlePuzzleRepository", () => {
    const database = new DatabaseService();
    const repository = new DrizzlePuzzleRepository(database);

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
                grid: [
                    ["C", "A", "T"],
                    [null, "R", null],
                    ["D", "O", "G"],
                ],
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
            grid: [
                ["C", "A", "T"],
                [null, "R", null],
                ["D", "O", "G"],
            ],
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
                grid: [
                    ["C", "A", "T"],
                    [null, "R", null],
                    ["D", "O", "G"],
                ],
            },
            {
                title: "Space",
                theme: "Space",
                difficulty: "hard",
                status: "draft",
                rows: 2,
                columns: 2,
                grid: [
                    ["M", "O"],
                    ["O", "N"],
                ],
            },
        ]);

        const result = await repository.findAll();

        expect(result).toHaveLength(2);

        expect(result[0]).toMatchObject({
            title: "Animals",
            theme: "Animals",
            difficulty: "easy",
            status: "ready",
        });

        expect(result[1]).toMatchObject({
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
            grid: [
                ["T", "R", "E"],
                [null, "E", null],
                ["L", "E", "A"],
            ],
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
            grid: [
                ["T", "R", "E"],
                [null, "E", null],
                ["L", "E", "A"],
            ],
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
                grid: [
                    ["C", "A", "T"],
                    [null, "R", null],
                    ["D", "O", "G"],
                ],
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
                grid: [
                    ["C", "A", "T"],
                    [null, "R", null],
                    ["D", "O", "G"],
                ],
            })
            .returning();

        await repository.delete(createdPuzzle.id);

        const deletedPuzzle = await repository.findById(createdPuzzle.id);

        expect(deletedPuzzle).toBeNull();
    });
});