import { get, post } from './client'
import type { Puzzle, PuzzleDifficulty } from '../types/puzzle'

export type GeneratePuzzleRequest = {
  title: string
  theme: string
  difficulty: PuzzleDifficulty
  rows: number
  columns: number
  wordCount: number
}

export function getPuzzle(id: string): Promise<Puzzle> {
  return get<Puzzle>(`/puzzles/${encodeURIComponent(id)}`)
}

export function generatePuzzle(data: GeneratePuzzleRequest): Promise<Puzzle> {
  return post<Puzzle>('/puzzles/generate', data)
}