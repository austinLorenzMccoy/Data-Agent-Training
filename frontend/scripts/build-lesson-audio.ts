// Builds lesson narration with macOS text-to-speech.
//   pnpm lessons:audio            (needs macOS: `say`, `afconvert`)
// For each chapter: voices every scene, joins them with short pauses,
// encodes AAC to public/lessons/<lesson>/<chapter>.m4a, and writes scene
// start times to lib/lessons/audio-manifest.json so the stage follows the
// voice. Swap VOICE, or replace a chapter with a recorded or AI video by
// setting its `videoUrl`.

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { LESSONS } from '../lib/lessons'
import type { AudioManifest } from '../lib/lessons/types'

const VOICE = process.env.LESSON_VOICE || 'Samantha'
const RATE = 22050
const GAP_SEC = 0.6
const root = join(__dirname, '..')

function pcm(file: string): Buffer {
  // Skip the RIFF header to the "data" chunk.
  const buf = readFileSync(file)
  const at = buf.indexOf('data')
  return buf.subarray(at + 8, at + 8 + buf.readUInt32LE(at + 4))
}

function wav(data: Buffer): Buffer {
  const h = Buffer.alloc(44)
  h.write('RIFF', 0)
  h.writeUInt32LE(36 + data.length, 4)
  h.write('WAVEfmt ', 8)
  h.writeUInt32LE(16, 16)
  h.writeUInt16LE(1, 20)
  h.writeUInt16LE(1, 22)
  h.writeUInt32LE(RATE, 24)
  h.writeUInt32LE(RATE * 2, 28)
  h.writeUInt16LE(2, 32)
  h.writeUInt16LE(16, 34)
  h.write('data', 36)
  h.writeUInt32LE(data.length, 40)
  return Buffer.concat([h, data])
}

const tmp = mkdtempSync(join(tmpdir(), 'lesson-audio-'))
const manifest: AudioManifest = {}

for (const lesson of LESSONS) {
  const outDir = join(root, 'public', 'lessons', lesson.id)
  mkdirSync(outDir, { recursive: true })
  manifest[lesson.id] = {}
  for (const chapter of lesson.chapters) {
    const parts: Buffer[] = []
    const cues: { scene: string; start: number }[] = []
    let samples = 0
    for (const scene of chapter.scenes) {
      const f = join(tmp, `${chapter.id}-${scene.id}.wav`)
      execFileSync('say', ['-v', VOICE, '-o', f, `--data-format=LEI16@${RATE}`, scene.say])
      cues.push({ scene: scene.id, start: Math.round((samples / RATE) * 100) / 100 })
      const data = pcm(f)
      parts.push(data)
      samples += data.length / 2
      const gap = Buffer.alloc(Math.round(GAP_SEC * RATE) * 2)
      parts.push(gap)
      samples += gap.length / 2
    }
    const wavFile = join(tmp, `${chapter.id}.wav`)
    writeFileSync(wavFile, wav(Buffer.concat(parts)))
    const out = join(outDir, `${chapter.id}.m4a`)
    execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', wavFile, out])
    manifest[lesson.id][chapter.id] = {
      src: `/lessons/${lesson.id}/${chapter.id}.m4a`,
      duration: Math.round((samples / RATE) * 100) / 100,
      cues,
    }
    console.log(`${lesson.id}/${chapter.id}: ${manifest[lesson.id][chapter.id].duration}s`)
  }
}

writeFileSync(join(root, 'lib', 'lessons', 'audio-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
