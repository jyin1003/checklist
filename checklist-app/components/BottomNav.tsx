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
        <nav className="border-t border-zinc-200 bg-white flex">
            {tabs.map((tab) => {
                const active = pathname.startsWith(tab.href);
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex-1 text-center py-3 text-sm font-medium ${active ? 'text-black' : 'text-zinc-400'
                            }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}