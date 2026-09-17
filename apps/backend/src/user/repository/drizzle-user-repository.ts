import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../../db/database.service.js";
import { users } from "../../db/schema/index.js";
import type { UserRepository, CreateUserData } from "./user.repository.js";
import type { User } from "../domain/user.js";

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly database: DatabaseService) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.database.client
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const user = result[0];

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.database.client
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async create(data: CreateUserData): Promise<User> {
    const result = await this.database.client
      .insert(users)
      .values(data)
      .returning();

    return this.toDomain(result[0]);
  }

  private toDomain(user: typeof users.$inferSelect): User {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      isGuest: user.isGuest,
    };
  }
}