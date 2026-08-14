import { SiteNav } from '@/components/site-nav'
import { OperationController } from '@/components/operation/operation-controller'

export const metadata = {
  title: 'Live Operation — Datanerds Annotation',
  description: 'Timed Live Operation across core and specialisation assignment types. Forward-only between assignments.',
}

export default function OperationPage() {
  return (
    <main className="relative min-h-screen">
      <SiteNav />
      <OperationController />
    </main>
  )
}
