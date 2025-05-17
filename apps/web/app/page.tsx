// This file will redirect to the appropriate language
// Real root page is in /[lang]/page.tsx

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const SUPPORTED_LANGS = ['en', 'it', 'ja'];

export default async function Home() {
    const h = await headers();
    const acceptLang = h.get('accept-language') || '';
    let lang: string = 'en';
    if (acceptLang) {
        // Parse the Accept-Language header and find the first supported language
        const preferred = acceptLang
            .split(',')
            .map(l => l.split(';')[0]?.trim())
            .filter(Boolean);
        const found = preferred.find(l =>
            SUPPORTED_LANGS.includes(l?.split('-')[0] || '')
        );
        if (found) {
            const candidate = found.split('-')[0];
            lang = SUPPORTED_LANGS.includes(candidate) ? candidate : 'en';
        }
    }
    redirect(`/${lang}`);
    return null;
}
