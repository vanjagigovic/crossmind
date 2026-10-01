import type { CrosswordWord } from '../domain/word.js';

const VALID_ANSWER_PATTERN = /^\p{L}+$/u;

function normalizeCrosswordWord(word: CrosswordWord): CrosswordWord | null {
  const normalizedAnswer = word.answer.trim().normalize('NFC');
  const answer = normalizedAnswer.toUpperCase().normalize('NFC');
  const clue = word.clue.trim();

  if (
    !VALID_ANSWER_PATTERN.test(answer) ||
    answer.length !== Array.from(answer).length ||
    Array.from(answer).length !== Array.from(normalizedAnswer).length ||
    clue.length === 0
  ) {
    return null;
  }

  return { answer, clue };
}

// Provider-agnostic safety net: drops any word that can't be placed by CrosswordGenerator.
export function normalizeCrosswordWords(
  words: CrosswordWord[],
): CrosswordWord[] {
  const seenAnswers = new Set<string>();

  return words.reduce<CrosswordWord[]>((normalized, word) => {
    const result = normalizeCrosswordWord(word);

    if (result && !seenAnswers.has(result.answer)) {
      seenAnswers.add(result.answer);
      normalized.push(result);
    }

    return normalized;
  }, []);
}
