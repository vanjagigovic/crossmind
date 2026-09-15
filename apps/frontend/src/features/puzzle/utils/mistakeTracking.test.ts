import { describe, expect, it } from 'vitest'
import { countMistakes, trackMistake } from './mistakeTracking'

describe('mistakeTracking', () => {
  it('counts the first incorrect entry for a cell', () => {
    const result = trackMistake(new Set(), '0-0', true)

    expect(countMistakes(result)).toBe(1)
  })

  it('does not count another incorrect entry for the same cell', () => {
    const first = trackMistake(new Set(), '0-0', true)
    const second = trackMistake(first, '0-0', true)

    expect(countMistakes(second)).toBe(1)
  })

  it('does not add a mistake when the entered letter is correct', () => {
    const result = trackMistake(new Set(), '0-0', false)

    expect(countMistakes(result)).toBe(0)
  })

  it('does not add another mistake when an incorrect cell is corrected', () => {
    const incorrect = trackMistake(new Set(), '0-0', true)
    const corrected = trackMistake(incorrect, '0-0', false)

    expect(countMistakes(corrected)).toBe(1)
  })

  it('does not add another mistake when an incorrect cell is cleared', () => {
    const incorrect = trackMistake(new Set(), '0-0', true)
    const cleared = trackMistake(incorrect, '0-0', false)

    expect(countMistakes(cleared)).toBe(1)
  })

  it('counts mistakes independently for different cells', () => {
    let mistakes = new Set<string>()

    mistakes = new Set(trackMistake(mistakes, '0-0', true))
    mistakes = new Set(trackMistake(mistakes, '0-1', true))

    expect(countMistakes(mistakes)).toBe(2)
  })
})