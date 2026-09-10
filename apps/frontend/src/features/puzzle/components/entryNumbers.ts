import type { WordPlacement } from '../../../types/puzzle'

function cellKey(row: number, col: number) {
  return `${row}:${col}`
}

export function getEntryNumbers(placements: WordPlacement[]) {
  const entryNumbers = new Map<string, number>()
  const sortedPlacements = [...placements].sort(
    (first, second) => first.row - second.row || first.col - second.col,
  )
  let nextNumber = 1

  for (const placement of sortedPlacements) {
    const key = cellKey(placement.row, placement.col)
    if (!entryNumbers.has(key)) {
      entryNumbers.set(key, nextNumber++)
    }
  }

  return entryNumbers
}

export function getCellKey(row: number, col: number) {
  return cellKey(row, col)
}