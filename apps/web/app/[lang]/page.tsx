'use client';
import Image, { type ImageProps } from 'next/image';
import { Button } from '@/components/ui/button';
import { Copy, FileText, ArrowRight, Check, Undo2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { SiReact } from 'react-icons/si';

const localeMap = {
    en: () => import('../locales/en.json').then(m => m.default),
    it: () => import('../locales/it.json').then(m => m.default),
    ja: () => import('../locales/ja.json').then(m => m.default),
    pt: () => import('../locales/pt.json').then(m => m.default),
    ar: () => import('../locales/ar.json').then(m => m.default),
    th: () => import('../locales/th.json').then(m => m.default),
    hi: () => import('../locales/hi.json').then(m => m.default),
    de: () => import('../locales/de.json').then(m => m.default),
    fr: () => import('../locales/fr.json').then(m => m.default),
    val: () => import('../locales/val.json').then(m => m.default)
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

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'th', label: 'ไทย', flag: '🇹🇭' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'val', label: 'High Valyrian', flag: '🐉' }
];

const SIMPLE_DUMMY_REACT = `import React from 'react';

export default function Hero() {
  return (
    <section>
      <h1>Translate your React app in minutes.</h1>
      <p>Parlai is an open-source widget that helps you internationalize your app with zero config and AI-powered translations—right inside your dev environment.</p>
      <Button>Explore docs</Button>
      <div>npm install parlai</div>
    </section>
  );
}`;

const SIMPLE_I18N_REACT = `import React from 'react';
import { useTranslations } from '@/i18n';

export default function Hero() {
  const t = useTranslations();
  return (
    <section>
      <h1>{t('header')}</h1>
      <p>{t('subheader')}</p>
      <Button>{t('exploreDocs')}</Button>
      <div>{t('npmInstall')} <Button>{t('copied')}</Button></div>
    </section>
  );
}`;

// Helper to add line numbers to code (with optional extra lines)
function withLineNumbers(code: string, extraLines = 0) {
    const lines = code.split('\n');
    const totalLines = lines.length + extraLines;
    return (
        <code className="flex text-left">
            <span className="select-none text-muted-foreground pr-4 text-right">
                {Array.from({ length: totalLines }).map((_, i) => (
                    <span key={i} className="block leading-snug">
                        {i + 1}
                    </span>
                ))}
            </span>
            <span className="flex-1">
                {lines.map((line, i) => (
                    <span key={i} className="block leading-snug">
                        {line}
                    </span>
                ))}
                {/* Add empty lines for realism if extraLines > 0 */}
                {Array.from({ length: extraLines }).map((_, i) => (
                    <span key={lines.length + i} className="block leading-snug">
                        {' '}
                    </span>
                ))}
            </span>
        </code>
    );
}

// Helper to escape < and > for code display
function escapeHtml(code: string) {
    return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Helper to highlight only the copy and variable text in the .tsx file in pink
function highlightReactCodeSimple(code: string, i18nMode: boolean) {
    // First, escape all < and > so tags show as text
    let escaped = escapeHtml(code);
    if (!i18nMode) {
        // Highlight only the text between tags (now &gt;text&lt;)
        return escaped.replace(
            /&gt;([^&<>{}\n]+)&lt;/g,
            (match, p1) => `&gt;<span class='text-pink-500'>${p1}</span>&lt;`
        );
    } else {
        // Highlight only the variable inside t('...')
        return escaped.replace(
            /t\('([^']+?)'\)/g,
            (match, p1) => `t('<span class='text-pink-500'>${p1}</span>')`
        );
    }
}

// Helper to render highlighted code with line numbers, HTML, and indentation
function withLineNumbersHTMLIndented(code: string, extraLines = 0) {
    const lines = code.split('\n');
    const totalLines = lines.length + extraLines;
    return (
        <code className="flex text-left">
            <span className="select-none text-muted-foreground pr-4 text-right">
                {Array.from({ length: totalLines }).map((_, i) => (
                    <span key={i} className="block leading-snug">
                        {i + 1}
                    </span>
                ))}
            </span>
            <span className="flex-1">
                {lines.map((line, i) => {
                    // Count leading spaces for indentation
                    const match = line.match(/^(\s*)/);
                    const indent = Number(match?.[1]?.length) || 0;
                    return (
                        <span
                            key={i}
                            className="block leading-snug"
                            style={{ paddingLeft: `${indent * 0.6}ch` }}
                            dangerouslySetInnerHTML={{ __html: line }}
                        />
                    );
                })}
                {/* Add empty lines for realism if extraLines > 0 */}
                {Array.from({ length: extraLines }).map((_, i) => (
                    <span key={lines.length + i} className="block leading-snug">
                        {' '}
                    </span>
                ))}
            </span>
        </code>
    );
}

