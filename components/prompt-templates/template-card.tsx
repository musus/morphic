'use client'

import { useEffect, useState, useTransition } from 'react'

import {
  Globe,
  Lock,
  MoreHorizontal,
  Pencil,
  Play,
  Star,
  Trash2,
  X
} from 'lucide-react'
import { toast } from 'sonner'

import { PROMPT_CATEGORIES } from '@/lib/constants/prompt-categories'
import type { PromptTemplate } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import {
  buildVariables,
  highlightVariables,
  resolveTemplate
} from '@/lib/utils/template-variables'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface TemplateCardProps {
  template: PromptTemplate
  isFavorited?: boolean
  isOwner?: boolean
  onUse: (template: PromptTemplate) => void
  onUseWithVariables?: (
    resolvedPrompt: string,
    templateId: string,
    modelId?: string | null
  ) => void
  onEdit?: (template: PromptTemplate) => void
  onDelete?: (template: PromptTemplate) => void
  onToggleFavorite?: (templateId: string) => Promise<void>
}

export function TemplateCard({
  template,
  isFavorited = false,
  isOwner = false,
  onUse,
  onUseWithVariables,
  onEdit,
  onDelete,
  onToggleFavorite
}: TemplateCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isExpanded, setIsExpanded] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})

  const categoryLabel = PROMPT_CATEGORIES.find(
    c => c.key === template.category
  )?.label

  const variables = buildVariables(template)

  // Reset form when collapsed
  useEffect(() => {
    if (!isExpanded) {
      setValues({})
    }
  }, [isExpanded])

  const handleToggleFavorite = () => {
    if (!onToggleFavorite) return
    startTransition(async () => {
      try {
        await onToggleFavorite(template.id)
      } catch {
        toast.error('お気に入りの更新に失敗しました')
      }
    })
  }

  const handleUseClick = () => {
    if (variables.length > 0 && onUseWithVariables) {
      // Initialize values with defaults
      const initial: Record<string, string> = {}
      for (const v of variables) {
        initial[v.name] = v.defaultValue ?? ''
      }
      setValues(initial)
      setIsExpanded(true)
    } else {
      onUse(template)
    }
  }

  const handleSubmit = () => {
    if (!onUseWithVariables) return

    // Check required variables
    for (const v of variables) {
      if (v.required && !values[v.name]?.trim()) {
        return
      }
    }

    const resolved = resolveTemplate(template.content, values)
    onUseWithVariables(resolved, template.id, template.modelId)
    setIsExpanded(false)
  }

  const handleCancel = () => {
    setIsExpanded(false)
  }

  const highlightedContent = highlightVariables(template.content)

  return (
    <div className="rounded-lg border bg-card text-card-foreground p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-medium truncate">{template.title}</h3>
          {categoryLabel && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {categoryLabel}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {template.visibility === 'public' ? (
            <Globe className="size-3.5 text-muted-foreground" />
          ) : (
            <Lock className="size-3.5 text-muted-foreground" />
          )}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(template)}>
                  <Pencil className="size-3.5 mr-2" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(template)}
                  className="text-destructive"
                >
                  <Trash2 className="size-3.5 mr-2" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {template.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      )}

      <div className="bg-muted rounded-md p-2">
        <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
          {highlightedContent}
        </p>
      </div>

      {/* Inline variable input form */}
      {isExpanded && (
        <div className="space-y-3 border-t pt-3">
          {variables.map(variable => (
            <div key={variable.name} className="space-y-1">
              <Label htmlFor={`${template.id}-${variable.name}`} className="text-xs">
                {variable.label}
                {variable.required && (
                  <span className="text-destructive ml-0.5">*</span>
                )}
              </Label>
              {variable.description && (
                <p className="text-xs text-muted-foreground">
                  {variable.description}
                </p>
              )}
              <Input
                id={`${template.id}-${variable.name}`}
                value={values[variable.name] ?? ''}
                onChange={e =>
                  setValues(prev => ({
                    ...prev,
                    [variable.name]: e.target.value
                  }))
                }
                placeholder={variable.defaultValue || variable.label}
                className="h-8 text-sm"
              />
            </div>
          ))}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleCancel}
            >
              <X className="size-3 mr-1" />
              キャンセル
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={handleSubmit}
            >
              <Play className="size-3 mr-1" />
              実行
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          {template.modelId && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {template.modelId}
            </span>
          )}
          {template.visibility === 'public' && (
            <span className="text-xs text-muted-foreground">
              {template.useCount}回使用
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleToggleFavorite}
              disabled={isPending}
            >
              <Star
                className={cn(
                  'size-3.5',
                  isFavorited
                    ? 'fill-foreground text-foreground'
                    : 'text-muted-foreground'
                )}
              />
            </Button>
          )}
          {!isExpanded && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleUseClick}
            >
              <Play className="size-3 mr-1" />
              使用
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
