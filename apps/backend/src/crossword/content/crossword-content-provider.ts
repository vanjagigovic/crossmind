import type { CrosswordDifficulty } from "../domain/difficulty.js";
import type { CrosswordWord } from "../domain/word.js";

export const CROSSWORD_CONTENT_PROVIDER = Symbol("CROSSWORD_CONTENT_PROVIDER");

export type CrosswordContentRequest = {
  theme: string;
  difficulty: CrosswordDifficulty;
  wordCount: number;
};

export interface CrosswordContentProvider {
  generateWords(request: CrosswordContentRequest): Promise<CrosswordWord[]>;
}
