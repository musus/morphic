'use client'

import { PROMPT_CATEGORIES } from '@/lib/constants/prompt-categories'
import { cn } from '@/lib/utils'

import { Button } from '../ui/button'

interface TemplateCategoryFilterProps {
  selected: string | null
  onChange: (category: string | null) => void
}

export function TemplateCategoryFilter({
  selected,
  onChange
}: TemplateCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        variant={selected === null ? 'default' : 'outline'}
        size="sm"
        className={cn('h-7 text-xs rounded-full')}
        onClick={() => onChange(null)}
      >
        すべて
      </Button>
      {PROMPT_CATEGORIES.map(category => (
        <Button
          key={category.key}
          variant={selected === category.key ? 'default' : 'outline'}
          size="sm"
          className={cn('h-7 text-xs rounded-full')}
          onClick={() =>
            onChange(selected === category.key ? null : category.key)
          }
        >
          {category.label}
        </Button>
      ))}
    </div>
  )
}
