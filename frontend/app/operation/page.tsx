import { SiteNav } from '@/components/site-nav'
import { OperationController } from '@/components/operation/operation-controller'

export const metadata = {
  title: 'Live Operation — Datanerds Annotation',
  description: 'Pick a track, then sit a timed Live Operation of that assignment type only.',
}

export default function OperationPage() {
  return (
    <main className="relative min-h-screen">
      <SiteNav />
      <OperationController />
    </main>
  )
}
