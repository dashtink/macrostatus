import { cva } from 'class-variance-authority'
import type { CompositeRegime } from '@/lib/types'

const heroVariants = cva('rounded-2xl border p-6 sm:p-8', {
  variants: {
    regime: {
      'risk-on': 'border-emerald-500/40 bg-emerald-500/10',
      neutral: 'border-amber-400/40 bg-amber-400/10',
      'risk-off': 'border-red-500/40 bg-red-500/10',
    },
  },
})

const REGIME_LABEL: Record<CompositeRegime['regime'], string> = {
  'risk-on': 'Risk-On',
  neutral: 'Neutral',
  'risk-off': 'Risk-Off',
}

export function RegimeHero({ composite }: { composite: CompositeRegime }) {
  return (
    <div className={heroVariants({ regime: composite.regime })}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{REGIME_LABEL[composite.regime]}</h1>
        <span className="text-muted-foreground text-sm">
          as of {new Date(composite.asOf).toLocaleString()} · score {composite.score.toFixed(2)}
        </span>
      </div>

      {composite.narrative && <p className="mt-4 max-w-3xl text-base leading-relaxed">{composite.narrative}</p>}

      {composite.rationale.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1.5">
          {composite.rationale.map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current opacity-60" />
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
