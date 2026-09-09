import { useEffect, useState } from 'react'
import { getPuzzle } from '../../../api/puzzles'
import type { Puzzle } from '../../../types/puzzle'
import { ClueList } from '../components/ClueList'
import { CrosswordGrid, type PuzzleCompletion } from '../components/CrosswordGrid'
import { getEntryNumbers } from '../components/entryNumbers'
import { savePuzzleSessionResult } from '../utils/puzzleSessionResult'
import { calculateScore } from '../utils/scoreUtils'

type PuzzlePageProps = {
  puzzleId?: string
}

export function PuzzlePage({ puzzleId }: PuzzlePageProps) {
  if (!puzzleId) {
    return <main className="puzzle-page"><p className="puzzle-state puzzle-state--error">A puzzle ID is required.</p></main>
  }

  return <LoadedPuzzlePage key={puzzleId} puzzleId={puzzleId} />
}

type LoadedPuzzlePageProps = {
  puzzleId: string
}

function LoadedPuzzlePage({ puzzleId }: LoadedPuzzlePageProps) {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadPuzzle() {
      try {
        const nextPuzzle = await getPuzzle(puzzleId)
        if (isCurrent) {
          setPuzzle(nextPuzzle)
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load the puzzle.')
        }
      }
    }

    void loadPuzzle()

    return () => {
      isCurrent = false
    }
  }, [puzzleId])

  if (error) {
    return <main className="puzzle-page"><p className="puzzle-state puzzle-state--error">{error}</p></main>
  }

  if (!puzzle) {
    return <main className="puzzle-page"><p className="puzzle-state">Loading puzzle...</p></main>
  }

  const loadedPuzzle = puzzle
  const entryNumbers = getEntryNumbers(loadedPuzzle.grid.placements)

  function handleComplete({ elapsedSeconds, mistakes }: PuzzleCompletion) {
    const result = {
      elapsedSeconds,
      mistakes,
      score: calculateScore({
        difficulty: loadedPuzzle.difficulty,
        elapsedSeconds,
        mistakes,
      }),
    }

    savePuzzleSessionResult(loadedPuzzle.id, result)
    window.location.assign(`/puzzle/${encodeURIComponent(loadedPuzzle.id)}/result`)
  }

  return (
    <main className="puzzle-page">
      <header className="puzzle-header">
        <p className="puzzle-theme">{loadedPuzzle.theme}</p>
        <h1>{loadedPuzzle.title}</h1>
        <dl className="puzzle-details">
          <div><dt>Difficulty</dt><dd>{loadedPuzzle.difficulty}</dd></div>
          <div><dt>Status</dt><dd>{loadedPuzzle.status}</dd></div>
          <div><dt>Size</dt><dd>{loadedPuzzle.rows} x {loadedPuzzle.columns}</dd></div>
        </dl>
      </header>
      <CrosswordGrid grid={loadedPuzzle.grid} onComplete={handleComplete} />
      <ClueList placements={loadedPuzzle.grid.placements} entryNumbers={entryNumbers} />
    </main>
  )
}