'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { const supabase = createClient(); if (!supabase) { setLoading(false); return }; let active = true; supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setLoading(false) } }); const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null)); return () => { active = false; listener.subscription.unsubscribe() } }, [])
  return { user, loading, configured: Boolean(createClient()) }
}
