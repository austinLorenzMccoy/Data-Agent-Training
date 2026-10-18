import 'server-only'
import type { ManualMethod } from '@/lib/manual-payments'

/** Where each method pays to, from env. A method with no destination is hidden. */
export function methodDestinations(): Partial<Record<ManualMethod, string>> {
  const out: Partial<Record<ManualMethod, string>> = {}
  const airtm = process.env.MANUAL_PAY_AIRTM?.trim()
  const binance = process.env.MANUAL_PAY_BINANCE?.trim()
  const grey = process.env.MANUAL_PAY_GREY?.trim()
  if (airtm) out.airtm = airtm
  if (binance) out.binance = binance
  if (grey) out.grey = grey
  return out
}
