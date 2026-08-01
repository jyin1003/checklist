import { relations } from 'drizzle-orm';
import { lists, listItems, schedules, listCompletions } from './schema';

export const listsRelations = relations(lists, ({ many }) => ({
    items: many(listItems),
    schedules: many(schedules),
    completions: many(listCompletions),
}));

export const listItemsRelations = relations(listItems, ({ one, many }) => ({
    list: one(lists, { fields: [listItems.listId], references: [lists.id] }),
    completions: many(listCompletions),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
    list: one(lists, { fields: [schedules.listId], references: [lists.id] }),
}));

export const listCompletionsRelations = relations(listCompletions, ({ one }) => ({
    list: one(lists, { fields: [listCompletions.listId], references: [lists.id] }),
    item: one(listItems, { fields: [listCompletions.itemId], references: [listItems.id] }),
}));