import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import auth from './locales/en/auth.json'
import common from './locales/en/common.json'
import dashboard from './locales/en/dashboard.json'
import errors from './locales/en/errors.json'
import navigation from './locales/en/navigation.json'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    resources: {
      en: { auth, common, dashboard, errors, navigation },
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
