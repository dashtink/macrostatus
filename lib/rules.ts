import type { Signal } from './types'

export type RuleDirection = 'higherIsBullish' | 'lowerIsBullish'

/**
 * A fixed numeric threshold rule — e.g. "WTI above $85 sustained = bearish."
 * Used when Dani's reference doc names an actual number, not just a direction.
 */
export interface LevelRule {
  type: 'level'
  direction: RuleDirection
  /** Beyond this value (in the bullish direction) the reading counts as bullish. */
  bullishThreshold: number
  /** Beyond this value (in the bearish direction) the reading counts as bearish. */
  bearishThreshold: number
  bullishText: (latest: number) => string
  neutralText: (latest: number) => string
  bearishText: (latest: number) => string
}

/**
 * A direction-of-travel rule — e.g. "spreads tightening = bullish." Compares
 * the latest observation against one `lookback` observations back.
 */
export interface TrendRule {
  type: 'trend'
  direction: RuleDirection
  /** How many observations back to compare the latest value against. */
  lookback: number
  /** |% change| below this is "flat" -> neutral, rather than a real trend. */
  neutralBandPct: number
  bullishText: (latest: number, prior: number) => string
  neutralText: (latest: number, prior: number) => string
  bearishText: (latest: number, prior: number) => string
}

/** No data source wired up — always renders as a dim "manual — coming soon" card. */
export interface ManualRule {
  type: 'manual'
}

export type Rule = LevelRule | TrendRule | ManualRule

export interface RuleResult {
  signal: Signal
  rationale: string
}

// Getting the direction backwards here silently inverts every glowing card on
// the page, so read this twice before trusting it.

export function evaluateLevelRule(rule: LevelRule, latest: number): RuleResult {
  const { direction, bullishThreshold, bearishThreshold } = rule
  const isBullish =
    direction === 'higherIsBullish' ? latest >= bullishThreshold : latest <= bullishThreshold
  const isBearish =
    direction === 'higherIsBullish' ? latest <= bearishThreshold : latest >= bearishThreshold

  if (isBullish) return { signal: 'bullish', rationale: rule.bullishText(latest) }
  if (isBearish) return { signal: 'bearish', rationale: rule.bearishText(latest) }
  return { signal: 'neutral', rationale: rule.neutralText(latest) }
}

export function evaluateTrendRule(rule: TrendRule, series: number[]): RuleResult {
  const { direction, lookback, neutralBandPct } = rule
  const latest = series[0]

  // Not enough history yet (e.g. a series that just started publishing) —
  // neutral is the honest answer, not a guess in either direction.
  if (series.length <= lookback) {
    return { signal: 'neutral', rationale: rule.neutralText(latest, latest) }
  }

  const prior = series[lookback]
  const pctChange = prior === 0 ? 0 : (latest - prior) / Math.abs(prior)

  const isRising = pctChange > neutralBandPct
  const isFalling = pctChange < -neutralBandPct
  const isBullish = direction === 'higherIsBullish' ? isRising : isFalling
  const isBearish = direction === 'higherIsBullish' ? isFalling : isRising

  if (isBullish) return { signal: 'bullish', rationale: rule.bullishText(latest, prior) }
  if (isBearish) return { signal: 'bearish', rationale: rule.bearishText(latest, prior) }
  return { signal: 'neutral', rationale: rule.neutralText(latest, prior) }
}

export function evaluateRule(rule: Rule, series: number[]): RuleResult {
  if (rule.type === 'manual') {
    return { signal: 'placeholder', rationale: 'Manual — coming soon' }
  }
  if (rule.type === 'level') {
    return evaluateLevelRule(rule, series[0])
  }
  return evaluateTrendRule(rule, series)
}
