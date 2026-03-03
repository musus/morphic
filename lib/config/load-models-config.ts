import cloudConfig from '@/config/models/cloud.json'
import defaultConfig from '@/config/models/default.json'

import { Model } from '@/lib/types/models'

export interface ModelsConfig {
  version: number
  models: {
    available: Model[]
    defaultModelId: string
    relatedQuestions: Model
  }
}

let cachedConfig: ModelsConfig | null = null
let cachedProfile: string | null = null

function validateModelsConfigStructure(
  json: unknown
): asserts json is ModelsConfig {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid models config: not an object')
  }
  const parsed = json as Record<string, any>
  if (typeof parsed.version !== 'number') {
    throw new Error('Invalid models config: missing version')
  }
  if (!parsed.models || typeof parsed.models !== 'object') {
    throw new Error('Invalid models config: missing models')
  }
  if (!Array.isArray(parsed.models.available)) {
    throw new Error('Invalid models config: available must be an array')
  }
  if (parsed.models.available.length === 0) {
    throw new Error('Invalid models config: available must not be empty')
  }
  if (typeof parsed.models.defaultModelId !== 'string') {
    throw new Error('Invalid models config: missing defaultModelId')
  }
  if (!parsed.models.relatedQuestions) {
    throw new Error('Invalid models config: missing relatedQuestions')
  }
}

export async function loadModelsConfig(): Promise<ModelsConfig> {
  const profile =
    process.env.MORPHIC_CLOUD_DEPLOYMENT === 'true' ? 'cloud' : 'default'

  if (cachedConfig && cachedProfile === profile) {
    return cachedConfig
  }

  const config = profile === 'cloud' ? cloudConfig : defaultConfig
  validateModelsConfigStructure(config)

  cachedConfig = config as ModelsConfig
  cachedProfile = profile
  return cachedConfig
}

// Synchronous load (for code paths that need sync access)
export function loadModelsConfigSync(): ModelsConfig {
  const profile =
    process.env.MORPHIC_CLOUD_DEPLOYMENT === 'true' ? 'cloud' : 'default'

  if (cachedConfig && cachedProfile === profile) {
    return cachedConfig
  }

  const config = profile === 'cloud' ? cloudConfig : defaultConfig
  validateModelsConfigStructure(config)

  cachedConfig = config as ModelsConfig
  cachedProfile = profile
  return cachedConfig
}

// Public accessor that ensures a config is available synchronously
export function getModelsConfig(): ModelsConfig {
  if (!cachedConfig) {
    return loadModelsConfigSync()
  }
  return cachedConfig
}
