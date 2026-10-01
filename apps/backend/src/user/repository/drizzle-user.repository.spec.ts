import { describe, expect, it } from 'vitest';
import { DatabaseService } from '../../db/database.service.js';
import { DrizzleUserRepository } from './drizzle-user-repository.js';

describe('DrizzleUserRepository', () => {
  it("should update a user's password", async () => {
    const database = new DatabaseService();
    const repository = new DrizzleUserRepository(database);

    const user = await repository.create({
      email: `password-test-${Date.now()}@example.com`,
      passwordHash: 'old-password-hash',
      displayName: 'Password Test',
      isGuest: false,
    });

    await repository.updatePassword(user.id, 'new-password-hash');

    const updatedUser = await repository.findById(user.id);

    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.passwordHash).toBe('new-password-hash');
  });

  it('defaults newly created users to USER and supports operator promotion', async () => {
    const database = new DatabaseService();
    const repository = new DrizzleUserRepository(database);
    const email = `role-test-${Date.now()}@example.com`;

    const user = await repository.create({
      email,
      passwordHash: 'password-hash',
      displayName: 'Role Test',
      isGuest: false,
    });

    expect(user.role).toBe('USER');

    const promoted = await repository.promoteToAdminByEmail(email);

    expect(promoted?.role).toBe('ADMIN');
  });
});
