'use server'

import { revalidateTag } from 'next/cache'

import { getCurrentUserId } from '@/lib/auth/get-current-user'
import * as dbActions from '@/lib/db/prompt-template-actions'
import type { PromptTemplate } from '@/lib/db/schema'
import type { PromptTemplateWithMeta } from '@/lib/types/prompt-template'

import type { CreateTemplateInput, UpdateTemplateInput } from '../schema/prompt-template'

export async function createTemplate(
  data: CreateTemplateInput
): Promise<PromptTemplate> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('User not authenticated')

  const template = await dbActions.createPromptTemplate({
    ...data,
    userId
  })
  revalidateTag('prompt-templates', 'max')
  return template
}

export async function updateTemplate(
  id: string,
  data: UpdateTemplateInput
): Promise<PromptTemplate | null> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('User not authenticated')

  const template = await dbActions.updatePromptTemplate(id, userId, data)
  revalidateTag('prompt-templates', 'max')
  revalidateTag(`prompt-template-${id}`, 'max')
  return template
}

export async function deleteTemplate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('User not authenticated')

  const result = await dbActions.deletePromptTemplate(id, userId)
  if (result.success) {
    revalidateTag('prompt-templates', 'max')
  }
  return result
}

export async function getMyTemplatesPage(limit = 20, offset = 0) {
  const userId = await getCurrentUserId()
  if (!userId) return { templates: [], nextOffset: null }

  return dbActions.getUserTemplates(userId, limit, offset)
}

export async function getPublicTemplatesPage(
  limit = 20,
  offset = 0,
  category?: string,
  search?: string
) {
  return dbActions.getPublicTemplates(limit, offset, category, search)
}

export async function getRankingPage(limit = 20, offset = 0) {
  return dbActions.getTemplateRanking(limit, offset)
}

export async function getFavoriteTemplatesPage(limit = 20, offset = 0) {
  const userId = await getCurrentUserId()
  if (!userId) return { templates: [], nextOffset: null }

  return dbActions.getUserFavorites(userId, limit, offset)
}

export async function toggleFavorite(
  templateId: string
): Promise<{ favorited: boolean }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('User not authenticated')

  const favoriteIds = await dbActions.getUserFavoriteTemplateIds(userId)
  if (favoriteIds.has(templateId)) {
    await dbActions.removeFavorite(userId, templateId)
    revalidateTag('prompt-templates', 'max')
    return { favorited: false }
  } else {
    await dbActions.addFavorite(userId, templateId)
    revalidateTag('prompt-templates', 'max')
    return { favorited: true }
  }
}

export async function trackTemplateUse(templateId: string): Promise<void> {
  await dbActions.incrementUseCount(templateId)
  revalidateTag('prompt-templates', 'max')
}

export async function getPopularTemplatesWithMeta(): Promise<
  PromptTemplateWithMeta[]
> {
  const userId = await getCurrentUserId()
  const templates = await dbActions.getPopularTemplates(8)

  if (!userId || templates.length === 0) {
    return templates.map(t => ({
      ...t,
      isFavorited: false,
      isOwner: false
    }))
  }

  const favoriteIds = await dbActions.getUserFavoriteTemplateIds(userId)

  return templates.map(t => ({
    ...t,
    isFavorited: favoriteIds.has(t.id),
    isOwner: t.userId === userId
  }))
}
