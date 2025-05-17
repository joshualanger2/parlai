'use client';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sections = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'installation', label: 'Installation' }
];

export default function DocsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [active, setActive] = useState(sections[0]?.id ?? 'getting-started');

    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r bg-card p-6 gap-2">
                <nav className="flex flex-col gap-2">
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
                    <section>
                        <h1 className="text-2xl font-bold mb-4">
                            Getting Started
                        </h1>
                        <p className="text-muted-foreground max-w-xl">
                            Welcome to the Parlai documentation! Use the sidebar
                            to navigate through the docs.
                        </p>
                    </section>
                )}
                {active === 'installation' && (
                    <section>
                        <h1 className="text-2xl font-bold mb-4">
                            Installation
                        </h1>
                        <p className="text-muted-foreground max-w-xl">
                            To install Parlai, run:
                        </p>
                        <pre className="bg-muted border rounded-md p-4 mt-4 font-mono text-sm">
                            npm install parlai
                        </pre>
                    </section>
                )}
            </main>
        </div>
    );
}
