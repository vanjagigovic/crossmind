import { useState } from 'react'
import { generatePuzzle } from '../../../api/puzzles'
import type { PuzzleDifficulty } from '../../../types/puzzle'

const TOPICS = ['Programming', 'Travel', 'Animals', 'Movies', 'Science', 'History', 'Sports', 'Food']

const SIZES = {
  small: { label: 'Small', rows: 11, columns: 11, wordCount: 5 },
  medium: { label: 'Medium', rows: 13, columns: 13, wordCount: 7 },
  large: { label: 'Large', rows: 15, columns: 15, wordCount: 9 },
} as const

type PuzzleSize = keyof typeof SIZES

export function CreatePuzzlePage() {
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0])
  const [customTopic, setCustomTopic] = useState('')
  const [difficulty, setDifficulty] = useState<PuzzleDifficulty>('medium')
  const [size, setSize] = useState<PuzzleSize>('medium')
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const isCustomTopic = selectedTopic === 'custom'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const theme = isCustomTopic ? customTopic.trim() : selectedTopic

    if (!theme) {
      setError('Enter a custom topic to generate your puzzle.')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const selectedSize = SIZES[size]
      const puzzle = await generatePuzzle({
        title: `${theme} Crossword`,
        theme,
        difficulty,
        rows: selectedSize.rows,
        columns: selectedSize.columns,
        wordCount: selectedSize.wordCount,
      })
      window.location.assign(`/puzzle/${encodeURIComponent(puzzle.id)}`)
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Unable to generate the puzzle.')
      setIsGenerating(false)
    }
  }

  return (
    <main className="create-puzzle-page">
      <header className="create-puzzle-page__header">
        <p className="puzzle-theme">New puzzle</p>
        <h1>Create Puzzle</h1>
      </header>
      <form className="puzzle-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Topic</legend>
          <div className="choice-grid">
            {TOPICS.map((topic) => (
              <label key={topic} className="choice-control">
                <input type="radio" name="topic" value={topic} checked={selectedTopic === topic} onChange={() => setSelectedTopic(topic)} />
                <span>{topic}</span>
              </label>
            ))}
            <label className="choice-control">
              <input type="radio" name="topic" value="custom" checked={isCustomTopic} onChange={() => setSelectedTopic('custom')} />
              <span>Custom topic</span>
            </label>
          </div>
          {isCustomTopic && (
            <label className="custom-topic-input">
              <span>Custom topic</span>
              <input type="text" value={customTopic} onChange={(event) => setCustomTopic(event.target.value)} placeholder="Formula 1 racing" autoFocus />
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend>Difficulty</legend>
          <div className="choice-grid choice-grid--compact">
            {(['easy', 'medium', 'hard'] as const).map((option) => (
              <label key={option} className="choice-control">
                <input type="radio" name="difficulty" value={option} checked={difficulty === option} onChange={() => setDifficulty(option)} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Puzzle size</legend>
          <div className="choice-grid choice-grid--compact">
            {(Object.entries(SIZES) as [PuzzleSize, (typeof SIZES)[PuzzleSize]][]).map(([value, option]) => (
              <label key={value} className="choice-control">
                <input type="radio" name="size" value={value} checked={size === value} onChange={() => setSize(value)} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="puzzle-state puzzle-state--error" role="alert">{error}</p>}
        {isGenerating && <p className="puzzle-state" role="status">Generating your puzzle...</p>}
        <button className="primary-action" type="submit" disabled={isGenerating}>Generate Puzzle</button>
      </form>
    </main>
  )
}