import { Inject, Injectable } from "@nestjs/common";

import type { User } from "./domain/user.js";
import {
  USER_REPOSITORY,
  type CreateUserData,
  type UserRepository,
} from "./repository/user.repository.js";

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async create(data: CreateUserData): Promise<User> {
    return this.userRepository.create(data);
  }
}