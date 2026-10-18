'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface Row {
  code: string
  operation_name: string
  score: number
  issued_at: string
  revoked_at: string | null
}

export function MyCertificates() {
  const { user } = useAuth()
  const [rows, setRows] = useState<Row[] | null>(null)

  useEffect(() => {
    if (!user) return
    createClient()
      .from('certificates' as never)
      .select('code, operation_name, score, issued_at, revoked_at')
      .order('issued_at', { ascending: false })
      .then(({ data }) => setRows((data as unknown as Row[]) ?? []))
  }, [user])

  if (!user || rows === null) return null

  return (
    <section className="mb-8 rounded-xl border border-border bg-card p-5" aria-labelledby="certs-heading">
      <h2 id="certs-heading" className="mb-3 text-[12px] font-medium text-muted-foreground">
        Certificates
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Pass a timed test to earn your first certificate.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.code} className="flex items-center justify-between gap-3 py-2.5">
              <span className="flex items-center gap-2 text-sm">
                <Award className={r.revoked_at ? 'size-4 text-muted-foreground' : 'size-4 text-xp'} />
                {r.operation_name} · {r.score}%
                {r.revoked_at && <span className="text-xs text-danger">revoked</span>}
              </span>
              <Link href={`/verify/${r.code}`} className="font-mono text-xs text-primary hover:underline">
                {r.code}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
