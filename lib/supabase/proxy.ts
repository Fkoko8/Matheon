import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/env'

export interface SessionResult {
  response: NextResponse
  user: User | null
  configured: boolean
}

export async function updateSession(request: NextRequest): Promise<SessionResult> {
  const url = supabaseUrl()
  const key = supabaseAnonKey()
  if (!url || !key) return { response: NextResponse.next({ request }), user: null, configured: false }
  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  const { data } = await supabase.auth.getUser()
  return { response, user: data.user ?? null, configured: true }
}
