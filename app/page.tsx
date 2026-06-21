import Link from 'next/link'
import {
  ShieldCheck, ArrowRight, Train, Car, Gavel, Globe, Radar, Database,
  Brain, FileSearch, LayoutDashboard, CheckCircle2,
} from 'lucide-react'
import { STANDARDS } from '@/lib/standards'
import { PILLARS, CAPABILITIES, overallReadiness, SYSTEMS } from '@/lib/mock'

const TERMS = [
  'Safety Assurance', 'Certification Readiness', 'Regulatory Intelligence',
  'Continuous Compliance Monitoring', 'Autonomous Mobility Governance',
  'Safety Management Systems', 'Risk-Based Decision Support',
]
const PILLAR_ICONS = [Train, Car, Gavel, Globe]
const CAP_ICONS = [ShieldCheck, Radar, Brain, FileSearch, LayoutDashboard]

export default function Landing() {
  const overall = overallReadiness()
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-[#e7e9ee] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20"><ShieldCheck className="h-6 w-6 text-white" /></div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-900">RTA Dubai <span className="font-medium text-gray-400">·</span> <span className="gradient-text">Safety Sentinel</span></p>
              <p className="text-xs text-gray-500">Safety Certification &amp; Autonomous Mobility Governance</p>
            </div>
          </div>
          <Link href="/console" className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium">Open Console <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-300/30 via-violet-300/30 to-teal-300/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-14">
          <div className="animate-fade-up max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm">
              <span className="live-dot h-2 w-2 rounded-full bg-emerald-500" /> Continuous Compliance Monitoring · Live
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              AI for Safety Governance, Certification &amp;{' '}
              <span className="gradient-text">Autonomous Mobility Regulation</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
              A safety governance, regulatory intelligence and assurance-enablement platform for RTA Dubai’s
              Guided Transport Systems — Metro, Tram, Automated People Movers and Autonomous Vehicles. Map
              evidence to certification requirements, monitor operator Safety Management Systems, and keep
              regulatory alignment with global best practice.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/console" className="btn-primary flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">Open Monitoring Console <ArrowRight className="h-4 w-4" /></Link>
              <a href="#capabilities" className="rounded-xl border border-[#e7e9ee] bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-300">Explore Capabilities</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {TERMS.map((t) => <span key={t} className="rounded-full border border-[#e7e9ee] bg-white/70 px-3 py-1 text-xs text-gray-600">{t}</span>)}
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat value={`${overall}%`} label="Certification Readiness" accent />
            <Stat value={String(STANDARDS.length)} label="Safety Standards" />
            <Stat value={String(SYSTEMS.length)} label="Transport Systems" />
            <Stat value="24/7" label="Continuous Monitoring" />
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">What we monitor</h2>
        <p className="mt-1 text-sm text-gray-500">Core responsibilities across safety certification, autonomous mobility and regulation.</p>
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => {
            const Icon = PILLAR_ICONS[i] ?? Train
            return (
              <div key={p.title} className="card card-hover p-5">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-600"><Icon className="h-5 w-5" /></div>
                <p className="mt-4 text-sm font-semibold text-gray-900">{p.title}</p>
                <ul className="mt-2.5 space-y-1.5">
                  {p.items.map((it) => <li key={it} className="flex items-center gap-1.5 text-xs text-gray-500"><CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" /> {it}</li>)}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="border-y border-[#e7e9ee] bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Platform capabilities</h2>
          <p className="mt-1 text-sm text-gray-500">Mapped to RTA’s needs across safety governance, compliance and decision support.</p>
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c, i) => {
              const Icon = CAP_ICONS[i] ?? Database
              return (
                <div key={c.name} className="card card-hover p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm"><Icon className="h-5 w-5" /></div>
                    <div><p className="text-sm font-semibold text-gray-900">{c.name}</p><p className="text-[11px] font-medium text-indigo-600">{c.need}</p></div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">{c.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Standards + CTA */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Safety standards covered</h2>
        <p className="mt-1 text-sm text-gray-500">Rail (CENELEC), autonomous-vehicle functional safety, SOTIF, cybersecurity and operational safety.</p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {STANDARDS.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-full border border-[#e7e9ee] bg-white px-3.5 py-2 text-sm shadow-sm">
              <span className={`h-2 w-2 rounded-full ${s.color}`} />
              <span className="font-semibold text-gray-800">{s.code}</span>
              <span className="text-xs text-gray-400">{s.domain}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 px-8 py-8 text-white shadow-xl sm:flex-row sm:items-center">
          <div>
            <p className="text-xl font-semibold">Ready to see continuous compliance in action?</p>
            <p className="mt-1 text-sm text-white/80">Open the live monitoring console for certification readiness, findings and evidence intake.</p>
          </div>
          <Link href="/console" className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-white/90">Open Console <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="border-t border-[#e7e9ee] bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-xs text-gray-400 sm:flex-row">
          <p>RTA Dubai · Safety Sentinel — Safety Certification &amp; Autonomous Mobility Governance</p>
          <p>AI for Safety Governance, Certification and Autonomous Mobility Regulation</p>
        </div>
      </footer>
    </div>
  )
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="card card-hover p-5">
      <p className={`text-3xl font-bold ${accent ? 'gradient-text' : 'text-gray-900'}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  )
}
