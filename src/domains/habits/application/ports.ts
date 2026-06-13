import type {
  DraftHabit,
  Habit,
  HabitCompletion,
  LocalDate,
  Today,
} from '../domain/types'

// Outbound ports the habits core depends on. Interfaces only — implemented by adapters.

/** Supplies the current local day. An adapter resolves the user's timezone. */
export interface Clock {
  today: () => Today
}

/** Persists and retrieves a user's habits and completions. */
export interface HabitRepository {
  listForUser: (userId: string) => Promise<ReadonlyArray<Habit>>
  /** Persists a new habit and returns it with its assigned id. */
  add: (userId: string, draft: DraftHabit) => Promise<Habit>
  recordCompletion: (
    userId: string,
    completion: HabitCompletion,
  ) => Promise<void>
  completionsForUserOn: (
    userId: string,
    date: LocalDate,
  ) => Promise<ReadonlyArray<HabitCompletion>>
}

/** Notifies the user about timed-habit events (e.g. a timer finishing). Stubbed for now. */
export interface Notifier {
  timerCompleted: (habit: Habit) => Promise<void>
}
