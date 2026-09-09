import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DatabaseModule } from "./db/database.module.js";
import { PuzzleModule } from "./puzzle/puzzle.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    PuzzleModule,
  ],
})
export class AppModule {}