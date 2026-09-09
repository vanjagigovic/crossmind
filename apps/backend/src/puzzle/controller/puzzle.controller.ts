import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post } from "@nestjs/common";
import { PuzzleService } from "../service/puzzle.service.js";
import { CreatePuzzleDto } from "./dto/create-puzzle.dto.js";
import { GeneratePuzzleDto } from "./dto/generate-puzzle.dto.js";
import { UpdatePuzzleDto } from "./dto/update-puzzle.dto.js";

@Controller("puzzles")
export class PuzzleController {
    constructor(private readonly puzzleService: PuzzleService) { }

    @Get()
    async findAll() {
        return this.puzzleService.findAll();
    }

    @Post("generate")
    async generate(@Body() data: GeneratePuzzleDto) {
        return this.puzzleService.generate(data);
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
    async create(@Body() data: CreatePuzzleDto) {
        return this.puzzleService.create(data);
    }

    @Patch(":id")
    async update(@Param("id") id: string,
        @Body() data: UpdatePuzzleDto,) {
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