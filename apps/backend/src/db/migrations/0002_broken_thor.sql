CREATE TYPE "public"."direction" AS ENUM('across', 'down');--> statement-breakpoint
CREATE TABLE "puzzle_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"puzzle_id" uuid NOT NULL,
	"word" varchar(255) NOT NULL,
	"clue" varchar(500) NOT NULL,
	"direction" "direction" NOT NULL,
	"row" integer NOT NULL,
	"column" integer NOT NULL,
	"length" integer NOT NULL,
	"number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "puzzle_entries" ADD CONSTRAINT "puzzle_entries_puzzle_id_puzzles_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."puzzles"("id") ON DELETE cascade ON UPDATE no action;