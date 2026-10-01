import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { generatePuzzle, getPuzzle } from '../../../api/puzzles';
import { getPuzzleSessionResult } from '../utils/puzzleSessionResult';
import { formatElapsedTime } from '../utils/timerUtils';
import { Link, useNavigate } from 'react-router-dom';

type PuzzleResultPageProps = {
  puzzleId: string;
};

export function PuzzleResultPage({ puzzleId }: PuzzleResultPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const result = getPuzzleSessionResult(puzzleId);
  const [isPlayingAgain, setIsPlayingAgain] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePlayAgain() {
    setIsPlayingAgain(true);
    setError(null);

    try {
      const currentPuzzle = await getPuzzle(puzzleId);

      const puzzle = await generatePuzzle({
        title: `${currentPuzzle.theme} Crossword`,
        theme: currentPuzzle.theme,
        difficulty: currentPuzzle.difficulty,
        language: currentPuzzle.language,
        rows: currentPuzzle.rows,
        columns: currentPuzzle.columns,
        wordCount: currentPuzzle.entries.length,
      });

      navigate(`/puzzle/${encodeURIComponent(puzzle.id)}`);
    } catch {
      setError(t('result.playAgainError'));
      setIsPlayingAgain(false);
    }
  }

  if (!result) {
    return (
      <main className="puzzle-result-page">
        <p className="puzzle-state puzzle-state--error">
          {t('result.noSession')}
        </p>
        <Link className="primary-action" to="/create">
          {t('result.createNewPuzzle')}
        </Link>
      </main>
    );
  }

  return (
    <main className="puzzle-result-page">
      <p className="puzzle-theme">{t('result.completed')}</p>
      <h1>{t('result.title')}</h1>

      <dl className="puzzle-result">
        <div>
          <dt>{t('common.score')}</dt>
          <dd>{result.score.toLocaleString()}</dd>
        </div>

        <div>
          <dt>{t('common.time')}</dt>
          <dd>{formatElapsedTime(result.elapsedSeconds)}</dd>
        </div>

        <div>
          <dt>{t('common.mistakes')}</dt>
          <dd>{result.mistakes}</dd>
        </div>
      </dl>

      {error && (
        <p className="puzzle-state puzzle-state--error" role="alert">
          {error}
        </p>
      )}

      <div className="puzzle-result-actions">
        <button
          className="primary-action"
          type="button"
          onClick={handlePlayAgain}
          disabled={isPlayingAgain}
        >
          {isPlayingAgain ? t('common.generating') : t('result.playAgain')}
        </button>

        <Link className="secondary-action" to="/create">
          {t('result.createNewPuzzle')}
        </Link>
      </div>
    </main>
  );
}
