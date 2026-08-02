'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    { href: '/today', label: 'Today' },
    { href: '/schedule', label: 'Manage' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="sticky bottom-0 border-t border-border bg-surface/95 backdrop-blur flex pb-[env(safe-area-inset-bottom)]">
            {tabs.map((tab) => {
                const active = pathname.startsWith(tab.href);
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className="relative flex-1 flex flex-col items-center justify-center gap-1 min-h-16 text-sm font-mono uppercase tracking-wide transition-colors"
                    >
                        <span
                            className={`absolute top-0 h-0.5 w-10 rounded-full transition-all ${active ? 'bg-accent shadow-[0_0_10px_var(--accent)]' : 'bg-transparent'
                                }`}
                        />
                        <span className={active ? 'text-accent-hover' : 'text-muted'}>{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}