'use client';
import Image, { type ImageProps } from 'next/image';
import { Button } from '@/components/ui/button';
import { Copy, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const localeMap = {
    en: () => import('../locales/en.json').then(m => m.default),
    it: () => import('../locales/it.json').then(m => m.default),
    ja: () => import('../locales/ja.json').then(m => m.default)
};

type Props = Omit<ImageProps, 'src'> & {
    srcLight: string;
    srcDark: string;
};

const ThemeImage = (props: Props) => {
    const { srcLight, srcDark, ...rest } = props;
    return (
        <>
            <Image {...rest} src={srcLight} className="imgLight" />
            <Image {...rest} src={srcDark} className="imgDark" />
        </>
    );
};

export default function Home() {
    const params = useParams();
    const lang = typeof params.lang === 'string' ? params.lang : 'en';
    const [strings, setStrings] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        (async () => {
            const load =
                localeMap[lang as keyof typeof localeMap] || localeMap.en;
            setStrings(await load());
        })();
    }, [lang]);

    if (!strings) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText('npm install parlai');
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center">
                <main className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-center gap-12 px-6 md:px-10 py-12">
                    {/* Left: Hero text and actions */}
                    <section className="flex-1 flex flex-col items-center md:items-start gap-8 max-w-xl text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                            {strings.header}
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl">
                            {strings.subheader}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
                            <Button
                                asChild
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                <a href="/docs">{strings.exploreDocs}</a>
                            </Button>
                            <div className="flex items-center bg-muted border rounded-md px-3 py-2 gap-2 text-sm font-mono w-full sm:w-auto justify-between">
                                <span>{strings.npmInstall}</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleCopy}
                                    aria-label="Copy npm install"
                                >
                                    <Copy className="size-4" />
                                    <span className="sr-only">Copy</span>
                                </Button>
                                {copied && (
                                    <span className="text-xs text-green-600 ml-2">
                                        {strings.copied}
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Right: Code file preview */}
                    <section className="flex-1 w-full max-w-lg flex flex-col items-center md:items-end mt-10 md:mt-0 p-8">
                        <div className="w-full bg-card border rounded-lg shadow-lg overflow-hidden font-mono text-sm">
                            <div className="flex items-center gap-2 bg-muted border-b px-4 py-2">
                                <FileText className="size-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground ">
                                    {lang}.json
                                </span>
                            </div>
                            <pre className="px-4 py-4 text-left whitespace-pre-wrap text-foreground bg-card">
                                {JSON.stringify(strings, null, 2)}
                            </pre>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
