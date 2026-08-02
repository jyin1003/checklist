import { pgTable, uuid, text, integer, boolean, date, timestamp } from 'drizzle-orm/pg-core';

export const lists = pgTable('lists', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
});

export const listItems = pgTable('list_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    listId: uuid('list_id').references(() => lists.id, { onDelete: 'cascade' }).notNull(),
    content: text('content').notNull(),
    position: integer('position').notNull(),
});

export const schedules = pgTable('schedules', {
    id: uuid('id').defaultRandom().primaryKey(),
    listId: uuid('list_id').references(() => lists.id, { onDelete: 'cascade' }).notNull(),
    type: text('type').notNull(), // 'daily' | 'weekly' | 'monthly' | 'today' | 'tomorrow'
    startDate: date('start_date').notNull(),
    interval: integer('interval').default(1),
    daysOfWeek: integer('days_of_week').array(), // e.g. [1,3,5]
    dayOfMonth: integer('day_of_month'),
    active: boolean('active').default(true).notNull(),
});

export const listCompletions = pgTable('list_completions', {
    id: uuid('id').defaultRandom().primaryKey(),
    listId: uuid('list_id').references(() => lists.id, { onDelete: 'cascade' }).notNull(),
    itemId: uuid('item_id').references(() => listItems.id, { onDelete: 'cascade' }).notNull(),
    date: date('date').notNull(),
    checked: boolean('checked').default(false).notNull(),
});