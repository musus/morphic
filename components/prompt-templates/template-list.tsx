'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { PromptTemplate } from '@/lib/db/schema'

import { TemplateCard } from './template-card'

interface TemplateListProps {
  initialTemplates: PromptTemplate[]
  initialNextOffset: number | null
  fetchUrl: string
  favoriteIds: Set<string>
  currentUserId?: string
  onUse: (template: PromptTemplate) => void
  onUseWithVariables?: (
    resolvedPrompt: string,
    templateId: string,
    modelId?: string | null
  ) => void
  onEdit?: (template: PromptTemplate) => void
  onDelete?: (template: PromptTemplate) => void
  onToggleFavorite?: (templateId: string) => Promise<void>
  emptyMessage?: string
}

export function TemplateList({
  initialTemplates,
  initialNextOffset,
  fetchUrl,
  favoriteIds,
  currentUserId,
  onUse,
  onUseWithVariables,
  onEdit,
  onDelete,
  onToggleFavorite,
  emptyMessage = 'テンプレートがありません'
}: TemplateListProps) {
  const [templates, setTemplates] =
    useState<PromptTemplate[]>(initialTemplates)
  const [nextOffset, setNextOffset] = useState<number | null>(
    initialNextOffset
  )
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  // Reset when initialTemplates change
  useEffect(() => {
    setTemplates(initialTemplates)
    setNextOffset(initialNextOffset)
  }, [initialTemplates, initialNextOffset])

  const loadMore = useCallback(async () => {
    if (isLoading || nextOffset === null) return
    setIsLoading(true)

    try {
      const separator = fetchUrl.includes('?') ? '&' : '?'
      const res = await fetch(`${fetchUrl}${separator}offset=${nextOffset}`)
      const data = await res.json()
      setTemplates(prev => [...prev, ...data.templates])
      setNextOffset(data.nextOffset)
    } catch (error) {
      console.error('Error loading more templates:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchUrl, nextOffset, isLoading])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && nextOffset !== null) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const el = observerRef.current
    if (el) observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
    }
  }, [loadMore, nextOffset])

  if (templates.length === 0 && !isLoading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          isFavorited={favoriteIds.has(template.id)}
          isOwner={currentUserId === template.userId}
          onUse={onUse}
          onUseWithVariables={onUseWithVariables}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
      <div ref={observerRef} className="h-4" />
      {isLoading && (
        <div className="py-4 text-center text-sm text-muted-foreground">
          読み込み中...
        </div>
      )}
    </div>
  )
}
