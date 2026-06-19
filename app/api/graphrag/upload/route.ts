import { NextResponse } from 'next/server'
import { demoStore } from '@/lib/store'
import { hasUpstream, uploadUrl, extractUrl, buildHeaders } from '@/lib/upstream'
import { encodeDocName, buildMetadata } from '@/lib/docname'

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  const std = String(form.get('std') ?? '')
  const clause = String(form.get('clause') ?? '')
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const original = file.name
  // Canonical name the ISO dashboard parses: ISO{id}__CL{clause}__name.txt
  const encoded = std && clause ? encodeDocName(std, clause, original) : original

  if (hasUpstream) {
    try {
      const headers = await buildHeaders()

      // 1. Get text. PDFs / docx are converted by the prod extract-text endpoint.
      let text = ''
      if (original.toLowerCase().endsWith('.txt')) {
        text = await file.text()
      } else if (extractUrl()) {
        const ef = new FormData()
        ef.append('file', file, original)
        const er = await fetch(extractUrl()!, { method: 'POST', body: ef, headers })
        if (!er.ok) {
          return NextResponse.json({ error: `extract-text failed: ${await er.text()}`, mode: 'live' }, { status: er.status })
        }
        text = (await er.json().catch(() => ({}))).text ?? ''
      } else {
        text = await file.text().catch(() => '')
      }

      // 2. Wrap with the metadata header + canonical name, forward to prod upload.
      const meta = std && clause ? buildMetadata(std, clause, original) : ''
      const blob = new Blob([meta + text], { type: 'text/plain' })
      const uf = new FormData()
      uf.append('file', blob, encoded)
      const ur = await fetch(uploadUrl(), { method: 'POST', body: uf, headers })
      const t = await ur.text()
      if (!ur.ok) return NextResponse.json({ error: t, mode: 'live' }, { status: ur.status })
      let data: unknown = t
      try { data = JSON.parse(t) } catch { /* keep raw */ }
      return NextResponse.json({ mode: 'live', saved: encoded, upstream: data })
    } catch (err) {
      return NextResponse.json({ error: String(err), mode: 'live' }, { status: 502 })
    }
  }

  // Demo fallback — record locally.
  demoStore.add({ filename: encoded, size_bytes: file.size ?? 0, modified_at: new Date().toISOString() })
  return NextResponse.json({ mode: 'demo', saved: encoded, size_bytes: file.size ?? 0 })
}
