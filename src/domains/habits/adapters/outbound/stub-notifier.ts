import type { Notifier } from '../../application/ports'

/**
 * No-op Notifier. Timed-habit alarms run in-app for now; real background notifications
 * (PWA service-worker push) are deferred and will implement this same port.
 */
export function stubNotifier(): Notifier {
  return {
    timerCompleted: () => Promise.resolve(),
  }
}
