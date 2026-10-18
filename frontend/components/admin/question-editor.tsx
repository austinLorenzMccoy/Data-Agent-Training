'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { AssignmentRenderer, type SubmittedAnswer } from '@/components/assignments/assignment-renderer'
import { FeedbackPanel } from '@/components/assignments/feedback-panel'
import { Button } from '@/components/ui/button'
import { toPublicQuestion } from '@/lib/exam/sanitize'
import { buildFeedback } from '@/lib/exam/score'
import { validateQuestion } from '@/lib/exam/validate'
import type { Feedback } from '@/lib/exam/public'
import { retireQuestion, revertQuestion, saveQuestion, type SaveResult } from '@/app/admin/actions'

export function QuestionEditor({
  initial,
  isNew,
  builtIn,
  status,
}: {
  initial: string
  isNew: boolean
  builtIn: boolean
  status: 'draft' | 'live' | 'retired' | null
}) {
  const [json, setJson] = useState(initial)
  const [result, setResult] = useState<SaveResult>({})
  const [pending, start] = useTransition()
  const [preview, setPreview] = useState<Feedback | null>(null)

  const checked = useMemo(() => {
    try {
      return validateQuestion(JSON.parse(json))
    } catch (err) {
      return { ok: false as const, errors: [`Not valid JSON: ${(err as Error).message}`] }
    }
  }, [json])

  const run = (fn: () => Promise<SaveResult>) => start(async () => setResult(await fn()))

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/admin/questions" className="text-sm text-primary hover:underline">
        ← Question bank
      </Link>
      <h1 className="mt-3 font-heading text-3xl font-medium">{isNew ? 'New question' : 'Edit question'}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {builtIn ? 'Built-in question. ' : ''}
        {status ? `Database copy: ${status}.` : isNew ? '' : 'No edits saved yet.'}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="question-json" className="text-xs font-medium text-muted-foreground">
            Question JSON (includes the answer key)
          </label>
          <textarea
            id="question-json"
            value={json}
            onChange={(e) => {
              setJson(e.target.value)
              setPreview(null)
            }}
            spellCheck={false}
            className="mt-1 h-[32rem] w-full rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed"
          />
          {!checked.ok && (
            <ul role="alert" className="mt-2 list-disc space-y-1 pl-5 text-sm text-danger">
              {checked.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={pending || !checked.ok} onClick={() => run(() => saveQuestion(json, 'live'))}>
              Publish
            </Button>
            <Button variant="outline" disabled={pending || !checked.ok} onClick={() => run(() => saveQuestion(json, 'draft'))}>
              Save draft
            </Button>
            {!isNew && checked.ok && (
              <Button variant="outline" disabled={pending} onClick={() => run(() => retireQuestion(checked.question.id))}>
                Retire
              </Button>
            )}
            {builtIn && status && checked.ok && (
              <Button variant="ghost" disabled={pending} onClick={() => run(() => revertQuestion(checked.question.id))}>
                Revert to built-in
              </Button>
            )}
          </div>
          {result.ok && <p className="mt-2 text-sm text-success">{result.ok}</p>}
          {result.errors && (
            <ul role="alert" className="mt-2 list-disc pl-5 text-sm text-danger">
              {result.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">Preview — answer it as a learner would</p>
          {checked.ok ? (
            <div className="mt-1 space-y-3">
              <AssignmentRenderer
                key={json}
                question={toPublicQuestion(checked.question)}
                onSubmit={(a: SubmittedAnswer) => setPreview(buildFeedback(checked.question, a.selection))}
                disabled={!!preview}
              />
              {preview && <FeedbackPanel feedback={preview} />}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Fix the errors to see a preview.</p>
          )}
        </div>
      </div>
    </main>
  )
}
