import { describe, expect, it } from 'vitest'
import { dailyScore } from './score'
import type { Habit, HabitCompletion } from './types'

function makeHabit(id: string): Habit {
  return { id, title: id, category: 'general', weekdays: ['mon'], timer: null }
}

const date = '2026-06-08'

describe('dailyScore', () => {
  it('scores the fraction of due habits completed on the date', () => {
    const due = [makeHabit('a'), makeHabit('b'), makeHabit('c'), makeHabit('d')]
    const completions: HabitCompletion[] = [
      { habitId: 'a', date },
      { habitId: 'c', date },
    ]
    expect(dailyScore(due, completions, date)).toEqual({
      completed: 2,
      due: 4,
      ratio: 0.5,
    })
  })

  it('ignores completions from other dates', () => {
    const due = [makeHabit('a')]
    const completions: HabitCompletion[] = [
      { habitId: 'a', date: '2026-06-07' },
    ]
    expect(dailyScore(due, completions, date)).toEqual({
      completed: 0,
      due: 1,
      ratio: 0,
    })
  })

  it('ignores completions for habits that are not due', () => {
    const due = [makeHabit('a')]
    const completions: HabitCompletion[] = [
      { habitId: 'a', date },
      { habitId: 'z', date },
    ]
    expect(dailyScore(due, completions, date)).toEqual({
      completed: 1,
      due: 1,
      ratio: 1,
    })
  })

  it('scores 1 when nothing is due', () => {
    expect(dailyScore([], [], date)).toEqual({ completed: 0, due: 0, ratio: 1 })
  })
})
