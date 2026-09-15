import type { CategoryId } from '../lib/types'

export const CATEGORIES: { id: CategoryId; label: string; weight: number }[] = [
  // Weight drives the composite regime score — Dani's own doc calls out
  // Fed/Liquidity as "highest-weight category," and re-steepening credit
  // stress as the closest thing to an actual recession trigger.
  { id: 'fed-liquidity', label: 'Fed / Liquidity', weight: 2 },
  { id: 'credit', label: 'Credit', weight: 2 },
  { id: 'bonds-rates', label: 'Bonds / Rates', weight: 1 },
  { id: 'labor', label: 'Labor', weight: 1 },
  { id: 'inflation', label: 'Inflation', weight: 1 },
  { id: 'growth', label: 'Growth / Business Cycle', weight: 1 },
  { id: 'valuation-sentiment', label: 'Valuation & Sentiment', weight: 1 },
  { id: 'crash-risk', label: 'Crash-Risk Tells', weight: 1.5 },
]
