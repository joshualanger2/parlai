export const fallbackLng = 'en';

export function getOptions(lng = fallbackLng) {
  return {
    supportedLngs: ['en', 'es'],
    fallbackLng,
    lng,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
    load: 'languageOnly'
  };
} 