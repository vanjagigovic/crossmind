import { Injectable } from '@nestjs/common';

import type { CrosswordWord } from '../domain/word.js';
import type {
  CrosswordContentProvider,
  CrosswordContentRequest,
} from './crossword-content-provider.js';

const WORD_POOL: CrosswordWord[] = [
  { answer: 'CAT', clue: 'A small domesticated feline' },
  { answer: 'DOG', clue: "Man's best friend" },
  { answer: 'BIRD', clue: 'An animal that can fly' },
  { answer: 'FISH', clue: 'An animal that lives in water' },
  { answer: 'LION', clue: 'The king of the jungle' },
  { answer: 'TIGER', clue: 'A large striped wild cat' },
  { answer: 'BEAR', clue: 'A large furry mammal' },
  { answer: 'HORSE', clue: 'An animal often ridden' },
  { answer: 'SHEEP', clue: 'An animal known for its wool' },
  { answer: 'MOUSE', clue: 'A small rodent' },
  { answer: 'WOLF', clue: 'A wild canine animal' },
  { answer: 'FOX', clue: 'A clever wild animal with a bushy tail' },
  { answer: 'DEER', clue: 'A hoofed animal with antlers' },
  { answer: 'EAGLE', clue: 'A large bird of prey' },
  { answer: 'SHARK', clue: 'A large predatory fish' },
  { answer: 'WHALE', clue: 'A very large marine mammal' },
  { answer: 'ZEBRA', clue: 'A striped African animal' },
  { answer: 'MONKEY', clue: 'A primate that often climbs trees' },
  { answer: 'RABBIT', clue: 'A small animal with long ears' },
  { answer: 'TURTLE', clue: 'An animal with a hard shell' },
  { answer: 'SNAKE', clue: 'A legless reptile' },
  { answer: 'FROG', clue: 'An amphibian that can jump' },
  { answer: 'OTTER', clue: 'A playful aquatic mammal' },
  { answer: 'PANDA', clue: 'A black and white bear' },
  { answer: 'CAMEL', clue: 'An animal adapted to desert travel' },
  { answer: 'GIRAFFE', clue: 'An animal with a very long neck' },
];

@Injectable()
export class StaticCrosswordContentProvider implements CrosswordContentProvider {
  async generateWords(
    request: CrosswordContentRequest,
  ): Promise<CrosswordWord[]> {
    const words: CrosswordWord[] = [];

    for (let index = 0; index < request.candidateCount; index++) {
      words.push(WORD_POOL[index % WORD_POOL.length]);
    }

    return words;
  }
}
