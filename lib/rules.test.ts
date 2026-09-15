import { describe, expect, it } from 'vitest'
import { evaluateLevelRule, evaluateTrendRule, type LevelRule, type TrendRule } from './rules'

// These are worth having even on a low-stakes hobby project: a flipped
// `direction` here silently inverts every card on the dashboard, and nothing
// else in the app would catch that — the rule functions ARE the product.

describe('evaluateLevelRule', () => {
  const oilRule: LevelRule = {
    type: 'level',
    direction: 'lowerIsBullish', // moderate oil = bullish, sustained >$85 = bearish
    bullishThreshold: 85,
    bearishThreshold: 85,
    bullishText: (v) => `WTI at $${v}, moderate`,
    neutralText: (v) => `WTI at $${v}`,
    bearishText: (v) => `WTI at $${v}, above the danger zone`,
  }

  it('reads a lowerIsBullish indicator below threshold as bullish, not bearish', () => {
    expect(evaluateLevelRule(oilRule, 70).signal).toBe('bullish')
  })

  it('reads a lowerIsBullish indicator above threshold as bearish', () => {
    expect(evaluateLevelRule(oilRule, 95).signal).toBe('bearish')
  })

  const gdpRule: LevelRule = {
    type: 'level',
    direction: 'higherIsBullish',
    bullishThreshold: 0,
    bearishThreshold: 0,
    bullishText: (v) => `GDPNow at ${v}%`,
    neutralText: (v) => `GDPNow at ${v}%`,
    bearishText: (v) => `GDPNow at ${v}%`,
  }

  it('reads a higherIsBullish indicator above threshold as bullish', () => {
    expect(evaluateLevelRule(gdpRule, 2.1).signal).toBe('bullish')
  })
})

describe('evaluateTrendRule', () => {
  const hyOasRule: TrendRule = {
    type: 'trend',
    direction: 'lowerIsBullish', // tightening spreads = bullish
    lookback: 1,
    neutralBandPct: 0.01,
    bullishText: (l) => `Spreads tightening to ${l}%`,
    neutralText: (l) => `Spreads flat at ${l}%`,
    bearishText: (l) => `Spreads widening to ${l}%`,
  }

  it('reads falling HY spreads (lowerIsBullish, value fell) as bullish', () => {
    // newest-first: 4.10 today vs 4.30 one observation back
    expect(evaluateTrendRule(hyOasRule, [4.1, 4.3]).signal).toBe('bullish')
  })

  it('reads rising HY spreads as bearish', () => {
    expect(evaluateTrendRule(hyOasRule, [4.5, 4.3]).signal).toBe('bearish')
  })

  it('reads a move inside the neutral band as neutral, not a false trend', () => {
    expect(evaluateTrendRule(hyOasRule, [4.301, 4.3]).signal).toBe('neutral')
  })

  it('falls back to neutral when there is not enough history yet', () => {
    expect(evaluateTrendRule(hyOasRule, [4.1]).signal).toBe('neutral')
  })
})
