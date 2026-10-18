import { redirect } from 'next/navigation'
import { PageHero } from '@/components/page-hero'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Check a certificate — Datanerds Annotation',
  description: 'Enter a certificate code to confirm who earned it, on which test, and with what score.',
}

async function lookUp(formData: FormData) {
  'use server'
  const code = String(formData.get('code') ?? '').trim()
  if (code) redirect(`/verify/${encodeURIComponent(code)}`)
}

export default function VerifyIndexPage() {
  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow="Credentials" title="Check a" accent="certificate.">
        Every certificate has a code. Enter it to see who earned it, on which test, and with what score.
      </PageHero>
      <form action={lookUp} className="mx-auto flex max-w-md flex-col gap-3 px-4 py-14 sm:flex-row">
        <label htmlFor="code" className="sr-only">
          Certificate code
        </label>
        <input
          id="code"
          name="code"
          required
          placeholder="7KQ2M-X9D4R"
          autoComplete="off"
          className="flex-1 rounded-full border border-border bg-surface-raised px-4 py-2.5 font-mono uppercase"
        />
        <Button type="submit" className="rounded-full px-6">
          Check
        </Button>
      </form>
    </main>
  )
}
