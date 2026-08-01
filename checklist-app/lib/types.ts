import { lists, listItems, schedules, listCompletions } from './db/schema';

export type List = typeof lists.$inferSelect;
export type NewList = typeof lists.$inferInsert;

export type ListItem = typeof listItems.$inferSelect;
export type NewListItem = typeof listItems.$inferInsert;

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;

export type ListCompletion = typeof listCompletions.$inferSelect;
export type NewListCompletion = typeof listCompletions.$inferInsert;

export type ScheduleType = 'once' | 'daily' | 'weekly' | 'monthly' | 'today' | 'tomorrow';

// Input shape used when creating/updating a schedule from the UI.
export interface ScheduleInput {
    type: ScheduleType;
    startDate: string; // ISO date string, e.g. '2026-08-01'
    interval?: number; // for daily/weekly/monthly repeats
    daysOfWeek?: number[]; // 0 (Sun) - 6 (Sat), for weekly
    dayOfMonth?: number; // 1-31, for monthly
}

// A list item paired with today's completion state, used on the Today tab.
export interface TodayListItem extends ListItem {
    checked: boolean;
}

// A full list with its items, hydrated for the Today tab.
export interface TodayList extends List {
    items: TodayListItem[];
    scheduleId: string;
}

// A list with its items and (optional) active schedule, used on the Manage tab.
export interface ManageList extends List {
    items: ListItem[];
    schedule: Schedule | null;
}

// Input shape for creating/updating a list's items from a modal form.
export interface ListItemInput {
    id?: string; // present when editing an existing item, absent when new
    content: string;
}