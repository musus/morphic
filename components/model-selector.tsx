'use client'

import { type ComponentType, useEffect, useState } from 'react'

import { Check, ChevronDown } from 'lucide-react'

import { getCookie, setCookie } from '@/lib/utils/cookies'

import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import {
  IconAnthropic,
  IconGoogle,
  IconMeta,
  IconOpenAI,
  IconQwen
} from './ui/icons'

interface ModelOption {
  id: string
  name: string
  provider: string
  providerId: string
  providerIcon?: string
}

const PROVIDER_ICONS: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  openai: IconOpenAI,
  anthropic: IconAnthropic,
  google: IconGoogle,
  meta: IconMeta,
  qwen: IconQwen
}

function ProviderIcon({
  providerId,
  providerIcon,
  className
}: {
  providerId: string
  providerIcon?: string
  className?: string
}) {
  const Icon = PROVIDER_ICONS[providerIcon ?? providerId]
  if (!Icon) return null
  return <Icon className={className} />
}

export function ModelSelector({ disabled = false }: { disabled?: boolean }) {
  const [models, setModels] = useState<ModelOption[]>([])
  const [defaultModelId, setDefaultModelId] = useState<string>('')
  const [selectedId, setSelectedId] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        setModels(data.models)
        setDefaultModelId(data.defaultModelId)

        const saved = getCookie('selectedModelId')
        const validSaved =
          saved && data.models.some((m: ModelOption) => m.id === saved)
        setSelectedId(validSaved ? saved : data.defaultModelId)
      })
      .catch(() => {
        // Fallback if API fails
      })
  }, [])

  useEffect(() => {
    if (disabled && defaultModelId) {
      setSelectedId(defaultModelId)
      setCookie('selectedModelId', defaultModelId)
    }
  }, [disabled, defaultModelId])

  const handleModelSelect = (id: string) => {
    if (disabled) return
    setSelectedId(id)
    setCookie('selectedModelId', id)
    setDropdownOpen(false)
  }

  const selectedModel = models.find(m => m.id === selectedId)

  if (models.length === 0) return null

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="text-sm rounded-full shadow-none gap-1 transition-all px-3 py-2 h-auto bg-muted border-none"
          disabled={disabled}
        >
          {selectedModel && (
            <ProviderIcon
              providerId={selectedModel.providerId}
              providerIcon={selectedModel.providerIcon}
              className="h-3.5 w-3.5 opacity-70"
            />
          )}
          <span className="text-xs font-medium truncate max-w-[120px]">
            {selectedModel?.name || 'Loading...'}
          </span>
          <ChevronDown
            className={`h-3 w-3 ml-0.5 opacity-50 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[220px]"
        sideOffset={5}
      >
        {models.map(model => {
          const isSelected = selectedId === model.id
          return (
            <DropdownMenuItem
              key={model.id}
              onClick={() => handleModelSelect(model.id)}
              className="relative flex items-center cursor-pointer gap-2"
            >
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {isSelected && <Check className="h-3 w-3" />}
              </div>
              <ProviderIcon
                providerId={model.providerId}
                providerIcon={model.providerIcon}
                className="h-4 w-4 shrink-0 opacity-60"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm">{model.name}</span>
                <span className="text-xs text-muted-foreground">
                  {model.provider}
                </span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
