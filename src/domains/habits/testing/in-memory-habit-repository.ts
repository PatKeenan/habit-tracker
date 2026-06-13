import type { HabitRepository } from '../application/ports'
import type { Habit, HabitCompletion } from '../domain/types'

/** An in-memory HabitRepository for tests — no database. */
export function inMemoryHabitRepository(): HabitRepository {
  const habitsByUser = new Map<string, Array<Habit>>()
  const completions: Array<{ userId: string; completion: HabitCompletion }> = []
  let counter = 0

  return {
    listForUser: (userId) =>
      Promise.resolve([...(habitsByUser.get(userId) ?? [])]),

    add: (userId, draft) => {
      counter += 1
      const habit: Habit = { ...draft, id: `h${counter}` }
      const list = habitsByUser.get(userId) ?? []
      list.push(habit)
      habitsByUser.set(userId, list)
      return Promise.resolve(habit)
    },

    recordCompletion: (userId, completion) => {
      completions.push({ userId, completion })
      return Promise.resolve()
    },

    completionsForUserOn: (userId, date) =>
      Promise.resolve(
        completions
          .filter(
            (row) => row.userId === userId && row.completion.date === date,
          )
          .map((row) => row.completion),
      ),
  }
}
