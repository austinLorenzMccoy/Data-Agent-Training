// Uptime probe: point an uptime monitor here. Checks the database too,
// so it doubles as the daily Supabase keep-alive.
export { GET } from '../keep-alive/route'

export const dynamic = 'force-dynamic'
