'use server';

import { revalidatePath } from 'next/cache';
import { eq, ilike, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { lists, listItems, schedules } from '@/lib/db/schema';
import type { ListItemInput, ManageList } from '@/lib/types';

/**
 * Creates a new list with its items in a single transaction.
 * Items are given sequential `position` values starting at 0.
 */
export async function createList(name: string, items: string[]): Promise<{ id: string }> {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('List name is required');

    const cleanItems = items.map((i) => i.trim()).filter(Boolean);
    if (cleanItems.length === 0) throw new Error('At least one item is required');

    const result = await db.transaction(async (tx) => {
        const [list] = await tx.insert(lists).values({ name: trimmedName }).returning();

        await tx.insert(listItems).values(
            cleanItems.map((content, index) => ({
                listId: list.id,
                content,
                position: index,
            }))
        );

        return list;
    });

    revalidatePath('/schedule');
    revalidatePath('/today');
    return { id: result.id };
}

/**
 * Replaces the item set for a list: updates existing items (by id),
 * inserts new items (no id), and deletes items no longer present.
 * Positions are recomputed based on the order of `items`.
 */
export async function updateListItems(listId: string, name: string, items: ListItemInput[]) {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('List name is required');

    const cleanItems = items
        .map((item) => ({ ...item, content: item.content.trim() }))
        .filter((item) => item.content.length > 0);
    if (cleanItems.length === 0) throw new Error('At least one item is required');

    await db.transaction(async (tx) => {
        await tx.update(lists).set({ name: trimmedName }).where(eq(lists.id, listId));

        const existing = await tx
            .select({ id: listItems.id })
            .from(listItems)
            .where(eq(listItems.listId, listId));
        const existingIds = new Set(existing.map((row) => row.id));
        const keptIds = new Set(cleanItems.filter((i) => i.id).map((i) => i.id!));

        const idsToDelete = [...existingIds].filter((id) => !keptIds.has(id));
        for (const id of idsToDelete) {
            await tx.delete(listItems).where(eq(listItems.id, id));
        }

        for (let index = 0; index < cleanItems.length; index++) {
            const item = cleanItems[index];
            if (item.id && existingIds.has(item.id)) {
                await tx
                    .update(listItems)
                    .set({ content: item.content, position: index })
                    .where(eq(listItems.id, item.id));
            } else {
                await tx.insert(listItems).values({
                    listId,
                    content: item.content,
                    position: index,
                });
            }
        }
    });

    revalidatePath('/schedule');
    revalidatePath('/today');
}

/** Deletes a list and (via FK cascade) its items, schedule, and completions. */
export async function deleteList(listId: string) {
    await db.delete(lists).where(eq(lists.id, listId));
    revalidatePath('/schedule');
    revalidatePath('/today');
}

/**
 * Fetches lists for the Manage tab, optionally filtered by a search query
 * against the list name. Includes items (ordered) and the active schedule.
 */
export async function searchLists(query?: string): Promise<ManageList[]> {
    const rows = await db.query.lists.findMany({
        where: query ? ilike(lists.name, `%${query.trim()}%`) : undefined,
        orderBy: [desc(lists.id)],
        with: {
            items: { orderBy: (item, { asc }) => [asc(item.position)] },
            schedules: { where: eq(schedules.active, true), limit: 1 },
        },
    });

    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        items: row.items,
        schedule: row.schedules[0] ?? null,
    }));
}