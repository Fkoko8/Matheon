'use client'

import { useParams } from 'next/navigation'
import { LessonCurriculumPage } from '@/components/learning-curriculum-pages'

export default function Page() {
  const { topic, lesson } = useParams<{ topic: string; lesson: string }>()
  return <LessonCurriculumPage topicSlug={topic} lessonSlug={lesson} />
}
