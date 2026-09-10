import './App.css'
import { CreatePuzzlePage } from './features/puzzle/pages/CreatePuzzlePage'
import { LandingPage } from './features/puzzle/pages/LandingPage'
import { PuzzlePage } from './features/puzzle/pages/PuzzlePage'
import { PuzzleResultPage } from './features/puzzle/pages/PuzzleResultPage'

function App() {
  const pathname = window.location.pathname
  const resultMatch = pathname.match(/^\/puzzles?\/([^/]+)\/result\/?$/)
  const puzzleMatch = pathname.match(/^\/puzzles?\/([^/]+)\/?$/)
  const puzzleId = puzzleMatch ? decodeURIComponent(puzzleMatch[1]) : undefined

  if (pathname === '/') {
    return <LandingPage />
  }

  if (pathname === '/create') {
    return <CreatePuzzlePage />
  }

  if (resultMatch) {
    return <PuzzleResultPage puzzleId={decodeURIComponent(resultMatch[1])} />
  }

  return (
    <div className="app">
      <PuzzlePage puzzleId={puzzleId} />
    </div>
  )
}

export default App
