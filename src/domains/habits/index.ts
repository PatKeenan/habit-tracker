// Public API for the habits domain. Other modules import from here, never internal paths.

export type {
  Weekday,
  LocalDate,
  Today,
  Category,
  HabitId,
  HabitTimer,
  Habit,
  HabitCompletion,
} from './domain/types'
export { isDueToday, habitsDueToday } from './domain/schedule'
export { dailyScore } from './domain/score'
export type { DailyScore } from './domain/score'
export type { Clock, HabitRepository, Notifier } from './application/ports'
