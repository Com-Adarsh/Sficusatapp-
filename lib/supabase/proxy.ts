import { type NextRequest, NextResponse } from 'next/server'

// Backend is intentionally paused while the frontend is being completed.
// Do not initialize Supabase in the request proxy when credentials are absent.
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request })
}
