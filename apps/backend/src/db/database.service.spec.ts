import "dotenv/config";

import { describe, expect, it } from "vitest";

import { db } from "./db.js";

describe("Database connection", () => {
  it("connects to PostgreSQL", async () => {
    const result = await db.execute("SELECT 1");

    expect(result.rows).toHaveLength(1);
  });
});