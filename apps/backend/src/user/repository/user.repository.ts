import type { User } from "../domain/user.js";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface CreateUserData {
  email?: string | null;
  passwordHash?: string | null;
  displayName?: string | null;
  isGuest: boolean;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  create(data: CreateUserData): Promise<User>;
}