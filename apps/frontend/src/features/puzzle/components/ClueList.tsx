import type { Direction, WordPlacement } from '../../../types/puzzle'
import { getCellKey } from './entryNumbers'

type ClueListProps = {
  placements: WordPlacement[]
  entryNumbers: Map<string, number>
}

type NumberedPlacement = {
  placement: WordPlacement
  number: number
}

function getPlacementsByDirection(
  placements: WordPlacement[],
  direction: Direction,
  entryNumbers: Map<string, number>,
) {
  const numberedPlacements: NumberedPlacement[] = []

  for (const placement of placements) {
    if (placement.direction !== direction) {
      continue
    }

    const number = entryNumbers.get(getCellKey(placement.row, placement.col))
    if (number !== undefined) {
      numberedPlacements.push({ placement, number })
    }
  }

  return numberedPlacements.sort((first, second) => first.number - second.number)
}

export function ClueList({ placements, entryNumbers }: ClueListProps) {
  const acrossPlacements = getPlacementsByDirection(placements, 'across', entryNumbers)
  const downPlacements = getPlacementsByDirection(placements, 'down', entryNumbers)

  return (
    <div className="clue-list">
      <ClueSection heading="Across" placements={acrossPlacements} />
      <ClueSection heading="Down" placements={downPlacements} />
    </div>
  )
}

type ClueSectionProps = {
  heading: string
  placements: NumberedPlacement[]
}

function ClueSection({ heading, placements }: ClueSectionProps) {
  return (
    <section className="clue-section" aria-labelledby={`clues-${heading.toLowerCase()}`}>
      <h2 id={`clues-${heading.toLowerCase()}`}>{heading}</h2>
      <ol>
        {placements.map(({ placement, number }) => (
          <li key={`${placement.row}-${placement.col}-${placement.direction}`} value={number}>
            <span className="clue-number">{number}</span>
            <span>{placement.word.clue}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}