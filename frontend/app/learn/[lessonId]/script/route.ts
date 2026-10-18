import { lessonById } from '@/lib/lessons'

// The narration as plain text: a readable transcript of the lesson, and the
// script to paste into an AI video tool when a chapter gets a real video.
export async function GET(_: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const lesson = lessonById((await params).lessonId)
  if (!lesson) return new Response('Not found', { status: 404 })
  const out = [`${lesson.title}\n${'='.repeat(lesson.title.length)}\n${lesson.summary}\n`]
  lesson.chapters.forEach((c, i) => {
    out.push(`\nChapter ${i + 1}: ${c.title}\n`)
    for (const s of c.scenes) out.push(`[${s.id}] ${s.say}\n`)
    out.push(`\nCheck: ${c.check.question}\n${c.check.options.map((o, j) => `  ${j === c.check.answer ? '*' : '-'} ${o}`).join('\n')}\n`)
  })
  return new Response(out.join(''), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
