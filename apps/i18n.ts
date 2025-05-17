'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions } from './i18n.config';

// Initialize i18next for the application
i18n
  .use(initReactI18next)
  .use(resourcesToBackend((lng) => import(`./locales/${lng}.json`)))
  .init(getOptions());

export default i18n;