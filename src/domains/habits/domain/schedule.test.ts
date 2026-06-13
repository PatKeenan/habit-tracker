import { describe, expect, it } from 'vitest'
import { habitsDueToday, isDueToday } from './schedule'
import type { Habit, Today } from './types'

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    title: 'Do 10 push-ups',
    category: 'workout',
    weekdays: ['mon', 'thu'],
    timer: null,
    ...overrides,
  }
}

// Only `weekday` is read by the schedule logic; `date` is carried for completeness.
const thursday: Today = { date: '2026-06-11', weekday: 'thu' }
const tuesday: Today = { date: '2026-06-09', weekday: 'tue' }

describe('isDueToday', () => {
  it('is due when today is one of the habit weekdays', () => {
    expect(isDueToday(makeHabit(), thursday)).toBe(true)
  })

  it('is not due when today is not a habit weekday', () => {
    expect(isDueToday(makeHabit(), tuesday)).toBe(false)
  })

  it('is never due when the habit has no weekdays', () => {
    expect(isDueToday(makeHabit({ weekdays: [] }), thursday)).toBe(false)
  })
})

describe('habitsDueToday', () => {
  it('returns only the habits due today, preserving order', () => {
    const a = makeHabit({ id: 'a', weekdays: ['thu'] })
    const b = makeHabit({ id: 'b', weekdays: ['tue'] })
    const c = makeHabit({ id: 'c', weekdays: ['mon', 'thu'] })
    expect(
      habitsDueToday([a, b, c], thursday).map((habit) => habit.id),
    ).toEqual(['a', 'c'])
  })

  it('returns empty when none are due', () => {
    expect(
      habitsDueToday([makeHabit({ weekdays: ['mon'] })], thursday),
    ).toEqual([])
  })
})
