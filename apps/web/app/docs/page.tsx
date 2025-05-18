'use client';
import { useState } from 'react';
import { Menu, Copy as CopyIcon, Check as CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sections = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'commands', label: 'Commands' }
];

const npmLogo = (
    <svg
        width="20"
        height="20"
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect width="256" height="256" rx="60" fill="#CB3837" />
        <path d="M48 48H208V208H48V48Z" fill="white" />
        <path d="M64 64H192V192H64V64Z" fill="#CB3837" />
        <path d="M80 80H176V176H80V80Z" fill="white" />
        <path d="M96 96H160V160H96V96Z" fill="#CB3837" />
        <path d="M112 112H144V144H112V112Z" fill="white" />
    </svg>
);
const yarnLogo = (
    <svg
        width="20"
        height="20"
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect width="256" height="256" rx="60" fill="#2C8EBB" />
        <path
            d="M128 48C85.96 48 52 81.96 52 124C52 166.04 85.96 200 128 200C170.04 200 204 166.04 204 124C204 81.96 170.04 48 128 48ZM128 184C97.072 184 72 158.928 72 128C72 97.072 97.072 72 128 72C158.928 72 184 97.072 184 128C184 158.928 158.928 184 128 184Z"
            fill="white"
        />
    </svg>
);

function CopyButton({
    value,
    className
}: {
    value: string;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            className={`ml-2 inline-flex items-center px-2 py-1 rounded bg-muted border text-xs hover:bg-accent transition-colors ${className ?? ''}`}
            onClick={e => {
                e.preventDefault();
                navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
            }}
            aria-label="Copy to clipboard"
            type="button"
        >
            {copied ? (
                <CheckIcon className="w-4 h-4 text-green-600" />
            ) : (
                <CopyIcon className="w-4 h-4" />
            )}
        </button>
    );
}

