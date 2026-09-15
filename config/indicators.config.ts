import type { Rule } from '../lib/rules'
import type { SourceConfig } from '../lib/sources/types'
import type { CategoryId } from '../lib/types'

export interface IndicatorConfig {
  id: string
  category: CategoryId
  label: string
  /** Omit entirely to render as a "manual — coming soon" placeholder card. */
  source?: SourceConfig
  format: (v: number) => string
  rule: Rule
}

const pct = (v: number) => `${v.toFixed(2)}%`
const num = (v: number) => v.toFixed(2)

// This file is the one to edit by hand when a definition needs tuning — it's
// meant to read close to the bullish/bearish bullets in the Notion reference
// doc, not like generic application code.
export const INDICATORS: IndicatorConfig[] = [
  // ── 1. Fed / Liquidity (highest weight) ──────────────────────────────
  {
    id: 'fed-funds-rate',
    category: 'fed-liquidity',
    label: 'Fed Funds Rate',
    source: {
      type: 'fred',
      seriesIds: ['FEDFUNDS'],
      name: 'FRED: Effective Federal Funds Rate',
      url: 'https://fred.stlouisfed.org/series/FEDFUNDS',
    },
    format: pct,
    rule: {
      type: 'trend',
      direction: 'lowerIsBullish', // cuts priced/delivered = bull, hikes/"higher for longer" = bear
      lookback: 3, // ~1 quarter of monthly readings, roughly one FOMC cycle
      neutralBandPct: 0.01,
      bullishText: (l) => `Fed funds at ${pct(l)} and falling — cuts being delivered`,
      neutralText: (l) => `Fed funds holding near ${pct(l)}`,
      bearishText: (l) => `Fed funds at ${pct(l)} and rising — "higher for longer" repricing`,
    },
  },
  {
    id: 'net-liquidity',
    category: 'fed-liquidity',
    label: 'Net Liquidity',
    source: {
      type: 'fred',
      seriesIds: ['WALCL', 'WTREGEN', 'RRPONTSYD'],
      combine: ([walcl, tga, rrp]) => walcl - tga - rrp,
      name: 'FRED: Fed Balance Sheet − TGA − RRP',
      url: 'https://fred.stlouisfed.org/series/WALCL',
    },
    format: (v) => `$${(v / 1000).toFixed(0)}B`,
    rule: {
      type: 'trend',
      direction: 'higherIsBullish',
      lookback: 4, // ~1 month of weekly readings
      neutralBandPct: 0.005,
      bullishText: (l) => `Net liquidity rising to $${(l / 1000).toFixed(0)}B`,
      neutralText: (l) => `Net liquidity roughly flat at $${(l / 1000).toFixed(0)}B`,
      bearishText: (l) => `Net liquidity draining to $${(l / 1000).toFixed(0)}B`,
    },
  },
  {
    id: 'real-rates-10y-tips',
    category: 'fed-liquidity',
    label: 'Real Rates (10y TIPS)',
    source: {
      type: 'fred',
      seriesIds: ['DFII10'],
      name: 'FRED: 10-Year Treasury Inflation-Indexed Security',
      url: 'https://fred.stlouisfed.org/series/DFII10',
    },
    format: pct,
    rule: {
      type: 'trend',
      direction: 'lowerIsBullish',
      lookback: 20, // ~1 month of daily readings
      neutralBandPct: 0.02,
      bullishText: (l) => `Real rates falling to ${pct(l)}`,
      neutralText: (l) => `Real rates steady near ${pct(l)}`,
      bearishText: (l) => `Real rates rising sharply to ${pct(l)}`,
    },
  },
  {
    id: 'qt-pace',
    category: 'fed-liquidity',
    label: 'QT Pace (Fed Balance Sheet)',
    source: {
      type: 'fred',
      seriesIds: ['WALCL'],
      name: 'FRED: Fed Total Assets',
      url: 'https://fred.stlouisfed.org/series/WALCL',
    },
    format: (v) => `$${(v / 1000).toFixed(0)}B`,
    rule: {
      type: 'trend',
      // Isolates the Fed's own runoff pace, separate from net-liquidity above
      // (which also nets out TGA/RRP swings) — rising/flattening = QT slowing.
      direction: 'higherIsBullish',
      lookback: 4,
      neutralBandPct: 0.003,
      bullishText: () => `Balance sheet runoff slowing or paused`,
      neutralText: () => `Balance sheet roughly steady`,
      bearishText: () => `Balance sheet shrinking faster — QT accelerating`,
    },
  },

  // ── 2. Credit ─────────────────────────────────────────────────────────
  {
    id: 'hy-oas-spread',
    category: 'credit',
    label: 'HY Credit Spreads (OAS)',
    source: {
      type: 'fred',
      seriesIds: ['BAMLH0A0HYM2'],
      name: 'FRED: ICE BofA US High Yield OAS',
      url: 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2',
    },
    format: pct,
    rule: {
      type: 'trend',
      direction: 'lowerIsBullish',
      lookback: 20,
      neutralBandPct: 0.02,
      bullishText: (l) => `HY spreads tightening to ${pct(l)} — credit calm`,
      neutralText: (l) => `HY spreads roughly flat at ${pct(l)}`,
      bearishText: (l) => `HY spreads widening to ${pct(l)}, especially if fast — credit stress`,
    },
  },
  {
    id: 'ig-oas-spread',
    category: 'credit',
    label: 'IG Credit Spreads (OAS)',
    source: {
      type: 'fred',
      seriesIds: ['BAMLC0A0CM'],
      name: 'FRED: ICE BofA US Corporate OAS',
      url: 'https://fred.stlouisfed.org/series/BAMLC0A0CM',
    },
    format: pct,
    rule: {
      type: 'trend',
      direction: 'lowerIsBullish',
      lookback: 20,
      neutralBandPct: 0.02,
      bullishText: (l) => `IG spreads tightening to ${pct(l)}`,
      neutralText: (l) => `IG spreads roughly flat at ${pct(l)}`,
      bearishText: (l) => `IG spreads widening to ${pct(l)}`,
    },
  },
  {
    id: 'yield-curve-2s10s',
    category: 'credit',
    label: '2s10s Yield Curve',
    source: {
      type: 'fred',
      seriesIds: ['T10Y2Y'],
      name: 'FRED: 10Y-2Y Treasury Spread',
      url: 'https://fred.stlouisfed.org/series/T10Y2Y',
    },
    format: pct,
    rule: {
      type: 'level',
      // Simplification worth flagging: Dani's doc says the real bear signal is
      // *re-steepening after inversion*, not inversion itself — a nuance this
      // simple level rule can't fully capture without tracking regime state.
      // Deep inversion is treated as the closest proxy we have for v1.
      direction: 'higherIsBullish',
      bullishThreshold: 0.15,
      bearishThreshold: -0.1,
      bullishText: (l) => `Curve steep and positive at ${pct(l)}`,
      neutralText: (l) => `Curve near flat at ${pct(l)}`,
      bearishText: (l) => `Curve inverted at ${pct(l)} — watch for re-steepening`,
    },
  },
  {
    id: 'sloos-lending-standards',
    category: 'credit',
    label: 'SLOOS Bank Lending Standards',
    source: {
      type: 'fred',
      seriesIds: ['DRTSCILM'],
      name: 'FRED: Net % of Banks Tightening C&I Loan Standards',
      url: 'https://fred.stlouisfed.org/series/DRTSCILM',
    },
    format: (v) => `${v.toFixed(0)}%`,
    rule: {
      type: 'level',
      direction: 'lowerIsBullish', // negative = net easing = bull, positive = net tightening = bear
      bullishThreshold: -5,
      bearishThreshold: 5,
      bullishText: (l) => `Banks net easing standards (${l.toFixed(0)}%)`,
      neutralText: (l) => `Lending standards roughly steady (${l.toFixed(0)}%)`,
      bearishText: (l) => `Banks net tightening standards (${l.toFixed(0)}%)`,
    },
  },

  // ── 3. Bonds / Rates ──────────────────────────────────────────────────
  {
    id: 'term-premium-10y',
    category: 'bonds-rates',
    label: '10y Term Premium',
    source: {
      type: 'fred',
      seriesIds: ['THREEFYTP10'],
      name: 'FRED: Kim-Wright 10-Year Term Premium', // proxy for the NY Fed ACM series Dani's doc references
      url: 'https://fred.stlouisfed.org/series/THREEFYTP10',
    },
    format: pct,
    rule: {
      type: 'level',
      direction: 'lowerIsBullish',
      bullishThreshold: 0,
      bearishThreshold: 0.5,
      bullishText: (l) => `Term premium stable/negative at ${pct(l)}`,
      neutralText: (l) => `Term premium near flat at ${pct(l)}`,
      bearishText: (l) => `Term premium turning positive at ${pct(l)} — regime shift`,
    },
  },
  {
    id: 'mortgage-treasury-spread',
    category: 'bonds-rates',
    label: '30y Mortgage vs 10y Spread',
    source: {
      type: 'fred',
      seriesIds: ['MORTGAGE30US', 'DGS10'],
      combine: ([mortgage, treasury]) => mortgage - treasury,
      name: 'FRED: 30Y Mortgage Rate minus 10Y Treasury',
      url: 'https://fred.stlouisfed.org/series/MORTGAGE30US',
    },
    format: pct,
    rule: {
      type: 'trend',
      direction: 'lowerIsBullish',
      lookback: 8, // ~2 months of weekly readings
      neutralBandPct: 0.02,
      bullishText: (l) => `Mortgage spread stable/narrow at ${pct(l)}`,
      neutralText: (l) => `Mortgage spread roughly flat at ${pct(l)}`,
      bearishText: (l) => `Mortgage spread widening to ${pct(l)} — housing stress`,
    },
  },
  { id: 'tlt-stocks-comovement', category: 'bonds-rates', label: 'Bonds vs Stocks Co-movement', format: num, rule: { type: 'manual' } },
  { id: 'move-index', category: 'bonds-rates', label: 'MOVE Index (Bond Vol)', format: num, rule: { type: 'manual' } },

  // ── 4. Labor ──────────────────────────────────────────────────────────
  {
    id: 'nonfarm-payrolls',
    category: 'labor',
    label: 'Nonfarm Payrolls',
    source: {
      type: 'fred',
      seriesIds: ['PAYEMS'],
      name: 'FRED: All Employees, Total Nonfarm',
      url: 'https://fred.stlouisfed.org/series/PAYEMS',
    },
    format: (v) => `${(v / 1000).toFixed(1)}M`,
    rule: {
      type: 'trend',
      direction: 'higherIsBullish',
      lookback: 1, // month over month (revisions themselves aren't tracked in v1)
      neutralBandPct: 0.0005,
      bullishText: () => `Payrolls growth steady/accelerating`,
      neutralText: () => `Payrolls roughly flat`,
      bearishText: () => `Payrolls growth decelerating`,
    },
  },
  {
    id: 'jobless-claims',
    category: 'labor',
    label: 'Initial Jobless Claims',
    source: {
      type: 'fred',
      seriesIds: ['ICSA'],
      name: 'FRED: Initial Claims',
      url: 'https://fred.stlouisfed.org/series/ICSA',
    },
    format: (v) => `${(v / 1000).toFixed(0)}K`,
    rule: {
      type: 'trend',
      direction: 'lowerIsBullish',
      lookback: 4, // ~1 month of weekly readings
      neutralBandPct: 0.03,
      bullishText: (l) => `Claims flat/falling at ${(l / 1000).toFixed(0)}K`,
      neutralText: (l) => `Claims roughly flat at ${(l / 1000).toFixed(0)}K`,
      bearishText: (l) => `Claims trending up to ${(l / 1000).toFixed(0)}K`,
    },
  },
  {
    id: 'jolts-quits-rate',
    category: 'labor',
    label: 'JOLTS Quits Rate',
    source: {
      type: 'fred',
      seriesIds: ['JTSQUR'],
      name: 'FRED: Quits Rate',
      url: 'https://fred.stlouisfed.org/series/JTSQUR',
    },
    format: pct,
    rule: {
      type: 'trend',
      direction: 'higherIsBullish', // rising = worker confidence
      lookback: 1,
      neutralBandPct: 0.01,
      bullishText: (l) => `Quits rate rising to ${pct(l)} — workers confident`,
      neutralText: (l) => `Quits rate flat at ${pct(l)}`,
      bearishText: (l) => `Quits rate falling to ${pct(l)} — workers afraid to leave`,
    },
  },

  // ── 5. Inflation ──────────────────────────────────────────────────────
  {
    id: 'core-pce',
    category: 'inflation',
    label: 'Core PCE (YoY)',
    source: {
      type: 'fred',
      seriesIds: ['PCEPILFE'],
      units: 'pc1', // year-over-year % change, not the raw index level
      name: 'FRED: Core PCE Price Index, YoY',
      url: 'https://fred.stlouisfed.org/series/PCEPILFE',
    },
    format: pct,
    rule: {
      type: 'trend',
      direction: 'lowerIsBullish',
      lookback: 3,
      neutralBandPct: 0.02,
      bullishText: (l) => `Core PCE at ${pct(l)} YoY and disinflating`,
      neutralText: (l) => `Core PCE roughly flat at ${pct(l)} YoY`,
      bearishText: (l) => `Core PCE reaccelerating to ${pct(l)} YoY`,
    },
  },
  {
    id: 'breakeven-5y5y',
    category: 'inflation',
    label: '5y5y Forward Breakeven',
    source: {
      type: 'fred',
      seriesIds: ['T5YIFR'],
      name: 'FRED: 5-Year, 5-Year Forward Inflation Expectation',
      url: 'https://fred.stlouisfed.org/series/T5YIFR',
    },
    format: pct,
    rule: {
      type: 'level',
      direction: 'lowerIsBullish',
      bullishThreshold: 2.5,
      bearishThreshold: 2.8,
      bullishText: (l) => `Inflation expectations anchored near ${pct(l)}`,
      neutralText: (l) => `Inflation expectations near target at ${pct(l)}`,
      bearishText: (l) => `Inflation expectations un-anchoring at ${pct(l)}`,
    },
  },
  { id: 'wage-vs-productivity', category: 'inflation', label: 'Wage Growth vs Productivity', format: pct, rule: { type: 'manual' } },

  // ── 6. Growth / Business Cycle ───────────────────────────────────────
  {
    id: 'gdpnow',
    category: 'growth',
    label: 'Atlanta Fed GDPNow',
    source: {
      type: 'fred',
      seriesIds: ['GDPNOW'],
      name: 'FRED: Atlanta Fed GDPNow',
      url: 'https://fred.stlouisfed.org/series/GDPNOW',
    },
    format: pct,
    rule: {
      type: 'trend',
      // Simplification: compares against the prior estimate, not "consensus"
      // (no free consensus feed) — still a reasonable read on momentum.
      direction: 'higherIsBullish',
      lookback: 1,
      neutralBandPct: 0.05,
      bullishText: (l) => `GDPNow tracking up to ${pct(l)}`,
      neutralText: (l) => `GDPNow roughly flat at ${pct(l)}`,
      bearishText: (l) => `GDPNow tracking down to ${pct(l)}`,
    },
  },
  {
    id: 'sahm-rule',
    category: 'growth',
    label: 'Sahm Rule',
    source: {
      type: 'fred',
      seriesIds: ['SAHMREALTIME'],
      name: 'FRED: Real-time Sahm Rule Recession Indicator',
      url: 'https://fred.stlouisfed.org/series/SAHMREALTIME',
    },
    format: (v) => v.toFixed(2),
    rule: {
      type: 'level',
      direction: 'lowerIsBullish',
      bullishThreshold: 0.3,
      bearishThreshold: 0.5, // the classic Sahm trigger
      bullishText: (l) => `Sahm indicator at ${l.toFixed(2)}, not triggered`,
      neutralText: (l) => `Sahm indicator at ${l.toFixed(2)}, watch closely`,
      bearishText: (l) => `Sahm indicator at ${l.toFixed(2)} — triggered`,
    },
  },
  { id: 'ism-pmi', category: 'growth', label: 'ISM Manufacturing/Services PMI', format: num, rule: { type: 'manual' } },
  { id: 'conference-board-lei', category: 'growth', label: 'Conference Board LEI', format: num, rule: { type: 'manual' } },

  // ── 7. Valuation & Sentiment ──────────────────────────────────────────
  {
    // Demoted to a placeholder: aaii.com blocks non-browser requests with an
    // Incapsula JS challenge (confirmed by hand, not just suspected) — the
    // free XLS this was supposed to use doesn't actually work from a Lambda.
    id: 'aaii-bull-bear-spread',
    category: 'valuation-sentiment',
    label: 'AAII Bull/Bear Spread',
    format: (v) => `${v.toFixed(0)}%`,
    rule: { type: 'manual' },
  },
  {
    id: 'vix-term-structure',
    category: 'valuation-sentiment',
    label: 'VIX Term Structure',
    source: {
      type: 'cboe',
      symbols: ['^VIX', '^VIX3M'],
      combine: ([vix, vix3m]) => vix - vix3m,
      name: 'CBOE: VIX − VIX3M',
      url: 'https://www.cboe.com/tradable_products/vix/vix_historical_data/',
    },
    format: num,
    rule: {
      type: 'level',
      direction: 'lowerIsBullish', // negative (contango) = calm/bull, positive (backwardation) = bear
      bullishThreshold: 0,
      bearishThreshold: 2,
      bullishText: () => `VIX in contango — calm`,
      neutralText: () => `VIX term structure flattening`,
      bearishText: () => `VIX in backwardation — "something's breaking" signal`,
    },
  },
  { id: 'pe-vs-10y-avg', category: 'valuation-sentiment', label: 'S&P Forward P/E vs 10y Avg', format: num, rule: { type: 'manual' } },
  { id: 'cftc-positioning', category: 'valuation-sentiment', label: 'CFTC Net Futures Positioning', format: num, rule: { type: 'manual' } },

  // ── 8. Crash-Risk Tells ───────────────────────────────────────────────
  {
    id: 'repo-vs-fedfunds',
    category: 'crash-risk',
    label: 'Repo (SOFR) vs Fed Funds',
    source: {
      type: 'fred',
      seriesIds: ['SOFR', 'FEDFUNDS'],
      combine: ([sofr, fedfunds]) => sofr - fedfunds,
      name: 'FRED: SOFR minus Effective Fed Funds Rate',
      url: 'https://fred.stlouisfed.org/series/SOFR',
    },
    format: pct,
    rule: {
      type: 'level',
      direction: 'lowerIsBullish',
      bullishThreshold: 0.15,
      bearishThreshold: 0.25,
      bullishText: (l) => `Repo spread stable at ${pct(l)}`,
      neutralText: (l) => `Repo spread at ${pct(l)}`,
      bearishText: (l) => `Repo spread spiking to ${pct(l)} — plumbing stress`,
    },
  },
  {
    id: 'margin-debt',
    category: 'crash-risk',
    label: 'Margin Debt',
    source: { type: 'finra', name: 'FINRA Margin Statistics', url: 'https://www.finra.org/rules-guidance/key-topics/margin-accounts/margin-statistics' },
    format: (v) => `$${(v / 1000).toFixed(0)}B`,
    rule: {
      type: 'trend',
      // Simplification: Dani's doc treats BOTH a sharp spike (leverage
      // building) and a sharp decline (forced deleveraging) as bearish; a
      // single-direction trend rule can only cleanly capture one side, so
      // v1 flags the spike case and leaves the deleveraging case as a gap.
      direction: 'lowerIsBullish',
      lookback: 1,
      neutralBandPct: 0.03,
      bullishText: (l) => `Margin debt stable at $${(l / 1000).toFixed(0)}B`,
      neutralText: (l) => `Margin debt roughly flat at $${(l / 1000).toFixed(0)}B`,
      bearishText: (l) => `Margin debt spiking to $${(l / 1000).toFixed(0)}B — leverage building`,
    },
  },
  { id: 'put-call-ratio', category: 'crash-risk', label: 'Put/Call Ratio', format: num, rule: { type: 'manual' } },
  { id: 'skew-index', category: 'crash-risk', label: 'SKEW Index', format: num, rule: { type: 'manual' } },
  { id: 'dealer-gamma', category: 'crash-risk', label: 'Dealer Gamma Positioning', format: num, rule: { type: 'manual' } },
  { id: 'cross-asset-correlation', category: 'crash-risk', label: 'Cross-Asset Correlation', format: num, rule: { type: 'manual' } },
]
