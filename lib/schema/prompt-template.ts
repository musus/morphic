import { z } from 'zod'

const variableSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
  label: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  defaultValue: z.string().max(1000).optional(),
  required: z.boolean().default(true)
})

export const createTemplateSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(256),
  description: z.string().max(1000).optional(),
  content: z.string().min(1, 'テンプレート内容は必須です').max(10000),
  category: z.string().max(256).optional(),
  variables: z.array(variableSchema).max(20).default([]),
  modelId: z.string().max(256).optional(),
  visibility: z.enum(['public', 'private']).default('private')
})

export const updateTemplateSchema = createTemplateSchema.partial()

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
