import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'sr', label: 'Srpski', flag: '🇷🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
] as const

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  const currentLanguage =
    LANGUAGES.find((language) => language.code === i18n.language) ??
    LANGUAGES[0]

  function handleLanguageChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    void i18n.changeLanguage(event.target.value)
  }

  return (
    <div className="language-switcher">
      <span
        className="language-switcher__flag"
        aria-hidden="true"
      >
        {currentLanguage.flag}
      </span>

      <select
        value={i18n.language}
        onChange={handleLanguageChange}
        aria-label={t('common.language')}
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  )
}