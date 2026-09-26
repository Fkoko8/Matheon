import { Suspense } from 'react'
import { TrainingPage } from '@/components/practice-pages'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-slate-500">Wczytuję bank zadań…</div>}>
      <TrainingPage />
    </Suspense>
  )
}
