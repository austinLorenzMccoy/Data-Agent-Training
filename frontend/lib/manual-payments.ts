// Manual payment methods (Airtm, Binance Pay, Grey). Shared by the pay page,
// the API and the admin review. Payment destinations come from server env
// vars so no account details live in the code.

export type ManualMethod = 'airtm' | 'binance' | 'grey'

export const MANUAL_METHODS: ManualMethod[] = ['airtm', 'binance', 'grey']

export const METHOD_INFO: Record<ManualMethod, { name: string; mark: string; tint: string; currencyNote: string; steps: (amount: string, dest: string) => string[] }> = {
  airtm: {
    name: 'Airtm',
    mark: 'A',
    tint: '#2c5282',
    currencyNote: 'USD balance',
    steps: (amount, dest) => [
      `Open Airtm and send ${amount} USD to ${dest}.`,
      'Screenshot the completed transfer.',
      'Upload it here with the transaction ID. Your plan starts when an admin approves it.',
    ],
  },
  binance: {
    name: 'Binance Pay',
    mark: 'B',
    tint: '#b8891a',
    currencyNote: 'USDT or other crypto',
    steps: (amount, dest) => [
      `Open Binance → Pay → Send, and pay ${amount} in USDT to Pay ID ${dest}.`,
      'Screenshot the success screen.',
      'Upload it here with the order ID. Your plan starts when an admin approves it.',
    ],
  },
  grey: {
    name: 'Grey',
    mark: 'G',
    tint: '#3f7a58',
    currencyNote: 'USD transfer',
    steps: (amount, dest) => [
      `In Grey (or your bank), send ${amount} USD to: ${dest}.`,
      'Screenshot the confirmation.',
      'Upload it here with the transaction reference. Your plan starts when an admin approves it.',
    ],
  },
}

export const PERIOD_DAYS = 30
export const MAX_PROOF_BYTES = 5 * 1024 * 1024
export const PROOF_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

/**
 * New period end for an approved payment: 30 days from now, or added to the
 * time left if the learner is already paid up on the same plan.
 */
export function newPeriodEnd(now: Date, current: { planId: number; periodEnd: string | null } | null, planId: number): Date {
  const base =
    current && current.planId === planId && current.periodEnd && Date.parse(current.periodEnd) > now.getTime()
      ? new Date(current.periodEnd)
      : now
  return new Date(base.getTime() + PERIOD_DAYS * 86_400_000)
}
