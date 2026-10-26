'use client'

import { useEffect, useState } from 'react'
import { Award, Lightbulb, Plus, Printer, RotateCcw, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResumeSheet } from '@/components/resume/resume-sheet'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  LANGUAGE_LEVELS,
  ROLES,
  emptyResume,
  parseResume,
  resumeTips,
  rolePreset,
  type Resume,
  type RoleId,
} from '@/lib/resume'

const STORAGE_KEY = 'datanerds.resume.v1'

const field =
  'w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30'

export function ResumeBuilder() {
  const { user } = useAuth()
  const [resume, setResume] = useState<Resume>(() => emptyResume())
  const [loaded, setLoaded] = useState(false)
  const [skillDraft, setSkillDraft] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [importNote, setImportNote] = useState('')

  // The draft lives only in this browser; nothing is sent to our servers.
  useEffect(() => {
    try {
      const saved = parseResume(localStorage.getItem(STORAGE_KEY))
      if (saved) setResume(saved)
    } catch {
      // storage blocked; start fresh
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume))
    } catch {
      // storage full or blocked; the page still works
    }
  }, [resume, loaded])

  const preset = rolePreset(resume.role)
  const tips = resumeTips(resume)

  function set<K extends keyof Resume>(key: K, value: Resume[K]) {
    setResume((r) => ({ ...r, [key]: value }))
  }

  function update<K extends 'experience' | 'education' | 'certifications' | 'languages'>(
    key: K,
    i: number,
    patch: Partial<Resume[K][number]>,
  ) {
    setResume((r) => ({ ...r, [key]: r[key].map((item, j) => (j === i ? { ...item, ...patch } : item)) }))
  }

  function remove(key: 'experience' | 'education' | 'certifications' | 'languages', i: number) {
    setResume((r) => ({ ...r, [key]: r[key].filter((_, j) => j !== i) }))
  }

  function pickRole(id: RoleId) {
    setResume((r) => {
      const next = rolePreset(id)
      // Swap the headline only if it is still the old preset's, so typed ones survive.
      const headline = !r.headline.trim() || r.headline === rolePreset(r.role).headline ? next.headline : r.headline
      return { ...r, role: id, headline }
    })
  }

  function addSkill(skill: string) {
    const s = skill.trim()
    if (!s) return
    setResume((r) => (r.skills.some((x) => x.toLowerCase() === s.toLowerCase()) ? r : { ...r, skills: [...r.skills, s] }))
  }

  async function importCertificates() {
    setImportNote('')
    const { data, error } = await createClient()
      .from('certificates' as never)
      .select('code, operation_name, score, issued_at, revoked_at')
      .order('issued_at', { ascending: false })
    if (error) {
      setImportNote('Could not load your certificates. Try again.')
      return
    }
    const rows = ((data as unknown as { code: string; operation_name: string; score: number; issued_at: string; revoked_at: string | null }[]) ?? [])
      .filter((c) => !c.revoked_at)
    const origin = window.location.origin
    const fresh = rows
      .map((c) => ({
        name: `${c.operation_name} (${c.score}%)`,
        issuer: 'Datanerds Annotation',
        date: new Date(c.issued_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        url: `${origin}/verify/${c.code}`,
      }))
      .filter((c) => !resume.certifications.some((x) => x.url === c.url))
    if (rows.length === 0) setImportNote('No certificates yet. Pass a timed test to earn one.')
    else if (fresh.length === 0) setImportNote('Your certificates are already on the resume.')
    else {
      set('certifications', [...resume.certifications, ...fresh])
      setImportNote(`Added ${fresh.length} certificate${fresh.length === 1 ? '' : 's'} with verify links.`)
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-6 print:hidden">
        <Card title="Role you are applying for">
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => pickRole(r.id)}
                aria-pressed={resume.role === r.id}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs transition-colors',
                  resume.role === r.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface-raised text-muted-foreground hover:border-primary/50 hover:text-foreground',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            This changes the suggested headline, skills and bullets. Pick the closest match; you can edit everything.
          </p>
        </Card>

        <Card title="Contact">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name">
              <input className={field} value={resume.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
            </Field>
            <Field label="Email">
              <input className={field} type="email" value={resume.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
            </Field>
            <Field label="Phone">
              <input className={field} value={resume.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
            </Field>
            <Field label="City, country">
              <input className={field} value={resume.location} onChange={(e) => set('location', e.target.value)} placeholder="Lagos, Nigeria" />
            </Field>
          </div>
          <Field label="Headline" className="mt-3">
            <input className={field} value={resume.headline} onChange={(e) => set('headline', e.target.value)} />
          </Field>
          <Field label="Links (LinkedIn, GitHub, portfolio), comma-separated" className="mt-3">
            <input
              className={field}
              value={resume.links}
              onChange={(e) => set('links', e.target.value)}
              placeholder="linkedin.com/in/you, github.com/you"
            />
          </Field>
        </Card>

        <Card
          title="Summary"
          action={
            <Button variant="ghost" size="xs" onClick={() => set('summary', preset.summary)}>
              <Sparkles /> Use example
            </Button>
          }
        >
          <textarea
            className={cn(field, 'min-h-28')}
            value={resume.summary}
            onChange={(e) => set('summary', e.target.value)}
            placeholder="2–3 sentences: the work you want, what you are careful about, and your strongest subject or language."
          />
        </Card>

        <Card title="Skills">
          {resume.skills.length > 0 && (
            <ul className="mb-3 flex flex-wrap gap-1.5">
              {resume.skills.map((s) => (
                <li key={s} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
                  {s}
                  <button
                    type="button"
                    onClick={() => set('skills', resume.skills.filter((x) => x !== s))}
                    aria-label={`Remove ${s}`}
                    className="text-muted-foreground hover:text-danger"
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              addSkill(skillDraft)
              setSkillDraft('')
            }}
          >
            <input className={field} value={skillDraft} onChange={(e) => setSkillDraft(e.target.value)} placeholder="Add a skill and press Enter" />
            <Button type="submit" variant="outline" size="lg">
              <Plus /> Add
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">Suggested for this role:</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {preset.skills
              .filter((s) => !resume.skills.some((x) => x.toLowerCase() === s.toLowerCase()))
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground"
                >
                  + {s}
                </button>
              ))}
          </div>
        </Card>

        <Card
          title="Experience"
          action={
            <Button variant="ghost" size="xs" onClick={() => set('experience', [...resume.experience, { role: '', org: '', dates: '', bullets: '' }])}>
              <Plus /> Add role
            </Button>
          }
        >
          <p className="mb-3 text-xs text-muted-foreground">
            No annotation work yet? Teaching, tutoring, editing, research, customer support and freelance writing all show the
            same care. Lead each bullet with a verb and add a number where you can.
          </p>
          <div className="space-y-5">
            {resume.experience.map((e, i) => (
              <Entry key={i} onRemove={() => remove('experience', i)}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input className={field} value={e.role} onChange={(ev) => update('experience', i, { role: ev.target.value })} placeholder="Job title" aria-label="Job title" />
                  <input className={field} value={e.org} onChange={(ev) => update('experience', i, { org: ev.target.value })} placeholder="Company or client" aria-label="Company" />
                  <input className={field} value={e.dates} onChange={(ev) => update('experience', i, { dates: ev.target.value })} placeholder="2023 – Present" aria-label="Dates" />
                </div>
                <textarea
                  className={cn(field, 'mt-3 min-h-28')}
                  value={e.bullets}
                  onChange={(ev) => update('experience', i, { bullets: ev.target.value })}
                  placeholder="One achievement per line"
                  aria-label="Bullets, one per line"
                />
                <Button
                  variant="ghost"
                  size="xs"
                  className="mt-1"
                  onClick={() => update('experience', i, { bullets: [e.bullets.trim(), ...preset.bullets].filter(Boolean).join('\n') })}
                >
                  <Sparkles /> Add example bullets
                </Button>
              </Entry>
            ))}
          </div>
        </Card>

        <Card
          title="Education"
          action={
            <Button variant="ghost" size="xs" onClick={() => set('education', [...resume.education, { degree: '', school: '', dates: '', detail: '' }])}>
              <Plus /> Add
            </Button>
          }
        >
          <div className="space-y-5">
            {resume.education.map((e, i) => (
              <Entry key={i} onRemove={() => remove('education', i)}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input className={field} value={e.degree} onChange={(ev) => update('education', i, { degree: ev.target.value })} placeholder="B.Sc. Biochemistry" aria-label="Degree" />
                  <input className={field} value={e.school} onChange={(ev) => update('education', i, { school: ev.target.value })} placeholder="University" aria-label="School" />
                  <input className={field} value={e.dates} onChange={(ev) => update('education', i, { dates: ev.target.value })} placeholder="2019 – 2023" aria-label="Dates" />
                </div>
                <input
                  className={cn(field, 'mt-3')}
                  value={e.detail}
                  onChange={(ev) => update('education', i, { detail: ev.target.value })}
                  placeholder="Honours, thesis topic or relevant courses (optional)"
                  aria-label="Details"
                />
              </Entry>
            ))}
          </div>
        </Card>

        <Card
          title="Certifications"
          action={
            <Button variant="ghost" size="xs" onClick={() => set('certifications', [...resume.certifications, { name: '', issuer: '', date: '', url: '' }])}>
              <Plus /> Add
            </Button>
          }
        >
          {user ? (
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" className="rounded-full" onClick={importCertificates}>
                <Award /> Import my Datanerds certificates
              </Button>
              {importNote && <span className="text-xs text-muted-foreground">{importNote}</span>}
            </div>
          ) : (
            <p className="mb-3 text-xs text-muted-foreground">Sign in to add your Datanerds certificates with links recruiters can verify.</p>
          )}
          <div className="space-y-4">
            {resume.certifications.map((c, i) => (
              <Entry key={i} onRemove={() => remove('certifications', i)}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input className={field} value={c.name} onChange={(ev) => update('certifications', i, { name: ev.target.value })} placeholder="Certificate" aria-label="Certificate name" />
                  <input className={field} value={c.issuer} onChange={(ev) => update('certifications', i, { issuer: ev.target.value })} placeholder="Issuer" aria-label="Issuer" />
                  <input className={field} value={c.date} onChange={(ev) => update('certifications', i, { date: ev.target.value })} placeholder="Oct 2026" aria-label="Date" />
                </div>
                <input className={cn(field, 'mt-3')} value={c.url} onChange={(ev) => update('certifications', i, { url: ev.target.value })} placeholder="Verify link (optional)" aria-label="Verify link" />
              </Entry>
            ))}
          </div>
        </Card>

        <Card
          title="Languages"
          action={
            <Button variant="ghost" size="xs" onClick={() => set('languages', [...resume.languages, { language: '', level: 'Fluent' }])}>
              <Plus /> Add
            </Button>
          }
        >
          <p className="mb-3 text-xs text-muted-foreground">Every language you speak well is a separate pool of projects. List them all.</p>
          <div className="space-y-3">
            {resume.languages.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input className={field} value={l.language} onChange={(ev) => update('languages', i, { language: ev.target.value })} placeholder="Language" aria-label="Language" />
                <select className={cn(field, 'w-40')} value={l.level} onChange={(ev) => update('languages', i, { level: ev.target.value })} aria-label="Level">
                  {LANGUAGE_LEVELS.map((lv) => (
                    <option key={lv}>{lv}</option>
                  ))}
                </select>
                <button type="button" onClick={() => remove('languages', i)} aria-label="Remove language" className="px-1 text-muted-foreground hover:text-danger">
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <p className="text-xs text-muted-foreground">Saved in this browser as you type.</p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => {
                if (!confirmClear) {
                  setConfirmClear(true)
                  setTimeout(() => setConfirmClear(false), 3000)
                  return
                }
                setResume(emptyResume(resume.role))
                setConfirmClear(false)
              }}
            >
              <RotateCcw /> {confirmClear ? 'Click again to clear' : 'Start over'}
            </Button>
            <Button className="rounded-full" onClick={() => window.print()}>
              <Printer /> Download PDF
            </Button>
          </div>
        </div>

        {tips.length > 0 && (
          <div className="mb-4 rounded-xl border border-xp/40 bg-xp/5 p-4 print:hidden">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-xp">
              <Lightbulb className="size-3.5" /> Before you send it
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              {tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto print:max-h-none print:overflow-visible">
          <ResumeSheet resume={resume} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground print:hidden">
          In the print dialog choose “Save as PDF” and turn off headers and footers.
        </p>
      </div>
    </div>
  )
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface-raised p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-heading text-xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function Entry({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="relative rounded-xl border border-border/70 bg-surface p-3 pr-9">
      <button type="button" onClick={onRemove} aria-label="Remove" className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-danger">
        <X className="size-4" />
      </button>
      {children}
    </div>
  )
}
