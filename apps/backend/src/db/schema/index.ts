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