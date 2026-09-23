import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase/env'

let browserClient: SupabaseClient | undefined

export function createClient() {
  const url = supabaseUrl()
  const key = supabaseAnonKey()
  if (!url || !key) return null
  browserClient ??= createBrowserClient(url, key, { cookieOptions: { sameSite: 'none', secure: true } })
  return browserClient
}
