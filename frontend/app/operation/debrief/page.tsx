'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { loadLastTest, type LastTest } from '@/lib/last-test'
import { PASS_THRESHOLD } from '@/lib/scoring'
import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

function DebriefBody() {
  const search = useSearchParams()
  const [data, setData] = useState<LastTest | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setData(loadLastTest())
    setReady(true)
  }, [])

  const score = data?.result.iqScore ?? Number(search.get('iqScore') || 0)
  const passedParam = search.get('passed')
  const passed =
    data?.result.passed ??
    (passedParam != null ? passedParam === 'true' : score >= PASS_THRESHOLD)
  const xp = data?.result.xpEarned ?? Number(search.get('xp') || 0)
  const rankedUp = data?.rankedUp ?? search.get('rankedUp') === 'true'
  const name = data?.result.operationName ?? 'Timed test'

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Loading results…</p>
  }

  return (
    <>
      <p className="text-sm font-medium text-primary">Results</p>
      <h1 className="mt-2 font-heading text-4xl font-medium tracking-tight">{name}</h1>
      <p className="mt-2 text-muted-foreground">
        {passed
          ? `You passed. Score ${score}% (pass mark ${PASS_THRESHOLD}%).`
          : `Below the pass mark. Score ${score}% (need ${PASS_THRESHOLD}%).`}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="agency-card p-4">
          <p className="text-[11px] text-muted-foreground">Score</p>
          <p className={cn('mt-1 text-2xl font-semibold', passed ? 'text-success' : 'text-danger')}>
            {score}%
          </p>
        </div>
        <div className="agency-card p-4">
          <p className="text-[11px] text-muted-foreground">XP earned</p>
          <p className="mt-1 text-2xl font-semibold">{xp.toLocaleString()}</p>
        </div>
        <div className="agency-card p-4">
          <p className="text-[11px] text-muted-foreground">Items</p>
          <p className="mt-1 text-2xl font-semibold">{data?.items.length ?? '—'}</p>
        </div>
      </div>

      {rankedUp && (
        <p className="mt-4 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          You ranked up.
        </p>
      )}

      {data?.items.length ? (
        <ol className="mt-10 space-y-3">
          {data.items.map((item, i) => (
            <li key={item.questionId} className="agency-card p-4">
              <div className="flex items-start gap-3">
                {item.correct ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {i + 1}. {item.correct ? 'Correct' : 'Not quite'} · {item.pointsEarned}/
                    {item.pointsPossible}
                  </p>
                  <p className="mt-1 text-sm">{item.title}</p>
                  {item.explanation && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.explanation.replace(/^Debrief:\s*/i, '')}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          Detailed review is only available right after you finish a test in this browser.
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/operation">Sit another test</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/training">Back to practice</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dossier">Your progress</Link>
        </Button>
      </div>
    </>
  )
}

export default function DebriefPage() {
  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading results…</p>}>
          <DebriefBody />
        </Suspense>
      </div>
    </main>
  )
}
