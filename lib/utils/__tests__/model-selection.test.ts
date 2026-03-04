import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Model } from '@/lib/types/models'

vi.mock('@/lib/config/load-models-config')
vi.mock('@/lib/utils/registry')

import { getModelsConfig } from '@/lib/config/load-models-config'
import { DEFAULT_MODEL, selectModel } from '@/lib/utils/model-selection'
import { isProviderEnabled } from '@/lib/utils/registry'

const mockGetModelsConfig = vi.mocked(getModelsConfig)
const mockIsProviderEnabled = vi.mocked(isProviderEnabled)

const modelA: Model = {
  id: 'model-a',
  name: 'Model A',
  provider: 'Provider A',
  providerId: 'provider-a'
}

const modelB: Model = {
  id: 'model-b',
  name: 'Model B',
  provider: 'Provider B',
  providerId: 'provider-b'
}

const modelC: Model = {
  id: 'model-c',
  name: 'Model C',
  provider: 'Provider C',
  providerId: 'provider-c',
  searchModeConfig: {
    search: { providerOptions: { custom: { effort: 'low' } } },
    research: { providerOptions: { custom: { effort: 'high' } } }
  }
}

function createCookieStore(selectedModelId?: string): ReadonlyRequestCookies {
  return {
    get: (name: string) => {
      if (name === 'selectedModelId' && selectedModelId) {
        return { name, value: selectedModelId } as any
      }
      return undefined
    }
  } as unknown as ReadonlyRequestCookies
}

function setConfig(available: Model[], defaultModelId: string) {
  mockGetModelsConfig.mockReturnValue({
    version: 2,
    models: {
      available,
      defaultModelId,
      relatedQuestions: modelA
    }
  })
}

describe('selectModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setConfig([modelA, modelB, modelC], 'model-a')
    mockIsProviderEnabled.mockReturnValue(true)
  })

  it('returns the cookie-specified model when available', () => {
    const result = selectModel({
      cookieStore: createCookieStore('model-b'),
      searchMode: 'search'
    })

    expect(result.id).toBe('model-b')
  })

  it('falls back to default model when cookie is absent', () => {
    const result = selectModel({
      cookieStore: createCookieStore(),
      searchMode: 'search'
    })

    expect(result.id).toBe('model-a')
  })

  it('falls back to default model when cookie-specified model provider is disabled', () => {
    mockIsProviderEnabled.mockImplementation(
      providerId => providerId !== 'provider-b'
    )

    const result = selectModel({
      cookieStore: createCookieStore('model-b'),
      searchMode: 'search'
    })

    expect(result.id).toBe('model-a')
  })

  it('falls back to first available model when default model provider is disabled', () => {
    mockIsProviderEnabled.mockImplementation(
      providerId => providerId === 'provider-b'
    )

    const result = selectModel({
      cookieStore: createCookieStore(),
      searchMode: 'search'
    })

    expect(result.id).toBe('model-b')
  })

  it('returns DEFAULT_MODEL when no configured providers are enabled', () => {
    mockIsProviderEnabled.mockReturnValue(false)

    const result = selectModel({
      cookieStore: createCookieStore(),
      searchMode: 'search'
    })

    expect(result).toEqual(
      expect.objectContaining({ id: DEFAULT_MODEL.id })
    )
  })

  it('resolves providerOptions from searchModeConfig for the active search mode', () => {
    const result = selectModel({
      cookieStore: createCookieStore('model-c'),
      searchMode: 'research'
    })

    expect(result.id).toBe('model-c')
    expect(result.providerOptions).toEqual({ custom: { effort: 'high' } })
  })

  it('resolves providerOptions for search mode by default', () => {
    const result = selectModel({
      cookieStore: createCookieStore('model-c'),
      searchMode: 'search'
    })

    expect(result.providerOptions).toEqual({ custom: { effort: 'low' } })
  })
})
