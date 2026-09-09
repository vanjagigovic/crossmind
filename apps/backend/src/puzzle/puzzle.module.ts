import { Module } from "@nestjs/common";

import { CrosswordGenerator } from "../crossword/generator/crossword-generator.js";
import { CROSSWORD_CONTENT_PROVIDER } from "../crossword/content/crossword-content-provider.js";
import { StaticCrosswordContentProvider } from "../crossword/content/static-crossword-content-provider.js";
import { DrizzlePuzzleRepository } from "./repository/drizzle-puzzle.repository.js";
import {
  CROSSWORD_GENERATOR_FACTORY,
  PUZZLE_REPOSITORY,
  PuzzleService,
} from "./service/puzzle.service.js";
import { PuzzleController } from "./controller/puzzle.controller.js";

@Module({
  controllers: [PuzzleController],
  providers: [
    PuzzleService,
    {
      provide: PUZZLE_REPOSITORY,
      useClass: DrizzlePuzzleRepository,
    },
    {
      provide: CROSSWORD_GENERATOR_FACTORY,
      useValue: (options: { rows: number; cols: number }) =>
        new CrosswordGenerator(options),
    },
    {
      provide: CROSSWORD_CONTENT_PROVIDER,
      useClass: StaticCrosswordContentProvider,
    },
  ],
  exports: [PuzzleService],
})
export class PuzzleModule {}