// Server-side Keycloak service authentication (client_credentials grant).
// Mints a fresh access token for calling the prod /iso-man/api/graphrag/*
// endpoints, and caches it until shortly before expiry. No cookies, no expiry
// babysitting. Configure via env:
//   KEYCLOAK_BASE_URL     e.g. https://quanterra.eastus.cloudapp.azure.com/auth
//   KEYCLOAK_REALM        e.g. quanterra   (default)
//   KEYCLOAK_CLIENT_ID    the service client id
//   KEYCLOAK_CLIENT_SECRET the service client secret
//   KEYCLOAK_TOKEN_URL    optional explicit override

const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID?.trim()
const CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET?.trim()
const REALM = process.env.KEYCLOAK_REALM?.trim() || 'quanterra'
const BASE = process.env.KEYCLOAK_BASE_URL?.trim().replace(/\/$/, '')

export const hasServiceAuth = !!(CLIENT_ID && CLIENT_SECRET && (BASE || process.env.KEYCLOAK_TOKEN_URL))

function tokenUrl(): string {
  return process.env.KEYCLOAK_TOKEN_URL?.trim()
    || `${BASE}/realms/${REALM}/protocol/openid-connect/token`
}

const g = globalThis as unknown as { __rtaToken?: { value: string; exp: number } }

export async function getBearer(): Promise<string | null> {
  if (!hasServiceAuth) return null
  const now = Date.now()
  if (g.__rtaToken && now < g.__rtaToken.exp - 30_000) return g.__rtaToken.value

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID!,
    client_secret: CLIENT_SECRET!,
  })
  const res = await fetch(tokenUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    console.error('[auth] token request failed', res.status, await res.text().catch(() => ''))
    return null
  }
  const j = await res.json()
  g.__rtaToken = { value: j.access_token, exp: now + (Number(j.expires_in) || 300) * 1000 }
  return g.__rtaToken.value
}
