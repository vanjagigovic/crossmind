import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post } from "@nestjs/common";
import { PuzzleService } from "../service/puzzle.service.js";
import type { CreatePuzzleData, UpdatePuzzleData } from "../domain/puzzle.js";

@Controller("puzzles")
export class PuzzleController {
    constructor(private readonly puzzleService: PuzzleService) { }

    @Get()
    async findAll() {
        return this.puzzleService.findAll();
    }

    @Get(":id")
    async findById(@Param("id") id: string) {
        const puzzle = await this.puzzleService.findById(id);
        if (!puzzle) {
            throw new NotFoundException(`Puzzle with id "${id}" not found`);
        }
        return puzzle;
    }
    @Post()
    async create(@Body() data: CreatePuzzleData) {
        return this.puzzleService.create(data);
    }

    @Patch(":id")
    async update(@Param("id") id: string,
        @Body() data: UpdatePuzzleData,) {
        const puzzle = await this.puzzleService.update(id, data);
        if (!puzzle) {
            throw new NotFoundException(`Puzzle with id "${id}" not found`);
        }
        return puzzle;
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param("id") id: string) {
        await this.puzzleService.delete(id);
    }
}