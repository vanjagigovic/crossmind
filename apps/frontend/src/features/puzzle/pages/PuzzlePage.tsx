import { useEffect, useState } from 'react'
import { getPuzzle } from '../../../api/puzzles'
import type { Puzzle, PuzzleEntry } from '../../../types/puzzle'
import { ClueList } from '../components/ClueList'
import {
  CrosswordGrid,
  type PuzzleCompletion,
} from '../components/CrosswordGrid'
import { savePuzzleSessionResult } from '../utils/puzzleSessionResult'
import { calculateScore } from '../utils/scoreUtils'
import { useTranslation } from 'react-i18next'

type PuzzlePageProps = {
  puzzleId?: string
}

export function PuzzlePage({
  puzzleId,
}: PuzzlePageProps) {
  const { t } = useTranslation()
  if (!puzzleId) {
    return (
      <main className="puzzle-page">
        <p className="puzzle-state puzzle-state--error">
          {t('puzzlePage.error.noPuzzleId')}
        </p>
      </main>
    )
  }

  return (
    <LoadedPuzzlePage
      key={puzzleId}
      puzzleId={puzzleId}
    />
  )
}

type LoadedPuzzlePageProps = {
  puzzleId: string
}

function LoadedPuzzlePage({
  puzzleId,
}: LoadedPuzzlePageProps) {
  const { t } = useTranslation()
  const [puzzle, setPuzzle] =
    useState<Puzzle | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  const [selectedCell, setSelectedCell] =
    useState<{
      row: number
      col: number
    } | null>(null)

  const [activeDirection, setActiveDirection] =
    useState<'across' | 'down'>('across')

  useEffect(() => {
    let isCurrent = true

    async function loadPuzzle() {
      try {
        const nextPuzzle =
          await getPuzzle(puzzleId)

        if (isCurrent) {
          setPuzzle(nextPuzzle)
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : t('puzzlePage.error.unableToLoad'),
          )
        }
      }
    }

    void loadPuzzle()

    return () => {
      isCurrent = false
    }
  }, [puzzleId, t])

  if (error) {
    return (
      <main className="puzzle-page">
        <p className="puzzle-state puzzle-state--error">
          {error}
        </p>
      </main>
    )
  }

  if (!puzzle) {
    return (
      <main className="puzzle-page">
        <p className="puzzle-state">
          {t('puzzlePage.loading')}
        </p>
      </main>
    )
  }

  const loadedPuzzle = puzzle

  function handleSelectEntry(
    entry: PuzzleEntry,
  ) {
    setSelectedCell({
      row: entry.row,
      col: entry.column,
    })

    setActiveDirection(entry.direction)
  }

  function handleSelectionChange(
    cell: {
      row: number
      col: number
    },
    direction: 'across' | 'down',
  ) {
    setSelectedCell(cell)
    setActiveDirection(direction)
  }

  function getActiveEntryId() {
    if (!selectedCell) {
      return undefined
    }

    const activeEntry =
      loadedPuzzle.entries.find((entry) => {
        if (
          entry.direction !== activeDirection
        ) {
          return false
        }

        const entryCells = Array.from(
          { length: entry.length },
          (_, index) => {
            if (
              entry.direction === 'across'
            ) {
              return {
                row: entry.row,
                col: entry.column + index,
              }
            }

            return {
              row: entry.row + index,
              col: entry.column,
            }
          },
        )

        return entryCells.some(
          (cell) =>
            cell.row === selectedCell.row &&
            cell.col === selectedCell.col,
        )
      })

    return activeEntry?.id
  }

  function handleComplete({
    elapsedSeconds,
    mistakes,
  }: PuzzleCompletion) {
    const result = {
      elapsedSeconds,
      mistakes,
      score: calculateScore({
        difficulty:
          loadedPuzzle.difficulty,
        elapsedSeconds,
        mistakes,
      }),
    }

    savePuzzleSessionResult(
      loadedPuzzle.id,
      result,
    )

    window.location.assign(
      `/puzzle/${encodeURIComponent(
        loadedPuzzle.id,
      )}/result`,
    )
  }

  const activeEntryId =
    getActiveEntryId()

  return (
    <main className="puzzle-page">
      <header className="puzzle-header">
        <p className="puzzle-theme">
          {loadedPuzzle.theme}
        </p>

        <h1>{loadedPuzzle.title}</h1>

        <dl className="puzzle-details">
          <div>
            <dt>{t('puzzlePage.difficulty')}</dt>
            <dd>
              {t(`createPuzzle.difficulty.${loadedPuzzle.difficulty}`)}
            </dd>
          </div>

          <div>
            <dt>{t('puzzlePage.status')}</dt>
            <dd>
              {t(`puzzlePage.status.${loadedPuzzle.status}`)}
            </dd>
          </div>

          <div>
            <dt>{t('puzzlePage.size')}</dt>
            <dd>
              {loadedPuzzle.rows} x{' '}
              {loadedPuzzle.columns}
            </dd>
          </div>
        </dl>
      </header>

      <CrosswordGrid
        grid={loadedPuzzle.grid}
        selectedCell={selectedCell}
        activeDirection={activeDirection}
        onSelectionChange={
          handleSelectionChange
        }
        onComplete={handleComplete}
      />

      <ClueList
        entries={loadedPuzzle.entries}
        activeEntryId={activeEntryId}
        onSelectEntry={
          handleSelectEntry
        }
      />
    </main>
  )
}