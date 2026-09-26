import { AITutorPage } from '@/components/ai-tutor-page'
import { defaultTaskPrompt, hasTaskContext, readTutorTaskParams } from '@/lib/ai/task-context'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const task = readTutorTaskParams(await searchParams)
  const withTask = hasTaskContext(task)

  return (
    <AITutorPage
      task={withTask ? task : undefined}
      initialPrompt={withTask ? task.prompt ?? defaultTaskPrompt(task) : task.prompt}
    />
  )
}
