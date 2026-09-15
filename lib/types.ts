import { z } from 'zod'

export const SignalSchema = z.enum(['bullish', 'bearish', 'neutral', 'placeholder'])
export type Signal = z.infer<typeof SignalSchema>

export const CategoryIdSchema = z.enum([
  'fed-liquidity',
  'credit',
  'bonds-rates',
  'labor',
  'inflation',
  'growth',
  'valuation-sentiment',
  'crash-risk',
])
export type CategoryId = z.infer<typeof CategoryIdSchema>

export const RuleTypeSchema = z.enum(['level', 'trend', 'manual'])
export type RuleType = z.infer<typeof RuleTypeSchema>

export const IndicatorSchema = z.object({
  id: z.string(),
  category: CategoryIdSchema,
  label: z.string(),
  signal: SignalSchema,
  rawValue: z.number().nullable(),
  displayValue: z.string(),
  rationale: z.string(),
  asOf: z.string(),
  source: z.object({ name: z.string(), url: z.string() }),
  ruleType: RuleTypeSchema,
  isPlaceholder: z.boolean(),
})
export type Indicator = z.infer<typeof IndicatorSchema>

export const CategoryRollupSchema = z.object({
  category: CategoryIdSchema,
  label: z.string(),
  signal: SignalSchema,
  counts: z.object({
    bullish: z.number(),
    bearish: z.number(),
    neutral: z.number(),
    placeholder: z.number(),
  }),
})
export type CategoryRollup = z.infer<typeof CategoryRollupSchema>

export const RegimeSchema = z.enum(['risk-on', 'neutral', 'risk-off'])
export type Regime = z.infer<typeof RegimeSchema>

export const CompositeRegimeSchema = z.object({
  regime: RegimeSchema,
  score: z.number(),
  asOf: z.string(),
  rationale: z.array(z.string()),
  narrative: z.string().optional(),
})
export type CompositeRegime = z.infer<typeof CompositeRegimeSchema>

export const IndicatorsDataSchema = z.object({
  generatedAt: z.string(),
  indicators: z.array(IndicatorSchema),
  categories: z.array(CategoryRollupSchema),
  composite: CompositeRegimeSchema,
})
export type IndicatorsData = z.infer<typeof IndicatorsDataSchema>

/** A single point read from a data source, already reduced to one number. */
export interface SeriesPoint {
  date: string
  value: number
}
