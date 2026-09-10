export type PuzzleSessionResult = {
  score: number
  elapsedSeconds: number
  mistakes: number
}

function getStorageKey(puzzleId: string) {
  return `crossmind:puzzle-result:${puzzleId}`
}

export function savePuzzleSessionResult(puzzleId: string, result: PuzzleSessionResult) {
  // Server-side attempts will calculate authoritative scores when they are introduced.
  sessionStorage.setItem(getStorageKey(puzzleId), JSON.stringify(result))
}

export function getPuzzleSessionResult(puzzleId: string): PuzzleSessionResult | null {
  const storedResult = sessionStorage.getItem(getStorageKey(puzzleId))
  if (!storedResult) {
    return null
  }

  try {
    const result = JSON.parse(storedResult) as Partial<PuzzleSessionResult>
    if (
      typeof result.score !== 'number'
      || typeof result.elapsedSeconds !== 'number'
      || typeof result.mistakes !== 'number'
    ) {
      return null
    }

    return result as PuzzleSessionResult
  } catch {
    return null
  }
}