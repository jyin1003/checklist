import type { Schedule } from './types';

/**
 * Parses a 'YYYY-MM-DD' date string into a UTC-midnight Date.
 * We treat all schedule dates as calendar dates (no time-of-day, no timezone
 * drift), so every comparison in this module works off UTC-midnight values.
 */
function parseDateOnly(value: string | Date): Date {
    if (value instanceof Date) {
        return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    }
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function isSameDay(a: string | Date, b: string | Date): boolean {
    return parseDateOnly(a).getTime() === parseDateOnly(b).getTime();
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a: string | Date, b: string | Date): number {
    return Math.round((parseDateOnly(b).getTime() - parseDateOnly(a).getTime()) / MS_PER_DAY);
}

function weeksBetween(a: string | Date, b: string | Date): number {
    return Math.floor(daysBetween(a, b) / 7);
}

function monthsBetween(a: string | Date, b: string | Date): number {
    const start = parseDateOnly(a);
    const end = parseDateOnly(b);
    return (
        (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
        (end.getUTCMonth() - start.getUTCMonth())
    );
}

/**
 * Returns the equivalent "shifted" date for the 'today' / 'tomorrow'
 * schedule shorthands, expressed as an offset from startDate.
 */
function shorthandOffsetDays(type: Schedule['type']): number {
    return type === 'tomorrow' ? 1 : 0;
}

/**
 * Determines whether a schedule fires on the given calendar day.
 * `today` should be a plain calendar date (time-of-day is ignored).
 */
export function isScheduledToday(schedule: Schedule, today: string | Date): boolean {
    if (!schedule.active) return false;

    const interval = schedule.interval && schedule.interval > 0 ? schedule.interval : 1;

    switch (schedule.type) {
        case 'once': {
            return isSameDay(schedule.startDate, today);
        }

        case 'today':
        case 'tomorrow': {
            // These are effectively one-off schedules anchored to startDate,
            // which is set to the intended day at creation time.
            const offset = shorthandOffsetDays(schedule.type);
            const target = parseDateOnly(schedule.startDate);
            target.setUTCDate(target.getUTCDate() + offset);
            return isSameDay(target, today);
        }

        case 'daily': {
            const diff = daysBetween(schedule.startDate, today);
            if (diff < 0) return false;
            return diff % interval === 0;
        }

        case 'weekly': {
            const days = schedule.daysOfWeek ?? [];
            if (days.length === 0) return false;
            const todayDate = parseDateOnly(today);
            if (!days.includes(todayDate.getUTCDay())) return false;
            const diffWeeks = weeksBetween(schedule.startDate, today);
            if (diffWeeks < 0) return false;
            return diffWeeks % interval === 0;
        }

        case 'monthly': {
            if (!schedule.dayOfMonth) return false;
            const todayDate = parseDateOnly(today);
            if (todayDate.getUTCDate() !== schedule.dayOfMonth) return false;
            const diffMonths = monthsBetween(schedule.startDate, today);
            if (diffMonths < 0) return false;
            return diffMonths % interval === 0;
        }

        default:
            return false;
    }
}

/** Formats a Date as a 'YYYY-MM-DD' string for storage/comparison. */
export function toDateOnlyString(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Today's date (UTC calendar day) as a 'YYYY-MM-DD' string. */
export function todayDateString(): string {
    return toDateOnlyString(new Date());
}