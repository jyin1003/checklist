'use client';

import { useState, type FormEvent } from 'react';
import { createList, updateListItems, deleteList } from '@/app/actions/lists';
import type { ManageList, ListItemInput } from '@/lib/types';

interface Row extends ListItemInput {
    key: string;
}

function toRows(items: ListItemInput[]): Row[] {
    return items.length > 0
        ? items.map((i) => ({ ...i, key: i.id ?? crypto.randomUUID() }))
        : [{ content: '', key: crypto.randomUUID() }];
}

export default function EditListModal({
    list,
    onClose,
    onSaved,
}: {
    list: ManageList | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [name, setName] = useState(list?.name ?? '');
    const [rows, setRows] = useState<Row[]>(
        toRows(list?.items.map((i) => ({ id: i.id, content: i.content })) ?? [])
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function updateRow(key: string, content: string) {
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, content } : r)));
    }

    function addRow() {
        setRows((prev) => [...prev, { content: '', key: crypto.randomUUID() }]);
    }

    function removeRow(key: string) {
        setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        const cleanRows = rows.filter((r) => r.content.trim().length > 0);
        if (!name.trim() || cleanRows.length === 0) {
            setError('Give the list a name and at least one item.');
            return;
        }

        setSaving(true);
        try {
            if (list) {
                await updateListItems(
                    list.id,
                    name,
                    cleanRows.map((r) => ({ id: r.id, content: r.content }))
                );
            } else {
                await createList(
                    name,
                    cleanRows.map((r) => r.content)
                );
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!list) return;
        if (!confirm('Delete this list?')) return;
        setSaving(true);
        try {
            await deleteList(list.id);
            onSaved();
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{list ? 'Edit list' : 'New list'}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1.5 -mr-1.5 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 text-xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="List name"
                        className="border border-zinc-300 rounded-lg px-3 py-2"
                        autoFocus
                    />

                    <div className="flex flex-col gap-2">
                        {rows.map((row) => (
                            <div key={row.key} className="flex items-center gap-2">
                                <input
                                    value={row.content}
                                    onChange={(e) => updateRow(row.key, e.target.value)}
                                    placeholder="Item"
                                    className="flex-1 border border-zinc-300 rounded-lg px-3 py-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeRow(row.key)}
                                    className="text-zinc-400 px-2"
                                    aria-label="Remove item"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={addRow} className="text-sm text-blue-600 text-left">
                        + Add item
                    </button>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex items-center justify-between mt-2 gap-2">
                        {list ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-sm text-red-600"
                                disabled={saving}
                            >
                                Delete list
                            </button>
                        ) : (
                            <span />
                        )}
                        <div className="flex gap-2 ml-auto">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}