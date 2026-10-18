import { OperationController } from '@/components/operation/operation-controller'
import { typeCounts } from '@/lib/server/bank'

export const metadata = {
  title: 'Timed test — Datanerds Annotation',
  description: 'Pick one task type, then sit a timed test of that type only.',
}

export default function OperationPage() {
  return (
    <main className="relative min-h-screen">
      <OperationController counts={typeCounts()} />
    </main>
  )
}
