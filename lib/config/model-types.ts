import { Model } from '@/lib/types/models'

import { getModelsConfig } from './load-models-config'

// Retrieve a model by its ID from the available models list.
export function getModelById(id: string): Model | undefined {
  const cfg = getModelsConfig()
  return cfg.models.available.find(m => m.id === id)
}

// Accessor for the related questions model configuration.
export function getRelatedQuestionsModel(): Model {
  const cfg = getModelsConfig()
  return cfg.models.relatedQuestions
}
