'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { listCompletions } from '@/lib/db/schema';

/**
 * Marks a single list item as checked/unchecked for a given date.
 * Upserts manually: updates the existing completion row for
 * (itemId, date) if one exists, otherwise inserts a new one.
 */
export async function toggleItemCompletion(
    itemId: string,
    listId: string,
    date: string,
    checked: boolean
) {
    const existing = await db.query.listCompletions.findFirst({
        where: and(eq(listCompletions.itemId, itemId), eq(listCompletions.date, date)),
    });

    if (existing) {
        await db.update(listCompletions).set({ checked }).where(eq(listCompletions.id, existing.id));
    } else {
        await db.insert(listCompletions).values({ listId, itemId, date, checked });
    }

    revalidatePath('/today');
}