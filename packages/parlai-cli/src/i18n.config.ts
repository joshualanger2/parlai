export const defaultNS = 'translation';
export const fallbackLng = 'en';

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    supportedLngs: ['en'],
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns
  };
}