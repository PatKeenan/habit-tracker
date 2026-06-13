import type { Clock } from '../application/ports'
import type { Today } from '../domain/types'

/** A Clock that always returns a fixed day. For tests. */
export function fakeClock(today: Today): Clock {
  return { today: () => today }
}
