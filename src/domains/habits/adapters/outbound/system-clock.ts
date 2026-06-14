import type { Clock } from '../../application/ports'
import type { Weekday } from '../../domain/types'

const WEEKDAY_BY_SHORT: Record<string, Weekday> = {
  sun: 'sun',
  mon: 'mon',
  tue: 'tue',
  wed: 'wed',
  thu: 'thu',
  fri: 'fri',
  sat: 'sat',
}

/**
 * Real Clock: resolves the current local day in the given timezone (defaults to the
 * runtime timezone). This is where timezone handling lives — the core stays date-free.
 */
export function systemClock(timeZone?: string): Clock {
  return {
    today: () => {
      const now = new Date()
      const date = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(now)
      const short = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'short',
      })
        .format(now)
        .toLowerCase()
      return { date, weekday: WEEKDAY_BY_SHORT[short] }
    },
  }
}
