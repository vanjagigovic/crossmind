import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CrosswordGrid } from './CrosswordGrid';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('CrosswordGrid', () => {
  it.each(['ñ', 'č'])('accepts the localized letter %s', (letter) => {
    const onComplete = vi.fn();

    render(
      <CrosswordGrid
        grid={{
          rows: 1,
          cols: 1,
          cells: [
            [
              {
                row: 0,
                col: 0,
                letter: letter.toUpperCase(),
                isBlocked: false,
              },
            ],
          ],
          placements: [
            {
              word: { answer: letter.toUpperCase(), clue: 'A localized word' },
              row: 0,
              col: 0,
              direction: 'across',
            },
          ],
        }}
        selectedCell={{ row: 0, col: 0 }}
        activeDirection="across"
        onSelectionChange={vi.fn()}
        onComplete={onComplete}
      />,
    );

    fireEvent.keyDown(screen.getByRole('gridcell'), { key: letter });

    expect(screen.getByRole('gridcell').textContent).toContain(
      letter.toUpperCase(),
    );
    expect(onComplete).toHaveBeenCalledWith({
      elapsedSeconds: expect.any(Number),
      mistakes: 0,
    });
  });
});
