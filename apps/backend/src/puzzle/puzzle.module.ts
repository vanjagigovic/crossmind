import { Module } from "@nestjs/common";

import { DrizzlePuzzleRepository } from "./repository/drizzle-puzzle.repository.js";
import {
  PUZZLE_REPOSITORY,
  PuzzleService,
} from "./service/puzzle.service.js";

@Module({
  providers: [
    PuzzleService,
    {
      provide: PUZZLE_REPOSITORY,
      useClass: DrizzlePuzzleRepository,
    },
  ],
  exports: [PuzzleService],
})
export class PuzzleModule {}