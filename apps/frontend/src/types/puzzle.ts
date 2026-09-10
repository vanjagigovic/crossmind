export type Direction = 'across' | 'down'

export type CrosswordWord = {
  answer: string
  clue: string
}

export type GridCell = {
  row: number
  col: number
  letter: string | null
  isBlocked: boolean
}

export type CrosswordGrid = {
  rows: number
  cols: number
  cells: GridCell[][]
  placements: WordPlacement[]
}

export type WordPlacement = {
  word: CrosswordWord
  row: number
  col: number
  direction: Direction
}

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard'

export type PuzzleStatus =
  | 'draft'
  | 'generating'
  | 'ready'
  | 'published'
  | 'archived'

export type Puzzle = {
  id: string
  title: string
  theme: string
  difficulty: PuzzleDifficulty
  status: PuzzleStatus
  rows: number
  columns: number
  grid: CrosswordGrid
  entries: PuzzleEntry[]
}

export type PuzzleEntry = {
  id: string
  puzzleId: string
  word: string
  clue: string
  direction: Direction
  row: number
  column: number
  length: number
  number: number
}