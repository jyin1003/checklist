import type { ManageList } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
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
        <div className="rounded-2xl border border-border bg-surface p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
                <h3 className="font-semibold text-[15px] truncate">{list.name}</h3>
                <p className="text-xs font-mono text-muted mt-1 flex items-center gap-1.5">
                    <span>{list.items.length} item{list.items.length === 1 ? '' : 's'}</span>
                    {list.schedule ? (
                        <span className="px-1.5 py-0.5 rounded bg-accent-dim text-accent-hover">
                            {TYPE_LABELS[list.schedule.type] ?? list.schedule.type}
                        </span>
                    ) : (
                        <span className="text-muted/70">not scheduled</span>
                    )}
                </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={onSchedule}
                    aria-label="Schedule"
                    className="w-11 h-11 flex items-center justify-center rounded-full active:bg-surface-2 text-lg"
                >
                    🕒
                </button>
                <button
                    onClick={onEdit}
                    aria-label="Edit"
                    className="w-11 h-11 flex items-center justify-center rounded-full active:bg-surface-2 text-lg"
                >
                    ✏️
                </button>
            </div>
        </div>
    );
}