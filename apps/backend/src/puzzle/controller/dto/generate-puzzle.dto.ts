import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from "class-validator";

import type { PuzzleDifficulty } from "../../domain/puzzle.js";
import { PuzzleDifficultyDto } from "./create-puzzle.dto.js";

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

  @IsInt()
  @Min(1)
  wordCount!: number;
}