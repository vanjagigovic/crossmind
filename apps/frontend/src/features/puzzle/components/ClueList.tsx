import type { Direction, PuzzleEntry } from '../../../types/puzzle'

type ClueListProps = {
  entries: PuzzleEntry[]
}

function getEntriesByDirection(entries: PuzzleEntry[], direction: Direction) {
  return entries
    .filter((entry) => entry.direction === direction)
    .sort((first, second) => first.number - second.number)
}

export function ClueList({ entries }: ClueListProps) {
  const acrossEntries = getEntriesByDirection(entries, 'across')
  const downEntries = getEntriesByDirection(entries, 'down')

  return (
    <div className="clue-list">
      <ClueSection heading="Across" entries={acrossEntries} />
      <ClueSection heading="Down" entries={downEntries} />
    </div>
  )
}

type ClueSectionProps = {
  heading: string
  entries: PuzzleEntry[]
}

function ClueSection({ heading, entries }: ClueSectionProps) {
  return (
    <section className="clue-section" aria-labelledby={`clues-${heading.toLowerCase()}`}>
      <h2 id={`clues-${heading.toLowerCase()}`}>{heading}</h2>
      <ol>
        {entries.map((entry) => (
          <li key={entry.id} value={entry.number}>
            <span className="clue-number">{entry.number}</span>
            <span>{entry.clue}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}