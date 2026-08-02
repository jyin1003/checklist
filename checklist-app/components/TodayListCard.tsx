'use client';

import { useState, useTransition } from 'react';
import { toggleItemCompletion } from '@/app/actions/completions';
import { todayDateString } from '@/lib/recurrence';
import type { TodayList } from '@/lib/types';

export default function TodayListCard({ list }: { list: TodayList }) {
    const [items, setItems] = useState(list.items);
    const [, startTransition] = useTransition();

    const allChecked = items.length > 0 && items.every((i) => i.checked);

    function handleToggle(itemId: string, checked: boolean) {
        setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, checked } : i)));
        startTransition(() => {
            toggleItemCompletion(itemId, list.id, todayDateString(), checked);
        });
    }

    return (
        <div
            className={`rounded-2xl border p-4 transition-all ${allChecked ? 'opacity-50 border-border bg-surface' : 'border-border bg-surface'
                }`}
        >
            <h2 className="font-semibold text-[15px] mb-1 px-1">{list.name}</h2>
            <ul className="flex flex-col">
                {items.map((item) => (
                    <li key={item.id}>
                        <label className="flex items-center gap-3 min-h-12 px-1 rounded-xl active:bg-surface-2 transition-colors cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={(e) => handleToggle(item.id, e.target.checked)}
                                className="peer sr-only"
                            />
                            <span className="check-box">×</span>
                            <span className={`text-[15px] ${item.checked ? 'line-through text-muted' : 'text-foreground'}`}>
                                {item.content}
                            </span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
}