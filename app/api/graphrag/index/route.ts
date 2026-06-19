import { NextResponse } from 'next/server'
import { demoStore } from '@/lib/store'
import { hasUpstream, indexStatusUrl, indexTriggerUrl, buildHeaders } from '@/lib/upstream'

// GET → index status
export async function GET() {
  if (hasUpstream) {
    try {
      const res = await fetch(indexStatusUrl(), { cache: 'no-store', headers: await buildHeaders() })
      const data = await res.json()
      return NextResponse.json({ ...data, mode: 'live' })
    } catch (err) {
      return NextResponse.json({ state: 'idle', error: String(err), mode: 'live' })
    }
  }
  return NextResponse.json({ ...demoStore.indexState(), recent_log: [], error: null, mode: 'demo' })
}

// POST → trigger (re)index
export async function POST() {
  if (hasUpstream) {
    try {
      const res = await fetch(indexTriggerUrl(), { method: 'POST', headers: await buildHeaders() })
      const data = await res.json().catch(() => ({}))
      return NextResponse.json({ ...data, mode: 'live' }, { status: res.ok ? 200 : res.status })
    } catch (err) {
      return NextResponse.json({ error: String(err), mode: 'live' }, { status: 502 })
    }
  }

  // Demo mode: simulate a short indexing run.
  const now = new Date().toISOString()
  demoStore.setIndex('running', now)
  setTimeout(() => demoStore.setIndex('completed', new Date().toISOString()), 6000)
  return NextResponse.json({ mode: 'demo', message: 'Indexing started (demo)', state: 'running' })
}
