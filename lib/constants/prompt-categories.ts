export const PROMPT_CATEGORIES = [
  { key: 'research', label: 'リサーチ' },
  { key: 'compare', label: '比較' },
  { key: 'latest', label: '最新ニュース' },
  { key: 'summarize', label: '要約' },
  { key: 'explain', label: '解説' },
  { key: 'creative', label: 'クリエイティブ' },
  { key: 'coding', label: 'コーディング' },
  { key: 'other', label: 'その他' }
] as const

export type PromptCategoryKey = (typeof PROMPT_CATEGORIES)[number]['key']
