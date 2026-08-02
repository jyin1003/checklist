import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { schedules, listCompletions } from '@/lib/db/schema';
import { isScheduledToday, todayDateString } from '@/lib/recurrence';
import type { TodayList } from '@/lib/types';
import TodayListCard from '@/components/TodayListCard';

export const dynamic = 'force-dynamic';

async function getTodaysLists(): Promise<TodayList[]> {
    try {

        const today = todayDateString();

        const activeSchedules = await db.query.schedules.findMany({
            where: eq(schedules.active, true),
            with: {
                list: {
                    with: {
                        items: { orderBy: (item, { asc }) => [asc(item.position)] },
                    },
                },
            },
        });

        const due = activeSchedules.filter((s) => isScheduledToday(s, today));
        if (due.length === 0) return [];

        const todaysCompletions = await db.query.listCompletions.findMany({
            where: eq(listCompletions.date, today),
        });
        const checkedItemIds = new Set(
            todaysCompletions.filter((c) => c.checked).map((c) => c.itemId)
        );


        return due.map((schedule) => ({
            ...schedule.list,
            scheduleId: schedule.id,
            items: schedule.list.items.map((item) => ({
                ...item,
                checked: checkedItemIds.has(item.id),
            })),
        }));
    } catch (error: unknown) {
        console.error("SCHEDULE_QUERY_ERROR", error);

        if (error instanceof Error) {
            console.error("SCHEDULE_QUERY_ERROR_DETAILS", {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: error.cause,
            });
        }

        throw error;
    }
}

export default async function TodayPage() {
    const lists = await getTodaysLists();

    const incomplete = lists.filter((l) => !l.items.every((i) => i.checked));
    const complete = lists.filter((l) => l.items.length > 0 && l.items.every((i) => i.checked));

    return (
        <div className="flex-1 overflow-y-auto p-4 pb-8">
            <h1 className="text-2xl font-semibold mb-5 font-mono tracking-tight">
                <span className="text-accent">...</span> Today
            </h1>

            {lists.length === 0 ? (
                <p className="text-muted mt-16 text-center text-sm font-mono">nothing scheduled for today</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {incomplete.map((list) => (
                        <TodayListCard key={list.id} list={list} />
                    ))}
                    {complete.map((list) => (
                        <TodayListCard key={list.id} list={list} />
                    ))}
                </div>
            )}
        </div>
    );
}