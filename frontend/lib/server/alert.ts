import 'server-only'

// Operational alerts. Posts to ALERT_WEBHOOK_URL (a Slack or Discord
// incoming webhook; both accept this body) and always logs. Repeats of the
// same alert are dropped for five minutes per server instance so an outage
// does not flood the channel.

const SUPPRESS_MS = 5 * 60_000
const lastSent = new Map<string, number>()

export type AlertLevel = 'error' | 'warning'

export async function alert(level: AlertLevel, title: string, detail: Record<string, unknown> = {}): Promise<void> {
  const line = `[${level}] ${title} ${JSON.stringify(detail)}`
  if (level === 'error') console.error(line)
  else console.warn(line)

  const url = process.env.ALERT_WEBHOOK_URL
  if (!url) return

  const now = Date.now()
  const prev = lastSent.get(title)
  if (prev && now - prev < SUPPRESS_MS) return
  lastSent.set(title, now)

  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown'
  const text = `${level === 'error' ? '🔴' : '🟠'} *${title}* (${env})\n\`\`\`${JSON.stringify(detail, null, 2).slice(0, 1500)}\`\`\``
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, content: text }),
      signal: AbortSignal.timeout(3000),
    })
  } catch (err) {
    console.error('alert: webhook failed', (err as Error).message)
  }
}
