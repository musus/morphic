import type { PromptTemplate } from '@/lib/db/schema'

export interface TemplateVariable {
  name: string
  label: string
  description?: string
  defaultValue?: string
  required: boolean
}

export interface PromptTemplateWithMeta extends PromptTemplate {
  isFavorited?: boolean
  isOwner?: boolean
  favoriteCount?: number
}
