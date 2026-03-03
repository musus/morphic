export interface Model {
  id: string
  name: string
  provider: string
  providerId: string
  providerOptions?: Record<string, any>
  searchModeConfig?: Record<string, { providerOptions?: Record<string, any> }>
}
