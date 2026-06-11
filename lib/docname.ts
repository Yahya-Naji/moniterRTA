// Mirrors the main platform's document naming so uploads from Sentinel are
// recognised by the main app's GraphRAG Documents page.
//   pattern: ISO{isoId}__CL{clause}__{base}.txt

export function encodeDocName(isoId: string, clause: string, originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, '')
  return `ISO${isoId}__CL${clause}__${base}.txt`
}

export function parseDocName(
  name: string,
): { isoId: string; clause: string; originalName: string } | null {
  const match = name.match(/^ISO([^_]+)__CL([^_]+)__(.+)$/)
  if (!match) return null
  return { isoId: match[1], clause: match[2], originalName: match[3] }
}

// Metadata header identical to the main platform's upload pipeline.
export function buildMetadata(isoId: string, clause: string, filename: string): string {
  return [
    '================================================================================',
    '--- METADATA ---',
    `EVIDENCE_FOR_CLAUSE: ${clause}`,
    `FILENAME: ${filename}`,
    `ISO:${isoId}`,
    '--- CONTENT ---',
    '================================================================================',
    '',
  ].join('\n')
}
