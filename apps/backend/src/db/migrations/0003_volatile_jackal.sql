CREATE TYPE "public"."puzzle_language" AS ENUM('en', 'sr', 'es');--> statement-breakpoint
ALTER TABLE "puzzles" ADD COLUMN "language" "puzzle_language" NOT NULL;