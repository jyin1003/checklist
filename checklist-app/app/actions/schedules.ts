'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { schedules } from '@/lib/db/schema';
import type { ScheduleInput } from '@/lib/types';
import { toDateOnlyString, todayDateString } from '@/lib/recurrence';

/**
 * Resolves the effective startDate for a schedule input, expanding the
 * 'today' / 'tomorrow' shorthands into concrete calendar dates.
 */
function resolveStartDate(input: ScheduleInput): string {
    if (input.type === 'today') return todayDateString();
    if (input.type === 'tomorrow') {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + 1);
        return toDateOnlyString(d);
    }
    return input.startDate;
}

/**
 * Sets (creates or replaces) the active schedule for a list.
 * A list has at most one active schedule at a time: any existing active
 * schedule is deactivated before the new one is inserted.
 */
export async function setSchedule(listId: string, input: ScheduleInput) {
    const startDate = resolveStartDate(input);

    await db.transaction(async (tx) => {
        await tx
            .update(schedules)
            .set({ active: false })
            .where(and(eq(schedules.listId, listId), eq(schedules.active, true)));

        await tx.insert(schedules).values({
            listId,
            type: input.type,
            startDate,
            interval: input.interval ?? 1,
            daysOfWeek: input.type === 'weekly' ? input.daysOfWeek ?? [] : null,
            dayOfMonth: input.type === 'monthly' ? input.dayOfMonth ?? null : null,
            active: true,
        });
    });

    revalidatePath('/schedule');
    revalidatePath('/today');
}

/** Turns off recurrence for a list without deleting the list itself. */
export async function deactivateSchedule(scheduleId: string) {
    await db.update(schedules).set({ active: false }).where(eq(schedules.id, scheduleId));
    revalidatePath('/schedule');
    revalidatePath('/today');
}