// In-memory MOCK store for the self-contained demo. Pre-seeded so the dashboard
// and evidence views look populated out of the box. Uploads append here and the
// "re-index" is simulated. No external dependency.

export type DemoDoc = {
  filename: string
  size_bytes: number
  modified_at: string
  status?: string
  score?: number
  summary?: string
}

type IndexState = 'idle' | 'running' | 'completed' | 'failed'

const g = globalThis as unknown as {
  __sentinelDocs?: DemoDoc[]
  __sentinelIndex?: { state: IndexState; started_at: string | null; finished_at: string | null }
}

// ── Seed evidence (filenames follow the ISO{id}__CL{clause}__{name}.txt scheme)
const SEED: string[] = [
  'ISO50126__CL5__metro_red_line_risk_analysis.txt',
  'ISO50126__CL12__metro_safety_validation_report.txt',
  'ISO50126__CL14__tram_operation_maintenance_records.txt',
  'ISO50128__CL9__cbtc_software_validation_report.txt',
  'ISO50128__CL8__signalling_component_test_log.txt',
  'ISO50129__P2__route2020_technical_safety_report.txt',
  'ISO50129__SAC__metro_safety_acceptance_certificate.txt',
  'ISO50129__QMR__quality_management_report.txt',
  'ISO26262__CL3__av_fleet_hara.txt',
  'ISO26262__CL9__av_asil_safety_analysis.txt',
  'ISO21448__CL6__sotif_hazard_identification.txt',
  'ISO4600__SC__robotaxi_safety_case.txt',
  'ISO21434__CL8__av_cybersecurity_risk_assessment.txt',
  'ISO45001__CL6.1.2__depot_hazard_register.txt',
]

function seed(): DemoDoc[] {
  const base = Date.parse('2026-06-09T10:00:00Z')
  return SEED.map((filename, i) => ({
    filename,
    size_bytes: 1500 + ((i * 737) % 2200),
    modified_at: new Date(base + i * 3_600_000).toISOString(),
  }))
}

if (!g.__sentinelDocs) g.__sentinelDocs = seed()
if (!g.__sentinelIndex) g.__sentinelIndex = { state: 'idle', started_at: null, finished_at: null }

export const demoStore = {
  list(): DemoDoc[] {
    return g.__sentinelDocs!
  },
  add(doc: DemoDoc) {
    g.__sentinelDocs = g.__sentinelDocs!.filter((d) => d.filename !== doc.filename)
    g.__sentinelDocs!.push(doc)
  },
  indexState() {
    return g.__sentinelIndex!
  },
  setIndex(state: IndexState, ts: string) {
    if (state === 'running') g.__sentinelIndex = { state, started_at: ts, finished_at: null }
    else g.__sentinelIndex = { ...g.__sentinelIndex!, state, finished_at: ts }
  },
}
