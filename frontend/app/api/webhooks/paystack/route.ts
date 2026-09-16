import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/paystack'

export const dynamic = 'force-dynamic'

interface PaystackEvent {
  event: string
  data: {
    reference?: string
    customer?: { customer_code: string }
    subscription?: { subscription_code: string }
    subscription_code?: string
    metadata?: Record<string, unknown> | null
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody) as PaystackEvent
  const admin = createAdminClient()

  switch (event.event) {
    case 'charge.success': {
      // Skip the one-off card-verification charge — it's not a recurring
      // billing event, and that flow is already handled synchronously by
      // POST /api/subscriptions/verify.
      if (event.data.metadata?.purpose === 'card_verification') break

      const customerCode = event.data.customer?.customer_code
      if (!customerCode) break

      await admin
        .from('subscriptions')
        .update({ status: 'active' } as never)
        .eq('paystack_customer_code', customerCode)
      break
    }

    case 'invoice.payment_failed': {
      const subscriptionCode = event.data.subscription?.subscription_code ?? event.data.subscription_code
      if (!subscriptionCode) break

      await admin
        .from('subscriptions')
        .update({ status: 'past_due' } as never)
        .eq('paystack_subscription_code', subscriptionCode)
      break
    }

    case 'subscription.disable': {
      const subscriptionCode = event.data.subscription_code
      if (!subscriptionCode) break

      await admin
        .from('subscriptions')
        .update({ plan_id: 1, status: 'canceled', cancel_at_period_end: false } as never)
        .eq('paystack_subscription_code', subscriptionCode)
      break
    }

    case 'subscription.not_renew': {
      const subscriptionCode = event.data.subscription_code
      if (!subscriptionCode) break

      await admin
        .from('subscriptions')
        .update({ cancel_at_period_end: true } as never)
        .eq('paystack_subscription_code', subscriptionCode)
      break
    }

    default:
      // Paystack may add event types over time — log and ignore rather
      // than error, since an unhandled event shouldn't cause retries.
      console.log('paystack webhook: unhandled event', event.event)
  }

  // Always 200 quickly — Paystack retries on non-2xx responses.
  return NextResponse.json({ received: true })
}
