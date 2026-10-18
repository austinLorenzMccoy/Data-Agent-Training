'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { getEnabledTypes } from '@/lib/feature-flags'
import { currentUser } from '@/lib/server/http'
import { canCreateOrg, canManage, newApiKey, newInviteToken, roleIn, type OrgRole } from '@/lib/server/orgs'
import { enqueue, isAllowedWebhookUrl, newWebhookSecret } from '@/lib/server/webhooks'

export interface ActionState {
  error?: string
  ok?: string
  /** Shown once: a new API key or webhook secret. */
  secret?: string
}

async function requireManager(orgId: string) {
  const user = await currentUser()
  if (!user) redirect('/login?next=/org')
  const role = await roleIn(orgId, user.id)
  if (!canManage(role)) throw new Error('You need to be an admin of this organisation.')
  return user
}

function text(form: FormData, key: string, max = 200): string {
  return String(form.get(key) ?? '').trim().slice(0, max)
}

function int(form: FormData, key: string, min: number, max: number, fallback: number): number {
  const n = Number(form.get(key))
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback
}

export async function createOrg(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await currentUser()
  if (!user) redirect('/login?next=/org')
  if (!canCreateOrg(user)) return { error: 'Organisation accounts are set up by Datanerds staff. Contact us to get one.' }
  const name = text(form, 'name', 120)
  if (name.length < 2) return { error: 'Give the organisation a name.' }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('organisations' as never)
    .insert({ name, created_by: user.id } as never)
    .select('id')
    .single()
  if (error || !data) return { error: 'Could not create the organisation.' }
  const orgId = (data as unknown as { id: string }).id
  await admin.from('org_members' as never).insert({ org_id: orgId, agent_id: user.id, role: 'owner' } as never)
  redirect(`/org/${orgId}`)
}

export async function createExam(orgId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireManager(orgId)
  const title = text(form, 'title', 120)
  const track = text(form, 'track', 20)
  if (title.length < 2) return { error: 'Give the exam a title.' }
  if (!(getEnabledTypes() as string[]).includes(track)) return { error: 'Pick a task type.' }
  const closesRaw = text(form, 'closes_at', 40)
  const closesAt = closesRaw ? new Date(closesRaw) : null
  if (closesAt && Number.isNaN(closesAt.getTime())) return { error: 'The closing date is not valid.' }

  const { error } = await createAdminClient()
    .from('org_exams' as never)
    .insert({
      org_id: orgId,
      title,
      track,
      question_count: int(form, 'question_count', 1, 60, 12),
      minutes: int(form, 'minutes', 5, 240, 30),
      max_attempts: int(form, 'max_attempts', 1, 10, 1),
      show_review: form.get('show_review') === 'on',
      closes_at: closesAt?.toISOString() ?? null,
      invite_token: newInviteToken(),
      created_by: user.id,
    } as never)
  if (error) return { error: 'Could not create the exam.' }
  revalidatePath(`/org/${orgId}`)
  return { ok: 'Exam created. Copy its invite link below.' }
}

export async function setExamArchived(orgId: string, examId: string, archived: boolean) {
  await requireManager(orgId)
  await createAdminClient()
    .from('org_exams' as never)
    .update({ archived } as never)
    .eq('id', examId)
    .eq('org_id', orgId)
  revalidatePath(`/org/${orgId}`)
  revalidatePath(`/org/${orgId}/exams/${examId}`)
}

export async function rotateInvite(orgId: string, examId: string) {
  await requireManager(orgId)
  await createAdminClient()
    .from('org_exams' as never)
    .update({ invite_token: newInviteToken() } as never)
    .eq('id', examId)
    .eq('org_id', orgId)
  revalidatePath(`/org/${orgId}/exams/${examId}`)
}

export async function addMember(orgId: string, _: ActionState, form: FormData): Promise<ActionState> {
  await requireManager(orgId)
  const email = text(form, 'email', 200).toLowerCase()
  const role = text(form, 'role', 20) as OrgRole
  if (!['admin', 'reviewer'].includes(role)) return { error: 'Pick a role.' }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'Enter an email address.' }

  const admin = createAdminClient()
  // Members must have signed in once so they have an agent row.
  let found: string | null = null
  for (let page = 1; page <= 20 && !found; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error || !data.users.length) break
    found = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null
  }
  if (!found) return { error: 'No account with that email. Ask them to sign in once, then add them.' }

  const { error } = await admin
    .from('org_members' as never)
    .upsert({ org_id: orgId, agent_id: found, role } as never, { onConflict: 'org_id,agent_id' })
  if (error) return { error: 'Could not add that member.' }
  revalidatePath(`/org/${orgId}`)
  return { ok: `Added ${email} as ${role}.` }
}

export async function removeMember(orgId: string, agentId: string) {
  const user = await requireManager(orgId)
  if (agentId === user.id) return
  await createAdminClient()
    .from('org_members' as never)
    .delete()
    .eq('org_id', orgId)
    .eq('agent_id', agentId)
    .neq('role', 'owner')
  revalidatePath(`/org/${orgId}`)
}

export async function saveWebhook(orgId: string, _: ActionState, form: FormData): Promise<ActionState> {
  await requireManager(orgId)
  const url = text(form, 'url', 500)
  const admin = createAdminClient()

  if (!url) {
    await admin.from('organisations' as never).update({ webhook_url: null } as never).eq('id', orgId)
    revalidatePath(`/org/${orgId}`)
    return { ok: 'Webhook removed.' }
  }
  if (!isAllowedWebhookUrl(url)) return { error: 'Use a public https:// address.' }

  const { data } = await admin.from('organisations' as never).select('webhook_secret').eq('id', orgId).single()
  const existing = (data as unknown as { webhook_secret: string | null } | null)?.webhook_secret
  const secret = existing ?? newWebhookSecret()
  await admin.from('organisations' as never).update({ webhook_url: url, webhook_secret: secret } as never).eq('id', orgId)
  revalidatePath(`/org/${orgId}`)
  return existing ? { ok: 'Webhook address saved.' } : { ok: 'Webhook saved. Copy the signing secret now; it is not shown again.', secret }
}

export async function rotateWebhookSecret(orgId: string): Promise<ActionState> {
  await requireManager(orgId)
  const secret = newWebhookSecret()
  await createAdminClient().from('organisations' as never).update({ webhook_secret: secret } as never).eq('id', orgId)
  return { ok: 'New signing secret. Update your receiver; the old one stops working now.', secret }
}

export async function sendTestWebhook(orgId: string): Promise<ActionState> {
  await requireManager(orgId)
  await enqueue(orgId, {
    event: 'test.ping',
    id: `evt_test_${Date.now()}`,
    created_at: new Date().toISOString(),
    data: { message: 'Test delivery from Datanerds Annotation' },
  }, null)
  revalidatePath(`/org/${orgId}`)
  return { ok: 'Test sent. See its status under recent deliveries.' }
}

export async function rotateApiKey(orgId: string): Promise<ActionState> {
  await requireManager(orgId)
  const { key, prefix, hash } = newApiKey()
  await createAdminClient()
    .from('organisations' as never)
    .update({ api_key_hash: hash, api_key_prefix: prefix } as never)
    .eq('id', orgId)
  revalidatePath(`/org/${orgId}`)
  return { ok: 'New API key. Copy it now; it is not shown again. Any older key has stopped working.', secret: key }
}
