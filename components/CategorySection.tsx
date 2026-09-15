import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { IndicatorCard } from '@/components/IndicatorCard'
import type { CategoryRollup, Indicator } from '@/lib/types'

export function CategorySection({
  category,
  indicators,
}: {
  category: CategoryRollup
  indicators: Indicator[]
}) {
  const { bullish, bearish, neutral, placeholder } = category.counts

  return (
    <AccordionItem value={category.category}>
      <AccordionTrigger>
        <div className="flex flex-1 flex-wrap items-center justify-between gap-2 pr-2">
          <span>{category.label}</span>
          <div className="flex gap-1.5 text-xs">
            {bullish > 0 && (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">{bullish} bullish</Badge>
            )}
            {bearish > 0 && <Badge className="bg-red-500/15 text-red-600 dark:text-red-400">{bearish} bearish</Badge>}
            {neutral > 0 && (
              <Badge className="bg-amber-400/15 text-amber-600 dark:text-amber-400">{neutral} neutral</Badge>
            )}
            {placeholder > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                {placeholder} manual
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {indicators.map((indicator) => (
            <IndicatorCard key={indicator.id} indicator={indicator} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
