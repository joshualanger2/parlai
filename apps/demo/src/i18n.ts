'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions } from '@/i18n.config';

// Initialize i18next instance
i18n
  .use(initReactI18next)
  .use(resourcesToBackend((language: string) => import(`../locales/${language}.json`)))
  .init({
    ...getOptions(),
    interpolation: {
      escapeValue: false, // React already escapes
    },
    returnNull: false,
    returnEmptyString: false,
    fallbackLng: 'en',
    load: 'languageOnly'
  });

export default i18n; 