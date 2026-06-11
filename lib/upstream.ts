// Resolves where Sentinel sends evidence, and how it authenticates.
//
// To mirror the main app exactly (recommended), set:
//   UPSTREAM_API_URL = https://quanterra.eastus.cloudapp.azure.com/iso-man/api/graphrag
// plus ONE of the credentials your logged-in browser sends:
//   UPSTREAM_AUTH    = "Bearer eyJhbGciOi..."     (copy from a request's Authorization header)
//   UPSTREAM_COOKIE  = "KEYCLOAK_SESSION=...; ..." (copy from a request's Cookie header)
//
// Alternatively point straight at a reachable GraphRAG (e.g. ngrok):
//   GRAPHRAG_API_URL = https://xxxx.ngrok-free.dev
//
// Set none of the above → Demo mode (local simulation).

const clean = (v?: string) => v?.trim().replace(/\/$/, '') || ''

export const UPSTREAM = clean(process.env.UPSTREAM_API_URL)
export const GRAPHRAG = clean(process.env.GRAPHRAG_API_URL)
export const hasUpstream = !!(UPSTREAM || GRAPHRAG)

// Headers forwarded on every upstream request: skip ngrok's interstitial, and
// pass through whichever auth credential was configured so we look like the
// logged-in browser to the main app's auth gate.
export const fwdHeaders: Record<string, string> = { 'ngrok-skip-browser-warning': 'true' }
if (process.env.UPSTREAM_AUTH?.trim()) fwdHeaders['Authorization'] = process.env.UPSTREAM_AUTH.trim()
if (process.env.UPSTREAM_COOKIE?.trim()) fwdHeaders['Cookie'] = process.env.UPSTREAM_COOKIE.trim()

export const docsUrl = () => (UPSTREAM ? `${UPSTREAM}/documents` : `${GRAPHRAG}/documents`)
export const uploadUrl = () => (UPSTREAM ? `${UPSTREAM}/upload` : `${GRAPHRAG}/documents/upload`)
export const indexStatusUrl = () => (UPSTREAM ? `${UPSTREAM}/index` : `${GRAPHRAG}/index/status`)
export const indexTriggerUrl = () => (UPSTREAM ? `${UPSTREAM}/index` : `${GRAPHRAG}/index`)
