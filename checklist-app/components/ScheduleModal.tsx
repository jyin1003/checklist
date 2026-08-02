'use client';

import { useState, type FormEvent } from 'react';
import { setSchedule, deactivateSchedule } from '@/app/actions/schedules';
import type { Schedule, ScheduleType, ScheduleInput } from '@/lib/types';
import { todayDateString } from '@/lib/recurrence';

const TYPE_OPTIONS: { value: ScheduleType; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
];

const WEEKDAYS = [
    { value: 0, label: 'S' },
    { value: 1, label: 'M' },
    { value: 2, label: 'T' },
    { value: 3, label: 'W' },
    { value: 4, label: 'T' },
    { value: 5, label: 'F' },
    { value: 6, label: 'S' },
];

export default function ScheduleModal({
    listId,
    schedule,
    onClose,
    onSaved,
}: {
    listId: string;
    schedule: Schedule | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [type, setType] = useState<ScheduleType>((schedule?.type as ScheduleType) ?? 'daily');
    const [startDate, setStartDate] = useState(schedule?.startDate ?? todayDateString());
    const [interval, setIntervalValue] = useState(schedule?.interval ?? 1);
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>(schedule?.daysOfWeek ?? []);
    const [dayOfMonth, setDayOfMonth] = useState(schedule?.dayOfMonth ?? 1);
    const [saving, setSaving] = useState(false);

    function toggleWeekday(day: number) {
        setDaysOfWeek((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
        );
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const input: ScheduleInput = {
                type,
                startDate,
                interval,
                daysOfWeek: type === 'weekly' ? daysOfWeek : undefined,
                dayOfMonth: type === 'monthly' ? dayOfMonth : undefined,
            };
            await setSchedule(listId, input);
            onSaved();
            onClose();
        } finally {
            setSaving(false);
        }
    }

    async function handleTurnOff() {
        if (!schedule) return;
        setSaving(true);
        try {
            await deactivateSchedule(schedule.id);
            onSaved();
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
            <div className="bg-surface border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 max-h-[85vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Schedule</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {TYPE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setType(opt.value)}
                                className={`px-4 min-h-11 rounded-full text-sm font-mono border transition-colors ${type === opt.value
                                    ? 'bg-accent text-white border-accent'
                                    : 'border-border text-muted active:bg-surface-2'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {(type === 'daily' || type === 'weekly' || type === 'monthly') && (
                        <label className="flex flex-col gap-1.5 text-sm text-muted">
                            Starting from
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-surface-2 border border-border rounded-xl px-4 py-3 text-[15px] text-foreground"
                            />
                        </label>
                    )}

                    {(type === 'daily' || type === 'weekly' || type === 'monthly') && (
                        <label className="flex flex-col gap-1.5 text-sm text-muted">
                            Repeat every
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    value={interval}
                                    onChange={(e) => setIntervalValue(Math.max(1, Number(e.target.value)))}
                                    className="w-20 bg-surface-2 border border-border rounded-xl px-4 py-3 text-[15px] text-foreground"
                                />
                                <span className="text-muted">
                                    {type === 'daily' && (interval === 1 ? 'day' : 'days')}
                                    {type === 'weekly' && (interval === 1 ? 'week' : 'weeks')}
                                    {type === 'monthly' && (interval === 1 ? 'month' : 'months')}
                                </span>
                            </div>
                        </label>
                    )}

                    {type === 'weekly' && (
                        <div className="flex flex-col gap-1.5 text-sm text-muted">
                            On these days
                            <div className="flex flex-wrap gap-2">
                                {WEEKDAYS.map((d, i) => (
                                    <button
                                        key={`${d.value}-${i}`}
                                        type="button"
                                        onClick={() => toggleWeekday(d.value)}
                                        className={`w-11 h-11 rounded-full text-sm font-mono border transition-colors ${daysOfWeek.includes(d.value)
                                            ? 'bg-accent text-white border-accent'
                                            : 'border-border text-muted active:bg-surface-2'
                                            }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {type === 'monthly' && (
                        <label className="flex flex-col gap-1.5 text-sm text-muted">
                            Day of month
                            <input
                                type="number"
                                min={1}
                                max={31}
                                value={dayOfMonth}
                                onChange={(e) => setDayOfMonth(Math.min(31, Math.max(1, Number(e.target.value))))}
                                className="w-20 bg-surface-2 border border-border rounded-xl px-4 py-3 text-[15px] text-foreground"
                            />
                        </label>
                    )}

                    <div className="flex items-center justify-between mt-2 gap-2">
                        {schedule ? (
                            <button
                                type="button"
                                onClick={handleTurnOff}
                                className="text-sm text-danger min-h-11 px-2"
                                disabled={saving}
                            >
                                Turn off
                            </button>
                        ) : (
                            <span />
                        )}
                        <div className="flex gap-2 ml-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 min-h-12 rounded-xl border border-border text-sm active:bg-surface-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 min-h-12 rounded-xl bg-accent text-white text-sm font-medium disabled:opacity-50 glow-accent"
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