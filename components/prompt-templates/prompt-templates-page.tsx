'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import {
  createTemplate,
  deleteTemplate,
  toggleFavorite,
  trackTemplateUse,
  updateTemplate} from '@/lib/actions/prompt-template'
import type { PromptTemplate } from '@/lib/db/schema'
import type { TemplateVariable } from '@/lib/types/prompt-template'
import { cn } from '@/lib/utils'
import { setCookie } from '@/lib/utils/cookies'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

import { Button } from '../ui/button'

import { TemplateCategoryFilter } from './template-category-filter'
import { TemplateEditDialog } from './template-edit-dialog'
import { TemplateList } from './template-list'

type Tab = 'my' | 'public' | 'ranking' | 'favorites'

const TABS: { key: Tab; label: string }[] = [
  { key: 'my', label: 'マイテンプレート' },
  { key: 'public', label: '公開' },
  { key: 'ranking', label: 'ランキング' },
  { key: 'favorites', label: 'お気に入り' }
]

export function PromptTemplatesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('my')
  const [category, setCategory] = useState<string | null>(null)
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] =
    useState<PromptTemplate | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTemplate, setDeletingTemplate] =
    useState<PromptTemplate | null>(null)
  const [, startTransition] = useTransition()

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setIsInitialLoading(true)
    try {
      const params = new URLSearchParams({
        tab: activeTab,
        limit: '20',
        offset: '0'
      })
      if (category) params.set('category', category)

      const res = await fetch(`/api/prompt-templates?${params}`)
      const data = await res.json()
      setTemplates(data.templates)
      setNextOffset(data.nextOffset)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }, [activeTab, category])

  // Fetch favorite IDs for current user
  const fetchFavoriteIds = useCallback(async () => {
    try {
      const res = await fetch('/api/prompt-templates?tab=favorites&limit=100')
      const data = await res.json()
      setFavoriteIds(
        new Set((data.templates as PromptTemplate[]).map(t => t.id))
      )
    } catch {
      // ignore
    }
  }, [])

  // Fetch current user ID
  useEffect(() => {
    fetch('/api/prompt-templates?tab=my&limit=1')
      .then(res => res.json())
      .then(data => {
        if (data.templates?.length > 0) {
          setCurrentUserId(data.templates[0].userId)
        }
      })
      .catch(() => {})
    fetchFavoriteIds()
  }, [fetchFavoriteIds])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setCategory(null)
  }

  const handleUse = (template: PromptTemplate) => {
    if (template.modelId) {
      setCookie('selectedModelId', template.modelId)
    }
    startTransition(async () => {
      await trackTemplateUse(template.id)
    })
    router.push(`/search?q=${encodeURIComponent(template.content)}`)
  }

  const handleUseWithVariables = (
    resolvedPrompt: string,
    templateId: string,
    modelId?: string | null
  ) => {
    if (modelId) {
      setCookie('selectedModelId', modelId)
    }
    startTransition(async () => {
      await trackTemplateUse(templateId)
    })
    router.push(`/search?q=${encodeURIComponent(resolvedPrompt)}`)
  }

  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate(template)
    setEditDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setEditDialogOpen(true)
  }

  const handleSave = async (data: {
    title: string
    description?: string
    content: string
    category?: string
    variables: TemplateVariable[]
    modelId?: string
    visibility: 'public' | 'private'
  }) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data)
      toast.success('テンプレートを更新しました')
    } else {
      await createTemplate(data)
      toast.success('テンプレートを作成しました')
    }
    fetchTemplates()
  }

  const handleDeleteConfirm = (template: PromptTemplate) => {
    setDeletingTemplate(template)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingTemplate) return
    const result = await deleteTemplate(deletingTemplate.id)
    if (result.success) {
      toast.success('テンプレートを削除しました')
      fetchTemplates()
    } else {
      toast.error(result.error ?? '削除に失敗しました')
    }
    setDeleteDialogOpen(false)
    setDeletingTemplate(null)
  }

  const handleToggleFavorite = async (templateId: string) => {
    await toggleFavorite(templateId)
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (next.has(templateId)) {
        next.delete(templateId)
      } else {
        next.add(templateId)
      }
      return next
    })
    if (activeTab === 'favorites') {
      fetchTemplates()
    }
  }

  const showCategoryFilter = activeTab === 'public' || activeTab === 'ranking'

  const buildFetchUrl = () => {
    const params = new URLSearchParams({ tab: activeTab, limit: '20' })
    if (category) params.set('category', category)
    return `/api/prompt-templates?${params}`
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">プロンプトテンプレート</h1>
        <Button size="sm" onClick={handleCreate} className="gap-1.5">
          <Plus className="size-4" />
          新規作成
        </Button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-4 border-b">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={cn(
              'px-3 py-2 text-sm transition-colors -mb-px',
              activeTab === tab.key
                ? 'border-b-2 border-foreground text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      {showCategoryFilter && (
        <div className="mb-4">
          <TemplateCategoryFilter
            selected={category}
            onChange={setCategory}
          />
        </div>
      )}

      {/* Template list */}
      {isInitialLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          読み込み中...
        </div>
      ) : (
        <TemplateList
          initialTemplates={templates}
          initialNextOffset={nextOffset}
          fetchUrl={buildFetchUrl()}
          favoriteIds={favoriteIds}
          currentUserId={currentUserId}
          onUse={handleUse}
          onUseWithVariables={handleUseWithVariables}
          onEdit={handleEdit}
          onDelete={handleDeleteConfirm}
          onToggleFavorite={handleToggleFavorite}
          emptyMessage={
            activeTab === 'my'
              ? 'テンプレートがありません。「新規作成」から作成しましょう。'
              : activeTab === 'favorites'
                ? 'お気に入りのテンプレートがありません'
                : 'テンプレートが見つかりません'
          }
        />
      )}

      {/* Edit Dialog */}
      <TemplateEditDialog
        template={editingTemplate}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>テンプレートを削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{deletingTemplate?.title}」を削除しますか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
