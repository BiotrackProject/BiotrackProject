import i18n, { type InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import es from './es.json'
import en from './en.json'

const options: InitOptions = {
  resources: {
    es: { translation: es as Record<string, unknown> },
    en: { translation: en as Record<string, unknown> },
  },
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
    lookupLocalStorage: 'biotrack_lang',
  },
}

// @ts-expect-error initImmediate is valid but missing from the type defs in this version
options.initImmediate = false

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(options)

export default i18n
