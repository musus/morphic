import { NextRequest, NextResponse } from 'next/server'

import {
  getFavoriteTemplatesPage,
  getMyTemplatesPage,
  getPublicTemplatesPage,
  getRankingPage
} from '@/lib/actions/prompt-template'
import type { PromptTemplate } from '@/lib/db/schema'

interface TemplatePageResponse {
  templates: PromptTemplate[]
  nextOffset: number | null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tab = searchParams.get('tab') || 'my'
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const category = searchParams.get('category') || undefined
  const search = searchParams.get('search') || undefined

  try {
    let result: TemplatePageResponse

    switch (tab) {
      case 'public':
        result = await getPublicTemplatesPage(limit, offset, category, search)
        break
      case 'ranking':
        result = await getRankingPage(limit, offset)
        break
      case 'favorites':
        result = await getFavoriteTemplatesPage(limit, offset)
        break
      case 'my':
      default:
        result = await getMyTemplatesPage(limit, offset)
        break
    }

    return NextResponse.json<TemplatePageResponse>(result)
  } catch (error) {
    console.error('API route error fetching prompt templates:', error)
    return NextResponse.json<TemplatePageResponse>(
      { templates: [], nextOffset: null },
      { status: 500 }
    )
  }
}
