import { getModelsConfig } from '@/lib/config/load-models-config'
import { isProviderEnabled } from '@/lib/utils/registry'

export async function GET() {
  const config = getModelsConfig()
  const enabledModels = config.models.available.filter(m =>
    isProviderEnabled(m.providerId)
  )
  return Response.json({
    models: enabledModels,
    defaultModelId: config.models.defaultModelId
  })
}
