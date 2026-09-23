'use client'

import { useRouter } from 'next/navigation'
import { ExamLibraryPage } from '@/components/exam-pages'

export default function Page() {
  const router = useRouter()
  return <ExamLibraryPage openExam={(id) => router.push(`/exams/${id}`)} />
}
