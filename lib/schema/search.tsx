import { DeepPartial } from 'ai'
import { z } from 'zod'

import { getSearchTypeDescription } from '@/lib/utils/search-config'

export const searchSchema = z.object({
  query: z.string().describe('The query to search for'),
  type: z
    .enum(['general', 'optimized'])
    .optional()
    .default('optimized')
    .describe(getSearchTypeDescription()),
  content_types: z
    .array(z.enum(['web', 'video', 'image', 'news']))
    .optional()
    .default(['web'])
    .describe(
      'Types of content to include in search results. Only applicable when type is "general" and a dedicated general search provider is configured. Ignored otherwise.'
    ),
  max_results: z
    .number()
    .optional()
    .default(20)
    .describe('The maximum number of results to return. default is 20'),
  search_depth: z
    .string()
    .optional()
    .default('basic')
    .describe(
      'The depth of the search. Allowed values are "basic" or "advanced"'
    ),
  include_domains: z
    .array(z.string())
    .nullish()
    .transform(val => val ?? [])
    .describe(
      'A list of domains to specifically include in the search results. Default is None, which includes all domains.'
    ),
  exclude_domains: z
    .array(z.string())
    .nullish()
    .transform(val => val ?? [])
    .describe(
      "A list of domains to specifically exclude from the search results. Default is None, which doesn't exclude any domains."
    )
})

// Strict schema with all fields required
export const strictSearchSchema = z.object({
  query: z.string().describe('The query to search for'),
  type: z.enum(['general', 'optimized']).describe(getSearchTypeDescription()),
  content_types: z
    .array(z.enum(['web', 'video', 'image', 'news']))
    .describe(
      'Types of content to include in search results. Only applicable when type is "general" and a dedicated general search provider is configured. Ignored otherwise.'
    ),
  max_results: z.number().describe('The maximum number of results to return.'),
  search_depth: z
    .enum(['basic', 'advanced'])
    .describe('The depth of the search'),
  include_domains: z
    .array(z.string())
    .nullish()
    .transform(val => val ?? [])
    .describe(
      'A list of domains to specifically include in the search results. Default is None, which includes all domains.'
    ),
  exclude_domains: z
    .array(z.string())
    .nullish()
    .transform(val => val ?? [])
    .describe(
      "A list of domains to specifically exclude from the search results. Default is None, which doesn't exclude any domains."
    )
})

// Simplified schema for models with limited tool calling capabilities (e.g., Groq-hosted OSS models).
// Avoids .nullish().transform() patterns that generate complex JSON Schema (anyOf with null)
// which causes "Failed to call a function" errors on some open-source models.
export const simpleSearchSchema = z.object({
  query: z.string().describe('The query to search for'),
  type: z
    .enum(['general', 'optimized'])
    .optional()
    .default('optimized')
    .describe(getSearchTypeDescription()),
  content_types: z
    .array(z.string())
    .optional()
    .default(['web'])
    .describe(
      'Types of content to include in search results (e.g. "web", "video", "image", "news"). Only applicable when type is "general".'
    ),
  max_results: z
    .number()
    .optional()
    .default(20)
    .describe('The maximum number of results to return. default is 20'),
  search_depth: z
    .string()
    .optional()
    .default('basic')
    .describe(
      'The depth of the search. Allowed values are "basic" or "advanced"'
    ),
  include_domains: z
    .array(z.string())
    .optional()
    .default([])
    .describe(
      'A list of domains to specifically include in the search results.'
    ),
  exclude_domains: z
    .array(z.string())
    .optional()
    .default([])
    .describe(
      'A list of domains to specifically exclude from the search results.'
    )
})

/**
 * Returns the appropriate search schema based on the full model name.
 * Uses the strict schema for OpenAI models starting with 'o'.
 * Uses the simple schema for Groq-hosted models to avoid tool calling failures.
 */
export function getSearchSchemaForModel(fullModel: string) {
  const [provider, modelName] = fullModel?.split(':') ?? []
  const useStrictSchema =
    (provider === 'openai' || provider === 'azure') &&
    modelName?.startsWith('o')
  const useSimpleSchema = provider === 'groq'

  if (useStrictSchema) {
    return strictSearchSchema
  } else if (useSimpleSchema) {
    return simpleSearchSchema
  } else {
    return searchSchema
  }
}

export type PartialInquiry = DeepPartial<typeof searchSchema>