export default function DocsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [active, setActive] = useState(sections[0]?.id ?? 'getting-started');
    const [installTab, setInstallTab] = useState<'npm' | 'yarn'>('npm');

    const npmCmd = 'npm install -g @parlai/cli';
    const yarnCmd = 'yarn global add @parlai/cli';

    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar */}
            <aside
                className="hidden md:flex flex-col w-64 border-r bg-card p-6 gap-2"
                style={{ marginTop: 64 }}
            >
                <nav className="flex flex-col gap-2 px-0">
                    {sections.map(section => (
                        <Button
                            key={section.id}
                            variant={
                                active === section.id ? 'secondary' : 'ghost'
                            }
                            className="justify-start"
                            onClick={() => setActive(section.id)}
                        >
                            {section.label}
                        </Button>
                    ))}
                </nav>
            </aside>
            {/* Mobile sidebar toggle */}
            <div className="md:hidden absolute top-4 left-4 z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(v => !v)}
                >
                    <Menu className="size-6" />
                </Button>
            </div>
            {/* Mobile sidebar drawer */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40"
                    onClick={() => setSidebarOpen(false)}
                >
                    <aside
                        className="absolute top-0 left-0 w-64 h-full bg-card border-r p-6 flex flex-col gap-2"
                        onClick={e => e.stopPropagation()}
                    >
                        <nav className="flex flex-col gap-2">
                            {sections.map(section => (
                                <Button
                                    key={section.id}
                                    variant={
                                        active === section.id
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    className="justify-start"
                                    onClick={() => {
                                        setActive(section.id);
                                        setSidebarOpen(false);
                                    }}
                                >
                                    {section.label}
                                </Button>
                            ))}
                        </nav>
                    </aside>
                </div>
            )}
            {/* Main content */}
            <main className="flex-1 flex flex-col items-center justify-start p-8 md:p-16">
                {active === 'getting-started' && (
                    <section className="max-w-2xl w-full">
                        <h1 className="text-2xl font-bold mb-4">
                            Getting Started
                        </h1>
                        <p className="text-muted-foreground mb-4">
                            Parlai CLI is a powerful tool that automates the
                            setup and management of internationalization (i18n)
                            in React applications. With just a few commands, you
                            can extract hardcoded strings, transform your
                            components, and even generate AI-powered
                            translations.
                        </p>
                        <h2 className="text-xl font-semibold mt-6 mb-2">
                            Installation
                        </h2>
                        <div className="flex gap-2 mb-4">
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-md border-b-2 transition-colors ${installTab === 'npm' ? 'border-primary bg-muted' : 'border-transparent bg-card'}`}
                                onClick={() => setInstallTab('npm')}
                                type="button"
                            >
                                {npmLogo}
                                <span className="font-semibold">npm</span>
                            </button>
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-md border-b-2 transition-colors ${installTab === 'yarn' ? 'border-primary bg-muted' : 'border-transparent bg-card'}`}
                                onClick={() => setInstallTab('yarn')}
                                type="button"
                            >
                                {yarnLogo}
                                <span className="font-semibold">yarn</span>
                            </button>
                        </div>
                        <div className="relative mb-4">
                            <pre className="bg-muted border rounded-md p-4 font-mono text-sm overflow-x-auto">
                                {installTab === 'npm' ? npmCmd : yarnCmd}
                            </pre>
                            <CopyButton
                                value={installTab === 'npm' ? npmCmd : yarnCmd}
                                className="absolute top-2 right-2"
                            />
                        </div>
                        <h2 className="text-xl font-semibold mt-6 mb-2">
                            Quick Start
                        </h2>
                        <ol className="list-decimal list-inside mb-4">
                            <li className="mb-2">
                                <strong>Set up i18n in your project</strong>
                                <div className="relative">
                                    <pre className="bg-muted border rounded-md p-2 font-mono text-sm mt-1">
                                        parlai setup
                                    </pre>
                                    <CopyButton
                                        value="parlai setup"
                                        className="absolute top-2 right-2"
                                    />
                                </div>
                            </li>
                            <li className="mb-2">
                                <strong>
                                    Extract strings from your components
                                </strong>
                                <div className="relative">
                                    <pre className="bg-muted border rounded-md p-2 font-mono text-sm mt-1">
                                        parlai extract ./src
                                    </pre>
                                    <CopyButton
                                        value="parlai extract ./src"
                                        className="absolute top-2 right-2"
                                    />
                                </div>
                            </li>
                            <li className="mb-2">
                                <strong>
                                    Transform components to use i18n
                                </strong>
                                <div className="relative">
                                    <pre className="bg-muted border rounded-md p-2 font-mono text-sm mt-1">
                                        parlai transform ./src
                                    </pre>
                                    <CopyButton
                                        value="parlai transform ./src"
                                        className="absolute top-2 right-2"
                                    />
                                </div>
                            </li>
                        </ol>
                        <h2 className="text-xl font-semibold mt-6 mb-2">
                            Workflow Example
                        </h2>
                        <div className="relative mb-4">
                            <pre className="bg-muted border rounded-md p-4 font-mono text-sm overflow-x-auto">
                                {`yarn global add @parlai/cli
cd your-react-app
parlai setup
parlai extract ./src
parlai transform ./src
parlai translate --api-key=your-openai-api-key --target fr es`}
                            </pre>
                            <CopyButton
                                value={`yarn global add @parlai/cli\ncd your-react-app\nparlai setup\nparlai extract ./src\nparlai transform ./src\nparlai translate --api-key=your-openai-api-key --target fr es`}
                                className="absolute top-2 right-2"
                            />
                        </div>
                        <h2 className="text-xl font-semibold mt-6 mb-2">
                            Notes
                        </h2>
                        <ul className="list-disc list-inside text-muted-foreground">
                            <li>
                                The <code>setup</code> command creates a{' '}
                                <code>locales</code> directory for your
                                translation files.
                            </li>
                            <li>
                                Run <code>extract</code> before{' '}
                                <code>transform</code> to ensure all strings are
                                captured.
                            </li>
                            <li>
                                The <code>transform</code> command requires{' '}
                                <code>locales/en.json</code> to exist (created
                                by <code>extract</code>).
                            </li>
                            <li>
                                Components using translations may be made async
                                to support dynamic loading.
                            </li>
                            <li>
                                <strong>
                                    Backup your code before running the{' '}
                                    <code>transform</code> command.
                                </strong>
                            </li>
                        </ul>
                    </section>
                )}
                {active === 'commands' && (
                    <section className="max-w-2xl w-full">
                        <h1 className="text-2xl font-bold mb-4">Commands</h1>
                        <h2 className="text-xl font-semibold mt-6 mb-2">
                            setup
                        </h2>
                        <p className="mb-2">
                            Sets up i18n in your React application by:
                        </p>
                        <ul className="list-disc list-inside mb-2">
                            <li>
                                Installing required dependencies (
                                <code>i18next</code>, <code>react-i18next</code>
                                )
                            </li>
                            <li>Creating i18n configuration files</li>
                            <li>Setting up the translation infrastructure</li>
                        </ul>
                        <div className="relative mb-4">
                            <pre className="bg-muted border rounded-md p-4 font-mono text-sm overflow-x-auto">
                                {`parlai setup
# or specify package manager
parlai setup --package-manager yarn
parlai setup --package-manager npm`}
                            </pre>
                            <CopyButton
                                value={`parlai setup\n# or specify package manager\nparlai setup --package-manager yarn\nparlai setup --package-manager npm`}
                                className="absolute top-2 right-2"
                            />
                        </div>
                        <h2 className="text-xl font-semibold mt-6 mb-2">
                            extract
                        </h2>
                        <p className="mb-2">
                            Scans your React components and extracts hardcoded
                            strings into a translation file:
                        </p>
                        <ul className="list-disc list-inside mb-2">
                            <li>Finds all text content in JSX</li>
                            <li>Extracts string literals from attributes</li>
                            <li>Generates appropriate translation keys</li>
                            <li>
                                Creates/updates <code>locales/en.json</code>{' '}
                                with extracted strings
                            </li>
                        </ul>
                        <div className="relative mb-4">
                            <pre className="bg-muted border rounded-md p-4 font-mono text-sm overflow-x-auto">
                                {`parlai extract <directory>
# Example:
parlai extract ./src`}
                            </pre>
                            <CopyButton
                                value={`parlai extract <directory>\n# Example:\nparlai extract ./src`}
                                className="absolute top-2 right-2"
                            />
                        </div>
                        <h2 className="text-xl font-semibold mt-6 mb-2">
                            transform
                        </h2>
                        <p className="mb-2">
                            Transforms your React components to use i18n:
                        </p>
                        <ul className="list-disc list-inside mb-2">
                            <li>Adds necessary imports and hooks</li>
                            <li>
                                Replaces hardcoded strings with translation keys
                            </li>
                            <li>
                                Handles both text content and attributes (e.g.,{' '}
                                <code>className</code>, <code>placeholder</code>
                                )
                            </li>
                            <li>
                                Makes components async if needed for translation
                                loading
                            </li>
                            <li>
                                Requires <code>locales/en.json</code> to exist
                                (created by <code>extract</code>)
                            </li>
                        </ul>
                        <div className="relative mb-4">
                            <pre className="bg-muted border rounded-md p-4 font-mono text-sm overflow-x-auto">
                                {`parlai transform <directory>
# Example:
parlai transform ./src`}
                            </pre>
                            <CopyButton
                                value={`parlai transform <directory>\n# Example:\nparlai transform ./src`}
                                className="absolute top-2 right-2"
                            />
                        </div>
                        <h2 className="text-xl font-semibold mt-6 mb-2">
                            translate{' '}
                            <span className="font-normal">(Optional)</span>
                        </h2>
                        <p className="mb-2">
                            Translates extracted strings to other languages
                            using AI:
                        </p>
                        <ul className="list-disc list-inside mb-2">
                            <li>
                                Reads source strings from{' '}
                                <code>locales/en.json</code>
                            </li>
                            <li>
                                Generates translations in the{' '}
                                <code>locales</code> directory
                            </li>
                        </ul>
                        <div className="relative mb-4">
                            <pre className="bg-muted border rounded-md p-4 font-mono text-sm overflow-x-auto">
                                {`parlai translate --api-key=your-openai-api-key
# or specify languages
parlai translate --api-key=your-key --source en --target fr es de`}
                            </pre>
                            <CopyButton
                                value={`parlai translate --api-key=your-openai-api-key\n# or specify languages\nparlai translate --api-key=your-key --source en --target fr es de`}
                                className="absolute top-2 right-2"
                            />
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
