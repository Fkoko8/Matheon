'use client'

import { useParams } from 'next/navigation'
import { TopicPage } from '@/components/learning-curriculum-pages'

export default function Page() {
  const { topic } = useParams<{ topic: string }>()
  return <TopicPage slug={topic} />
}
