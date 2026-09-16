import { useState } from 'react'

import { generatePuzzle, getPuzzle } from '../../../api/puzzles'
import { getPuzzleSessionResult } from '../utils/puzzleSessionResult'
import { formatElapsedTime } from '../utils/timerUtils'

type PuzzleResultPageProps = {
  puzzleId: string
}

export function PuzzleResultPage({ puzzleId }: PuzzleResultPageProps) {
  const result = getPuzzleSessionResult(puzzleId)
  const [isPlayingAgain, setIsPlayingAgain] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePlayAgain() {
    setIsPlayingAgain(true)
    setError(null)

    try {
      const currentPuzzle = await getPuzzle(puzzleId)

      const puzzle = await generatePuzzle({
        title: `${currentPuzzle.theme} Crossword`,
        theme: currentPuzzle.theme,
        difficulty: currentPuzzle.difficulty,
        language: currentPuzzle.language,
        rows: currentPuzzle.rows,
        columns: currentPuzzle.columns,
        wordCount: currentPuzzle.entries.length,
      })

      window.location.assign(`/puzzle/${encodeURIComponent(puzzle.id)}`)
    } catch {
      setError('We could not generate the puzzle again. Please try again.')
      setIsPlayingAgain(false)
    }
  }

  if (!result) {
    return (
      <main className="puzzle-result-page">
        <p className="puzzle-state puzzle-state--error">
          No completed puzzle session was found.
        </p>
        <a className="primary-action" href="/create">
          Create New Puzzle
        </a>
      </main>
    )
  }

  return (
    <main className="puzzle-result-page">
      <p className="puzzle-theme">Puzzle completed!</p>
      <h1>Great work</h1>

      <dl className="puzzle-result">
        <div>
          <dt>Score</dt>
          <dd>{result.score.toLocaleString()}</dd>
        </div>

        <div>
          <dt>Time</dt>
          <dd>{formatElapsedTime(result.elapsedSeconds)}</dd>
        </div>

        <div>
          <dt>Mistakes</dt>
          <dd>{result.mistakes}</dd>
        </div>
      </dl>

      {error && (
        <p className="puzzle-state puzzle-state--error" role="alert">
          {error}
        </p>
      )}

      <div className="puzzle-result-actions">
        <button
          className="primary-action"
          type="button"
          onClick={handlePlayAgain}
          disabled={isPlayingAgain}
        >
          {isPlayingAgain ? 'Generating...' : 'Play Again'}
        </button>

        <a className="secondary-action" href="/create">
          Create New Puzzle
        </a>
      </div>
    </main>
  )
}