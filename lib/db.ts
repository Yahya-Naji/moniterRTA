// Postgres persistence for evidence + AI evaluations.
// Falls back to null when DATABASE_URL is not set (the API routes then use the
// in-memory demo store), so local/demo use needs no database.

import { Pool } from 'pg'

const URL = process.env.DATABASE_URL?.trim()
export const hasDb = !!URL

const g = globalThis as unknown as { __rtaPool?: Pool; __rtaSchemaReady?: Promise<void> }

export function getPool(): Pool {
  if (!g.__rtaPool) {
    g.__rtaPool = new Pool({
      connectionString: URL,
      max: 5,
      ssl: { rejectUnauthorized: false }, // Supabase / managed PG
    })
  }
  return g.__rtaPool
}

export function ensureSchema(): Promise<void> {
  if (!g.__rtaSchemaReady) {
    g.__rtaSchemaReady = (async () => {
      const pool = getPool()
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rta_evidence (
          id            TEXT PRIMARY KEY,
          std_id        TEXT NOT NULL,
          clause        TEXT NOT NULL,
          filename      TEXT NOT NULL UNIQUE,
          original_name TEXT,
          content       TEXT,
          size_bytes    INTEGER,
          created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS rta_evaluations (
          id          TEXT PRIMARY KEY,
          evidence_id TEXT REFERENCES rta_evidence(id) ON DELETE CASCADE,
          status      TEXT,
          score       INTEGER,
          summary     TEXT,
          gaps        JSONB,
          model       TEXT,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_eval_evidence ON rta_evaluations(evidence_id);
      `)
    })()
  }
  return g.__rtaSchemaReady
}
