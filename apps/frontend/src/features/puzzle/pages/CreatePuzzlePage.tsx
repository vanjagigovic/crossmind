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
    } catch {
      setError('We could not generate that puzzle. Check your selections and try again.')
      setIsGenerating(false)
    }
  }

  return (
    <main className="create-puzzle-page">
      <header className="create-puzzle-page__header">
        <p className="puzzle-theme">New puzzle</p>
        <h1>Create Puzzle</h1>
        <p>Choose a topic, difficulty, and size. We will handle the rest.</p>
      </header>
      <form className="puzzle-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend><span className="form-step">01</span> Topic</legend>
          <p className="fieldset-hint">What should your crossword be about?</p>
          <div className="choice-grid">
            {TOPICS.map((topic) => (
              <label key={topic} className={`choice-control${selectedTopic === topic ? ' choice-control--selected' : ''}`}>
                <input type="radio" name="topic" value={topic} checked={selectedTopic === topic} onChange={() => setSelectedTopic(topic)} />
                <span>{topic}</span>
              </label>
            ))}
            <label className={`choice-control${isCustomTopic ? ' choice-control--selected' : ''}`}>
              <input type="radio" name="topic" value="custom" checked={isCustomTopic} onChange={() => setSelectedTopic('custom')} />
              <span>Custom topic</span>
            </label>
          </div>
          {isCustomTopic && (
            <label className="custom-topic-input">
              <span>Custom topic</span>
              <input aria-describedby="custom-topic-help" aria-invalid={Boolean(error && !customTopic.trim())} id="custom-topic" type="text" value={customTopic} onChange={(event) => setCustomTopic(event.target.value)} placeholder="Formula 1 racing" autoFocus />
              <span className="input-hint" id="custom-topic-help">Keep it specific for a more focused puzzle.</span>
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend><span className="form-step">02</span> Difficulty</legend>
          <p className="fieldset-hint">How much of a challenge are you after?</p>
          <div className="choice-grid choice-grid--compact">
            {(['easy', 'medium', 'hard'] as const).map((option) => (
              <label key={option} className={`choice-control${difficulty === option ? ' choice-control--selected' : ''}`}>
                <input type="radio" name="difficulty" value={option} checked={difficulty === option} onChange={() => setDifficulty(option)} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend><span className="form-step">03</span> Puzzle size</legend>
          <p className="fieldset-hint">How much grid do you want to tackle?</p>
          <div className="choice-grid choice-grid--compact">
            {(Object.entries(SIZES) as [PuzzleSize, (typeof SIZES)[PuzzleSize]][]).map(([value, option]) => (
              <label key={value} className={`choice-control${size === value ? ' choice-control--selected' : ''}`}>
                <input type="radio" name="size" value={value} checked={size === value} onChange={() => setSize(value)} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="puzzle-state puzzle-state--error" role="alert">{error}</p>}
        {isGenerating && <p className="puzzle-state" role="status">Generating your puzzle...</p>}
        <button className="primary-action generate-action" type="submit" disabled={isGenerating}>{isGenerating ? 'Generating...' : 'Generate Puzzle'}</button>
      </form>
    </main>
  )
}