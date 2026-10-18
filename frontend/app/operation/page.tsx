import { OperationController } from '@/components/operation/operation-controller'
import { ensureBank, typeCounts } from '@/lib/server/bank'

export const metadata = {
  title: 'Timed test — Datanerds Annotation',
  description: 'Pick one task type, then sit a timed test of that type only.',
}

export const dynamic = 'force-dynamic'

export default async function OperationPage() {
  await ensureBank()
  return (
    <main className="relative min-h-screen">
      <OperationController counts={typeCounts()} />
    </main>
  )
}
