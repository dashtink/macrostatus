import Link from 'next/link'
import { Accordion } from '@/components/ui/accordion'
import { CategorySection } from '@/components/CategorySection'
import { RegimeHero } from '@/components/RegimeHero'
import { TickerTape } from '@/components/TickerTape'
import { getIndicatorsData } from '@/lib/data'

export default async function DashboardPage() {
  const data = await getIndicatorsData()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <TickerTape />
      <RegimeHero composite={data.composite} />

      <Accordion defaultValue={data.categories.map((c) => c.category)}>
        {data.categories.map((category) => (
          <CategorySection
            key={category.category}
            category={category}
            indicators={data.indicators.filter((i) => i.category === category.category)}
          />
        ))}
      </Accordion>

      <p className="text-muted-foreground pb-4 text-center font-mono text-xs">
        Generated {new Date(data.generatedAt).toLocaleString()} — see{' '}
        <Link href="/architecture" className="underline">
          how this is built
        </Link>
        .
      </p>
    </div>
  )
}
