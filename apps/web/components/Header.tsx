'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Github, Globe, Menu } from 'lucide-react';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const GITHUB_URL = 'https://github.com/joshualanger2/parlai';

const languages = [
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

export function Header() {
    const [theme, setTheme] = useState('light');
    const [lang, setLang] = useState('en');
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const currentLang = pathname.split('/')[1] || 'en';

    // Simple theme toggle (replace with context/provider for real app)
    const toggleTheme = () => {
        setTheme(t => (t === 'light' ? 'dark' : 'light'));
        if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark');
        }
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-background/80 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="max-w-7xl mx-auto flex items-center px-6 md:px-10 py-3 md:py-2">
                {/* Logo */}
                <Link
                    href="/"
                    className="font-bold tracking-wider text-lg md:text-xl select-none flex-grow text-left"
                >
                    Parlai
                </Link>
                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-2 ml-auto">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/docs">Docs</Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Toggle dark mode"
                        onClick={toggleTheme}
                    >
                        {theme === 'dark' ? (
                            <Sun className="size-5" />
                        ) : (
                            <Moon className="size-5" />
                        )}
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label="GitHub repo"
                    >
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Github className="size-5" />
                        </a>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Change language"
                            >
                                <Globe className="size-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {languages.map(l => (
                                <DropdownMenuItem
                                    key={l.code}
                                    onClick={() => {
                                        if (l.code === 'en') {
                                            router.push('/');
                                        } else {
                                            router.push(`/${l.code}`);
                                        }
                                        setLang(l.code);
                                    }}
                                >
                                    <span className="mr-2">{l.flag}</span>{' '}
                                    {l.label}
                                    {currentLang === l.code && (
                                        <span className="ml-2 text-xs">✓</span>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {/* Mobile nav */}
                <div className="md:hidden flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMenuOpen(v => !v)}
                        aria-label="Open menu"
                    >
                        <Menu className="size-6" />
                    </Button>
                    {menuOpen && (
                        <div className="absolute right-4 top-14 bg-background border rounded-md shadow-lg flex flex-col gap-1 p-2 min-w-[160px] z-50">
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Link href="/docs">Docs</Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Toggle dark mode"
                                onClick={toggleTheme}
                            >
                                {theme === 'dark' ? (
                                    <Sun className="size-5" />
                                ) : (
                                    <Moon className="size-5" />
                                )}
                            </Button>
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                aria-label="GitHub repo"
                            >
                                <a
                                    href={GITHUB_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Github className="size-5" />
                                </a>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Change language"
                                    >
                                        <Globe className="size-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {languages.map(l => (
                                        <DropdownMenuItem
                                            key={l.code}
                                            onClick={() => {
                                                if (l.code === 'en') {
                                                    router.push('/');
                                                } else {
                                                    router.push(`/${l.code}`);
                                                }
                                                setLang(l.code);
                                            }}
                                        >
                                            <span className="mr-2">
                                                {l.flag}
                                            </span>{' '}
                                            {l.label}
                                            {currentLang === l.code && (
                                                <span className="ml-2 text-xs">
                                                    ✓
                                                </span>
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
