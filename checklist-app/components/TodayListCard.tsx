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
            className={`rounded-xl border p-4 transition-opacity ${allChecked ? 'opacity-50 border-zinc-200 bg-zinc-50' : 'border-zinc-300 bg-white'
                }`}
        >
            <h2 className="font-medium mb-2">{list.name}</h2>
            <ul className="flex flex-col gap-1.5">
                {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => handleToggle(item.id, e.target.checked)}
                            className="h-4 w-4"
                        />
                        <span className={item.checked ? 'line-through text-zinc-400' : ''}>
                            {item.content}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}