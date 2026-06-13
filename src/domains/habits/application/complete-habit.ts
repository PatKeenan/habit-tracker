import type { HabitId } from '../domain/types'
import type { Clock, HabitRepository } from './ports'

export interface CompleteHabitDeps {
  readonly habits: HabitRepository
  readonly clock: Clock
}

/** Marks a habit completed for the user, dated to the current local day. */
export async function completeHabit(
  deps: CompleteHabitDeps,
  userId: string,
  habitId: HabitId,
): Promise<void> {
  const today = deps.clock.today()
  await deps.habits.recordCompletion(userId, { habitId, date: today.date })
}
