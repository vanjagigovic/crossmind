import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;
const backendEnvPath = resolve(process.cwd(), "apps/backend/.env");

config({ path: existsSync(backendEnvPath) ? backendEnvPath : resolve(process.cwd(), ".env") });

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);