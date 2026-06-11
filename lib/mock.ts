// Dashboard analytics for RTA Dubai — Safety Certification & Autonomous
// Mobility Governance. All figures are illustrative.

import { STANDARDS } from './standards'

// Certification readiness % per safety standard.
export const READINESS: Record<string, number> = {
  '50126': 84, '50128': 77, '50129': 90, '26262': 71,
  '21448': 63, '4600': 58, '21434': 80, '45001': 88,
}

// Open safety findings per standard.
export const OPEN_GAPS: Record<string, number> = {
  '50126': 3, '50128': 5, '50129': 1, '26262': 6,
  '21448': 8, '4600': 9, '21434': 4, '45001': 2,
}

// 18-point overall safety-readiness trend.
export const TREND = [58, 60, 59, 63, 65, 64, 67, 70, 69, 72, 74, 73, 76, 78, 77, 79, 81, 82]

// Safety findings by severity.
export const SEVERITY = { major: 5, minor: 18, ofi: 11 }

// Certification readiness by transport system.
export const SYSTEMS: { name: string; type: string; readiness: number; docs: number }[] = [
  { name: 'Dubai Metro — Red Line', type: 'Automatic Metro', readiness: 92, docs: 184 },
  { name: 'Dubai Metro — Green Line', type: 'Automatic Metro', readiness: 88, docs: 156 },
  { name: 'Route 2020 Extension', type: 'Automatic Metro', readiness: 81, docs: 121 },
  { name: 'Dubai Tram', type: 'Tramway', readiness: 79, docs: 98 },
  { name: 'Automated People Mover', type: 'APM', readiness: 74, docs: 63 },
  { name: 'Autonomous Vehicles (Robotaxi)', type: 'Autonomous Mobility', readiness: 61, docs: 142 },
]

// Autonomous-mobility operator deployment readiness.
export const AV_OPERATORS: { name: string; phase: string; readiness: number; status: 'major' | 'minor' | 'ofi' | 'info' }[] = [
  { name: 'Cruise', phase: 'Supervised testing', readiness: 68, status: 'minor' },
  { name: 'WeRide', phase: 'Deployment readiness', readiness: 74, status: 'minor' },
  { name: 'Baidu Apollo', phase: 'Closed-route trial', readiness: 59, status: 'major' },
  { name: 'Pony.ai', phase: 'Onsite witnessing', readiness: 52, status: 'major' },
]

// Clauses / cases needing attention.
export const ATTENTION: { std: string; clause: string; title: string; reason: string; sev: 'major' | 'minor' | 'ofi' }[] = [
  { std: 'UL 4600', clause: 'FM', title: 'Field monitoring', reason: 'Robotaxi field-monitoring evidence overdue', sev: 'major' },
  { std: 'ISO 21448', clause: '10', title: 'SOTIF validation', reason: 'Unknown-scenario validation pack incomplete', sev: 'major' },
  { std: 'ISO 26262', clause: '3', title: 'HARA', reason: 'Hazard analysis pending sign-off for AV fleet', sev: 'minor' },
  { std: 'EN 50128', clause: '9', title: 'Software validation', reason: 'CBTC software validation report expiring in 14 days', sev: 'minor' },
  { std: 'EN 50126', clause: '14', title: 'Operation & maintenance', reason: 'Tram O&M safety records awaiting review', sev: 'ofi' },
]

// MoUs / international collaboration.
export const COLLAB: { org: string; country: string; focus: string }[] = [
  { org: 'UK Office of Rail and Road (ORR)', country: 'United Kingdom', focus: 'Rail safety regulation best practice' },
  { org: 'STRMTG', country: 'France', focus: 'Guided transport safety assessment' },
  { org: 'Global Regulatory Alignment', country: 'International', focus: 'Autonomous mobility standards harmonisation' },
]

