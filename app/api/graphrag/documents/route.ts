import { NextResponse } from 'next/server'
import { demoStore } from '@/lib/store'
import { hasUpstream, docsUrl, buildHeaders } from '@/lib/upstream'

export async function GET() {
  if (hasUpstream) {
    try {
      const res = await fetch(docsUrl(), { cache: 'no-store', headers: await buildHeaders() })
      const data = await res.json()
      return NextResponse.json({ ...data, mode: 'live' })
    } catch (err) {
      return NextResponse.json({ documents: [], count: 0, mode: 'live', error: String(err) })
    }
  }
  const docs = demoStore.list()
  return NextResponse.json({ documents: docs, count: docs.length, mode: 'demo' })
}
