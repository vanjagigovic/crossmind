import { pgTable, serial, varchar, timestamp, integer, pgEnum, uuid, jsonb } from "drizzle-orm/pg-core";

export const difficultyEnum = pgEnum("difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const puzzleStatusEnum = pgEnum("puzzle_status", [
  "draft",
  "generating",
  "ready",
  "published",
  "archived",
]);

export const directionEnum = pgEnum("direction", [
  "across",
  "down",
]);

export const puzzles = pgTable("puzzles", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  theme: varchar("theme", { length: 255 }).notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  status: puzzleStatusEnum("status").notNull(),
  rows: integer("rows").notNull(),
  columns: integer("columns").notNull(),
  grid: jsonb("grid").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const puzzleEntries = pgTable("puzzle_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  puzzleId: uuid("puzzle_id")
    .notNull()
    .references(() => puzzles.id, { onDelete: "cascade" }),
  word: varchar("word", { length: 255 }).notNull(),
  clue: varchar("clue", { length: 500 }).notNull(),
  direction: directionEnum("direction").notNull(),
  row: integer("row").notNull(),
  column: integer("column").notNull(),
  length: integer("length").notNull(),
  number: integer("number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
