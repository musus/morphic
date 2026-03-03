'use client'

import { useEffect, useRef, useState } from 'react'

import {
  Code,
  FileText,
  HelpCircle,
  LucideIcon,
  MoreHorizontal,
  Newspaper,
  Scale,
  Search,
  Sparkles
} from 'lucide-react'

import { trackTemplateUse } from '@/lib/actions/prompt-template'
import type { PromptTemplate } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import { setCookie } from '@/lib/utils/cookies'
import { extractVariableNames } from '@/lib/utils/template-variables'

import { TemplateUseDialog } from './prompt-templates/template-use-dialog'
import { Button } from './ui/button'

const FOCUS_OUT_DELAY_MS = 100

interface ActionCategory {
  icon: LucideIcon
  label: string
  key: string
}

const actionCategories: ActionCategory[] = [
  { icon: Search, label: 'リサーチ', key: 'research' },
  { icon: Scale, label: '比較', key: 'compare' },
  { icon: Newspaper, label: '最新ニュース', key: 'latest' },
  { icon: FileText, label: '要約', key: 'summarize' },
  { icon: HelpCircle, label: '解説', key: 'explain' },
  { icon: Sparkles, label: 'クリエイティブ', key: 'creative' },
  { icon: Code, label: 'コーディング', key: 'coding' },
  { icon: MoreHorizontal, label: 'その他', key: 'other' }
]

// Default prompts shown when no templates exist
const defaultPromptSamples: Record<string, string[]> = {
  research: [
    'Nvidiaが急成長している理由は？',
    '最新のAI技術の動向を調べて',
    'ロボティクスの主要トレンドは？',
    '再生可能エネルギーの最新ブレイクスルーは？'
  ],
  compare: [
    'Tesla vs BYD vs トヨタの比較',
    'Next.js、Remix、Astroを比較して',
    'AWS vs GCP vs Azure',
    'iPhone vs Androidエコシステムの比較'
  ],
  latest: [
    '今日の最新ニュース',
    '今週のテック業界の出来事は？',
    '医療分野の最近のブレイクスルー',
    '最新のAIモデルリリース情報'
  ],
  summarize: [
    '要約して: https://arxiv.org/pdf/2504.19678',
    '今週のビジネスニュースを要約して',
    'AIトレンドのエグゼクティブサマリーを作成して',
    '最近の気候変動研究を要約して'
  ],
  explain: [
    'ニューラルネットワークをわかりやすく説明して',
    'ブロックチェーンの仕組みは？',
    '量子もつれとは何か？',
    'CRISPR遺伝子編集について説明して'
  ]
}

interface PromptItem {
  text: string
  templateId?: string
  template?: PromptTemplate
}

interface ActionButtonsProps {
  onSelectPrompt: (prompt: string) => void
  onCategoryClick: (category: string) => void
  inputRef?: React.RefObject<HTMLTextAreaElement>
  className?: string
}

