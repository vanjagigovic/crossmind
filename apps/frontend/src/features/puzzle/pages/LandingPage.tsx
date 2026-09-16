import { useTranslation } from "react-i18next"


export function LandingPage() {

  const { t } = useTranslation()
  return (
    <main className="landing-page">
      <div className="landing-page__content">
        <p className="landing-page__eyebrow">{t('landing.eyebrow')}</p>
        <h1>CrossMind</h1>
        <p className="landing-page__intro">{t('landing.intro')}</p>
        <a className="primary-action" href="/create"> {t('common.createPuzzle')}</a>
      </div>
      <div className="landing-page__preview" aria-label="A crossword puzzle preview" role="img">
        <div className="crossword-preview__label">{t('landing.previewLabel')}</div>
        <div className="crossword-preview" aria-hidden="true">
          {['C', '', 'R', '', 'S', '', '', 'M', 'I', 'N', 'D', '', 'S', '', ''].map((letter, index) => (
            <span className={letter ? 'crossword-preview__cell' : 'crossword-preview__cell crossword-preview__cell--blocked'} key={`${letter}-${index}`}>
              {letter}
            </span>
          ))}
        </div>
        <p className="crossword-preview__caption">{t('landing.previewCaption')}</p>
      </div>
    </main>
  )
}