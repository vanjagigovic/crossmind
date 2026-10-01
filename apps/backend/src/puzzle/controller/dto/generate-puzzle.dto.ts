import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

import type { PuzzleDifficulty, PuzzleLanguage } from '../../domain/puzzle.js';

export enum PuzzleDifficultyDto {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum PuzzleLanguageDto {
  English = 'en',
  Serbian = 'sr',
  Spanish = 'es',
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

  @IsInt()
  @Min(1)
  wordCount!: number;

  @IsEnum(PuzzleLanguageDto)
  language!: PuzzleLanguage;
}
