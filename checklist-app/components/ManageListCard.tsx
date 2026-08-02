import type { ManageList } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
    once: 'Once',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    today: 'Today',
    tomorrow: 'Tomorrow',
};

export default function ManageListCard({
    list,
    onEdit,
    onSchedule,
}: {
    list: ManageList;
    onEdit: () => void;
    onSchedule: () => void;
}) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
                <h3 className="font-medium truncate">{list.name}</h3>
                <p className="text-sm text-zinc-500 mt-0.5">
                    {list.items.length} item{list.items.length === 1 ? '' : 's'}
                    {list.schedule
                        ? ` · ${TYPE_LABELS[list.schedule.type] ?? list.schedule.type}`
                        : ' · Not scheduled'}
                </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <button onClick={onSchedule} aria-label="Schedule" className="p-2 rounded-full hover:bg-zinc-100 text-lg">
                    🕒
                </button>
                <button onClick={onEdit} aria-label="Edit" className="p-2 rounded-full hover:bg-zinc-100 text-lg">
                    ✏️
                </button>
            </div>
        </div>
    );
}