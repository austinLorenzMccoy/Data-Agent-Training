import { ShieldAlert } from 'lucide-react'
import { questionById } from '@/lib/server/bank'
import { TYPE_NAMES } from '@/lib/scoring'
import { applyPermutation } from '@/lib/exam/shuffle'
import type { GradeLogRow } from '@/lib/server/review'
import type { AttemptQuestionRef } from '@/lib/server/attempts'
import { overrideGradeAction } from '@/app/org/review-actions'
import { OverrideForm } from './override-form'

export interface ReviewRow extends GradeLogRow {
  agents: { alias: string } | null
  operation_attempts: { questions: AttemptQuestionRef[]; answers: Record<string, { selection: unknown }> } | null
}

function shownDecision(row: ReviewRow): string {
  const att = row.operation_attempts
  if (!att || row.question_index === null) return '—'
  const sel = att.answers?.[String(row.question_index)]?.selection
  if (sel === undefined || sel === null) return '—'
  return typeof sel === 'string' || typeof sel === 'number' ? String(sel) : JSON.stringify(sel)
}

export function GradeReviewList({ rows, path }: { rows: ReviewRow[]; path: string }) {
  if (rows.length === 0) return <p className="text-muted-foreground">Nothing to review here.</p>
  return (
    <ul className="space-y-4">
      {rows.map((row) => {
        const q = questionById(row.question_id)
        const ref = row.question_index !== null ? row.operation_attempts?.questions?.[row.question_index] : undefined
        // Show the options in the order the candidate saw them, so "A" in their reason matches.
        const shown = q && ref ? applyPermutation(q, ref.perm) : q
        const effective = row.override_score ?? row.score
        return (
          <li key={row.id} className="rounded-2xl border border-border bg-surface-raised p-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{row.agents?.alias ?? 'Candidate'}</span>
              <span>{q ? TYPE_NAMES[q.type] : row.question_id}</span>
              <span>{new Date(row.created_at).toLocaleString('en-GB')}</span>
              <span>
                graded by {row.mode}
                {row.model && ` (${row.model})`}
              </span>
              {row.flagged_injection && (
                <span className="inline-flex items-center gap-1 text-danger">
                  <ShieldAlert className="size-3.5" /> addressed the grader
                </span>
              )}
            </div>

            {shown && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-primary">Question</summary>
                <div className="mt-2 space-y-2 rounded-md bg-muted/50 p-3">
                  <p className="whitespace-pre-wrap">{shown.prompt}</p>
                  {shown.responseA && (
                    <p className="whitespace-pre-wrap">
                      <strong>{shown.responseB ? 'Response A: ' : 'Response: '}</strong>
                      {shown.responseA}
                    </p>
                  )}
                  {shown.responseB && (
                    <p className="whitespace-pre-wrap">
                      <strong>Response B: </strong>
                      {shown.responseB}
                    </p>
                  )}
                  {shown.rubric && <p className="text-xs text-muted-foreground">Rubric: {shown.rubric}</p>}
                </div>
              </details>
            )}

            <p className="mt-3 text-sm">
              <span className="text-muted-foreground">Their call: </span>
              <code className="font-mono text-xs">{shownDecision(row)}</code>
            </p>
            <blockquote className="mt-2 whitespace-pre-wrap border-l-2 border-primary/40 pl-3 text-sm">{row.justification}</blockquote>
            <p className="mt-2 text-sm text-muted-foreground">
              AI: {row.score}/2{row.feedback && ` — ${row.feedback}`}
            </p>
            {row.override_score !== null && (
              <p className="mt-1 text-sm text-success">
                Reviewed: {row.override_score}/2{row.override_note && ` — ${row.override_note}`}
              </p>
            )}

            <div className="mt-4">
              <OverrideForm action={overrideGradeAction.bind(null, row.id, path)} current={effective} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
