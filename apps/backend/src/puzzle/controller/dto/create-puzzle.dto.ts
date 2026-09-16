import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";

import type {
  CrosswordGrid,
  Grid,
  GridCell,
} from "../../../crossword/domain/grid.js";
import type { CrosswordWord } from "../../../crossword/domain/word.js";
import type {
  Direction,
  WordPlacement,
} from "../../../crossword/domain/word-placement.js";
import type {
  PuzzleDifficulty,
  PuzzleLanguage,
  PuzzleStatus,
} from "../../domain/puzzle.js";

export enum PuzzleDifficultyDto {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum PuzzleLanguageDto {
  English = 'en',
  Serbian = 'sr',
  Spanish = 'es',
}

export enum PuzzleStatusDto {
  DRAFT = "draft",
  GENERATING = "generating",
  READY = "ready",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

class CrosswordWordDto implements CrosswordWord {
  @IsString()
  @IsNotEmpty()
  answer!: string;

  @IsString()
  @IsNotEmpty()
  clue!: string;
}

class GridCellDto implements GridCell {
  @IsInt()
  @Min(0)
  row!: number;

  @IsInt()
  @Min(0)
  col!: number;

  @ValidateIf((_object, value) => value !== null)
  @IsString()
  letter!: string | null;

  @IsBoolean()
  isBlocked!: boolean;
}

class WordPlacementDto implements WordPlacement {
  @IsObject()
  @ValidateNested()
  @Type(() => CrosswordWordDto)
  word!: CrosswordWord;

  @IsInt()
  @Min(0)
  row!: number;

  @IsInt()
  @Min(0)
  col!: number;

  @IsEnum(["across", "down"])
  direction!: Direction;
}

class CrosswordGridDto implements CrosswordGrid {
  @IsInt()
  @Min(1)
  rows!: number;

  @IsInt()
  @Min(1)
  cols!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GridCellDto)
  cells!: Grid;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WordPlacementDto)
  placements!: WordPlacement[];
}

export class CreatePuzzleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  theme!: string;

  @IsEnum(PuzzleDifficultyDto)
  difficulty!: PuzzleDifficulty;

  @IsEnum(PuzzleLanguageDto)
  language!: PuzzleLanguage;


  @IsEnum(PuzzleStatusDto)
  status!: PuzzleStatus;

  @IsInt()
  @Min(1)
  rows!: number;

  @IsInt()
  @Min(1)
  columns!: number;

  @IsObject()
  @ValidateNested()
  @Type(() => CrosswordGridDto)
  grid!: CrosswordGrid;
}