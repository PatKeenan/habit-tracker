import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import { sql } from '@/lib/db'
import {
  habitCompletions,
  habitCompletionsRelations,
  habits,
  habitsRelations,
} from './schema'
import type { HabitRepository } from '../../application/ports'
import type { Habit, Weekday } from '../../domain/types'

// Domain-local typed Drizzle instance (ADR 0007): schema registered here, not in lib/.
const db = drizzle(sql, {
  schema: {
    habits,
    habitCompletions,
    habitsRelations,
    habitCompletionsRelations,
  },
})

type HabitRow = typeof habits.$inferSelect

function toHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    weekdays: row.weekdays as Array<Weekday>,
    timer:
      row.timerDurationMinutes === null
        ? null
        : { durationMinutes: row.timerDurationMinutes },
  }
}

/** Drizzle/Neon implementation of the HabitRepository port. */
export function drizzleHabitRepository(): HabitRepository {
  return {
    listForUser: async (userId) => {
      const rows = await db
        .select()
        .from(habits)
        .where(eq(habits.userId, userId))
      return rows.map(toHabit)
    },

    add: async (userId, draft) => {
      const [row] = await db
        .insert(habits)
        .values({
          userId,
          title: draft.title,
          category: draft.category,
          weekdays: [...draft.weekdays],
          timerDurationMinutes: draft.timer?.durationMinutes ?? null,
        })
        .returning()
      return toHabit(row)
    },

    recordCompletion: async (userId, completion) => {
      await db
        .insert(habitCompletions)
        .values({ habitId: completion.habitId, userId, date: completion.date })
        .onConflictDoNothing()
    },

    completionsForUserOn: async (userId, date) => {
      const rows = await db
        .select()
        .from(habitCompletions)
        .where(
          and(
            eq(habitCompletions.userId, userId),
            eq(habitCompletions.date, date),
          ),
        )
      return rows.map((row) => ({ habitId: row.habitId, date: row.date }))
    },
  }
}
