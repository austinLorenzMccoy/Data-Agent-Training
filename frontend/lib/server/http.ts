import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AttemptError } from './attempts'

export async function currentUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export function unauthorized() {
  return Response.json({ error: 'unauthorized' }, { status: 401 })
}

export async function readJson(req: Request, maxBytes = 128 * 1024): Promise<Record<string, unknown> | null> {
  const text = await req.text()
  if (text.length > maxBytes) return null
  try {
    const body = JSON.parse(text)
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function errorResponse(err: unknown, where: string) {
  if (err instanceof AttemptError) {
    return Response.json({ error: err.code, ...err.detail }, { status: err.status })
  }
  console.error(`${where}:`, (err as Error).message)
  return Response.json({ error: 'server_error' }, { status: 500 })
}
