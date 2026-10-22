import 'server-only'
import { getEntitlements } from '@/lib/entitlements'

// Premium is any paid plan that is active or still in its trial. A past-due
// plan keeps its quotas until the expiry job drops it, but not the
// members-only pages.
export async function hasPremium(userId: string): Promise<boolean> {
  const ent = await getEntitlements(userId)
  if (!ent) return false
  return ent.plan.is_paid && (ent.subscription.status === 'active' || ent.subscription.status === 'trialing')
}
