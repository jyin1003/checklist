'use client';

import { useState, type FormEvent } from 'react';
import { setSchedule, deactivateSchedule } from '@/app/actions/schedules';
import type { Schedule, ScheduleType, ScheduleInput } from '@/lib/types';
import { todayDateString } from '@/lib/recurrence';

const TYPE_OPTIONS: { value: ScheduleType; label: string }[] = [
    { value: 'once', label: 'Once' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
];

const WEEKDAYS = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
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
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 max-h-[85vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Schedule</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {TYPE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setType(opt.value)}
                                className={`px-3 py-1.5 rounded-full text-sm border ${type === opt.value
                                        ? 'bg-black text-white border-black'
                                        : 'border-zinc-300 text-zinc-600'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {(type === 'once' || type === 'daily' || type === 'weekly' || type === 'monthly') && (
                        <label className="flex flex-col gap-1 text-sm">
                            {type === 'once' ? 'Date' : 'Starting from'}
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-zinc-300 rounded-lg px-3 py-2"
                            />
                        </label>
                    )}

                    {(type === 'daily' || type === 'weekly' || type === 'monthly') && (
                        <label className="flex flex-col gap-1 text-sm">
                            Repeat every
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    value={interval}
                                    onChange={(e) => setIntervalValue(Math.max(1, Number(e.target.value)))}
                                    className="w-20 border border-zinc-300 rounded-lg px-3 py-2"
                                />
                                <span className="text-zinc-500">
                                    {type === 'daily' && (interval === 1 ? 'day' : 'days')}
                                    {type === 'weekly' && (interval === 1 ? 'week' : 'weeks')}
                                    {type === 'monthly' && (interval === 1 ? 'month' : 'months')}
                                </span>
                            </div>
                        </label>
                    )}

                    {type === 'weekly' && (
                        <div className="flex flex-col gap-1 text-sm">
                            On these days
                            <div className="flex flex-wrap gap-2">
                                {WEEKDAYS.map((d) => (
                                    <button
                                        key={d.value}
                                        type="button"
                                        onClick={() => toggleWeekday(d.value)}
                                        className={`px-2.5 py-1 rounded-full text-xs border ${daysOfWeek.includes(d.value)
                                                ? 'bg-black text-white border-black'
                                                : 'border-zinc-300 text-zinc-600'
                                            }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {type === 'monthly' && (
                        <label className="flex flex-col gap-1 text-sm">
                            Day of month
                            <input
                                type="number"
                                min={1}
                                max={31}
                                value={dayOfMonth}
                                onChange={(e) => setDayOfMonth(Math.min(31, Math.max(1, Number(e.target.value))))}
                                className="w-20 border border-zinc-300 rounded-lg px-3 py-2"
                            />
                        </label>
                    )}

                    <div className="flex items-center justify-between mt-2 gap-2">
                        {schedule ? (
                            <button
                                type="button"
                                onClick={handleTurnOff}
                                className="text-sm text-red-600"
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
                                className="px-4 py-2 rounded-lg border border-zinc-300 text-sm"
                            >
                                Cancel
                            </button>
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