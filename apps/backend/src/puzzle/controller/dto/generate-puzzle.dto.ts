import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

import type { PuzzleDifficulty } from "../../domain/puzzle.js";
import type { CrosswordWord } from "../../../crossword/domain/word.js";
import { PuzzleDifficultyDto } from "./create-puzzle.dto.js";

class CrosswordWordDto {
  @IsString()
  @IsNotEmpty()
  answer!: string;

  @IsString()
  @IsNotEmpty()
  clue!: string;
}

export class GeneratePuzzleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  theme!: string;

  @IsEnum(PuzzleDifficultyDto)
  difficulty!: PuzzleDifficulty;

  @IsInt()
  @Min(1)
  rows!: number;

  @IsInt()
  @Min(1)
  columns!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrosswordWordDto)
  words!: CrosswordWord[];
}