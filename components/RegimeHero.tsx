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

const pillVariants = cva(
  'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide',
  {
    variants: {
      regime: {
        'risk-on': 'border-emerald-500/40 text-emerald-400',
        neutral: 'border-amber-400/40 text-amber-400',
        'risk-off': 'border-red-500/40 text-red-400',
      },
    },
  },
)

const dotVariants = cva('size-1.5 rounded-full shadow-[0_0_6px_1px] animate-pulse', {
  variants: {
    regime: {
      'risk-on': 'bg-emerald-500 shadow-emerald-500/80',
      neutral: 'bg-amber-400 shadow-amber-400/80',
      'risk-off': 'bg-red-500 shadow-red-500/80',
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
      <span className={pillVariants({ regime: composite.regime })}>
        <span className={dotVariants({ regime: composite.regime })} aria-hidden />
        Macroeconomic monitor
      </span>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{REGIME_LABEL[composite.regime]}</h1>
        <span className="text-muted-foreground font-mono text-xs">
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
