import { getPuzzleSessionResult } from '../utils/puzzleSessionResult'
import { formatElapsedTime } from '../utils/timerUtils'

type PuzzleResultPageProps = {
  puzzleId: string
}

export function PuzzleResultPage({ puzzleId }: PuzzleResultPageProps) {
  const result = getPuzzleSessionResult(puzzleId)

  if (!result) {
    return (
      <main className="puzzle-result-page">
        <p className="puzzle-state puzzle-state--error">No completed puzzle session was found.</p>
        <a className="primary-action" href="/create">Create New Puzzle</a>
      </main>
    )
  }

  return (
    <main className="puzzle-result-page">
      <p className="puzzle-theme">Puzzle completed!</p>
      <h1>Great work</h1>
      <dl className="puzzle-result">
        <div><dt>Score</dt><dd>{result.score.toLocaleString()}</dd></div>
        <div><dt>Time</dt><dd>{formatElapsedTime(result.elapsedSeconds)}</dd></div>
        <div><dt>Mistakes</dt><dd>{result.mistakes}</dd></div>
      </dl>
      <div className="puzzle-result-actions">
        <a className="primary-action" href="/create">Play Again</a>
        <a className="secondary-action" href="/create">Create New Puzzle</a>
      </div>
    </main>
  )
}