export default function Home() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const lang = typeof params.lang === 'string' ? params.lang : 'en';
    const [heroLang, setHeroLang] = useState<string>(lang);
    const [strings, setStrings] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [i18nMode, setI18nMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'react' | string>('react');
    const [openedLangs, setOpenedLangs] = useState<string[]>([]);
    const tabListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            const load =
                localeMap[heroLang as keyof typeof localeMap] || localeMap.en;
            setStrings(await load());
        })();
    }, [heroLang]);

    // When URL lang changes, update heroLang
    useEffect(() => {
        setHeroLang(lang);
    }, [lang]);

    if (!strings) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText('npm install parlai');
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };

    // For tab content
    const localeFiles = {
        en: require('../locales/en.json'),
        it: require('../locales/it.json'),
        ja: require('../locales/ja.json'),
        pt: require('../locales/pt.json'),
        ar: require('../locales/ar.json'),
        th: require('../locales/th.json'),
        hi: require('../locales/hi.json'),
        de: require('../locales/de.json'),
        fr: require('../locales/fr.json'),
        val: require('../locales/val.json')
    };

    // Tabs: always React file, then openedLangs .json files
    const tabs = [
        {
            key: 'react',
            label: 'Hero.tsx',
            icon: <SiReact className="inline mr-1 text-sky-500" size={16} />,
            type: 'react'
        },
        ...openedLangs.map(code => {
            const lang = LANGUAGES.find(l => l.code === code);
            return {
                key: code,
                label: `${lang ? lang.flag + ' ' + lang.label : code + '.json'}`,
                type: 'json',
                icon: null
            };
        })
    ];

    // Remove a language tab
    function closeTab(code: string) {
        setOpenedLangs(prev => prev.filter(l => l !== code));
        setTimeout(() => {
            setActiveTab('react');
        }, 0);
    }

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center">
                <main className="w-full max-w-7xl flex flex-col px-6 md:px-10 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                        {/* Left: Hero text and actions */}
                        <section className="flex-1 flex flex-col items-center md:items-start gap-8 max-w-xl text-center md:text-left">
                            {/* Back to English pill button (blue, small, with revert arrow) */}
                            {heroLang !== 'en' && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-full px-3 py-1 mb-2 self-center md:self-start text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 border-none shadow-none"
                                    onClick={() => {
                                        setHeroLang('en');
                                        setI18nMode(false);
                                    }}
                                >
                                    <Undo2 className="size-4 mr-1" />
                                    Revert to original
                                </Button>
                            )}
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                                {strings.header}
                            </h1>
                            <p className="text-muted-foreground text-lg md:text-xl">
                                {strings.subheader}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center md:justify-start">
                                <div className="flex w-full gap-4 flex-col sm:flex-row">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="flex-1 flex items-center justify-between w-full !bg-black !text-white dark:!bg-white dark:!text-black h-12 px-6 text-base font-semibold transition-colors"
                                        style={{ minHeight: '48px' }}
                                    >
                                        <a
                                            href="/docs"
                                            className="flex items-center justify-between w-full"
                                        >
                                            <span>{strings.exploreDocs}</span>
                                            <ArrowRight className="ml-2 size-5" />
                                        </a>
                                    </Button>
                                    <div
                                        className="flex items-center bg-muted border rounded-md px-4 h-12 text-sm font-mono w-full sm:w-auto justify-between min-w-0 flex-shrink-0"
                                        style={{ minHeight: '48px' }}
                                    >
                                        <span className="truncate">
                                            {strings.npmInstall}
                                        </span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={handleCopy}
                                            aria-label="Copy npm install"
                                            className="ml-2"
                                        >
                                            <Copy className="size-4" />
                                            <span className="sr-only">
                                                Copy
                                            </span>
                                        </Button>
                                        {copied && (
                                            <span className="text-xs text-green-600 ml-2">
                                                {strings.copied}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* Right: Code file preview UI */}
                        <section className="flex-1 w-full max-w-lg flex flex-col items-center md:items-end mt-10 md:mt-0">
                            <div className="w-full bg-card border rounded-lg shadow-lg overflow-hidden font-mono text-sm">
                                {/* Tabs for code files */}
                                <div
                                    className="flex overflow-x-auto border-b bg-muted"
                                    style={{ maxWidth: '100%' }}
                                    ref={tabListRef}
                                >
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.key}
                                            className={`relative px-4 py-2 whitespace-nowrap border-b-2 transition-colors flex items-center ${activeTab === tab.key ? 'border-primary text-primary font-bold bg-background' : 'border-transparent text-muted-foreground'}`}
                                            onClick={() =>
                                                setActiveTab(tab.key)
                                            }
                                        >
                                            {tab.icon || null} {tab.label}
                                            {tab.type === 'json' && (
                                                <span
                                                    className="ml-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        closeTab(tab.key);
                                                    }}
                                                    aria-label={`Close ${tab.label}`}
                                                >
                                                    ×
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {/* Code preview area */}
                                <div
                                    className="relative"
                                    style={{
                                        height: 360,
                                        minHeight: 200,
                                        maxHeight: 400,
                                        overflow: 'auto'
                                    }}
                                >
                                    <div className="flex items-center gap-2 bg-muted border-b px-4 py-2">
                                        {activeTab === 'react' ? (
                                            <SiReact className="size-4 text-sky-500" />
                                        ) : (
                                            <FileText className="size-4 text-muted-foreground" />
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {activeTab === 'react'
                                                ? 'Hero.tsx'
                                                : `${activeTab}.json`}
                                        </span>
                                    </div>
                                    <div className="px-4 py-4 bg-card overflow-x-auto max-w-full h-full">
                                        {activeTab === 'react'
                                            ? withLineNumbersHTMLIndented(
                                                  highlightReactCodeSimple(
                                                      i18nMode
                                                          ? SIMPLE_I18N_REACT
                                                          : SIMPLE_DUMMY_REACT,
                                                      i18nMode
                                                  ),
                                                  3 // add a few extra lines for realism
                                              )
                                            : withLineNumbersHTMLIndented(
                                                  // Indent everything inside the braces
                                                  (() => {
                                                      const json =
                                                          JSON.stringify(
                                                              localeFiles[
                                                                  activeTab as keyof typeof localeFiles
                                                              ],
                                                              null,
                                                              2
                                                          );
                                                      // Add extra indent to everything except first/last line
                                                      const lines =
                                                          json.split('\n');
                                                      return [
                                                          lines[0],
                                                          ...lines
                                                              .slice(1, -1)
                                                              .map(
                                                                  l => '  ' + l
                                                              ),
                                                          lines[
                                                              lines.length - 1
                                                          ]
                                                      ].join('\n');
                                                  })(),
                                                  5 // add more line numbers for realism
                                              )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    {/* Translate to buttons row (below hero/code preview) */}
                    <div className="flex flex-col items-center w-full mt-8">
                        <span className="mb-3 text-base font-medium text-muted-foreground">
                            Translate to:
                        </span>
                        <div className="flex flex-wrap justify-center gap-2 w-full max-w-2xl">
                            {LANGUAGES.filter(l => l.code !== 'en').map(
                                langObj => {
                                    const isOpened = openedLangs.includes(
                                        langObj.code
                                    );
                                    return (
                                        <Button
                                            key={langObj.code}
                                            variant={
                                                isOpened
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isOpened ? '!bg-black !text-white dark:!bg-white dark:!text-black' : ''}`}
                                            onClick={() => {
                                                setI18nMode(true);
                                                if (isOpened) {
                                                    setOpenedLangs(prev =>
                                                        prev.filter(
                                                            l =>
                                                                l !==
                                                                langObj.code
                                                        )
                                                    );
                                                    if (
                                                        activeTab ===
                                                        langObj.code
                                                    )
                                                        setActiveTab('react');
                                                    if (
                                                        heroLang ===
                                                        langObj.code
                                                    )
                                                        setHeroLang(lang);
                                                } else {
                                                    setOpenedLangs(prev => [
                                                        ...prev,
                                                        langObj.code
                                                    ]);
                                                    setTimeout(() => {
                                                        if (
                                                            tabListRef.current
                                                        ) {
                                                            tabListRef.current.scrollLeft = 1000;
                                                        }
                                                    }, 100);
                                                    setHeroLang(langObj.code);
                                                }
                                            }}
                                        >
                                            <span>{langObj.flag}</span>
                                            <span>{langObj.label}</span>
                                            {isOpened && (
                                                <Check className="ml-1 size-4" />
                                            )}
                                        </Button>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