// Platform capabilities (for the landing page).
export const CAPABILITIES: { name: string; need: string; desc: string }[] = [
  { name: 'Q-Conform', need: 'Compliance Monitoring', desc: 'Continuous compliance oversight of operator Safety Management Systems with full auditability.' },
  { name: 'Q-Risk', need: 'Safety Governance', desc: 'Risk-based decision support — identify emerging risks and track mitigation effectiveness.' },
  { name: 'Knowledge Intelligence Layer', need: 'Regulatory Knowledge', desc: 'Monitor regulatory change and keep evidence aligned with global standards.' },
  { name: 'AI Document Intelligence', need: 'Evidence Analysis', desc: 'Map large volumes of safety evidence to certification requirements automatically.' },
  { name: 'Executive Dashboards', need: 'Decision Support', desc: 'Real-time certification readiness and safety posture for leadership.' },
]

// Pillars (for the landing page).
export const PILLARS: { title: string; items: string[] }[] = [
  { title: 'Safety Certification', items: ['Metro', 'Tram', 'Automated People Movers', 'Operational Safety Certification'] },
  { title: 'Autonomous Mobility', items: ['AV Regulation', 'Testing & Deployment Readiness', 'Safety Assessments', 'Risk Evaluation'] },
  { title: 'Governance & Regulation', items: ['Safety Regulations', 'Compliance Oversight', 'International Best Practices', 'Strategic Safety Planning'] },
  { title: 'International Collaboration', items: ['UK ORR', 'STRMTG France', 'Global Regulatory Alignment'] },
]

// Seed notifications.
export const SEED_ALERTS: { title: string; body: string; sev: 'major' | 'minor' | 'ofi' | 'info' }[] = [
  { title: 'Major finding — UL 4600', body: 'Robotaxi field-monitoring evidence (FM) is overdue for the Autonomous Vehicles programme.', sev: 'major' },
  { title: 'Certification milestone', body: 'EN 50129 safety case for Route 2020 reached 81% readiness.', sev: 'info' },
  { title: 'Regulatory update', body: 'New autonomous-vehicle testing guidance flagged for impact assessment.', sev: 'minor' },
]

// Periodic monitoring alerts.
export const ALERT_POOL: { title: string; body: string; sev: 'major' | 'minor' | 'ofi' | 'info' }[] = [
  { title: 'AV readiness change', body: 'WeRide deployment-readiness assessment advanced to 74%.', sev: 'info' },
  { title: 'Safety case drift', body: 'EN 50129 technical safety report changed — re-validation queued.', sev: 'ofi' },
  { title: 'New corrective action', body: 'Corrective action opened against ISO 26262 HARA for AV fleet.', sev: 'minor' },
  { title: 'Onsite witnessing scheduled', body: 'Pony.ai onsite witnessing scheduled for next assessment window.', sev: 'info' },
  { title: 'Regulatory change detected', body: 'STRMTG guidance update — impact on tramway certification under review.', sev: 'minor' },
  { title: 'Evidence freshness alert', body: 'EN 50128 CBTC software validation report approaching expiry.', sev: 'minor' },
  { title: 'Coverage improved', body: 'ISO 21434 cybersecurity evidence coverage increased to 80%.', sev: 'info' },
]

export function overallReadiness(): number {
  const vals = STANDARDS.map((s) => READINESS[s.id] ?? 0)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export function totalGaps(): number {
  return STANDARDS.reduce((n, s) => n + (OPEN_GAPS[s.id] ?? 0), 0)
}

export function band(pct: number): { label: string; text: string; bar: string } {
  if (pct >= 80) return { label: 'Strong', text: 'text-emerald-600', bar: 'bg-emerald-500' }
  if (pct >= 60) return { label: 'Moderate', text: 'text-amber-600', bar: 'bg-amber-500' }
  return { label: 'At risk', text: 'text-rose-600', bar: 'bg-rose-500' }
}

export const sevMeta: Record<string, { label: string; text: string; bg: string; dot: string }> = {
  major: { label: 'Major', text: 'text-rose-700', bg: 'bg-rose-50', dot: 'bg-rose-500' },
  minor: { label: 'Minor', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  ofi: { label: 'OFI', text: 'text-sky-700', bg: 'bg-sky-50', dot: 'bg-sky-500' },
  info: { label: 'Info', text: 'text-indigo-700', bg: 'bg-indigo-50', dot: 'bg-indigo-500' },
}
