export function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-page__content">
        <p className="landing-page__eyebrow">A crossword for your curiosity</p>
        <h1>CrossMind</h1>
        <p className="landing-page__intro">Choose a topic, pick your challenge, and CrossMind will build a crossword made for you.</p>
        <a className="primary-action" href="/create">Create Puzzle</a>
      </div>
      <div className="landing-page__preview" aria-label="A crossword puzzle preview" role="img">
        <div className="crossword-preview__label">Your next puzzle</div>
        <div className="crossword-preview" aria-hidden="true">
          {['C', '', 'R', '', 'S', '', '', 'M', 'I', 'N', 'D', '', 'S', '', ''].map((letter, index) => (
            <span className={letter ? 'crossword-preview__cell' : 'crossword-preview__cell crossword-preview__cell--blocked'} key={`${letter}-${index}`}>
              {letter}
            </span>
          ))}
        </div>
        <p className="crossword-preview__caption">A fresh grid, shaped around what you want to explore.</p>
      </div>
    </main>
  )
}