'use client'

/**
 * Bramka pierwszego startu.
 *
 * Uczeń bez aktywnego planu nauki trafia do kreatora onboardingu. Sprawdzenie
 * idzie jednym zapytaniem po `study_plans` (RLS ogranicza je do właściciela),
 * więc nie blokuje nawigacji i nie wymaga migracji schematu.
 */
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { hasActivePlan } from '@/lib/learning/onboarding'

export function useOnboardingGate() {
  const { user, loading: authLoading, configured } = useAuth()
  const [checking, setChecking] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    let active = true
    if (authLoading) return () => { active = false }

    if (!configured || !user) {
      setChecking(false)
      setNeedsOnboarding(false)
      return () => { active = false }
    }

    const supabase = createClient()
    void hasActivePlan(user.id, supabase).then((hasPlan) => {
      if (!active) return
      setNeedsOnboarding(!hasPlan)
      setChecking(false)
    })

    return () => { active = false }
  }, [user, authLoading, configured])

  return { checking, needsOnboarding }
}
