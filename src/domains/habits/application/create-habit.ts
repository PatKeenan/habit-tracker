import type { DraftHabit, Habit } from '../domain/types'
import type { HabitRepository } from './ports'

export interface CreateHabitDeps {
  readonly habits: HabitRepository
}

/** Creates a habit for the user and returns it with its assigned id. */
export function createHabit(
  deps: CreateHabitDeps,
  userId: string,
  draft: DraftHabit,
): Promise<Habit> {
  return deps.habits.add(userId, draft)
}
