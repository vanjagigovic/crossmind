CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."puzzle_status" AS ENUM('draft', 'generating', 'ready', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "puzzles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"theme" varchar(255) NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"status" "puzzle_status" NOT NULL,
	"rows" integer NOT NULL,
	"columns" integer NOT NULL,
	"grid" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;