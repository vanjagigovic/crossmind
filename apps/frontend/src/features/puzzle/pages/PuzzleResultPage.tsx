import { useTranslation } from 'react-i18next'
import { getPuzzleSessionResult } from '../utils/puzzleSessionResult'
import { formatElapsedTime } from '../utils/timerUtils'

type PuzzleResultPageProps = {
  puzzleId: string
}

export function PuzzleResultPage({ puzzleId }: PuzzleResultPageProps) {
  const { t } = useTranslation();
  const result = getPuzzleSessionResult(puzzleId)

  if (!result) {
    return (
      <main className="puzzle-result-page">
        <p className="puzzle-state puzzle-state--error">{t('result.noSession')}</p>
        <a className="primary-action" href="/create">{t('result.createNewPuzzle')}</a>
      </main>
    )
  }

  return (
    <main className="puzzle-result-page">
      <p className="puzzle-theme">{t('result.completed')}</p>
      <h1>{t('result.title')}</h1>
      <dl className="puzzle-result">
        <div><dt>Score</dt><dd>{result.score.toLocaleString()}</dd></div>
        <div><dt>Time</dt><dd>{formatElapsedTime(result.elapsedSeconds)}</dd></div>
        <div><dt>Mistakes</dt><dd>{result.mistakes}</dd></div>
      </dl>
      <div className="puzzle-result-actions">
        <a className="primary-action" href="/create">{t('result.playAgain')}</a>
        <a className="secondary-action" href="/create">{t('result.createNewPuzzle')}</a>
      </div>
    </main>
  )
}