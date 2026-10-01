import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('user role migration', () => {
  it('defaults existing users to USER without promoting any account', async () => {
    const migration = await readFile(
      new URL('./0008_add_user_role.sql', import.meta.url),
      'utf8',
    );

    expect(migration).toContain(
      `ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'USER' NOT NULL;`,
    );
    expect(migration).not.toMatch(/UPDATE\s+"users"[\s\S]*'ADMIN'/i);
  });
});
