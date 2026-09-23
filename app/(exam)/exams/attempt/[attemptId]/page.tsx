'use client'

import { useParams, useRouter } from 'next/navigation'
import { ExamModePage } from '@/components/exam-pages'

export default function Page() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const router = useRouter()
  return <ExamModePage attemptId={attemptId} exit={() => router.push('/exams')} />
}
