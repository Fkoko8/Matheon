'use client'

/**
 * Realny postęp nauki dla widoków sekcji Nauka (mastery działów, lekcji i umiejętności).
 * Bez sesji zwraca pustą mapę, więc UI pokazuje zera zamiast wymyślonych liczb.
 */
import { useEffect, useState } from 'react'
import { loadLearningProgress, type TopicProgress } from '@/lib/learning/learning-progress'
import { useAuth } from '@/hooks/use-auth'

export function useLearningProgress() {
  const { user, loading: authLoading } = useAuth()
  const [progress, setProgress] = useState<Map<string, TopicProgress> | null>(null)

  useEffect(() => {
    let active = true
    if (authLoading) return () => { active = false }

    if (!user) {
      setProgress(new Map())
      return () => { active = false }
    }

    void loadLearningProgress().then((result) => {
      if (active) setProgress(result)
    })

    return () => { active = false }
  }, [user, authLoading])

  return { progress, loading: progress === null }
}
