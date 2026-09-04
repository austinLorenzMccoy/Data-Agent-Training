import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">404</p>
      <h1 className="font-heading text-3xl italic text-foreground">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
      >
        Back home
      </Link>
    </main>
  )
}
