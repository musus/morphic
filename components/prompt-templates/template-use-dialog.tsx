'use client'

import { useEffect, useState } from 'react'

import type { PromptTemplate } from '@/lib/db/schema'
import {
  buildVariables,
  resolveTemplate
} from '@/lib/utils/template-variables'

import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface TemplateUseDialogProps {
  template: PromptTemplate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUse: (
    resolvedPrompt: string,
    templateId: string,
    modelId?: string | null
  ) => void
}

export function TemplateUseDialog({
  template,
  open,
  onOpenChange,
  onUse
}: TemplateUseDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({})

  const variables = template ? buildVariables(template) : []

  // Reset values when template changes
  useEffect(() => {
    if (open && template) {
      const vars = buildVariables(template)
      const initial: Record<string, string> = {}
      for (const v of vars) {
        initial[v.name] = v.defaultValue ?? ''
      }
      setValues(initial)
    }
  }, [open, template])

  const handleSubmit = () => {
    if (!template) return

    // Check required variables
    for (const v of variables) {
      if (v.required && !values[v.name]?.trim()) {
        return
      }
    }

    const resolved = resolveTemplate(template.content, values)
    onUse(resolved, template.id, template.modelId)
    onOpenChange(false)
  }

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{template.title}</DialogTitle>
          {template.description && (
            <DialogDescription>{template.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {variables.map(variable => (
            <div key={variable.name} className="space-y-1.5">
              <Label htmlFor={variable.name} className="text-sm">
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
                id={variable.name}
                value={values[variable.name] ?? ''}
                onChange={e =>
                  setValues(prev => ({
                    ...prev,
                    [variable.name]: e.target.value
                  }))
                }
                placeholder={variable.defaultValue || variable.label}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>使用する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
