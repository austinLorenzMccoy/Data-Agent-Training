import { SiteNav } from '@/components/site-nav'
import { OperationController } from '@/components/operation/operation-controller'

export const metadata = {
  title: 'Live Operation — Datanerds Annotation',
  description: 'Timed, AI-graded annotation operation. No second chances.',
}

export default function OperationPage() {
  return (
    <main className="relative min-h-screen">
      <SiteNav />
      <OperationController />
    </main>
  )
}
