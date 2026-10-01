import { useState } from 'react';

import { generatePuzzle, getPuzzle } from '../../../api/puzzles';
import { getPuzzleSessionResult } from '../utils/puzzleSessionResult';
import { formatElapsedTime } from '../utils/timerUtils';
import { Link, useNavigate } from 'react-router-dom';

type PuzzleResultPageProps = {
  puzzleId: string;
};

export function PuzzleResultPage({ puzzleId }: PuzzleResultPageProps) {
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
      setError('We could not generate the puzzle again. Please try again.');
      setIsPlayingAgain(false);
    }
  }

  if (!result) {
    return (
      <main className="puzzle-result-page">
        <p className="puzzle-state puzzle-state--error">
          No completed puzzle session was found.
        </p>
        <Link className="primary-action" to="/create">
          Create New Puzzle
        </Link>
      </main>
    );
  }

  return (
    <main className="puzzle-result-page">
      <p className="puzzle-theme">Puzzle completed!</p>
      <h1>Great work</h1>

      <dl className="puzzle-result">
        <div>
          <dt>Score</dt>
          <dd>{result.score.toLocaleString()}</dd>
        </div>

        <div>
          <dt>Time</dt>
          <dd>{formatElapsedTime(result.elapsedSeconds)}</dd>
        </div>

        <div>
          <dt>Mistakes</dt>
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
          {isPlayingAgain ? 'Generating...' : 'Play Again'}
        </button>

        <Link className="secondary-action" to="/create">
          Create New Puzzle
        </Link>
      </div>
    </main>
  );
}
