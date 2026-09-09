import type { CrosswordWord } from "../domain/word.js";

const VALID_ANSWER_PATTERN = /^[A-Z]+$/;

function normalizeCrosswordWord(word: CrosswordWord): CrosswordWord | null {
  const answer = word.answer.trim().toUpperCase();
  const clue = word.clue.trim();

  if (!VALID_ANSWER_PATTERN.test(answer) || clue.length === 0) {
    return null;
  }

  return { answer, clue };
}

// Provider-agnostic safety net: drops any word that can't be placed by CrosswordGenerator.
export function normalizeCrosswordWords(words: CrosswordWord[]): CrosswordWord[] {
  return words.reduce<CrosswordWord[]>((normalized, word) => {
    const result = normalizeCrosswordWord(word);

    if (result) {
      normalized.push(result);
    }

    return normalized;
  }, []);
}
