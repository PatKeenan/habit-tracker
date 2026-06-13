// Public API for the habits domain. Other modules import from here, never internal paths.

export type {
  Weekday,
  LocalDate,
  Today,
  Category,
  HabitId,
  HabitTimer,
  Habit,
  DraftHabit,
  HabitCompletion,
} from './domain/types'
export { isDueToday, habitsDueToday } from './domain/schedule'
export { dailyScore } from './domain/score'
export type { DailyScore } from './domain/score'
export type { Clock, HabitRepository, Notifier } from './application/ports'

// Use cases (inbound ports) — the surface routes/adapters call.
export { listTodaysHabits } from './application/list-todays-habits'
export type {
  TodaysHabit,
  TodaysHabits,
  ListTodaysHabitsDeps,
} from './application/list-todays-habits'
export { createHabit } from './application/create-habit'
export type { CreateHabitDeps } from './application/create-habit'
export { completeHabit } from './application/complete-habit'
export type { CompleteHabitDeps } from './application/complete-habit'
