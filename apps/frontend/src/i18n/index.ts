import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './languages/en.json'
import sr from './languages/sr.json'
import es from './languages/es.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      sr: {
        translation: sr,
      },
      es: {
        translation: es,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n