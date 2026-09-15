import { INDICATORS } from '../config/indicators.config'
import { generateNarrative } from './bedrock'
import { assembleIndicator, computeCategoryRollups, computeCompositeRegime } from './compute'
import { fetchSourceSeries, type Secrets } from './sources'
import type { Indicator, IndicatorsData } from './types'

/**
 * Fetches every configured indicator's raw data, evaluates its rule, and
 * assembles the full IndicatorsData payload. One indicator failing to fetch
 * (e.g. an unofficial Yahoo/CBOE endpoint hiccups) degrades just that card to
 * a placeholder rather than failing the whole run — a partial dashboard beats
 * no dashboard.
 */
export async function runIngestion(
  secrets: Secrets,
  opts: { withNarrative?: boolean } = {},
): Promise<IndicatorsData> {
  const indicators: Indicator[] = await Promise.all(
    INDICATORS.map(async (config) => {
      if (!config.source) return assembleIndicator(config, null)

      try {
        const series = await fetchSourceSeries(config.source, secrets)
        return assembleIndicator(config, series)
      } catch (err) {
        console.error(`[ingest] ${config.id} failed, degrading to placeholder:`, err)
        return assembleIndicator(config, null)
      }
    }),
  )

  const categories = computeCategoryRollups(indicators)
  const composite = computeCompositeRegime(indicators)

  if (opts.withNarrative) {
    composite.narrative = await generateNarrative(indicators, categories, composite)
  }

  return {
    generatedAt: new Date().toISOString(),
    indicators,
    categories,
    composite,
  }
}
