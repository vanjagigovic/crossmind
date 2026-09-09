import { Module } from "@nestjs/common";

import { CrosswordGenerator } from "../crossword/generator/crossword-generator.js";
import { CROSSWORD_CONTENT_PROVIDER } from "../crossword/content/crossword-content-provider.js";
import { OpenAiCrosswordContentProvider } from "../crossword/content/openai/openai-crossword-content-provider.js";
import {
  OPENAI_CLIENT_FACTORY,
  defaultOpenAiClientFactory,
} from "../crossword/content/openai/openai-client.js";
import { DrizzlePuzzleRepository } from "./repository/drizzle-puzzle.repository.js";
import { DrizzlePuzzleEntryRepository } from "./repository/drizzle-puzzle-entry.repository.js";
import {
  CROSSWORD_GENERATOR_FACTORY,
  PUZZLE_ENTRY_REPOSITORY,
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
      provide: PUZZLE_ENTRY_REPOSITORY,
      useClass: DrizzlePuzzleEntryRepository,
    },
    {
      provide: CROSSWORD_GENERATOR_FACTORY,
      useValue: (options: { rows: number; cols: number }) =>
        new CrosswordGenerator(options),
    },
    {
      provide: OPENAI_CLIENT_FACTORY,
      useValue: defaultOpenAiClientFactory,
    },
    {
      provide: CROSSWORD_CONTENT_PROVIDER,
      useClass: OpenAiCrosswordContentProvider,
    },
  ],
  exports: [PuzzleService],
})
export class PuzzleModule {}