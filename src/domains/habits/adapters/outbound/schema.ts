import { relations } from 'drizzle-orm'
import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

// Drizzle schema for the habits domain (outbound adapter). Rows are mapped to/from
// domain types in the repository — these table types never leak into the core.

export const habits = pgTable('habits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  weekdays: text('weekdays').array().notNull(),
  timerDurationMinutes: integer('timer_duration_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const habitCompletions = pgTable(
  'habit_completions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    habitId: uuid('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    date: date('date', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    unique('habit_completions_habit_date').on(table.habitId, table.date),
  ],
)

// Within-domain relations only (a completion belongs to a habit). Cross-domain links
// (e.g. to the user) are by id, not DB relations — see the habit-core slice plan.
export const habitsRelations = relations(habits, ({ many }) => ({
  completions: many(habitCompletions),
}))

export const habitCompletionsRelations = relations(
  habitCompletions,
  ({ one }) => ({
    habit: one(habits, {
      fields: [habitCompletions.habitId],
      references: [habits.id],
    }),
  }),
)
