import { NextResponse } from 'next/server'
import { UPSTREAM, standardsUrl, buildHeaders } from '@/lib/upstream'
import { STANDARDS } from '@/lib/standards'

// Real standards from the prod ISO platform; falls back to the built-in set.
export async function GET() {
  if (UPSTREAM) {
    try {
      const res = await fetch(standardsUrl(), { cache: 'no-store', headers: await buildHeaders() })
      if (res.ok) {
        const data = await res.json()
        const standards = (Array.isArray(data) ? data : [])
          .filter((s: any) => s && (s.active ?? 1))
          .map((s: any) => ({
            id: String(s.id),
            code: s.name || `ISO ${s.id}`,
            full: s.full_name || '',
            color: s.color || '#6366f1',
            clauseCount: Number(s.clause_count) || 0,
          }))
        if (standards.length) return NextResponse.json({ standards, mode: 'live' })
      }
    } catch { /* fall through */ }
  }
  const standards = STANDARDS.map((s) => ({
    id: s.id, code: s.code, full: s.domain, color: '#6366f1', clauseCount: s.clauses.length,
  }))
  return NextResponse.json({ standards, mode: 'demo' })
}
