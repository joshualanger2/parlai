'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

/**
 * Parlai Configuration
 * -------------------
 * This file manages your app's internationalization setup.
 * Created and managed by Parlai (https://github.com/your-org/parlai)
 * 
 * Commands:
 * - parlai extract: Extract strings from your components
 * - parlai translate: Add new languages to your app
 */

export const parlaiConfig = {
  // Default language for your app
  defaultLanguage: 'en',
  
  // Directory where translation files are stored (relative to this file)
  localesDir: './locales',
  
  // Currently supported languages
  // More languages will be added here when you run 'parlai translate'
  supportedLanguages: ['en'],

  // Namespace for translations
  defaultNamespace: 'translation',

  // Whether to load only language code (en) or full locale (en-US)
  loadLocaleFrom: 'languageOnly' as const
};

// Initialize i18next instance
i18n
  .use(initReactI18next)
  .use(resourcesToBackend((language: string) => 
    import(`${parlaiConfig.localesDir}/${language}.json`)))
  .init({
    lng: parlaiConfig.defaultLanguage,
    fallbackLng: parlaiConfig.defaultLanguage,
    supportedLngs: parlaiConfig.supportedLanguages,
    defaultNS: parlaiConfig.defaultNamespace,
    fallbackNS: parlaiConfig.defaultNamespace,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    load: parlaiConfig.loadLocaleFrom
  });

// Provider component for wrapping your app
export function ParlaiProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!i18n.isInitialized) {
        await i18n.init();
      }
      setInitialized(true);
    };

    init();
  }, []);

  if (!initialized) {
    return null; // or a loading spinner
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}

// Export initialized i18n instance for advanced use cases
export default i18n;