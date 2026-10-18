import type { Instrumentation } from 'next'

// Reports unhandled server errors (route handlers, server components,
// server actions) to the alert channel.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { alert } = await import('./lib/server/alert')
  const e = err as Error & { digest?: string }
  await alert('error', `Server error on ${context.routeType} ${context.routePath}`, {
    message: e.message?.slice(0, 500),
    digest: e.digest,
    method: request.method,
    path: request.path,
  })
}
