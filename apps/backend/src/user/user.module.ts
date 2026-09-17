import { Module } from "@nestjs/common";
import { DatabaseModule } from "../db/database.module.js";
import { USER_REPOSITORY } from "./repository/user.repository.js";
import { UserService } from "./user.service.js";
import { DrizzleUserRepository } from "./repository/drizzle-user-repository.js";

@Module({
  imports: [DatabaseModule],
  providers: [
    DrizzleUserRepository,
    UserService,
    {
      provide: USER_REPOSITORY,
      useExisting: DrizzleUserRepository,
    },
  ],
  exports: [USER_REPOSITORY, UserService],
})
export class UserModule {}