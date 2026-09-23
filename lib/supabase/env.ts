/**
 * Resolves Supabase configuration from the environment.
 *
 * Different Supabase dashboards hand out different variable names, so we accept
 * the common variants (publishable key, anon key) in both the public and the
 * server-only naming schemes.
 *
 * NOTE: these must stay as static `process.env.X` accesses — Next.js inlines
 * public variables into the browser bundle only when referenced statically.
 */
export function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
}

export function supabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_KEY
  )
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey())
}
