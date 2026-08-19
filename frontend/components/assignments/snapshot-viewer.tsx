'use client'

import { cn } from '@/lib/utils'

export function SnapshotViewer({
  url,
  label = 'Page snapshot',
}: {
  url?: string
  label?: string
}) {
  if (!url) {
    return (
      <div className="mb-4 rounded-md border border-border bg-surface-raised/40 p-6 text-center text-sm text-muted-foreground">
        No page snapshot for this question.
      </div>
    )
  }

  const isImage = /\.(png|jpe?g|webp|gif)$/i.test(url)

  return (
    <div className="mb-4">
      <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
        {label}
      </p>
      <div className={cn('overflow-hidden rounded-md border border-border bg-background')}>
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Landing page snapshot" className="w-full" />
        ) : (
          <iframe
            src={url}
            title="Sandboxed landing page snapshot"
            sandbox=""
            referrerPolicy="no-referrer"
            className="h-[360px] w-full bg-white"
          />
        )}
      </div>
    </div>
  )
}
