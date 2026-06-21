// Resolves where Sentinel sends evidence, and how it authenticates.
//
// RECOMMENDED (prod indexing via the ISO dashboard endpoints):
//   UPSTREAM_API_URL = https://quanterra.eastus.cloudapp.azure.com/iso-man/api/graphrag
//   + a Keycloak service client (see lib/auth.ts):
//       KEYCLOAK_BASE_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET
//   The server mints a fresh bearer token per request — no cookie babysitting.
//
// Manual-credential fallbacks (short-lived):
//   UPSTREAM_AUTH   = "Bearer eyJ..."        UPSTREAM_COOKIE = "kc_access=...; ..."
//
// Direct GraphRAG (e.g. ngrok): GRAPHRAG_API_URL = https://xxxx.ngrok-free.dev
// None set → Demo mode (local simulation).

import { getBearer } from './auth'

const clean = (v?: string) => v?.trim().replace(/\/$/, '') || ''

export const UPSTREAM = clean(process.env.UPSTREAM_API_URL)
export const GRAPHRAG = clean(process.env.GRAPHRAG_API_URL)
export const hasUpstream = !!(UPSTREAM || GRAPHRAG)

// Build per-request headers: ngrok-skip + auth. A freshly-minted service token
// takes precedence; otherwise fall back to a manually supplied bearer/cookie.
export async function buildHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const h: Record<string, string> = { 'ngrok-skip-browser-warning': 'true', ...(extra || {}) }
  const bearer = await getBearer()
  if (bearer) {
    // The prod /api/graphrag middleware authenticates via the kc_access cookie,
    // not the Authorization header — so present the minted service token there.
    h['Authorization'] = `Bearer ${bearer}`
    h['Cookie'] = `kc_access=${bearer}`
  } else if (process.env.UPSTREAM_AUTH?.trim()) {
    h['Authorization'] = process.env.UPSTREAM_AUTH.trim()
  }
  // Explicit cookie (manual fallback) wins if provided.
  if (process.env.UPSTREAM_COOKIE?.trim()) h['Cookie'] = process.env.UPSTREAM_COOKIE.trim()
  return h
}

// The prod app API base (one level up from /graphrag) for standards + clauses.
const appBase = () => (UPSTREAM ? UPSTREAM.replace(/\/graphrag$/, '') : '')
export const standardsUrl = () => `${appBase()}/iso-standards`
export const checklistUrl = (id: string) => `${appBase()}/checklist/${encodeURIComponent(id)}`

// extract-text only exists on the prod Next app (UPSTREAM), not on raw GraphRAG.
export const extractUrl = () => (UPSTREAM ? `${UPSTREAM}/extract-text` : null)
export const docsUrl = () => (UPSTREAM ? `${UPSTREAM}/documents` : `${GRAPHRAG}/documents`)
export const uploadUrl = () => (UPSTREAM ? `${UPSTREAM}/upload` : `${GRAPHRAG}/documents/upload`)
export const indexStatusUrl = () => (UPSTREAM ? `${UPSTREAM}/index` : `${GRAPHRAG}/index/status`)
export const indexTriggerUrl = () => (UPSTREAM ? `${UPSTREAM}/index` : `${GRAPHRAG}/index`)
