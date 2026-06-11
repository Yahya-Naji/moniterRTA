import { NextResponse } from 'next/server'
import { demoStore } from '@/lib/store'
import { hasUpstream, uploadUrl, fwdHeaders } from '@/lib/upstream'

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // ── Live mode: forward to the real upstream (main app or GraphRAG) ────────
  if (hasUpstream) {
    try {
      const fwd = new FormData()
      fwd.append('file', file, file.name)
      const res = await fetch(uploadUrl(), { method: 'POST', body: fwd, headers: fwdHeaders })
      const text = await res.text()
      if (!res.ok) return NextResponse.json({ error: text, mode: 'live' }, { status: res.status })
      let data: unknown = text
      try { data = JSON.parse(text) } catch { /* keep raw */ }
      return NextResponse.json({ mode: 'live', saved: file.name, upstream: data })
    } catch (err) {
      return NextResponse.json({ error: String(err), mode: 'live' }, { status: 502 })
    }
  }

  // ── Demo mode: record it locally ─────────────────────────────────────────
  const size = (file as File).size ?? 0
  demoStore.add({ filename: file.name, size_bytes: size, modified_at: new Date().toISOString() })
  return NextResponse.json({ mode: 'demo', saved: file.name, size_bytes: size })
}
