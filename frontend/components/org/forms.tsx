'use client'

import { useActionState, useState, useTransition } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPE_NAMES } from '@/lib/scoring'
import type { AssignmentType } from '@/lib/types'
import type { ActionState } from '@/app/org/actions'

const input = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm'
const label = 'block text-xs font-medium text-muted-foreground'

function Status({ state }: { state: ActionState }) {
  return (
    <>
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.ok && <p className="text-sm text-success">{state.ok}</p>}
      {state.secret && <SecretBox value={state.secret} />}
    </>
  )
}

export function CopyButton({ value, label: text = 'Copy' }: { value: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        } catch {
          // clipboard blocked; the value is visible to copy by hand
        }
      }}
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? 'Copied' : text}
    </Button>
  )
}

function SecretBox({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-xp/40 bg-xp/5 p-2">
      <code className="min-w-0 flex-1 break-all font-mono text-xs">{value}</code>
      <CopyButton value={value} />
    </div>
  )
}

type Action = (state: ActionState, form: FormData) => Promise<ActionState>

export function CreateOrgForm({ action }: { action: Action }) {
  const [state, run, pending] = useActionState(action, {})
  return (
    <form action={run} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="org-name" className={label}>
          Organisation name
        </label>
        <input id="org-name" name="name" required minLength={2} maxLength={120} className={input} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Creating…' : 'Create organisation'}
      </Button>
      <Status state={state} />
    </form>
  )
}

export function CreateExamForm({ action, tracks }: { action: Action; tracks: AssignmentType[] }) {
  const [state, run, pending] = useActionState(action, {})
  return (
    <form action={run} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="exam-title" className={label}>
          Title
        </label>
        <input id="exam-title" name="title" required maxLength={120} placeholder="Rater screening — October" className={input} />
      </div>
      <div>
        <label htmlFor="exam-track" className={label}>
          Task type
        </label>
        <select id="exam-track" name="track" className={input} defaultValue={tracks[0]}>
          {tracks.map((t) => (
            <option key={t} value={t}>
              {TYPE_NAMES[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="exam-count" className={label}>
          Questions
        </label>
        <input id="exam-count" name="question_count" type="number" min={1} max={60} defaultValue={12} className={input} />
      </div>
      <div>
        <label htmlFor="exam-minutes" className={label}>
          Time limit (minutes)
        </label>
        <input id="exam-minutes" name="minutes" type="number" min={5} max={240} defaultValue={30} className={input} />
      </div>
      <div>
        <label htmlFor="exam-attempts" className={label}>
          Attempts per candidate
        </label>
        <input id="exam-attempts" name="max_attempts" type="number" min={1} max={10} defaultValue={1} className={input} />
      </div>
      <div>
        <label htmlFor="exam-closes" className={label}>
          Closes (optional)
        </label>
        <input id="exam-closes" name="closes_at" type="datetime-local" className={input} />
      </div>
      <label className="flex items-center gap-2 self-end text-sm">
        <input type="checkbox" name="show_review" className="size-4" />
        Show candidates the explanations afterwards
      </label>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? 'Creating…' : 'Create exam'}
        </Button>
        <Status state={state} />
      </div>
    </form>
  )
}

export function AddMemberForm({ action }: { action: Action }) {
  const [state, run, pending] = useActionState(action, {})
  return (
    <form action={run} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="member-email" className={label}>
          Email (must have signed in once)
        </label>
        <input id="member-email" name="email" type="email" required className={input} />
      </div>
      <div>
        <label htmlFor="member-role" className={label}>
          Role
        </label>
        <select id="member-role" name="role" className={input} defaultValue="reviewer">
          <option value="admin">Admin</option>
          <option value="reviewer">Reviewer</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Adding…' : 'Add'}
      </Button>
      <div className="sm:basis-full">
        <Status state={state} />
      </div>
    </form>
  )
}

export function WebhookForm({ action, current }: { action: Action; current: string | null }) {
  const [state, run, pending] = useActionState(action, {})
  return (
    <form action={run} className="flex flex-col gap-3">
      <div>
        <label htmlFor="webhook-url" className={label}>
          Results webhook URL
        </label>
        <input
          id="webhook-url"
          name="url"
          type="url"
          defaultValue={current ?? ''}
          placeholder="https://your-system.example.com/hooks/datanerds"
          className={input}
        />
      </div>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : 'Save'}
      </Button>
      <Status state={state} />
    </form>
  )
}

/** A button that runs a no-argument server action and shows its result. */
export function ActionButton({
  action,
  children,
  variant = 'outline',
}: {
  action: () => Promise<ActionState>
  children: React.ReactNode
  variant?: 'outline' | 'destructive' | 'default'
}) {
  const [state, setState] = useState<ActionState>({})
  const [pending, start] = useTransition()
  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant={variant} size="sm" disabled={pending} onClick={() => start(async () => setState(await action()))} className="self-start">
        {pending ? 'Working…' : children}
      </Button>
      <Status state={state} />
    </div>
  )
}
