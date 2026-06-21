import { NextResponse } from 'next/server'
import { UPSTREAM, checklistUrl, buildHeaders } from '@/lib/upstream'
import { getStandard } from '@/lib/standards'

// Real clauses for a standard from the prod checklist; falls back to built-in.
export async function GET(_req: Request, { params }: { params: Promise<{ iso: string }> }) {
  const { iso } = await params
  if (UPSTREAM) {
    try {
      const res = await fetch(checklistUrl(iso), { cache: 'no-store', headers: await buildHeaders() })
      if (res.ok) {
        const data = await res.json()
        const raw = data?.checklist?.clauses ?? []
        const clauses = raw.map((c: any) => ({
          number: String(c.clause),
          title: c.title || '',
          dept: c.dept || '',
        }))
        if (clauses.length) return NextResponse.json({ clauses, mode: 'live' })
      }
    } catch { /* fall through */ }
  }
  const s = getStandard(iso)
  return NextResponse.json({
    clauses: (s?.clauses ?? []).map((c) => ({ number: c.number, title: c.title, dept: '' })),
    mode: 'demo',
  })
}
