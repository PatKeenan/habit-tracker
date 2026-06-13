import type { Habit, Today } from './types'

/** Whether a habit is due on the given day — a deterministic weekday-set membership check. */
export function isDueToday(habit: Habit, today: Today): boolean {
  return habit.weekdays.includes(today.weekday)
}

/** The subset of habits due on the given day, preserving input order. */
export function habitsDueToday(
  habits: ReadonlyArray<Habit>,
  today: Today,
): ReadonlyArray<Habit> {
  return habits.filter((habit) => isDueToday(habit, today))
}
