import { Route, Routes, useParams } from 'react-router-dom'
import { CreatePuzzlePage } from './features/puzzle/pages/CreatePuzzlePage'
import { LandingPage } from './features/puzzle/pages/LandingPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import { PuzzlePage } from './features/puzzle/pages/PuzzlePage'
import { PuzzleResultPage } from './features/puzzle/pages/PuzzleResultPage'

function PuzzleRoute() {
  const { puzzleId } = useParams<{ puzzleId: string }>()

  return <PuzzlePage puzzleId={puzzleId} />
}

function PuzzleResultRoute() {
  const { puzzleId } = useParams<{ puzzleId: string }>()

  return <PuzzleResultPage puzzleId={puzzleId ?? ''} />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/create" element={<CreatePuzzlePage />} />
      <Route path="/puzzle/:puzzleId" element={<PuzzleRoute />} />
      <Route path="/puzzle/:puzzleId/result" element={<PuzzleResultRoute />} />
    </Routes>
  )
}