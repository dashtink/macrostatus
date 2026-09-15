import { fetchCboeCsv } from './cboe'
import { fetchFinraMarginDebt } from './finra'
import { fetchFredSeries } from './fred'
import type { SourceConfig } from './types'
import { fetchYahooSeries } from './yahoo'
import type { SeriesPoint } from '../types'

export interface Secrets {
  fredApiKey: string
}

/**
 * Fetches every underlying series for one indicator and combines them into a
 * single time series (newest-first). For a multi-series source (e.g. net
 * liquidity = WALCL - TGA - RRP), each series is fetched independently and
 * then zipped together *positionally* — this assumes they publish on
 * comparable cadences, which holds well enough for FRED's own daily/weekly
 * series but is a known simplification, not exact calendar alignment.
 */
export async function fetchSourceSeries(source: SourceConfig, secrets: Secrets): Promise<SeriesPoint[]> {
  switch (source.type) {
    case 'fred': {
      const perSeries = await Promise.all(
        source.seriesIds.map((id) => fetchFredSeries(id, secrets.fredApiKey, { units: source.units })),
      )
      return zipAndCombine(perSeries, source.combine)
    }
    case 'yahoo': {
      const perSeries = await Promise.all(source.symbols.map((s) => fetchYahooSeries(s)))
      return zipAndCombine(perSeries, source.combine)
    }
    case 'cboe': {
      const perSeries = await Promise.all(source.symbols.map((s) => fetchCboeCsv(s)))
      return zipAndCombine(perSeries, source.combine)
    }
    case 'finra':
      return fetchFinraMarginDebt()
  }
}

function zipAndCombine(perSeries: SeriesPoint[][], combine?: (values: number[]) => number): SeriesPoint[] {
  if (perSeries.length === 1) return perSeries[0]

  const length = Math.min(...perSeries.map((s) => s.length))
  const points: SeriesPoint[] = []
  for (let i = 0; i < length; i++) {
    const values = perSeries.map((s) => s[i].value)
    points.push({ date: perSeries[0][i].date, value: (combine ?? ((v) => v[0]))(values) })
  }
  return points
}
