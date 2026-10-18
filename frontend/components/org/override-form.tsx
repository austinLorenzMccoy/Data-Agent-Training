'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import type { ActionState } from '@/app/org/actions'

export function OverrideForm({
  action,
  current,
}: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>
  current: number
}) {
  const [state, run, pending] = useActionState(action, {})
  return (
    <form action={run} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <fieldset className="flex items-center gap-3">
        <legend className="sr-only">Score</legend>
        {[0, 1, 2].map((n) => (
          <label key={n} className="flex items-center gap-1 text-sm">
            <input type="radio" name="score" value={n} defaultChecked={n === current} />
            {n}
          </label>
        ))}
      </fieldset>
      <label className="flex-1">
        <span className="sr-only">Note</span>
        <input name="note" maxLength={500} placeholder="Why (optional)" className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm" />
      </label>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? 'Saving…' : 'Save grade'}
      </Button>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-success">{state.ok}</p>}
    </form>
  )
}
