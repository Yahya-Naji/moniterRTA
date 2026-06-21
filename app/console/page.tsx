'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck, Upload, FileText, Database, Activity, CheckCircle2, FolderOpen,
  Layers, Radar, Loader2, LayoutDashboard, AlertTriangle, TrendingUp, Bell, X,
  Train, Car, Globe, Clock, ListChecks, FileCheck,
} from 'lucide-react'
import { parseDocName } from '@/lib/docname'
import {
  TREND, SEVERITY, SYSTEMS, AV_OPERATORS, COLLAB, ATTENTION,
  SEED_ALERTS, ALERT_POOL, band, sevMeta,
} from '@/lib/mock'

type Std = { id: string; code: string; full: string; color: string; clauseCount: number }
type Clause = { number: string; title: string; dept?: string }
type FeedEvent = { id: string; at: number; kind: string; message: string }
type Note = { id: string; at: number; title: string; body: string; sev: string; read: boolean }
type Toast = { id: string; title: string; body: string; sev: string }

let counter = 0
const uid = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`
const HEARTBEATS = [
  'Integrity check passed — no safety-evidence drift detected',
  'Certification coverage scan complete across all standards',
  'Safety knowledge-graph consistency verified',
  'Clause-to-evidence mapping re-validated',
  'Freshness sweep complete — safety evidence current',
  'Continuous compliance monitor heartbeat — all systems nominal',
]
const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const ago = (ts: number) => { const s = Math.max(1, Math.round((Date.now() - ts) / 1000)); if (s < 60) return `${s}s ago`; const m = Math.round(s / 60); return m < 60 ? `${m}m ago` : `${Math.round(m / 60)}h ago` }

export default function Console() {
  const [tab, setTab] = useState<'dashboard' | 'evidence'>('dashboard')
  const [standards, setStandards] = useState<Std[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [clauses, setClauses] = useState<Clause[]>([])
  const [clausesLoading, setClausesLoading] = useState(false)
  const [fetchedDocs, setFetchedDocs] = useState<string[]>([])
  const [localDocs, setLocalDocs] = useState<string[]>([])
  const [feed, setFeed] = useState<FeedEvent[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [bellOpen, setBellOpen] = useState(false)
  const [uploadingClause, setUploadingClause] = useState<string | null>(null)
  const [indexState, setIndexState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle')
  const [lastSync, setLastSync] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeClauseRef = useRef<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const documents = useMemo(() => Array.from(new Set([...localDocs, ...fetchedDocs])), [localDocs, fetchedDocs])
  const unread = notes.filter((n) => !n.read).length
  const standard = standards.find((s) => s.id === selectedId)

  const pushEvent = useCallback((kind: string, message: string) => {
    setFeed((prev) => [{ id: uid(), at: Date.now(), kind, message }, ...prev].slice(0, 60))
  }, [])
  const notify = useCallback((title: string, body: string, sev: string) => {
    const id = uid()
    setNotes((prev) => [{ id, at: Date.now(), title, body, sev, read: false }, ...prev].slice(0, 40))
    setToasts((prev) => [{ id, title, body, sev }, ...prev].slice(0, 4))
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5500)
  }, [])

  const refreshDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/graphrag/documents', { cache: 'no-store' })
      const data = await res.json()
      setFetchedDocs((data.documents ?? []).map((d: { filename: string }) => d.filename))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetch('/api/standards', { cache: 'no-store' }).then((r) => r.json()).then((d) => {
      const list: Std[] = d.standards ?? []
      setStandards(list)
      setSelectedId((cur) => cur || list[0]?.id || '')
    }).catch(() => {})
    void refreshDocuments()
    setNotes(SEED_ALERTS.map((a, i) => ({ id: uid(), at: Date.now() - (i + 1) * 600_000, title: a.title, body: a.body, sev: a.sev, read: false })))
  }, [refreshDocuments])

  useEffect(() => {
    if (!selectedId) return
    let cancel = false
    setClausesLoading(true)
    fetch(`/api/clauses/${encodeURIComponent(selectedId)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (!cancel) { setClauses(d.clauses ?? []); setClausesLoading(false) } })
      .catch(() => { if (!cancel) setClausesLoading(false) })
    return () => { cancel = true }
  }, [selectedId])

  useEffect(() => {
    setLastSync(Date.now())
    const t = setInterval(() => { pushEvent('heartbeat', HEARTBEATS[Math.floor(Math.random() * HEARTBEATS.length)]); setLastSync(Date.now()) }, 5000)
    return () => clearInterval(t)
  }, [pushEvent])
  useEffect(() => {
    const t = setInterval(() => {
      const a = ALERT_POOL[Math.floor(Math.random() * ALERT_POOL.length)]
      notify(a.title, a.body, a.sev); pushEvent(a.sev === 'info' ? 'monitor' : 'index', a.body)
    }, 14000)
    return () => clearInterval(t)
  }, [notify, pushEvent])

  const docIndex = useMemo(() => {
    const m: Record<string, { count: number; clauses: Record<string, string[]> }> = {}
    for (const name of documents) {
      const p = parseDocName(name)
      if (!p) continue
      const e = (m[p.isoId] ??= { count: 0, clauses: {} })
      e.count++
      ;(e.clauses[p.clause] ??= []).push(name)
    }
    return m
  }, [documents])

  const coveredOf = (id: string) => Object.keys(docIndex[id]?.clauses ?? {}).length
  const totalClauses = standards.reduce((n, s) => n + s.clauseCount, 0)
  const totalCovered = standards.reduce((n, s) => n + coveredOf(s.id), 0)
  const overallCoverage = totalClauses ? Math.round((totalCovered / totalClauses) * 100) : 0
  const sel = docIndex[selectedId] ?? { count: 0, clauses: {} }
  const docsForStd = sel.count
  const coveredClauses = Object.keys(sel.clauses).length
  const clauseTitle = (num: string) => clauses.find((c) => c.number === num)?.title || ''

  const onUploadClick = (clause: string) => { activeClauseRef.current = clause; fileInputRef.current?.click() }
  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const clause = activeClauseRef.current
    const files = Array.from(e.target.files ?? [])
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!clause || !files.length || !standard) return
    setUploadingClause(clause)
    pushEvent('upload', `Receiving ${files.length} document(s) for ${standard.code} clause ${clause}`)
    for (const file of files) {
      try {
        const form = new FormData()
        form.append('file', file, file.name); form.append('std', selectedId); form.append('clause', clause)
        const res = await fetch('/api/graphrag/upload', { method: 'POST', body: form })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json().catch(() => ({}))
        if (data.saved) setLocalDocs((prev) => [data.saved, ...prev])
        pushEvent('transmit', `Transmitted to safety knowledge graph — ${file.name}`)
      } catch { pushEvent('error', `Upload failed — ${file.name}`) }
    }
    setUploadingClause(null)
    await refreshDocuments()
    notify('Evidence received', `${files.length} document(s) added to ${standard.code} clause ${clause}.`, 'info')
    pushEvent('index', `Evidence stored for ${standard.code} clause ${clause} — ready to re-index`)
  }

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
  useEffect(() => () => stopPolling(), [])
  const handleIndex = async () => {
    setIndexState('running')
    pushEvent('index', 'Re-indexing safety knowledge graph with latest evidence…')
    try {
      const res = await fetch('/api/graphrag/index', { method: 'POST' })
      if (!res.ok) { setIndexState('failed'); pushEvent('error', 'Indexing failed to start'); return }
    } catch { setIndexState('failed'); pushEvent('error', 'Indexing request failed'); return }
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/graphrag/index', { cache: 'no-store' })
        const data = await res.json()
        if (data.state === 'completed') {
          setIndexState('completed'); stopPolling(); setLastSync(Date.now())
          pushEvent('monitor', 'Re-index complete — evidence under continuous monitoring')
          notify('Re-index complete', 'Safety knowledge graph rebuilt with the latest evidence.', 'info')
          await refreshDocuments()
        } else if (data.state === 'failed') { setIndexState('failed'); stopPolling(); pushEvent('error', 'Indexing failed') }
      } catch { /* ignore */ }
    }, 2000)
  }

  return (
    <div className="flex min-h-screen">
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesSelected} />
      <ToastStack toasts={toasts} onClose={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-[#0e1424] to-[#0a0f1c] text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-900/40"><ShieldCheck className="h-5 w-5 text-white" /></div>
            <div className="leading-tight">
              <p className="text-sm font-bold">Safety Sentinel</p>
              <p className="text-[11px] text-white/50">RTA Dubai</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">Monitoring</p>
          <button onClick={() => setTab('dashboard')} className={`nav-link w-full ${tab === 'dashboard' ? 'active' : ''}`}><LayoutDashboard className="h-4 w-4" /> Dashboard</button>
          <button onClick={() => setTab('evidence')} className={`nav-link w-full ${tab === 'evidence' ? 'active' : ''}`}><FolderOpen className="h-4 w-4" /> Evidence Library</button>
        </nav>
        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-2"><span className="live-dot h-2 w-2 rounded-full bg-emerald-400" /><span className="text-xs font-medium text-white/70">Live · Monitoring</span></div>
          <p className="mt-2 text-[11px] text-white/40">{documents.length} documents · {standards.length} standards</p>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1" onClick={() => bellOpen && setBellOpen(false)}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e7e9ee] bg-white/80 px-5 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 lg:hidden"><ShieldCheck className="h-5 w-5 text-white" /></Link>
            <div>
              <h1 className="text-base font-bold text-gray-900">{tab === 'dashboard' ? 'Safety Governance Overview' : 'Evidence Library'}</h1>
              <p className="hidden text-xs text-gray-400 sm:block">{tab === 'dashboard' ? 'Continuous certification readiness & assurance' : 'Indexed evidence by standard & clause'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 md:flex">
              <span className="live-dot h-2.5 w-2.5 rounded-full bg-emerald-500" /><span className="text-xs font-medium text-emerald-700">Live</span>
            </div>
            {/* mobile tabs */}
            <div className="flex gap-1 lg:hidden">
              <button onClick={() => setTab('dashboard')} className={`rounded-lg p-2 ${tab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}><LayoutDashboard className="h-4 w-4" /></button>
              <button onClick={() => setTab('evidence')} className={`rounded-lg p-2 ${tab === 'evidence' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}><FolderOpen className="h-4 w-4" /></button>
            </div>
            <div className="relative">
              <button onClick={() => { setBellOpen((o) => !o); setNotes((p) => p.map((n) => ({ ...n, read: true }))) }} className="relative grid h-9 w-9 place-items-center rounded-lg border border-[#e7e9ee] bg-white text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600">
                <Bell className="h-4.5 w-4.5" />
                {unread > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
              </button>
              {bellOpen && <NotificationPanel notes={notes} onClose={() => setBellOpen(false)} onClear={() => setNotes([])} />}
            </div>
            {tab === 'evidence' && (
              <button onClick={handleIndex} disabled={indexState === 'running'} className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60">
                {indexState === 'running' ? <><Loader2 className="h-4 w-4 animate-spin" /> Re-indexing…</> : <><Database className="h-4 w-4" /> Re-index</>}
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 pb-16 pt-7 lg:px-8">
          {tab === 'dashboard' ? (
            <Dashboard standards={standards} coveredOf={coveredOf} docIndex={docIndex} overall={overallCoverage} totalDocs={documents.length} totalCovered={totalCovered} lastSync={lastSync} feed={feed} />
          ) : (
            <Evidence standards={standards} standard={standard} selectedId={selectedId} setSelectedId={setSelectedId} clauses={clauses} clausesLoading={clausesLoading} sel={sel} docsForStd={docsForStd} coveredClauses={coveredClauses} clauseTitle={clauseTitle} uploadingClause={uploadingClause} onUploadClick={onUploadClick} feed={feed} lastSync={lastSync} />
          )}
        </main>
      </div>
    </div>
  )
}

/* ───────────── Dashboard ───────────── */
function Dashboard({ standards, coveredOf, docIndex, overall, totalDocs, totalCovered, lastSync, feed }: any) {
  const sevTotal = SEVERITY.major + SEVERITY.minor + SEVERITY.ofi
  const recent = feed.filter((e: FeedEvent) => e.kind !== 'heartbeat').slice(0, 6)
  return (
    <>
      <section className="animate-fade-up">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Certification readiness, <span className="gradient-text">continuously monitored.</span></h2>
        <p className="mt-1.5 max-w-2xl text-sm text-gray-500">Live safety-assurance posture across RTA Dubai’s management-system standards — real evidence coverage from the knowledge graph, plus programme and operator readiness.</p>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={<Radar className="h-5 w-5" />} label="Evidence Coverage" value={`${overall}%`} hint="clauses with evidence" accent />
        <Kpi icon={<Database className="h-5 w-5" />} label="Evidence Documents" value={String(totalDocs)} hint="indexed & monitored" />
        <Kpi icon={<FileCheck className="h-5 w-5" />} label="Clauses Covered" value={String(totalCovered)} hint="across all standards" />
        <Kpi icon={<Layers className="h-5 w-5" />} label="Standards Monitored" value={String(standards.length)} hint="management systems" />
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="card animate-fade-up-delay-1 lg:col-span-3">
          <div className="border-b border-[#eef0f4] px-5 py-3.5"><p className="text-sm font-semibold text-gray-900">Evidence Coverage by Standard</p></div>
          <ul className="slim-scroll max-h-[420px] divide-y divide-[#f1f2f5] overflow-y-auto">
            {standards.length === 0 ? <li className="px-5 py-8 text-center text-sm text-gray-400">Loading standards…</li> : standards.map((s: Std) => {
              const covered = coveredOf(s.id), pct = s.clauseCount ? Math.round((covered / s.clauseCount) * 100) : 0, b = band(pct)
              return (
                <li key={s.id} className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Dot color={s.color} />
                    <span className="w-28 truncate text-sm font-semibold text-gray-800">{s.code}</span>
                    <span className="hidden flex-1 truncate text-xs text-gray-400 sm:block">{s.full}</span>
                    <span className={`text-xs font-medium ${b.text}`}>{b.label}</span>
                    <span className="w-10 text-right text-sm font-semibold text-gray-900">{pct}%</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${b.bar}`} style={{ width: `${pct}%` }} /></div>
                    <span className="w-24 text-right text-[11px] text-gray-400">{docIndex[s.id]?.count ?? 0} docs · {covered}/{s.clauseCount}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="lg:col-span-2 space-y-5">
          <div className="card animate-fade-up-delay-1 p-5">
            <div className="flex items-center gap-2 text-gray-500"><TrendingUp className="h-4 w-4 text-indigo-500" /><span className="text-sm font-semibold text-gray-900">Readiness Trend</span><span className="ml-auto text-xs text-gray-400">last 30 days</span></div>
            <div className="mt-3 flex items-end gap-3"><span className="text-3xl font-bold gradient-text">{overall}%</span><span className="mb-1 text-xs font-medium text-emerald-600">▲ live</span></div>
            <Sparkline data={[...TREND.slice(0, -1), Math.max(TREND[0], overall)]} className="mt-2 h-14 w-full text-indigo-500" />
          </div>
          <div className="card animate-fade-up-delay-2 flex items-center gap-5 p-5">
            <Donut pct={overall} /><div><p className="text-sm font-semibold text-gray-900">Overall Coverage</p><p className="mt-1 text-xs text-gray-500">Clauses with at least one indexed evidence document, across all standards.</p></div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="card animate-fade-up-delay-1 p-5 lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900">Safety Findings by Severity</p>
          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
            <div className="bg-rose-500" style={{ width: `${(SEVERITY.major / sevTotal) * 100}%` }} />
            <div className="bg-amber-500" style={{ width: `${(SEVERITY.minor / sevTotal) * 100}%` }} />
            <div className="bg-sky-500" style={{ width: `${(SEVERITY.ofi / sevTotal) * 100}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {([['major', SEVERITY.major], ['minor', SEVERITY.minor], ['ofi', SEVERITY.ofi]] as const).map(([k, v]) => (
              <div key={k} className={`rounded-lg ${sevMeta[k].bg} py-3`}><p className={`text-2xl font-bold ${sevMeta[k].text}`}>{v}</p><p className="text-xs text-gray-500">{sevMeta[k].label}</p></div>
            ))}
          </div>
        </div>
        <div className="card animate-fade-up-delay-2 lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-[#eef0f4] px-5 py-3.5"><Train className="h-4 w-4 text-indigo-500" /><p className="text-sm font-semibold text-gray-900">Readiness by Transport System</p></div>
          <ul className="divide-y divide-[#f1f2f5]">
            {SYSTEMS.map((sec) => { const b = band(sec.readiness); return (
              <li key={sec.name} className="flex items-center gap-3 px-5 py-2.5">
                <div className="w-56 min-w-0"><p className="truncate text-sm text-gray-800">{sec.name}</p><p className="text-[11px] text-gray-400">{sec.type}</p></div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${b.bar}`} style={{ width: `${sec.readiness}%` }} /></div>
                <span className="w-10 text-right text-sm font-semibold text-gray-900">{sec.readiness}%</span>
              </li>
            )})}
          </ul>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="card animate-fade-up-delay-1 lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-[#eef0f4] px-5 py-3.5"><Car className="h-4 w-4 text-indigo-500" /><p className="text-sm font-semibold text-gray-900">Autonomous Mobility — Operator Readiness</p></div>
          <ul className="divide-y divide-[#f1f2f5]">
            {AV_OPERATORS.map((op) => { const b = band(op.readiness); return (
              <li key={op.name} className="flex items-center gap-3 px-5 py-2.5">
                <span className="w-28 text-sm font-medium text-gray-800">{op.name}</span>
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${sevMeta[op.status].bg} ${sevMeta[op.status].text}`}>{op.phase}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${b.bar}`} style={{ width: `${op.readiness}%` }} /></div>
                <span className="w-10 text-right text-sm font-semibold text-gray-900">{op.readiness}%</span>
              </li>
            )})}
          </ul>
        </div>
        <div className="card animate-fade-up-delay-2 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-[#eef0f4] px-5 py-3.5"><Globe className="h-4 w-4 text-indigo-500" /><p className="text-sm font-semibold text-gray-900">International Collaboration</p></div>
          <ul className="divide-y divide-[#f1f2f5]">{COLLAB.map((c) => (<li key={c.org} className="px-5 py-2.5"><p className="text-sm font-medium text-gray-800">{c.org}</p><p className="text-[11px] text-gray-400">{c.country} · {c.focus}</p></li>))}</ul>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="card animate-fade-up-delay-1 lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-[#eef0f4] px-5 py-3.5"><AlertTriangle className="h-4 w-4 text-amber-500" /><p className="text-sm font-semibold text-gray-900">Attention Required</p></div>
          <ul className="divide-y divide-[#f1f2f5]">{ATTENTION.map((a, i) => (
            <li key={i} className="flex items-center gap-3 px-5 py-2.5">
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${sevMeta[a.sev].bg} ${sevMeta[a.sev].text}`}>{sevMeta[a.sev].label}</span>
              <span className="text-xs font-semibold text-gray-700">{a.std}</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">{a.clause}</span>
              <span className="flex-1 truncate text-sm text-gray-600">{a.reason}</span>
            </li>
          ))}</ul>
        </div>
        <div className="card animate-fade-up-delay-2 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-[#eef0f4] px-5 py-3.5"><ListChecks className="h-4 w-4 text-indigo-500" /><p className="text-sm font-semibold text-gray-900">Recent Activity</p></div>
          <div className="slim-scroll max-h-64 overflow-y-auto px-3 py-2">
            {recent.length === 0 ? <p className="py-8 text-center text-sm text-gray-400">Monitoring — awaiting events…</p> : recent.map((e: FeedEvent) => (
              <div key={e.id} className="flex items-start gap-2.5 px-2 py-1.5"><Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300" /><div className="min-w-0 flex-1"><p className="text-xs leading-snug text-gray-700">{e.message}</p><p className="text-[10px] text-gray-400">{fmtTime(e.at)}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      <FeedPanel feed={feed} lastSync={lastSync} />
    </>
  )
}

/* ───────────── Evidence ───────────── */
function Evidence({ standards, standard, selectedId, setSelectedId, clauses, clausesLoading, sel, docsForStd, coveredClauses, clauseTitle, uploadingClause, onUploadClick, feed, lastSync }: any) {
  const groupedClauses = Object.keys(sel.clauses).sort()
  return (
    <>
      <section className="animate-fade-up">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">What’s indexed. <span className="gradient-text">And what to submit next.</span></h2>
        <p className="mt-1.5 max-w-2xl text-sm text-gray-500">Browse evidence already indexed in the knowledge graph by standard and clause, and submit new documents — transmitted to the compliance engine and re-indexed.</p>
      </section>

      <section className="mt-5 flex flex-wrap gap-2">
        {standards.map((s: Std) => {
          const active = s.id === selectedId
          return (
            <button key={s.id} onClick={() => setSelectedId(s.id)} className={['flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition', active ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-[#e7e9ee] bg-white text-gray-600 hover:border-indigo-200'].join(' ')}>
              <Dot color={s.color} />{s.code}
            </button>
          )
        })}
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="card animate-fade-up-delay-1 lg:col-span-2">
          <div className="border-b border-[#eef0f4] px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Clauses {clauses.length ? `· ${clauses.length}` : ''}</p></div>
          <ul className="slim-scroll max-h-[600px] divide-y divide-[#f1f2f5] overflow-y-auto">
            {clausesLoading ? <li className="flex items-center gap-2 px-4 py-6 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading clauses…</li>
              : clauses.length === 0 ? <li className="px-4 py-6 text-center text-sm text-gray-400">No clause checklist for this standard</li>
              : clauses.map((c: Clause) => {
                const count = sel.clauses[c.number]?.length ?? 0, busy = uploadingClause === c.number
                return (
                  <li key={c.number} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="grid h-7 min-w-[2.75rem] place-items-center rounded-md bg-gray-100 px-1.5 text-xs font-semibold text-gray-600">{c.number}</span>
                    <span className="flex-1 truncate text-sm text-gray-700" title={c.title}>{c.title}</span>
                    {count > 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">{count}</span>}
                    <button onClick={() => onUploadClick(c.number)} disabled={busy} className="flex items-center gap-1 rounded-md border border-[#e2e4ea] px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50">
                      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />} Upload
                    </button>
                  </li>
                )
              })}
          </ul>
        </div>

        <div className="card animate-fade-up-delay-2 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[#eef0f4] px-5 py-3.5">
            <div className="flex items-center gap-2.5">{standard && <Dot color={standard.color} />}<div><p className="text-sm font-semibold text-gray-900">{standard?.code ?? '—'}</p><p className="text-xs text-gray-500">{standard?.full ?? ''}</p></div></div>
            <p className="text-xs text-gray-500">{coveredClauses}{standard ? `/${standard.clauseCount}` : ''} clauses · {docsForStd} docs</p>
          </div>
          <div className="slim-scroll max-h-[600px] space-y-4 overflow-y-auto p-5">
            {docsForStd === 0 ? (
              <div className="grid place-items-center py-16 text-center"><FolderOpen className="h-10 w-10 text-gray-300" /><p className="mt-3 text-sm font-medium text-gray-500">No evidence indexed for this standard yet</p><p className="mt-1 text-xs text-gray-400">Use the Upload buttons on the left to submit documents per clause</p></div>
            ) : groupedClauses.map((num) => (
              <div key={num} className="animate-fade-in overflow-hidden rounded-xl border border-[#eef0f4]">
                <div className="flex items-center justify-between border-l-4 border-indigo-400 bg-[#fafbfc] px-4 py-2.5">
                  <div className="flex items-center gap-2.5"><span className="rounded-md bg-indigo-500 px-2 py-0.5 text-xs font-semibold text-white">{num}</span><span className="text-sm font-medium text-gray-800">{clauseTitle(num)}</span></div>
                  <span className="text-xs text-gray-400">{sel.clauses[num].length} files</span>
                </div>
                <ul>{sel.clauses[num].map((name: string) => (
                  <li key={name} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-[#fafbfc]"><FileText className="h-4 w-4 text-indigo-400" /><span className="truncate">{parseDocName(name)?.originalName ?? name}</span><CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" /></li>
                ))}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeedPanel feed={feed} lastSync={lastSync} />
    </>
  )
}

/* ───────────── Shared ───────────── */
function Dot({ color }: { color: string }) { return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} /> }
function Kpi({ icon, label, value, hint, accent }: { icon: React.ReactNode; label: string; value: string; hint?: string; accent?: boolean }) {
  return (<div className="card card-hover p-4"><div className="flex items-center gap-2 text-gray-500"><span className={accent ? 'text-violet-500' : 'text-indigo-500'}>{icon}</span><span className="text-xs font-medium">{label}</span></div><p className={`mt-2 text-2xl font-bold ${accent ? 'gradient-text' : 'text-gray-900'}`}>{value}</p>{hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}</div>)
}
function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const w = 240, h = 56, min = Math.min(...data), max = Math.max(...data)
  const x = (i: number) => (i / (data.length - 1)) * w, y = (v: number) => h - ((v - min) / (max - min || 1)) * (h - 8) - 4
  const line = data.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  return <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}><polygon points={`0,${h} ${line} ${w},${h}`} fill="currentColor" opacity="0.10" /><polyline points={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function Donut({ pct }: { pct: number }) {
  const r = 34, c = 2 * Math.PI * r, off = c - (pct / 100) * c
  return (<svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0 -rotate-90"><circle cx="40" cy="40" r={r} fill="none" stroke="#eef0f4" strokeWidth="8" /><circle cx="40" cy="40" r={r} fill="none" stroke="url(#g)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} /><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#14b8a6" /></linearGradient></defs><text x="40" y="40" transform="rotate(90 40 40)" textAnchor="middle" dominantBaseline="central" className="fill-gray-900 text-[15px] font-bold">{pct}%</text></svg>)
}
function FeedPanel({ feed, lastSync }: { feed: FeedEvent[]; lastSync: number }) {
  const dot: Record<string, string> = { upload: 'bg-sky-500', transmit: 'bg-indigo-500', index: 'bg-violet-500', monitor: 'bg-amber-500', error: 'bg-rose-500', heartbeat: 'bg-emerald-500' }
  return (
    <section className="card animate-fade-up-delay-2 mt-5">
      <div className="flex items-center justify-between border-b border-[#eef0f4] px-5 py-3"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-500" /><p className="text-sm font-semibold text-gray-900">Live Monitoring Feed</p></div><div className="flex items-center gap-2 text-xs text-gray-400">{lastSync ? <span>synced {fmtTime(lastSync)}</span> : null}<span className="live-dot h-2 w-2 rounded-full bg-emerald-500" /></div></div>
      <div className="slim-scroll max-h-56 overflow-y-auto px-3 py-2">
        {feed.length === 0 ? <p className="py-6 text-center text-sm text-gray-400">Initializing monitor…</p> : feed.map((ev) => (<div key={ev.id} className="animate-fade-in flex items-start gap-2.5 px-2 py-1.5"><span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot[ev.kind] ?? 'bg-emerald-500'}`} /><div className="min-w-0 flex-1"><p className="text-xs leading-snug text-gray-700">{ev.message}</p><p className="text-[10px] text-gray-400">{fmtTime(ev.at)}</p></div></div>))}
      </div>
    </section>
  )
}
function NotificationPanel({ notes, onClose, onClear }: { notes: Note[]; onClose: () => void; onClear: () => void }) {
  return (
    <div className="absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-xl border border-[#e7e9ee] bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-[#eef0f4] px-4 py-2.5"><p className="text-sm font-semibold text-gray-900">Notifications</p><div className="flex items-center gap-2"><button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-700">Clear all</button><button onClick={onClose}><X className="h-4 w-4 text-gray-400 hover:text-gray-700" /></button></div></div>
      <div className="slim-scroll max-h-96 overflow-y-auto">
        {notes.length === 0 ? <p className="py-10 text-center text-sm text-gray-400">No notifications</p> : notes.map((n) => (
          <div key={n.id} className="flex items-start gap-3 border-b border-[#f4f5f7] px-4 py-3 last:border-0"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${sevMeta[n.sev]?.dot ?? 'bg-indigo-500'}`} /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-gray-800">{n.title}</p><p className="mt-0.5 text-xs leading-snug text-gray-500">{n.body}</p><p className="mt-1 text-[10px] text-gray-400">{ago(n.at)}</p></div></div>
        ))}
      </div>
    </div>
  )
}
function ToastStack({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="animate-fade-up flex items-start gap-3 rounded-xl border border-[#e7e9ee] bg-white p-3 shadow-lg"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${sevMeta[t.sev]?.dot ?? 'bg-indigo-500'}`} /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-gray-800">{t.title}</p><p className="mt-0.5 text-xs leading-snug text-gray-500">{t.body}</p></div><button onClick={() => onClose(t.id)}><X className="h-3.5 w-3.5 text-gray-300 hover:text-gray-600" /></button></div>
      ))}
    </div>
  )
}
