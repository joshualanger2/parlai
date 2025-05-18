'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import i18next from '@/i18n';
import { I18nextProvider } from 'react-i18next';

export function I18nProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!i18next.isInitialized) {
        await i18next.init();
      }
      i18next.changeLanguage('es');
      setInitialized(true);
    };

    init();
    
  }, []);

  if (!initialized) {
    return null; // or a loading spinner
  }

  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
} 