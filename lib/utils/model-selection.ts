import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

import { getModelsConfig } from '@/lib/config/load-models-config'
import { Model } from '@/lib/types/models'
import { SearchMode } from '@/lib/types/search'
import { isProviderEnabled } from '@/lib/utils/registry'

const DEFAULT_MODEL: Model = {
  id: 'gpt-5-mini',
  name: 'GPT-5 mini',
  provider: 'OpenAI',
  providerId: 'openai',
  searchModeConfig: {
    quick: {
      providerOptions: {
        openai: {
          reasoningEffort: 'low',
          reasoningSummary: 'auto'
        }
      }
    },
    adaptive: {
      providerOptions: {
        openai: {
          reasoningEffort: 'medium',
          reasoningSummary: 'auto'
        }
      }
    }
  }
}

interface ModelSelectionParams {
  cookieStore: ReadonlyRequestCookies
  searchMode?: SearchMode
}

// Resolve providerOptions from searchModeConfig for the active search mode.
function resolveProviderOptions(
  model: Model,
  searchMode?: SearchMode
): Model {
  const modeConfig = model.searchModeConfig?.[searchMode ?? 'quick']
  if (modeConfig?.providerOptions) {
    return { ...model, providerOptions: modeConfig.providerOptions }
  }
  return model
}

/**
 * Determines which model to use based on the selected model ID cookie.
 *
 * Priority order:
 * 1. Cookie-specified model ID → use that model if provider is enabled
 * 2. Default model from config → if provider is enabled
 * 3. First available model with an enabled provider
 * 4. Hardcoded DEFAULT_MODEL as final fallback
 */
export function selectModel({
  cookieStore,
  searchMode
}: ModelSelectionParams): Model {
  const selectedId = cookieStore.get('selectedModelId')?.value
  const config = getModelsConfig()

  // 1. Cookie-specified model
  if (selectedId) {
    const model = config.models.available.find(m => m.id === selectedId)
    if (model && isProviderEnabled(model.providerId)) {
      return resolveProviderOptions(model, searchMode)
    }
  }

  // 2. Default model from config
  const defaultModel = config.models.available.find(
    m => m.id === config.models.defaultModelId
  )
  if (defaultModel && isProviderEnabled(defaultModel.providerId)) {
    return resolveProviderOptions(defaultModel, searchMode)
  }

  // 3. First available model with enabled provider
  for (const model of config.models.available) {
    if (isProviderEnabled(model.providerId)) {
      return resolveProviderOptions(model, searchMode)
    }
  }

  // 4. Hardcoded fallback
  if (!isProviderEnabled(DEFAULT_MODEL.providerId)) {
    console.warn(
      `[ModelSelection] Default model provider "${DEFAULT_MODEL.providerId}" is not enabled. Returning default model configuration.`
    )
  }

  return resolveProviderOptions(DEFAULT_MODEL, searchMode)
}

export { DEFAULT_MODEL }
