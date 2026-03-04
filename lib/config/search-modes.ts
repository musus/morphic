import { MessageSquare, Search } from 'lucide-react'

import { SearchMode } from '@/lib/types/search'

import { IconLogoOutline } from '@/components/ui/icons'

export interface SearchModeConfig {
  value: SearchMode
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

// Centralized search mode configuration
// Order: ascending search intensity (none → light → deep)
export const SEARCH_MODE_CONFIGS: SearchModeConfig[] = [
  {
    value: 'chat',
    label: 'チャット',
    description: '検索なしでAIの知識のみで回答',
    icon: MessageSquare,
    color: 'text-emerald-500'
  },
  {
    value: 'search',
    label: '検索',
    description: '素早く簡潔な回答のための高速検索',
    icon: Search,
    color: 'text-amber-500'
  },
  {
    value: 'research',
    label: 'リサーチ',
    description: '思考ステップ付きの深掘り調査',
    icon: IconLogoOutline,
    color: 'text-violet-500'
  }
]

// Helper function to get a specific mode config
export function getSearchModeConfig(
  mode: SearchMode
): SearchModeConfig | undefined {
  return SEARCH_MODE_CONFIGS.find(config => config.value === mode)
}

export interface SearchModeLimitation {
  hasLimitation: boolean
  disabled: boolean
  message?: string
}

export function getSearchModeLimitation(
  providerId: string | null,
  mode: SearchMode
): SearchModeLimitation {
  if (providerId === 'groq' && (mode === 'search' || mode === 'research')) {
    return {
      hasLimitation: true,
      disabled: true,
      message: 'Groqモデルではチャットモードのみ利用可能です'
    }
  }
  return { hasLimitation: false, disabled: false }
}
