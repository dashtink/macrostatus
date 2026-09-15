import { cva } from 'class-variance-authority'
import { ExternalLink } from 'lucide-react'
import type { Indicator } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

const cardVariants = cva('rounded-xl border p-4 transition-shadow flex flex-col gap-2', {
  variants: {
    signal: {
      bullish: 'border-emerald-500/60 shadow-[0_0_24px_-4px] shadow-emerald-500/50 bg-emerald-500/5',
      bearish: 'border-red-500/60 shadow-[0_0_24px_-4px] shadow-red-500/50 bg-red-500/5',
      neutral: 'border-amber-400/60 shadow-[0_0_18px_-6px] shadow-amber-400/40 bg-amber-400/5',
      placeholder: 'border-border opacity-50 grayscale',
    },
  },
})

const dotVariants = cva('size-2.5 rounded-full', {
  variants: {
    signal: {
      bullish: 'bg-emerald-500 shadow-[0_0_8px_1px] shadow-emerald-500/80',
      bearish: 'bg-red-500 shadow-[0_0_8px_1px] shadow-red-500/80',
      neutral: 'bg-amber-400 shadow-[0_0_8px_1px] shadow-amber-400/70',
      placeholder: 'bg-muted-foreground/40',
    },
  },
})

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  return (
    <div className={cardVariants({ signal: indicator.signal })}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{indicator.label}</span>
        <span className={dotVariants({ signal: indicator.signal })} aria-hidden />
      </div>

      {indicator.isPlaceholder ? (
        <Badge variant="outline" className="w-fit text-xs">
          Manual — coming soon
        </Badge>
      ) : (
        <>
          <div className="text-2xl font-semibold tabular-nums">{indicator.displayValue}</div>
          <p className="text-muted-foreground text-sm">{indicator.rationale}</p>
          {indicator.source.url && (
            <a
              href={indicator.source.url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground mt-auto flex items-center gap-1 text-xs"
            >
              {indicator.source.name}
              <ExternalLink className="size-3" />
            </a>
          )}
        </>
      )}
    </div>
  )
}