export function ActionButtons({
  onSelectPrompt,
  onCategoryClick,
  inputRef,
  className
}: ActionButtonsProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [templatesByCategory, setTemplatesByCategory] = useState<
    Record<string, PromptTemplate[]>
  >({})
  const [useDialogOpen, setUseDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch popular templates on mount
  useEffect(() => {
    fetch('/api/prompt-templates?tab=public&limit=100')
      .then(res => res.json())
      .then(data => {
        const grouped: Record<string, PromptTemplate[]> = {}
        for (const t of data.templates as PromptTemplate[]) {
          const cat = t.category ?? 'other'
          if (!grouped[cat]) grouped[cat] = []
          grouped[cat].push(t)
        }
        setTemplatesByCategory(grouped)
      })
      .catch(() => {})
  }, [])

  const getPromptsForCategory = (key: string): PromptItem[] => {
    const templates = templatesByCategory[key]
    if (templates && templates.length > 0) {
      return templates.slice(0, 4).map(t => ({
        text: t.title,
        templateId: t.id,
        template: t
      }))
    }
    // Fallback to defaults
    const defaults = defaultPromptSamples[key]
    if (defaults) {
      return defaults.map(text => ({ text }))
    }
    return []
  }

  const handleCategoryClick = (category: ActionCategory) => {
    setActiveCategory(category.key)
    onCategoryClick(category.label)
  }

  const handlePromptClick = (item: PromptItem) => {
    if (item.template) {
      const varNames = extractVariableNames(item.template.content)
      if (varNames.length > 0) {
        setSelectedTemplate(item.template)
        setUseDialogOpen(true)
        return
      }
      // No variables - track usage, set model, and send content
      if (item.template.modelId) {
        setCookie('selectedModelId', item.template.modelId)
      }
      trackTemplateUse(item.template.id)
      setActiveCategory(null)
      onSelectPrompt(item.template.content)
    } else {
      setActiveCategory(null)
      onSelectPrompt(item.text)
    }
  }

  const handleUseWithVariables = (
    resolvedPrompt: string,
    templateId: string,
    modelId?: string | null
  ) => {
    if (modelId) {
      setCookie('selectedModelId', modelId)
    }
    trackTemplateUse(templateId)
    setActiveCategory(null)
    onSelectPrompt(resolvedPrompt)
  }

  const resetToButtons = () => {
    setActiveCategory(null)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCategory) {
        resetToButtons()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (activeCategory) {
          if (!inputRef?.current?.contains(e.target as Node)) {
            resetToButtons()
          }
        }
      }
    }

    const handleFocusOut = () => {
      setTimeout(() => {
        const activeElement = document.activeElement
        if (
          activeCategory &&
          !containerRef.current?.contains(activeElement) &&
          activeElement !== inputRef?.current
        ) {
          resetToButtons()
        }
      }, FOCUS_OUT_DELAY_MS)
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [activeCategory, inputRef])

  // Only show categories that have prompts available
  const visibleCategories = actionCategories.filter(cat => {
    return (
      (templatesByCategory[cat.key] &&
        templatesByCategory[cat.key].length > 0) ||
      defaultPromptSamples[cat.key]
    )
  })

  const containerHeight = 'h-[180px]'

  return (
    <>
      <div
        ref={containerRef}
        className={cn('relative', containerHeight, className)}
      >
        <div className="relative h-full">
          {/* Action buttons */}
          <div
            className={cn(
              'absolute inset-0 flex items-start justify-center pt-2 transition-opacity duration-300',
              activeCategory
                ? 'opacity-0 pointer-events-none'
                : 'opacity-100'
            )}
          >
            <div className="flex flex-wrap justify-center gap-2 px-2">
              {visibleCategories.map(category => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      'flex items-center gap-2 whitespace-nowrap rounded-full',
                      'text-xs sm:text-sm px-3 sm:px-4'
                    )}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{category.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Prompt samples */}
          <div
            className={cn(
              'absolute inset-0 py-1 space-y-1 overflow-y-auto transition-opacity duration-300',
              !activeCategory
                ? 'opacity-0 pointer-events-none'
                : 'opacity-100'
            )}
          >
            {activeCategory &&
              getPromptsForCategory(activeCategory).map((item, index) => (
                <button
                  key={item.templateId ?? index}
                  type="button"
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm',
                    'hover:bg-muted transition-colors',
                    'flex items-center gap-2 group'
                  )}
                  onClick={() => handlePromptClick(item)}
                >
                  <Search className="h-3 w-3 text-muted-foreground flex-shrink-0 group-hover:text-foreground" />
                  <span className="line-clamp-1">{item.text}</span>
                </button>
              ))}
          </div>
        </div>
      </div>

      <TemplateUseDialog
        template={selectedTemplate}
        open={useDialogOpen}
        onOpenChange={setUseDialogOpen}
        onUse={handleUseWithVariables}
      />
    </>
  )
}
