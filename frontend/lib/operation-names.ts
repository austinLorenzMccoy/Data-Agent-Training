const ADJECTIVES = [
  'PHANTOM',
  'SILENT',
  'NEURAL',
  'SIGNAL',
  'DARK',
  'ECHO',
  'CRIMSON',
  'HOLLOW',
  'IRON',
  'NORTHERN',
  'GLASS',
  'OBSIDIAN',
  'SCARLET',
  'FROZEN',
  'HIDDEN',
]

const NOUNS = [
  'GHOST',
  'VECTOR',
  'PRISM',
  'CIPHER',
  'NODE',
  'ATLAS',
  'HALO',
  'ORACLE',
  'SPECTRE',
  'MERIDIAN',
  'TEMPEST',
  'LANTERN',
  'COBALT',
  'HORIZON',
  'WARDEN',
]

export function generateOperationName(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `OPERATION ${a} ${n}`
}

const BRIEFINGS = [
  'Intelligence indicates a surge in unverified AI output across our channels. Your assignment: assess each transmission for accuracy, compliance, and quality. Clearance depends on your judgement.',
  'Field reports are arriving faster than our analysts can vet them. We need a sharp eye on the line. Evaluate every artifact. Flag what does not hold up. Trust the rubric.',
  'A new batch of intercepts has cleared the first filter and awaits your review. Some are clean. Some are compromised. Tell us which is which — and justify your call.',
]

export function generateBriefing(): string {
  return BRIEFINGS[Math.floor(Math.random() * BRIEFINGS.length)]
}
