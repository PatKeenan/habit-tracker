import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { drizzle } from 'drizzle-orm/neon-http'
import { sql } from '@/lib/db'
import * as authSchema from '@/lib/auth-schema'

// Fail fast rather than booting auth with an unsigned/ephemeral secret (ADR 0010).
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is required (set it in .env.local)')
}

// Auth owns its own typed Drizzle instance over the shared Neon client (ADR 0003),
// registering only the Better Auth-owned tables. transaction: false because the
// neon-http driver has no interactive transactions (see docs/gotchas.md).
const authDb = drizzle(sql, { schema: authSchema })

export const auth = betterAuth({
  database: drizzleAdapter(authDb, {
    provider: 'pg',
    schema: authSchema,
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
})
