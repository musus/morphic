import type { PromptTemplate } from '@/lib/db/schema'
import type { TemplateVariable } from '@/lib/types/prompt-template'

const VARIABLE_REGEX = /\{\{([\p{L}\p{N}_][\p{L}\p{N}_]*)\}\}/gu

/**
 * テンプレート文字列から変数名を抽出
 */
export function extractVariableNames(content: string): string[] {
  const matches = [...content.matchAll(VARIABLE_REGEX)]
  return [...new Set(matches.map(m => m[1]))]
}

/**
 * テンプレート文字列の変数を値で置換
 */
export function resolveTemplate(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(VARIABLE_REGEX, (match, name) => {
    return values[name] ?? match
  })
}

/**
 * {{var}} を ⟨var⟩ に変換（表示用）
 */
export function highlightVariables(content: string): string {
  return content.replace(VARIABLE_REGEX, '⟨$1⟩')
}

/**
 * テンプレートのcontent + stored metadataから変数リストを構築
 */
export function buildVariables(template: PromptTemplate): TemplateVariable[] {
  const varNames = extractVariableNames(template.content)
  const stored = (template.variables ?? []) as TemplateVariable[]
  const storedMap = new Map(stored.map(v => [v.name, v]))

  return varNames.map(name => {
    const existing = storedMap.get(name)
    return (
      existing ?? {
        name,
        label: name,
        required: true
      }
    )
  })
}
