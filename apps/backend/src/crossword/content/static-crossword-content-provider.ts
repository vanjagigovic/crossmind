import { Injectable } from "@nestjs/common";

import type { CrosswordWord } from "../domain/word.js";
import type {
  CrosswordContentProvider,
  CrosswordContentRequest,
} from "./crossword-content-provider.js";

const WORD_POOL: CrosswordWord[] = [
  { answer: "CAT", clue: "A small domesticated feline" },
  { answer: "DOG", clue: "Man's best friend" },
  { answer: "BIRD", clue: "An animal that can fly" },
  { answer: "FISH", clue: "An animal that lives in water" },
  { answer: "LION", clue: "The king of the jungle" },
  { answer: "TIGER", clue: "A large striped wild cat" },
  { answer: "BEAR", clue: "A large furry mammal" },
  { answer: "HORSE", clue: "An animal often ridden" },
  { answer: "SHEEP", clue: "An animal known for its wool" },
  { answer: "MOUSE", clue: "A small rodent" },
];

@Injectable()
export class StaticCrosswordContentProvider implements CrosswordContentProvider {
  async generateWords(
    request: CrosswordContentRequest,
  ): Promise<CrosswordWord[]> {
    const words: CrosswordWord[] = [];

    for (let index = 0; index < request.wordCount; index++) {
      words.push(WORD_POOL[index % WORD_POOL.length]);
    }

    return words;
  }
}
