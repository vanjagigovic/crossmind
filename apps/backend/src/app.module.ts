import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { DatabaseModule } from "./db/database.module.js";
import { PuzzleModule } from "./puzzle/puzzle.module.js";
import { UserModule } from "./user/user.module.js";
import { AuthModule } from "./auth/auth.module.js";

const backendEnvPath = resolve(process.cwd(), "apps/backend/.env");
const envFilePath = existsSync(backendEnvPath)
  ? backendEnvPath
  : resolve(process.cwd(), ".env");

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    DatabaseModule,
    PuzzleModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}