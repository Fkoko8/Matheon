'use client'

import { useParams, useRouter } from 'next/navigation'
import { ExamDetailsPage } from '@/components/exam-pages'

export default function Page() {
  const { examId } = useParams<{ examId: string }>()
  const router = useRouter()
  return <ExamDetailsPage examId={examId} openAttempt={(id) => router.push(`/exams/attempt/${id}`)} close={() => router.push('/exams')} />
}
