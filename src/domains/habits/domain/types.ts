// Pure domain types for the habits domain. No framework, ORM, clock, or I/O.

/** Days of the week a habit can recur on. */
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

/** A calendar date in the user's local timezone, ISO `YYYY-MM-DD`. */
export type LocalDate = string

/**
 * The current local day, supplied by the `Clock` port. The adapter resolves the
 * timezone and computes the weekday; the core just reads these values.
 */
export interface Today {
  readonly date: LocalDate
  readonly weekday: Weekday
}

/** User-defined habit category, e.g. "workout" or "health & wellness". */
export type Category = string

/** Identifies a habit. Assigned by the persistence adapter; opaque to the core. */
export type HabitId = string

/** A timed habit runs a timer for a fixed duration (e.g. meditate for 60 minutes). */
export interface HabitTimer {
  readonly durationMinutes: number
}

/** A habit the user wants to perform on a set of weekdays. */
export interface Habit {
  readonly id: HabitId
  readonly title: string
  readonly category: Category
  /** The weekdays this habit recurs on, treated as a set. */
  readonly weekdays: ReadonlyArray<Weekday>
  /** Present when the habit is timed; `null` for a simple check-off habit. */
  readonly timer: HabitTimer | null
}

/** Records that a habit was completed on a given local date. */
export interface HabitCompletion {
  readonly habitId: HabitId
  readonly date: LocalDate
}
