import type { KeyboardEvent } from 'react'
import type { GridCell } from '../../../types/puzzle'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const isBlocked = cell.isBlocked || cell.letter === null

  if (isBlocked) {
    return (
      <div
        className="crossword-cell crossword-cell--blocked"
        role="gridcell"
        aria-label={t('accessibility.blockedCell')}
      />
    )
  }

  const label = number
    ? t('accessibility.entry', {
      number,
      row: cell.row + 1,
      column: cell.col + 1,
    })
    : t('accessibility.cell', {
      row: cell.row + 1,
      column: cell.col + 1,
    })
  const stateLabel = value ? t('accessibility.contains', { value }) : t('accessibility.empty')
  const validationLabel = incorrect ? `, ${t('accessibility.incorrect')}` : ''

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