import { dailyScore } from '../domain/score'
import type { DailyScore } from '../domain/score'
import { habitsDueToday } from '../domain/schedule'
import type { Habit, LocalDate } from '../domain/types'
import type { Clock, HabitRepository } from './ports'

/** A habit due today, with whether it has been completed. */
export interface TodaysHabit {
  readonly habit: Habit
  readonly completed: boolean
}

/** Everything the dashboard needs for today: the due habits and the score. */
export interface TodaysHabits {
  readonly date: LocalDate
  readonly items: ReadonlyArray<TodaysHabit>
  readonly score: DailyScore
}

export interface ListTodaysHabitsDeps {
  readonly habits: HabitRepository
  readonly clock: Clock
}

/** Lists the user's habits due today, marks which are done, and computes the score. */
export async function listTodaysHabits(
  deps: ListTodaysHabitsDeps,
  userId: string,
): Promise<TodaysHabits> {
  const today = deps.clock.today()
  const all = await deps.habits.listForUser(userId)
  const due = habitsDueToday(all, today)
  const completions = await deps.habits.completionsForUserOn(userId, today.date)

  const completedIds = new Set(
    completions.map((completion) => completion.habitId),
  )
  const items = due.map((habit) => ({
    habit,
    completed: completedIds.has(habit.id),
  }))

  return {
    date: today.date,
    items,
    score: dailyScore(due, completions, today.date),
  }
}
