import 'dotenv/config';

import { pool } from '../db/db.js';
import { DatabaseService } from '../db/database.service.js';
import { DrizzleUserRepository } from '../user/repository/drizzle-user-repository.js';

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    throw new Error('Set ADMIN_EMAIL to the email of an existing user.');
  }

  const repository = new DrizzleUserRepository(new DatabaseService());
  const user = await repository.promoteToAdminByEmail(email);

  if (!user) {
    throw new Error(`No user found for ADMIN_EMAIL: ${email}`);
  }

  console.log(`Promoted ${user.email} to ADMIN.`);
}

try {
  await main();
} finally {
  await pool.end();
}
