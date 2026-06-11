// Safety standards relevant to RTA Dubai — Guided Transport Systems (rail
// CENELEC suite), Autonomous Mobility (ISO 26262 / SOTIF / UL 4600 / cyber)
// and operational safety. `id` is filename-safe and used in the evidence
// naming scheme: ISO{id}__CL{clause}__{name}.txt

export type Clause = { number: string; title: string }

export type Standard = {
  id: string
  code: string       // "EN 50129"
  full: string       // "EN 50129:2018"
  domain: string     // short domain label
  color: string
  clauses: Clause[]
}

export const STANDARDS: Standard[] = [
  {
    id: '50126',
    code: 'EN 50126',
    full: 'EN 50126:2017',
    domain: 'Railway RAMS Lifecycle',
    color: 'bg-indigo-500',
    clauses: [
      { number: '5', title: 'Risk analysis & evaluation' },
      { number: '6', title: 'System requirements specification' },
      { number: '7', title: 'Architecture & risk apportionment' },
      { number: '10', title: 'Design & implementation' },
      { number: '12', title: 'Safety validation & acceptance' },
      { number: '14', title: 'Operation, maintenance & monitoring' },
    ],
  },
  {
    id: '50128',
    code: 'EN 50128',
    full: 'EN 50128:2011',
    domain: 'Railway Software Safety',
    color: 'bg-violet-500',
    clauses: [
      { number: '6.2', title: 'Software requirements specification' },
      { number: '7.2', title: 'Software architecture' },
      { number: '7.4', title: 'Software design & implementation' },
      { number: '8', title: 'Software component testing' },
      { number: '9', title: 'Software validation & assessment' },
    ],
  },
  {
    id: '50129',
    code: 'EN 50129',
    full: 'EN 50129:2018',
    domain: 'Signalling Safety Case',
    color: 'bg-sky-500',
    clauses: [
      { number: 'P1', title: 'Safety management report' },
      { number: 'P2', title: 'Technical safety report' },
      { number: 'P3', title: 'Related safety cases' },
      { number: 'QMR', title: 'Quality management report' },
      { number: 'SAC', title: 'Safety acceptance & approval' },
    ],
  },
  {
    id: '26262',
    code: 'ISO 26262',
    full: 'ISO 26262:2018',
    domain: 'AV Functional Safety',
    color: 'bg-emerald-500',
    clauses: [
      { number: '3', title: 'Concept phase — HARA' },
      { number: '4', title: 'System-level development' },
      { number: '6', title: 'Software-level development' },
      { number: '8', title: 'Supporting processes' },
      { number: '9', title: 'ASIL-oriented safety analyses' },
    ],
  },
  {
    id: '21448',
    code: 'ISO 21448',
    full: 'ISO 21448 (SOTIF)',
    domain: 'Safety of Intended Function',
    color: 'bg-amber-500',
    clauses: [
      { number: '5', title: 'Functional specification' },
      { number: '6', title: 'Hazard identification' },
      { number: '7', title: 'Triggering condition analysis' },
      { number: '9', title: 'Verification of known scenarios' },
      { number: '10', title: 'Validation of unknown scenarios' },
    ],
  },
  {
    id: '4600',
    code: 'UL 4600',
    full: 'UL 4600:2023',
    domain: 'Autonomous Product Safety',
    color: 'bg-rose-500',
    clauses: [
      { number: 'SC', title: 'Safety case structure' },
      { number: 'HA', title: 'Hazard & risk analysis' },
      { number: 'TM', title: 'Testing & metrics' },
      { number: 'FM', title: 'Field monitoring & feedback' },
      { number: 'TQ', title: 'Tool & data qualification' },
    ],
  },
  {
    id: '21434',
    code: 'ISO 21434',
    full: 'ISO 21434:2021',
    domain: 'Vehicle Cybersecurity',
    color: 'bg-cyan-500',
    clauses: [
      { number: '8', title: 'Cybersecurity risk assessment' },
      { number: '9', title: 'Concept phase' },
      { number: '10', title: 'Product development' },
      { number: '11', title: 'Cybersecurity validation' },
      { number: '13', title: 'Incident response & monitoring' },
    ],
  },
  {
    id: '45001',
    code: 'ISO 45001',
    full: 'ISO 45001:2018',
    domain: 'Operational Health & Safety',
    color: 'bg-teal-500',
    clauses: [
      { number: '5.4', title: 'Consultation & participation of workers' },
      { number: '6.1.2', title: 'Hazard identification & assessment' },
      { number: '8.1', title: 'Operational planning & control' },
      { number: '9.2', title: 'Internal audit' },
      { number: '10.2', title: 'Incident & corrective action' },
    ],
  },
]

export function getStandard(id: string): Standard | undefined {
  return STANDARDS.find((s) => s.id === id)
}
