import { defineConfig } from "vitest/config";

// These specs share one physical Postgres database/table set and must not run concurrently with each other.
const dbIntegrationSpecs = [
  "src/puzzle/repository/drizzle-puzzle.repository.spec.ts",
  "src/puzzle/repository/drizzle-puzzle-entry.repository.spec.ts",
  "src/puzzle/repository/puzzle-persistence.transaction.spec.ts",
];

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: "./",
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["**/*.spec.ts"],
          exclude: dbIntegrationSpecs,
        },
      },
      {
        extends: true,
        test: {
          name: "db-integration",
          include: dbIntegrationSpecs,
          fileParallelism: false,
        },
      },
    ],
  },
});