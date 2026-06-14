import { getRequest } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth'

/**
 * Resolve the current user's id from the request session, server-side.
 *
 * Returns the user id, or `null` when there is no authenticated session.
 * Per ADR 0011 this only *resolves* identity — it does not decide policy.
 * Protected server functions reject on `null` (401 / throw) rather than
 * substituting a default user.
 *
 * Server-only: depends on the incoming request and must never be imported
 * into client/component code.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const result = await auth.api.getSession({
    headers: getRequest().headers,
  })
  return result?.user.id ?? null
}
