'use client'

import { useParams } from 'next/navigation'
import { MasteryChallengePage } from '@/components/mastery-challenge-page'

export default function Page() {
  const { topic } = useParams<{ topic: string }>()
  return <MasteryChallengePage slug={topic} />
}
