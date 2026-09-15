import { CATEGORIES } from '../config/categories'
import type { IndicatorConfig } from '../config/indicators.config'
import { evaluateRule } from './rules'
import type { CategoryRollup, CompositeRegime, Indicator, Signal } from './types'

/** Turns one indicator's fetched series (newest-first) into its full card data. Pass `null` for a manual/unfetched indicator. */
export function assembleIndicator(
  config: IndicatorConfig,
  series: { date: string; value: number }[] | null,
): Indicator {
  const sourceMeta = config.source
    ? { name: config.source.name, url: config.source.url }
    : { name: 'Manual', url: '' }

  if (config.rule.type === 'manual' || !series || series.length === 0) {
    return {
      id: config.id,
      category: config.category,
      label: config.label,
      signal: 'placeholder',
      rawValue: null,
      displayValue: '—',
      rationale: 'Manual — coming soon',
      asOf: new Date().toISOString().slice(0, 10),
      source: sourceMeta,
      ruleType: 'manual',
      isPlaceholder: true,
    }
  }

  const values = series.map((p) => p.value)
  const { signal, rationale } = evaluateRule(config.rule, values)

  return {
    id: config.id,
    category: config.category,
    label: config.label,
    signal,
    rawValue: values[0],
    displayValue: config.format(values[0]),
    rationale,
    asOf: series[0].date,
    source: sourceMeta,
    ruleType: config.rule.type,
    isPlaceholder: false,
  }
}

function rollupSignal(indicators: Indicator[]): Signal {
  const real = indicators.filter((i) => !i.isPlaceholder)
  if (real.length === 0) return 'placeholder'

  const bullish = real.filter((i) => i.signal === 'bullish').length
  const bearish = real.filter((i) => i.signal === 'bearish').length
  if (bullish > bearish) return 'bullish'
  if (bearish > bullish) return 'bearish'
  return 'neutral'
}

export function computeCategoryRollups(indicators: Indicator[]): CategoryRollup[] {
  return CATEGORIES.map(({ id, label }) => {
    const inCategory = indicators.filter((i) => i.category === id)
    return {
      category: id,
      label,
      signal: rollupSignal(inCategory),
      counts: {
        bullish: inCategory.filter((i) => i.signal === 'bullish').length,
        bearish: inCategory.filter((i) => i.signal === 'bearish').length,
        neutral: inCategory.filter((i) => i.signal === 'neutral').length,
        placeholder: inCategory.filter((i) => i.signal === 'placeholder').length,
      },
    }
  })
}

const SIGNAL_SCORE: Record<Signal, number> = { bullish: 1, bearish: -1, neutral: 0, placeholder: 0 }

/**
 * Weighted average of category-level signals (each category's own average
 * across its real indicators), weighted by CATEGORIES' `weight` — this is
 * how Dani's "Fed/Liquidity is highest-weight" framing gets encoded rather
 * than treating every indicator as equally important to the overall read.
 */
export function computeCompositeRegime(indicators: Indicator[]): CompositeRegime {
  let weightedSum = 0
  let weightTotal = 0
  const rationale: string[] = []

  for (const { id, label, weight } of CATEGORIES) {
    const real = indicators.filter((i) => i.category === id && !i.isPlaceholder)
    if (real.length === 0) continue

    const categoryScore = real.reduce((sum, i) => sum + SIGNAL_SCORE[i.signal], 0) / real.length
    weightedSum += categoryScore * weight
    weightTotal += weight

    if (Math.abs(categoryScore) >= 0.5) {
      rationale.push(`${label}: ${categoryScore > 0 ? 'leaning bullish' : 'leaning bearish'}`)
    }
  }

  const score = weightTotal === 0 ? 0 : weightedSum / weightTotal
  const regime = score >= 0.2 ? 'risk-on' : score <= -0.2 ? 'risk-off' : 'neutral'

  return {
    regime,
    score,
    asOf: new Date().toISOString(),
    rationale: rationale.slice(0, 4),
  }
}
