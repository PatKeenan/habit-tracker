import { neon } from '@neondatabase/serverless'

// The shared Neon serverless (HTTP) connection — see ADR 0003. Each domain's outbound
// adapter wraps this with its own schema via drizzle(sql, { schema }), so schema
// registration stays domain-local and lib/ never imports a domain. Server-only.

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required (set it in .env.local)')
}

export const sql = neon(databaseUrl)
