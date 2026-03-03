import { redirect } from 'next/navigation'

import { getCurrentUserId } from '@/lib/auth/get-current-user'

import { PromptTemplatesPage } from '@/components/prompt-templates/prompt-templates-page'

export default async function PromptsPage() {
  const userId = await getCurrentUserId()
  if (!userId) {
    redirect('/auth/login')
  }

  return <PromptTemplatesPage />
}
