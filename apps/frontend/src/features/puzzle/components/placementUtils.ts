import type { Direction, WordPlacement } from '../../../types/puzzle'

export type CellCoordinate = {
  row: number
  col: number
}

export function getPlacementCells(placement: WordPlacement): CellCoordinate[] {
  return Array.from({ length: placement.word.answer.length }, (_, index) => ({
    row: placement.direction === 'down' ? placement.row + index : placement.row,
    col: placement.direction === 'across' ? placement.col + index : placement.col,
  }))
}

export function containsCell(placement: WordPlacement, cell: CellCoordinate) {
  return getPlacementCells(placement).some(
    (placementCell) => placementCell.row === cell.row && placementCell.col === cell.col,
  )
}

export function getPlacementAtCell(
  placements: WordPlacement[],
  cell: CellCoordinate,
  direction: Direction,
) {
  return placements.find(
    (placement) => placement.direction === direction && containsCell(placement, cell),
  )
}

export function getPlacementsAtCell(placements: WordPlacement[], cell: CellCoordinate) {
  return placements.filter((placement) => containsCell(placement, cell))
}

export function getCellIndex(placement: WordPlacement, cell: CellCoordinate) {
  return getPlacementCells(placement).findIndex(
    (placementCell) => placementCell.row === cell.row && placementCell.col === cell.col,
  )
}