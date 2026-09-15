import type { Direction, PuzzleEntry } from '../../../types/puzzle'

type ClueListProps = {
  entries: PuzzleEntry[]
  activeEntryId?: string
  onSelectEntry: (entry: PuzzleEntry) => void
}

function getEntriesByDirection(entries: PuzzleEntry[], direction: Direction) {
  return entries
    .filter((entry) => entry.direction === direction)
    .sort((first, second) => first.number - second.number)
}

export function ClueList({
  entries,
  activeEntryId,
  onSelectEntry,
}: ClueListProps) {
  const acrossEntries = getEntriesByDirection(entries, 'across')
  const downEntries = getEntriesByDirection(entries, 'down')

  return (
    <div className="clue-list">
      <ClueSection
        heading="Across"
        entries={acrossEntries}
        activeEntryId={activeEntryId}
        onSelectEntry={onSelectEntry}
      />
      <ClueSection
        heading="Down"
        entries={downEntries}
        activeEntryId={activeEntryId}
        onSelectEntry={onSelectEntry}
      />
    </div>
  )
}

type ClueSectionProps = {
  heading: string
  entries: PuzzleEntry[]
  activeEntryId?: string
  onSelectEntry: (entry: PuzzleEntry) => void
}

function ClueSection({
  heading,
  entries,
  activeEntryId,
  onSelectEntry,
}: ClueSectionProps) {
  return (
    <section
      className="clue-section"
      aria-labelledby={`clues-${heading.toLowerCase()}`}
    >
      <h2 id={`clues-${heading.toLowerCase()}`}>{heading}</h2>
      <ol>
        {entries.map((entry) => {
          const active = entry.id === activeEntryId

          return (
            <li key={entry.id} value={entry.number}>
              <button
                type="button"
                className={`clue-item${active ? ' clue-item--active' : ''}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelectEntry(entry)}
              >
                <span className="clue-number">{entry.number}</span>
                <span>{entry.clue}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}