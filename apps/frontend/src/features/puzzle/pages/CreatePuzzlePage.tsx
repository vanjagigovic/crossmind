import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { generatePuzzle } from '../../../api/puzzles'
import type { PuzzleDifficulty } from '../../../types/puzzle'

const TOPICS = [
  'programming',
  'travel',
  'animals',
  'movies',
  'science',
  'history',
  'sports',
  'food',
] as const

const SIZES = {
  small: {
    label: 'createPuzzle.size.small',
    rows: 11,
    columns: 11,
    wordCount: 5,
  },
  medium: {
    label: 'createPuzzle.size.medium',
    rows: 13,
    columns: 13,
    wordCount: 7,
  },
  large: {
    label: 'createPuzzle.size.large',
    rows: 15,
    columns: 15,
    wordCount: 9,
  },
} as const

type Topic = (typeof TOPICS)[number] | 'custom'
type PuzzleSize = keyof typeof SIZES

export function CreatePuzzlePage() {
  const { t } = useTranslation()

  const [selectedTopic, setSelectedTopic] = useState<Topic>(TOPICS[0])
  const [customTopic, setCustomTopic] = useState('')
  const [difficulty, setDifficulty] =
    useState<PuzzleDifficulty>('medium')
  const [size, setSize] = useState<PuzzleSize>('medium')
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const isCustomTopic = selectedTopic === 'custom'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const theme = isCustomTopic ? customTopic.trim() : selectedTopic

    if (!theme) {
      setError(t('createPuzzle.topic.error'))
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
      setError(t('createPuzzle.error'))
      setIsGenerating(false)
    }
  }

  return (
    <main className="create-puzzle-page">
      <header className="create-puzzle-page__header">
        <p className="puzzle-theme">{t('common.newPuzzle')}</p>

        <h1>{t('createPuzzle.title')}</h1>

        <p>{t('createPuzzle.description')}</p>
      </header>

      <form className="puzzle-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>
            <span className="form-step">01</span>{' '}
            {t('createPuzzle.topic.title')}
          </legend>

          <p className="fieldset-hint">
            {t('createPuzzle.topic.hint')}
          </p>

          <div className="choice-grid">
            {TOPICS.map((topic) => (
              <label
                key={topic}
                className={`choice-control${selectedTopic === topic
                    ? ' choice-control--selected'
                    : ''
                  }`}
              >
                <input
                  type="radio"
                  name="topic"
                  value={topic}
                  checked={selectedTopic === topic}
                  onChange={() => setSelectedTopic(topic)}
                />

                <span>{t(`topics.${topic}`)}</span>
              </label>
            ))}

            <label
              className={`choice-control${isCustomTopic
                  ? ' choice-control--selected'
                  : ''
                }`}
            >
              <input
                type="radio"
                name="topic"
                value="custom"
                checked={isCustomTopic}
                onChange={() => setSelectedTopic('custom')}
              />

              <span>{t('createPuzzle.topic.customLabel')}</span>
            </label>
          </div>

          {isCustomTopic && (
            <label className="custom-topic-input">
              <span>{t('createPuzzle.topic.customLabel')}</span>

              <input
                aria-describedby="custom-topic-help"
                aria-invalid={Boolean(error && !customTopic.trim())}
                id="custom-topic"
                type="text"
                value={customTopic}
                onChange={(event) =>
                  setCustomTopic(event.target.value)
                }
                placeholder={t('createPuzzle.topic.placeholder')}
                autoFocus
              />

              <span
                className="input-hint"
                id="custom-topic-help"
              >
                {t('createPuzzle.topic.inputHint')}
              </span>
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend>
            <span className="form-step">02</span>{' '}
            {t('createPuzzle.difficulty.title')}
          </legend>

          <p className="fieldset-hint">
            {t('createPuzzle.difficulty.hint')}
          </p>

          <div className="choice-grid choice-grid--compact">
            {(['easy', 'medium', 'hard'] as const).map(
              (option) => (
                <label
                  key={option}
                  className={`choice-control${difficulty === option
                      ? ' choice-control--selected'
                      : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={option}
                    checked={difficulty === option}
                    onChange={() => setDifficulty(option)}
                  />

                  <span>
                    {t(`createPuzzle.difficulty.${option}`)}
                  </span>
                </label>
              ),
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <span className="form-step">03</span>{' '}
            {t('createPuzzle.size.title')}
          </legend>

          <p className="fieldset-hint">
            {t('createPuzzle.size.hint')}
          </p>

          <div className="choice-grid choice-grid--compact">
            {(
              Object.entries(SIZES) as [
                PuzzleSize,
                (typeof SIZES)[PuzzleSize],
              ][]
            ).map(([value]) => (
              <label
                key={value}
                className={`choice-control${size === value
                    ? ' choice-control--selected'
                    : ''
                  }`}
              >
                <input
                  type="radio"
                  name="size"
                  value={value}
                  checked={size === value}
                  onChange={() => setSize(value)}
                />

                <span>{t(`createPuzzle.size.${value}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p
            className="puzzle-state puzzle-state--error"
            role="alert"
          >
            {error}
          </p>
        )}

        {isGenerating && (
          <p className="puzzle-state" role="status">
            {t('createPuzzle.generating')}
          </p>
        )}

        <button
          className="primary-action generate-action"
          type="submit"
          disabled={isGenerating}
        >
          {isGenerating
            ? t('common.generating')
            : t('common.generatePuzzle')}
        </button>
      </form>
    </main>
  )
}