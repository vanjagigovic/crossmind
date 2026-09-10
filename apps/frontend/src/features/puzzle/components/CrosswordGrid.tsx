import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { CrosswordGrid as CrosswordGridData } from '../../../types/puzzle'
import type { GridCell, WordPlacement } from '../../../types/puzzle'
import { CrosswordCell } from './CrosswordCell'
import { getCellKey, getEntryNumbers } from './entryNumbers'
import {
  getCellIndex,
  getPlacementAtCell,
  getPlacementCells,
  getPlacementsAtCell,
  type CellCoordinate,
} from './placementUtils'
import { formatElapsedTime } from '../utils/timerUtils'

type CrosswordGridProps = {
  grid: CrosswordGridData
  onComplete: (result: PuzzleCompletion) => void
}

export type PuzzleCompletion = {
  elapsedSeconds: number
  mistakes: number
}

export function CrosswordGrid({ grid, onComplete }: CrosswordGridProps) {
  const entryNumbers = getEntryNumbers(grid.placements)
  const [selectedCell, setSelectedCell] = useState<CellCoordinate | null>(null)
  const [activeDirection, setActiveDirection] = useState<'across' | 'down'>('across')
  const [enteredLetters, setEnteredLetters] = useState<Record<string, string>>({})
  const [elapsedTime, setElapsedTime] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const startedAtRef = useRef<number | null>(null)
  const completionHandledRef = useRef(false)
  const activePlacement = selectedCell
    ? getPlacementAtCell(grid.placements, selectedCell, activeDirection)
    : undefined
  const activeCellKeys = new Set(
    activePlacement ? getPlacementCells(activePlacement).map((cell) => getCellKey(cell.row, cell.col)) : [],
  )
  const playableCells = grid.cells.flat().filter(isPlayableCell)
  const completed = playableCells.length > 0 && playableCells.every(
    (cell) => enteredLetters[getCellKey(cell.row, cell.col)] === cell.letter,
  )
  useEffect(() => {
    if (completed) {
      return
    }

    startedAtRef.current = Date.now()
    const intervalId = window.setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsedTime(getElapsedSeconds(startedAtRef.current))
      }
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [completed])

  function selectCell(cell: CellCoordinate) {
    if (completed) {
      return
    }

    const placements = getPlacementsAtCell(grid.placements, cell)
    if (placements.length === 0) {
      return
    }

    const isSameCell = selectedCell?.row === cell.row && selectedCell.col === cell.col
    const alternatePlacement = isSameCell
      ? placements.find((placement) => placement.direction !== activeDirection)
      : undefined
    const currentDirectionPlacement = placements.find(
      (placement) => placement.direction === activeDirection,
    )
    const acrossPlacement = placements.find((placement) => placement.direction === 'across')

    setSelectedCell(cell)
    setActiveDirection(
      alternatePlacement?.direction ?? currentDirectionPlacement?.direction ?? acrossPlacement?.direction ?? placements[0].direction,
    )
    inputRef.current?.focus()
  }

  function enterLetter(letter: string) {
    if (!selectedCell || completed) {
      return
    }

    const key = getCellKey(selectedCell.row, selectedCell.col)
    const nextLetters = {
      ...enteredLetters,
      [key]: letter.toUpperCase(),
    }
    const isIncorrect = grid.cells[selectedCell.row][selectedCell.col].letter !== letter.toUpperCase()
    const nextMistakes = mistakes + (isIncorrect ? 1 : 0)

    setEnteredLetters(nextLetters)
    if (isIncorrect) {
      setMistakes(nextMistakes)
    }
    if (isSolved(grid.cells, nextLetters) && startedAtRef.current !== null) {
      const finalElapsedTime = getElapsedSeconds(startedAtRef.current)
      setElapsedTime(finalElapsedTime)
      if (!completionHandledRef.current) {
        completionHandledRef.current = true
        onComplete({ elapsedSeconds: finalElapsedTime, mistakes: nextMistakes })
      }
    }

    moveWithinActivePlacement(1)
  }

  function clearLetter() {
    if (!selectedCell || completed) {
      return
    }

    const key = getCellKey(selectedCell.row, selectedCell.col)
    setEnteredLetters((currentLetters) => removeLetter(currentLetters, key))
  }

  function moveWithinActivePlacement(offset: number) {
    if (!selectedCell || !activePlacement) {
      return
    }

    const cells = getPlacementCells(activePlacement)
    const index = getCellIndex(activePlacement, selectedCell)
    const nextCell = cells[index + offset]

    if (nextCell) {
      setSelectedCell(nextCell)
    }
  }

  function handleBackspace() {
    if (!selectedCell || completed) {
      return
    }

    const key = getCellKey(selectedCell.row, selectedCell.col)
    if (enteredLetters[key]) {
      clearLetter()
      return
    }

    if (!activePlacement) {
      return
    }

    const cells = getPlacementCells(activePlacement)
    const index = getCellIndex(activePlacement, selectedCell)
    const previousCell = cells[index - 1]

    if (previousCell) {
      const previousKey = getCellKey(previousCell.row, previousCell.col)
      setSelectedCell(previousCell)
      setEnteredLetters((currentLetters) => removeLetter(currentLetters, previousKey))
    }
  }

  function moveToAdjacentCell(rowOffset: number, colOffset: number, direction: 'across' | 'down') {
    if (!selectedCell || completed) {
      return
    }

    const nextCell = grid.cells[selectedCell.row + rowOffset]?.[selectedCell.col + colOffset]
    if (!nextCell || !isPlayableCell(nextCell)) {
      return
    }

    setSelectedCell(nextCell)
    if (getPlacementAtCell(grid.placements, nextCell, direction)) {
      setActiveDirection(direction)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (/^[a-z]$/i.test(event.key)) {
      event.preventDefault()
      enterLetter(event.key)
      return
    }

    if (event.key === 'Backspace') {
      event.preventDefault()
      handleBackspace()
      return
    }

    if (event.key === 'Delete') {
      event.preventDefault()
      clearLetter()
      return
    }

    const arrowKeys = {
      ArrowUp: [-1, 0, 'down'],
      ArrowDown: [1, 0, 'down'],
      ArrowLeft: [0, -1, 'across'],
      ArrowRight: [0, 1, 'across'],
    } as const
    const arrowKey = arrowKeys[event.key as keyof typeof arrowKeys]

    if (arrowKey) {
      event.preventDefault()
      moveToAdjacentCell(arrowKey[0], arrowKey[1], arrowKey[2])
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const letter = event.target.value.match(/[a-z]/i)?.[0]
    if (letter) {
      enterLetter(letter)
    }
  }

  return (
    <>
      <p className="puzzle-timer" aria-label={`Elapsed time ${formatElapsedTime(elapsedTime)}`}>
        Time: <time dateTime={`PT${elapsedTime}S`}>{formatElapsedTime(elapsedTime)}</time>
      </p>
      {activePlacement && selectedCell && (
        <section className="active-clue" aria-live="polite">
          <p className="active-clue__heading">
            {activePlacement.direction === 'across' ? 'Across' : 'Down'} {entryNumbers.get(getCellKey(activePlacement.row, activePlacement.col))}
          </p>
          <p>{activePlacement.word.clue}</p>
          <p className="active-clue__status">{getWordStatus(activePlacement, enteredLetters, grid.cells)}</p>
        </section>
      )}
      <div
        className="crossword-grid"
        role="grid"
        aria-label="Crossword grid"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}
      >
        {grid.cells.flatMap((row) => row.map((cell) => {
          const cellKey = getCellKey(cell.row, cell.col)
          const value = enteredLetters[cellKey]

          return (
            <CrosswordCell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              number={entryNumbers.get(cellKey)}
              value={value}
              selected={selectedCell?.row === cell.row && selectedCell.col === cell.col}
              active={activeCellKeys.has(cellKey)}
              incorrect={Boolean(value && value !== cell.letter)}
              completed={completed}
              onSelect={() => selectCell(cell)}
              onKeyDown={handleKeyDown}
            />
          )
        }))}
        <input
          ref={inputRef}
          className="crossword-grid-input"
          aria-label="Enter a letter for the selected crossword cell"
          value=""
          disabled={completed}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      {completed && <p className="puzzle-completion" role="status">Puzzle completed!</p>}
    </>
  )
}

function isPlayableCell(cell: GridCell) {
  return !cell.isBlocked && cell.letter !== null
}

function getElapsedSeconds(startedAt: number) {
  return Math.floor((Date.now() - startedAt) / 1000)
}

function isSolved(cells: GridCell[][], enteredLetters: Record<string, string>) {
  const playableCells = cells.flat().filter(isPlayableCell)
  return playableCells.length > 0 && playableCells.every(
    (cell) => enteredLetters[getCellKey(cell.row, cell.col)] === cell.letter,
  )
}

function removeLetter(letters: Record<string, string>, key: string) {
  const remainingLetters = { ...letters }
  delete remainingLetters[key]
  return remainingLetters
}

function getWordStatus(
  placement: WordPlacement,
  enteredLetters: Record<string, string>,
  cells: GridCell[][],
) {
  const placementCells = getPlacementCells(placement)
  const incorrectLetters = placementCells.filter((cell) => {
    const value = enteredLetters[getCellKey(cell.row, cell.col)]
    return value && value !== cells[cell.row][cell.col].letter
  }).length
  const correct = placementCells.every(
    (cell) => enteredLetters[getCellKey(cell.row, cell.col)] === cells[cell.row][cell.col].letter,
  )

  if (correct) {
    return 'Correct'
  }

  return incorrectLetters > 0 ? `${incorrectLetters} incorrect` : 'In progress'
}