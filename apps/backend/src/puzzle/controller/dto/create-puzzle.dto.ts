import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  Min,
} from "class-validator";

import type { Grid } from "../../../crossword/domain/grid.js";

export enum PuzzleDifficultyDto {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum PuzzleStatusDto {
  DRAFT = "draft",
  GENERATING = "generating",
  READY = "ready",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export class CreatePuzzleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  theme!: string;

  @IsEnum(PuzzleDifficultyDto)
  difficulty!: PuzzleDifficultyDto;

  @IsEnum(PuzzleStatusDto)
  status!: PuzzleStatusDto;

  @IsInt()
  @Min(1)
  rows!: number;

  @IsInt()
  @Min(1)
  columns!: number;

  @IsObject()
  grid!: Grid;
}