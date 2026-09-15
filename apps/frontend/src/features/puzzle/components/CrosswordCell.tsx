import type { KeyboardEvent } from 'react'
import type { GridCell } from '../../../types/puzzle'

type CrosswordCellProps = {
  cell: GridCell
  number?: number
  value?: string
  selected: boolean
  active: boolean
  incorrect: boolean
  completed: boolean
  tabbable: boolean
  onSelect: () => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
}

export function CrosswordCell({
  cell,
  number,
  value,
  selected,
  active,
  incorrect,
  completed,
  tabbable,
  onSelect,
  onKeyDown,
}: CrosswordCellProps) {
  const isBlocked = cell.isBlocked || cell.letter === null

  if (isBlocked) {
    return (
      <div
        className="crossword-cell crossword-cell--blocked"
        role="gridcell"
        aria-label="Blocked cell"
      />
    )
  }

  const label = number
    ? `Entry ${number}, row ${cell.row + 1}, column ${cell.col + 1}`
    : `Row ${cell.row + 1}, column ${cell.col + 1}`
  const stateLabel = value ? `contains ${value}` : 'empty'
  const validationLabel = incorrect ? ', incorrect' : ''

  return (
    <div
      className={`crossword-cell${active ? ' crossword-cell--active' : ''}${selected ? ' crossword-cell--selected' : ''}${incorrect ? ' crossword-cell--incorrect' : ''}`}
      role="gridcell"
      aria-label={`${label}, ${stateLabel}${validationLabel}${selected ? ', selected' : ''}`}
      aria-selected={selected}
      aria-disabled={completed}
      tabIndex={completed ? -1 : tabbable ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      {number && (
        <span className="crossword-cell-number">
          {number}
        </span>
      )}
      {value && <span>{value}</span>}
    </div>
  )
}