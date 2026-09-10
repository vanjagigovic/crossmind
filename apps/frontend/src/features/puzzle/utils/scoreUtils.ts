import type { PuzzleDifficulty } from '../../../types/puzzle'

type ScoreInput = {
  difficulty: PuzzleDifficulty
  elapsedSeconds: number
  mistakes: number
}

const BASE_POINTS: Record<PuzzleDifficulty, number> = {
  easy: 1000,
  medium: 1500,
  hard: 2000,
}

export function calculateScore({ difficulty, elapsedSeconds, mistakes }: ScoreInput) {
  return Math.max(0, BASE_POINTS[difficulty] - elapsedSeconds - mistakes * 50)
}