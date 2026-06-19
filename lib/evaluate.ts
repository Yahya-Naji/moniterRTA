// AI evaluation of safety evidence against a standard/requirement.
// Uses OpenAI when OPENAI_API_KEY is set (or Azure OpenAI as a fallback);
// otherwise a deterministic heuristic so the demo still produces verdicts.

import OpenAI from 'openai'

export type Evaluation = {
  status: 'Conformant' | 'Minor' | 'Major' | 'OFI'
  score: number
  summary: string
  gaps: string[]
  model: string
}

const OPENAI_KEY = process.env.OPENAI_API_KEY?.trim()
const AZ_KEY = process.env.AZURE_OPENAI_API_KEY?.trim()
const AZ_BASE = process.env.AZURE_OPENAI_BASE_URL?.trim() // …/openai/deployments/<deployment>
const AZ_VER = process.env.AZURE_OPENAI_API_VERSION?.trim() || '2024-08-01-preview'
const AZ_DEPLOY = process.env.AZURE_OPENAI_DEPLOYMENT_NAME?.trim() || 'gpt-4o-mini'

export const hasAI = !!(OPENAI_KEY || (AZ_KEY && AZ_BASE))

function client(): { c: OpenAI; model: string } | null {
  if (OPENAI_KEY) return { c: new OpenAI({ apiKey: OPENAI_KEY }), model: 'gpt-4o-mini' }
  if (AZ_KEY && AZ_BASE) {
    return {
      c: new OpenAI({
        apiKey: AZ_KEY,
        baseURL: AZ_BASE.replace(/\/$/, ''),
        defaultQuery: { 'api-version': AZ_VER },
        defaultHeaders: { 'api-key': AZ_KEY },
      }),
      model: AZ_DEPLOY,
    }
  }
  return null
}

const STATUSES = ['Conformant', 'Minor', 'Major', 'OFI'] as const
const clampScore = (n: unknown) => {
  const v = Math.round(Number(n))
  return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 50
}
const asStatus = (s: unknown): Evaluation['status'] =>
  (STATUSES as readonly string[]).includes(String(s)) ? (s as Evaluation['status']) : 'OFI'

export async function evaluateEvidence(
  stdCode: string, clause: string, clauseTitle: string, filename: string, content: string,
): Promise<Evaluation> {
  const cl = client()
  if (!cl) return heuristic(content)

  const system =
    'You are a safety-certification assessor for RTA Dubai (Roads & Transport Authority), reviewing ' +
    'evidence for guided-transport and autonomous-mobility safety standards. Assess how well the ' +
    'evidence document satisfies the requirement. Be concise and objective. Respond ONLY as a JSON ' +
    'object: {"status": "Conformant"|"Minor"|"Major"|"OFI", "score": integer 0-100, ' +
    '"summary": one or two sentences, "gaps": array of short strings (empty if none)}. ' +
    'Use "Major" when critical evidence is missing, "Minor" for partial coverage, "OFI" for ' +
    'opportunities for improvement, "Conformant" when fully satisfied.'

  const user =
    `Standard: ${stdCode}\nRequirement: ${clause} — ${clauseTitle}\nDocument: ${filename}\n\n` +
    `Evidence content:\n${content.slice(0, 6000)}`

  try {
    const resp = await cl.c.chat.completions.create({
      model: cl.model,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 450,
    })
    const j = JSON.parse(resp.choices[0]?.message?.content ?? '{}')
    return {
      status: asStatus(j.status),
      score: clampScore(j.score),
      summary: String(j.summary ?? '').slice(0, 500),
      gaps: Array.isArray(j.gaps) ? j.gaps.map(String).slice(0, 6) : [],
      model: cl.model,
    }
  } catch {
    return heuristic(content)
  }
}

function heuristic(content: string): Evaluation {
  const len = content.trim().length
  const score = Math.max(25, Math.min(94, Math.round(len / 35)))
  const status: Evaluation['status'] = score >= 80 ? 'Conformant' : score >= 60 ? 'Minor' : score >= 40 ? 'OFI' : 'Major'
  return {
    status,
    score,
    summary: 'Preliminary evaluation based on submitted evidence.',
    gaps: score < 60 ? ['Evidence may lack sufficient detail to demonstrate full conformance.'] : [],
    model: 'heuristic',
  }
}
