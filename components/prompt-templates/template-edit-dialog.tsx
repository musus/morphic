'use client'

import { useEffect, useState, useTransition } from 'react'

import { Check, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

import { PROMPT_CATEGORIES } from '@/lib/constants/prompt-categories'
import type { PromptTemplate } from '@/lib/db/schema'
import type { TemplateVariable } from '@/lib/types/prompt-template'
import { extractVariableNames } from '@/lib/utils/template-variables'

import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { Textarea } from '../ui/textarea'

interface ModelOption {
  id: string
  name: string
  provider: string
  providerId: string
}

interface TemplateEditDialogProps {
  template?: PromptTemplate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: {
    title: string
    description?: string
    content: string
    category?: string
    variables: TemplateVariable[]
    modelId?: string
    visibility: 'public' | 'private'
  }) => Promise<void>
}

export function TemplateEditDialog({
  template,
  open,
  onOpenChange,
  onSave
}: TemplateEditDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<string>('')
  const [modelId, setModelId] = useState<string>('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [variables, setVariables] = useState<TemplateVariable[]>([])
  const [models, setModels] = useState<ModelOption[]>([])
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)

  const isEditing = !!template

  // Fetch available models
  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => setModels(data.models ?? []))
      .catch(() => {})
  }, [])

  // Sync variables from content
  useEffect(() => {
    const names = extractVariableNames(content)
    setVariables(prev => {
      const existingMap = new Map(prev.map(v => [v.name, v]))
      return names.map(name => {
        const existing = existingMap.get(name)
        return (
          existing ?? {
            name,
            label: name,
            required: true
          }
        )
      })
    })
  }, [content])

  // Reset form when template changes
  useEffect(() => {
    if (open) {
      if (template) {
        setTitle(template.title)
        setDescription(template.description ?? '')
        setContent(template.content)
        setCategory(template.category ?? '')
        setModelId(template.modelId ?? '')
        setVisibility(template.visibility as 'public' | 'private')
        setVariables((template.variables as TemplateVariable[]) ?? [])
      } else {
        setTitle('')
        setDescription('')
        setContent('')
        setCategory('')
        setModelId('')
        setVisibility('private')
        setVariables([])
      }
    }
  }, [open, template])

  const updateVariable = (
    index: number,
    updates: Partial<TemplateVariable>
  ) => {
    setVariables(prev =>
      prev.map((v, i) => (i === index ? { ...v, ...updates } : v))
    )
  }

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('タイトルとテンプレート内容は必須です')
      return
    }

    startTransition(async () => {
      try {
        await onSave({
          title: title.trim(),
          description: description.trim() || undefined,
          content: content.trim(),
          category: category || undefined,
          variables,
          modelId: modelId || undefined,
          visibility
        })
        onOpenChange(false)
      } catch {
        toast.error('保存に失敗しました')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {isEditing ? 'テンプレートを編集' : 'テンプレートを作成'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="template-title" className="text-sm">
              タイトル
            </Label>
            <Input
              id="template-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="テンプレート名"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-description" className="text-sm">
              説明（任意）
            </Label>
            <Input
              id="template-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="テンプレートの説明"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-category" className="text-sm">
              カテゴリ
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.key} value={cat.key}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {models.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm">モデル（任意）</Label>
              <DropdownMenu
                open={modelDropdownOpen}
                onOpenChange={setModelDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                    type="button"
                  >
                    <span className="truncate">
                      {modelId
                        ? models.find(m => m.id === modelId)?.name ??
                          modelId
                        : '指定なし（実行時のデフォルト）'}
                    </span>
                    <ChevronDown className="size-4 opacity-50 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[var(--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuItem
                    onClick={() => {
                      setModelId('')
                      setModelDropdownOpen(false)
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {!modelId && <Check className="size-3" />}
                    </div>
                    <span className="text-sm">指定なし</span>
                  </DropdownMenuItem>
                  {models.map(model => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => {
                        setModelId(model.id)
                        setModelDropdownOpen(false)
                      }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {modelId === model.id && (
                          <Check className="size-3" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.provider}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="template-content" className="text-sm">
              テンプレート内容
            </Label>
            <p className="text-xs text-muted-foreground">
              {'{{変数名}}'} で変数を埋め込めます
            </p>
            <Textarea
              id="template-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="{{company}}と{{competitor}}を比較して"
              rows={4}
              className="min-h-[100px]"
            />
          </div>

          {variables.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm">変数設定</Label>
              {variables.map((variable, index) => (
                <div
                  key={variable.name}
                  className="rounded-md border p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {'{{'}{variable.name}{'}}'}
                    </code>
                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        id={`required-${variable.name}`}
                        checked={variable.required}
                        onCheckedChange={checked =>
                          updateVariable(index, {
                            required: checked === true
                          })
                        }
                      />
                      <Label
                        htmlFor={`required-${variable.name}`}
                        className="text-xs"
                      >
                        必須
                      </Label>
                    </div>
                  </div>
                  <Input
                    value={variable.label}
                    onChange={e =>
                      updateVariable(index, { label: e.target.value })
                    }
                    placeholder="表示ラベル"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={variable.defaultValue ?? ''}
                    onChange={e =>
                      updateVariable(index, {
                        defaultValue: e.target.value || undefined
                      })
                    }
                    placeholder="デフォルト値（任意）"
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm">公開設定</Label>
            <Select
              value={visibility}
              onValueChange={v => setVisibility(v as 'public' | 'private')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">プライベート</SelectItem>
                <SelectItem value="public">パブリック（全員に公開）</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
