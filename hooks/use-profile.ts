'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export interface ShellProfile {
  id: string
  displayName: string
  email?: string
  avatarUrl?: string
  level: number
  xp: number
  streak: number
  /** Poziom matury wybrany przez ucznia (`preferred_level` w profilu). */
  preferredLevel: 'basic' | 'extended'
}

function displayNameFromUser(user: User): string {
  const raw = (user.user_metadata?.display_name as string | undefined) ?? user.email?.split('@')[0] ?? 'Uczeń'
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Uczeń'
}

function fallbackProfile(user: User): ShellProfile {
  return { id: user.id, displayName: displayNameFromUser(user), email: user.email ?? undefined, level: 1, xp: 0, streak: 0, preferredLevel: 'basic' }
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'M'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** Reads the signed-in learner's profile (level, XP, streak) from Supabase. */
export function useProfile() {
  const { user, loading: authLoading, configured } = useAuth()
  const [profile, setProfile] = useState<ShellProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    if (!supabase || !user) {
      setProfile(user ? fallbackProfile(user) : null)
      setLoading(authLoading)
      return () => { active = false }
    }
    supabase
      .from('profiles')
      .select('id,display_name,avatar_url,level,xp,streak,preferred_level')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        if (!data) {
          setProfile(fallbackProfile(user))
          setLoading(false)
          return
        }
        setProfile({
          id: String(data.id),
          displayName: String(data.display_name ?? displayNameFromUser(user)),
          email: user.email ?? undefined,
          avatarUrl: data.avatar_url ? String(data.avatar_url) : undefined,
          level: Number(data.level ?? 1),
          xp: Number(data.xp ?? 0),
          streak: Number(data.streak ?? 0),
          preferredLevel: data.preferred_level === 'extended' ? 'extended' : 'basic',
        })
        setLoading(false)
      })
    return () => { active = false }
  }, [user, authLoading])

  return { user, profile, loading, configured }
}
