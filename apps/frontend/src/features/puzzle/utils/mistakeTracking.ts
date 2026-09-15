/**
 * Mistakes are tracked per cell: a cell contributes at most one mistake, counted
 * when it first becomes incorrect. Replacing an incorrect letter with another
 * incorrect letter, correcting it, or clearing it never changes the count.
 */
export function trackMistake(
  mistakenCells: ReadonlySet<string>,
  cellKey: string,
  isIncorrect: boolean,
): ReadonlySet<string> {
  if (!isIncorrect || mistakenCells.has(cellKey)) {
    return mistakenCells
  }

  return new Set(mistakenCells).add(cellKey)
}

export function countMistakes(mistakenCells: ReadonlySet<string>): number {
  return mistakenCells.size
}
