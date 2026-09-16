import type { CrosswordDifficulty } from "../domain/difficulty.js";
import { CrosswordLanguage } from "../domain/language.js";
import type { CrosswordWord } from "../domain/word.js";

export const CROSSWORD_CONTENT_PROVIDER = Symbol("CROSSWORD_CONTENT_PROVIDER");

export type CrosswordContentRequest = {
  theme: string;
  difficulty: CrosswordDifficulty;
  wordCount: number;
  language: CrosswordLanguage;
};

export interface CrosswordContentProvider {
  generateWords(request: CrosswordContentRequest): Promise<CrosswordWord[]>;
}
