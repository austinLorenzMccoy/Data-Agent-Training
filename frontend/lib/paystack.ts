import { timingSafeEqual, createHmac } from 'crypto'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export type PaystackResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'not_configured' }
  | { ok: false; reason: 'request_failed'; message: string }

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY)
}

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<PaystackResult<T>> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return { ok: false, reason: 'not_configured' }
  }

  try {
    const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      cache: 'no-store',
    })

    const body = await res.json().catch(() => null)

    if (!res.ok || !body?.status) {
      return { ok: false, reason: 'request_failed', message: body?.message ?? `Paystack request failed (${res.status})` }
    }

    return { ok: true, data: body.data as T }
  } catch (err) {
    return { ok: false, reason: 'request_failed', message: err instanceof Error ? err.message : 'Unknown error' }
  }
}

interface InitializeTransactionArgs {
  email: string
  amountKobo: number
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}

interface InitializeTransactionData {
  authorization_url: string
  access_code: string
  reference: string
}

export function initializeTransaction(args: InitializeTransactionArgs) {
  // Deliberately no `plan` field here — passing one would charge the full
  // plan amount immediately. This is only the small card-verification
  // charge that unlocks a subscription's `authorization_code`.
  return paystackFetch<InitializeTransactionData>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: args.email,
      amount: args.amountKobo,
      reference: args.reference,
      callback_url: args.callbackUrl,
      metadata: args.metadata,
    }),
  })
}

interface VerifyTransactionData {
  status: string
  reference: string
  amount: number
  metadata: Record<string, unknown> | null
  customer: { customer_code: string; email: string }
  authorization: { authorization_code: string; reusable: boolean }
}

export function verifyTransaction(reference: string) {
  return paystackFetch<VerifyTransactionData>(`/transaction/verify/${encodeURIComponent(reference)}`)
}

export function refundTransaction(reference: string) {
  return paystackFetch<{ status: string }>('/refund', {
    method: 'POST',
    body: JSON.stringify({ transaction: reference }),
  })
}

interface CreateSubscriptionArgs {
  customerCode: string
  planCode: string
  authorizationCode: string
  startDate: string
}

interface CreateSubscriptionData {
  subscription_code: string
  email_token: string
  status: string
}

export function createSubscription(args: CreateSubscriptionArgs) {
  // Paystack has no native "N trial days" flag — start_date is what
  // schedules the first real debit, which is how the trial is implemented.
  // This call also requires the customer to already have a successful
  // prior charge on file (the verification transaction above supplies it).
  return paystackFetch<CreateSubscriptionData>('/subscription', {
    method: 'POST',
    body: JSON.stringify({
      customer: args.customerCode,
      plan: args.planCode,
      authorization: args.authorizationCode,
      start_date: args.startDate,
    }),
  })
}

export function disableSubscription(args: { subscriptionCode: string; emailToken: string }) {
  return paystackFetch<{ status: string }>('/subscription/disable', {
    method: 'POST',
    body: JSON.stringify({ code: args.subscriptionCode, token: args.emailToken }),
  })
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey || !signatureHeader) return false

  const expected = createHmac('sha512', secretKey).update(rawBody).digest('hex')

  const expectedBuf = Buffer.from(expected, 'hex')
  const receivedBuf = Buffer.from(signatureHeader, 'hex')
  if (expectedBuf.length !== receivedBuf.length) return false

  return timingSafeEqual(expectedBuf, receivedBuf)
}
