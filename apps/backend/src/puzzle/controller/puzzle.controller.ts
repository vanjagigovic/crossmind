import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { PuzzleService } from '../service/puzzle.service.js';
import { GeneratePuzzleDto } from './dto/generate-puzzle.dto.js';

@Controller('puzzles')
export class PuzzleController {
  constructor(private readonly puzzleService: PuzzleService) {}

  @Get()
  async findAll() {
    return this.puzzleService.findAll();
  }

  @Post('generate')
  async generate(@Body() data: GeneratePuzzleDto) {
    return this.puzzleService.generate(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const puzzle = await this.puzzleService.findById(id);
    if (!puzzle) {
      throw new NotFoundException(`Puzzle with id "${id}" not found`);
    }
    return puzzle;
  }

  // Internal maintenance only; deleting shared content is not a gameplay operation.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.puzzleService.delete(id);
  }
}
