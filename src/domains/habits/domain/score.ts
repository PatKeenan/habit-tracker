import type { Habit, HabitCompletion, LocalDate } from './types'

/** A day's progress: how many due habits were completed, and the resulting ratio. */
export interface DailyScore {
  readonly completed: number
  readonly due: number
  /** `completed / due`, in [0, 1]. A day with nothing due scores 1 (no obligations). */
  readonly ratio: number
}

/**
 * Plain daily score: the fraction of the day's due habits that were completed.
 *
 * `dueHabits` is the set of habits due on `date`. Only completions whose date matches
 * `date` and whose habit is in `dueHabits` count.
 */
export function dailyScore(
  dueHabits: ReadonlyArray<Habit>,
  completions: ReadonlyArray<HabitCompletion>,
  date: LocalDate,
): DailyScore {
  const completedOnDate = new Set(
    completions
      .filter((completion) => completion.date === date)
      .map((completion) => completion.habitId),
  )

  const due = dueHabits.length
  const completed = dueHabits.filter((habit) =>
    completedOnDate.has(habit.id),
  ).length
  const ratio = due === 0 ? 1 : completed / due

  return { completed, due, ratio }
}
