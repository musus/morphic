'use server'

import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'

import type { TemplateVariable } from '@/lib/types/prompt-template'

import type { PromptFavorite, PromptTemplate } from './schema'
import {
  generateId,
  promptFavorites,
  promptTemplates
} from './schema'
import { withOptionalRLS, withRLS } from './with-rls'
import { db } from '.'

// --- CRUD ---

export async function createPromptTemplate(data: {
  title: string
  description?: string
  content: string
  category?: string
  variables?: TemplateVariable[]
  modelId?: string
  userId: string
  visibility?: 'public' | 'private'
}): Promise<PromptTemplate> {
  return withRLS(data.userId, async tx => {
    const [template] = await tx
      .insert(promptTemplates)
      .values({
        id: generateId(),
        title: data.title,
        description: data.description ?? null,
        content: data.content,
        category: data.category ?? null,
        variables: data.variables ?? [],
        modelId: data.modelId ?? null,
        userId: data.userId,
        visibility: data.visibility ?? 'private'
      })
      .returning()
    return template
  })
}

export async function updatePromptTemplate(
  id: string,
  userId: string,
  data: Partial<{
    title: string
    description: string | null
    content: string
    category: string | null
    variables: TemplateVariable[]
    modelId: string | null
    visibility: 'public' | 'private'
  }>
): Promise<PromptTemplate | null> {
  return withRLS(userId, async tx => {
    const [template] = await tx
      .update(promptTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(promptTemplates.id, id))
      .returning()
    return template ?? null
  })
}

export async function deletePromptTemplate(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    return withRLS(userId, async tx => {
      const [template] = await tx
        .select()
        .from(promptTemplates)
        .where(eq(promptTemplates.id, id))
        .limit(1)

      if (!template || template.userId !== userId) {
        return { success: false, error: 'Unauthorized' }
      }

      await tx
        .delete(promptTemplates)
        .where(eq(promptTemplates.id, id))

      return { success: true }
    })
  } catch (error) {
    console.error('Error deleting prompt template:', error)
    return { success: false, error: 'Failed to delete template' }
  }
}

export async function getPromptTemplate(
  id: string,
  userId?: string
): Promise<PromptTemplate | null> {
  return withOptionalRLS(userId || null, async tx => {
    const [template] = await tx
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.id, id))
      .limit(1)

    if (!template) return null

    if (template.visibility === 'public') return template
    if (userId && template.userId === userId) return template

    return null
  })
}

// --- 一覧取得 ---

export async function getUserTemplates(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{ templates: PromptTemplate[]; nextOffset: number | null }> {
  return withRLS(userId, async tx => {
    const results = await tx
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.userId, userId))
      .orderBy(desc(promptTemplates.updatedAt))
      .limit(limit)
      .offset(offset)

    return {
      templates: results,
      nextOffset: results.length === limit ? offset + limit : null
    }
  })
}

export async function getPublicTemplates(
  limit = 20,
  offset = 0,
  category?: string,
  search?: string
): Promise<{ templates: PromptTemplate[]; nextOffset: number | null }> {
  const conditions = [eq(promptTemplates.visibility, 'public')]
  if (category) {
    conditions.push(eq(promptTemplates.category, category))
  }
  if (search) {
    conditions.push(
      or(
        ilike(promptTemplates.title, `%${search}%`),
        ilike(promptTemplates.content, `%${search}%`)
      )!
    )
  }

  const results = await db
    .select()
    .from(promptTemplates)
    .where(and(...conditions))
    .orderBy(desc(promptTemplates.createdAt))
    .limit(limit)
    .offset(offset)

  return {
    templates: results,
    nextOffset: results.length === limit ? offset + limit : null
  }
}

export async function getTemplateRanking(
  limit = 20,
  offset = 0
): Promise<{ templates: PromptTemplate[]; nextOffset: number | null }> {
  const results = await db
    .select()
    .from(promptTemplates)
    .where(eq(promptTemplates.visibility, 'public'))
    .orderBy(desc(promptTemplates.useCount))
    .limit(limit)
    .offset(offset)

  return {
    templates: results,
    nextOffset: results.length === limit ? offset + limit : null
  }
}

// --- 利用カウント ---

export async function incrementUseCount(templateId: string): Promise<void> {
  await db
    .update(promptTemplates)
    .set({ useCount: sql`${promptTemplates.useCount} + 1` })
    .where(eq(promptTemplates.id, templateId))
}

// --- お気に入り ---

export async function addFavorite(
  userId: string,
  templateId: string
): Promise<PromptFavorite> {
  return withRLS(userId, async tx => {
    const [favorite] = await tx
      .insert(promptFavorites)
      .values({
        id: generateId(),
        userId,
        templateId
      })
      .onConflictDoNothing()
      .returning()
    return favorite
  })
}

export async function removeFavorite(
  userId: string,
  templateId: string
): Promise<{ success: boolean }> {
  return withRLS(userId, async tx => {
    await tx
      .delete(promptFavorites)
      .where(
        and(
          eq(promptFavorites.userId, userId),
          eq(promptFavorites.templateId, templateId)
        )
      )
    return { success: true }
  })
}

export async function getUserFavorites(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{ templates: PromptTemplate[]; nextOffset: number | null }> {
  return withRLS(userId, async tx => {
    const results = await tx
      .select({ template: promptTemplates })
      .from(promptFavorites)
      .innerJoin(
        promptTemplates,
        eq(promptFavorites.templateId, promptTemplates.id)
      )
      .where(eq(promptFavorites.userId, userId))
      .orderBy(desc(promptFavorites.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      templates: results.map(r => r.template),
      nextOffset: results.length === limit ? offset + limit : null
    }
  })
}

export async function getUserFavoriteTemplateIds(
  userId: string
): Promise<Set<string>> {
  return withRLS(userId, async tx => {
    const results = await tx
      .select({ templateId: promptFavorites.templateId })
      .from(promptFavorites)
      .where(eq(promptFavorites.userId, userId))

    return new Set(results.map(r => r.templateId))
  })
}

// --- ホーム画面用 ---

export async function getPopularTemplates(
  limit = 8
): Promise<PromptTemplate[]> {
  return db
    .select()
    .from(promptTemplates)
    .where(eq(promptTemplates.visibility, 'public'))
    .orderBy(desc(promptTemplates.useCount))
    .limit(limit)
}
