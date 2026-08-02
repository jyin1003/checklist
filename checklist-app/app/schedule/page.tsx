'use client';

import { useEffect, useState, useCallback } from 'react';
import { searchLists } from '@/app/actions/lists';
import type { ManageList } from '@/lib/types';
import ManageListCard from '@/components/ManageListCard';
import EditListModal from '@/components/EditListModal';
import ScheduleModal from '@/components/ScheduleModal';

export default function SchedulePage() {
    const [query, setQuery] = useState('');
    const [lists, setLists] = useState<ManageList[]>([]);
    const [loading, setLoading] = useState(true);

    // undefined = closed, null = "create new" mode, ManageList = "edit" mode
    const [editingList, setEditingList] = useState<ManageList | null | undefined>(undefined);
    const [schedulingList, setSchedulingList] = useState<ManageList | null>(null);

    const refresh = useCallback(async (q: string) => {
        const results = await searchLists(q);
        setLists(results);
        setLoading(false);
    }, []);

    useEffect(() => {
        const handle = setTimeout(() => refresh(query), 250);
        return () => clearTimeout(handle);
    }, [query, refresh]);

    return (
        <div className="flex-1 overflow-y-auto p-4 pb-8 relative">
            <h1 className="text-2xl font-semibold mb-5 font-mono tracking-tight">
                <span className="text-accent">...</span> Manage
            </h1>

            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lists..."
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 mb-5 text-[15px] placeholder:text-muted"
            />

            {loading ? (
                <p className="text-muted text-sm font-mono">loading…</p>
            ) : lists.length === 0 ? (
                <p className="text-muted mt-16 text-center text-sm font-mono">no lists yet</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {lists.map((list) => (
                        <ManageListCard
                            key={list.id}
                            list={list}
                            onEdit={() => setEditingList(list)}
                            onSchedule={() => setSchedulingList(list)}
                        />
                    ))}
                </div>
            )}

            <button
                onClick={() => setEditingList(null)}
                aria-label="Add list"
                className="fixed bottom-24 right-5 w-16 h-16 rounded-full bg-accent text-white text-3xl shadow-lg glow-accent flex items-center justify-center"
            >
                +
            </button>

            {editingList !== undefined && (
                <EditListModal
                    list={editingList}
                    onClose={() => setEditingList(undefined)}
                    onSaved={() => refresh(query)}
                />
            )}

            {schedulingList && (
                <ScheduleModal
                    listId={schedulingList.id}
                    schedule={schedulingList.schedule}
                    onClose={() => setSchedulingList(null)}
                    onSaved={() => refresh(query)}
                />
            )}
        </div>
    );
}