import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/server'
import type { AssignmentType } from '@/lib/types'
import type { OrgExamConfig } from './attempts'

type Admin = ReturnType<typeof createAdminClient>

export type OrgRole = 'owner' | 'admin' | 'reviewer'

export interface Organisation {
  id: string
  name: string
  webhook_url: string | null
  api_key_prefix: string | null
  created_at: string
}

export interface OrgExamRow {
  id: string
  org_id: string
  title: string
  track: AssignmentType
  question_count: number
  minutes: number
  max_attempts: number
  show_review: boolean
  invite_token: string
  opens_at: string | null
  closes_at: string | null
  archived: boolean
  created_at: string
}

/** Platform staff, from ADMIN_EMAILS (comma-separated). */
export function isPlatformAdmin(user: Pick<User, 'email'> | null | undefined): boolean {
  if (!user?.email) return false
  const list = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(user.email.toLowerCase())
}

export function canCreateOrg(user: Pick<User, 'email'> | null | undefined): boolean {
  return !!user && (process.env.ORG_SELF_SERVE === 'true' || isPlatformAdmin(user))
}

export async function roleIn(orgId: string, agentId: string, admin: Admin = createAdminClient()): Promise<OrgRole | null> {
  const { data } = await admin
    .from('org_members' as never)
    .select('role')
    .eq('org_id', orgId)
    .eq('agent_id', agentId)
    .maybeSingle()
  return (data as unknown as { role: OrgRole } | null)?.role ?? null
}

/** Admins and owners manage exams and settings; reviewers only read results and review grades. */
export function canManage(role: OrgRole | null): boolean {
  return role === 'owner' || role === 'admin'
}

export async function myOrgs(agentId: string, admin: Admin = createAdminClient()): Promise<(Organisation & { role: OrgRole })[]> {
  const { data } = await admin
    .from('org_members' as never)
    .select('role, organisations(id, name, webhook_url, api_key_prefix, created_at)')
    .eq('agent_id', agentId)
  const rows = (data as unknown as { role: OrgRole; organisations: Organisation }[]) ?? []
  return rows.filter((r) => r.organisations).map((r) => ({ ...r.organisations, role: r.role }))
}

export async function getOrg(orgId: string, admin: Admin = createAdminClient()): Promise<Organisation | null> {
  const { data } = await admin
    .from('organisations' as never)
    .select('id, name, webhook_url, api_key_prefix, created_at')
    .eq('id', orgId)
    .maybeSingle()
  return (data as unknown as Organisation) ?? null
}

export function newInviteToken(): string {
  return randomBytes(12).toString('base64url')
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export function newApiKey(): { key: string; prefix: string; hash: string } {
  const key = `dn_live_${randomBytes(24).toString('base64url')}`
  return { key, prefix: key.slice(0, 12), hash: hashApiKey(key) }
}

/** Resolve a bearer API key to its organisation. */
export async function orgForApiKey(key: string, admin: Admin = createAdminClient()): Promise<string | null> {
  if (!key.startsWith('dn_live_')) return null
  const { data } = await admin.from('organisations' as never).select('id').eq('api_key_hash', hashApiKey(key)).maybeSingle()
  return (data as unknown as { id: string } | null)?.id ?? null
}

export async function examByToken(token: string, admin: Admin = createAdminClient()): Promise<(OrgExamRow & { org_name: string }) | null> {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return null
  const { data } = await admin
    .from('org_exams' as never)
    .select('*, organisations(name)')
    .eq('invite_token', token)
    .maybeSingle()
  const row = data as unknown as (OrgExamRow & { organisations: { name: string } }) | null
  if (!row) return null
  const { organisations, ...exam } = row
  return { ...exam, org_name: organisations?.name ?? '' }
}

export function toExamConfig(e: OrgExamRow): OrgExamConfig {
  return {
    id: e.id,
    title: e.title,
    track: e.track,
    questionCount: e.question_count,
    minutes: e.minutes,
    maxAttempts: e.max_attempts,
    opensAt: e.opens_at,
    closesAt: e.closes_at,
    archived: e.archived,
  }
}

/** Record that a signed-in user opened an exam link, so the organisation sees them. */
export async function joinExam(examId: string, user: User, admin: Admin = createAdminClient()) {
  const name = (user.user_metadata?.full_name as string | undefined) ?? (user.user_metadata?.name as string | undefined) ?? null
  await admin
    .from('org_exam_candidates' as never)
    .upsert({ org_exam_id: examId, agent_id: user.id, email: user.email ?? null, name } as never, {
      onConflict: 'org_exam_id,agent_id',
      ignoreDuplicates: true,
    })
}

export interface CandidateResult {
  agent_id: string
  name: string | null
  email: string | null
  joined_at: string
  attempts: {
    attempt_id: string
    status: 'active' | 'finished'
    started_at: string
    finished_at: string | null
    operation_id: string | null
    score: number | null
    passed: boolean | null
    questions_total: number | null
    questions_correct: number | null
    time_taken_seconds: number | null
    integrity_verified: boolean | null
    integrity_reasons: string[]
  }[]
}

export async function examResults(examId: string, admin: Admin = createAdminClient()): Promise<CandidateResult[]> {
  const [{ data: cands }, { data: atts }] = await Promise.all([
    admin.from('org_exam_candidates' as never).select('agent_id, name, email, joined_at').eq('org_exam_id', examId),
    admin
      .from('operation_attempts' as never)
      .select(
        'id, agent_id, status, started_at, finished_at, operation_id, operations:operation_id(iq_score, passed, questions_total, questions_correct, time_taken_seconds, integrity)',
      )
      .eq('org_exam_id', examId)
      .order('started_at', { ascending: true }),
  ])
  const candidates = (cands as unknown as Omit<CandidateResult, 'attempts'>[]) ?? []
  const attempts =
    (atts as unknown as {
      id: string
      agent_id: string
      status: 'active' | 'finished'
      started_at: string
      finished_at: string | null
      operation_id: string | null
      operations: {
        iq_score: number
        passed: boolean
        questions_total: number
        questions_correct: number
        time_taken_seconds: number | null
        integrity: { verified?: boolean; reasons?: string[] } | null
      } | null
    }[]) ?? []

  return candidates
    .map((c) => ({
      ...c,
      attempts: attempts
        .filter((a) => a.agent_id === c.agent_id)
        .map((a) => ({
          attempt_id: a.id,
          status: a.status,
          started_at: a.started_at,
          finished_at: a.finished_at,
          operation_id: a.operation_id,
          score: a.operations?.iq_score ?? null,
          passed: a.operations?.passed ?? null,
          questions_total: a.operations?.questions_total ?? null,
          questions_correct: a.operations?.questions_correct ?? null,
          time_taken_seconds: a.operations?.time_taken_seconds ?? null,
          integrity_verified: a.operations?.integrity ? a.operations.integrity.verified !== false : null,
          integrity_reasons: a.operations?.integrity?.reasons ?? [],
        })),
    }))
    .sort((a, b) => a.joined_at.localeCompare(b.joined_at))
}
