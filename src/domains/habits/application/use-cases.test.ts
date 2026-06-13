import { describe, expect, it } from 'vitest'
import { completeHabit } from './complete-habit'
import { createHabit } from './create-habit'
import { listTodaysHabits } from './list-todays-habits'
import { fakeClock } from '../testing/fake-clock'
import { inMemoryHabitRepository } from '../testing/in-memory-habit-repository'
import type { DraftHabit, Today } from '../domain/types'

const thursday: Today = { date: '2026-06-11', weekday: 'thu' }

function draft(overrides: Partial<DraftHabit> = {}): DraftHabit {
  return {
    title: 'Do 10 push-ups',
    category: 'workout',
    weekdays: ['thu'],
    timer: null,
    ...overrides,
  }
}

describe('habit use cases (with in-memory repo + fake clock)', () => {
  it("lists today's due habits with completion status and the score", async () => {
    const habits = inMemoryHabitRepository()
    const clock = fakeClock(thursday)
    const userId = 'u1'

    const a = await createHabit({ habits }, userId, draft({ title: 'A' }))
    await createHabit(
      { habits },
      userId,
      draft({ title: 'B', weekdays: ['tue'] }),
    ) // not due Thu
    const c = await createHabit({ habits }, userId, draft({ title: 'C' }))

    await completeHabit({ habits, clock }, userId, a.id)

    const result = await listTodaysHabits({ habits, clock }, userId)

    expect(result.date).toBe('2026-06-11')
    expect(
      result.items.map((item) => ({
        id: item.habit.id,
        completed: item.completed,
      })),
    ).toEqual([
      { id: a.id, completed: true },
      { id: c.id, completed: false },
    ])
    expect(result.score).toEqual({ completed: 1, due: 2, ratio: 0.5 })
  })

  it("only counts the requesting user's habits", async () => {
    const habits = inMemoryHabitRepository()
    const clock = fakeClock(thursday)

    await createHabit({ habits }, 'u1', draft({ title: 'mine' }))
    const result = await listTodaysHabits({ habits, clock }, 'u2')

    expect(result.items).toEqual([])
    expect(result.score).toEqual({ completed: 0, due: 0, ratio: 1 })
  })
})
