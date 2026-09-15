import type { SeriesPoint } from '../types'

/**
 * Yahoo Finance's unofficial (but widely used, free, no-signup) chart
 * endpoint — fills the gap FRED can't: index/ETF-level data like VIX/VIX3M
 * term structure and SPY/TLT prices. Undocumented and could change without
 * notice, so callers should treat a failure here as "degrade this one card
 * to a placeholder," never as a reason to fail the whole ingestion run.
 */
export async function fetchYahooSeries(symbol: string, opts: { range?: string } = {}): Promise<SeriesPoint[]> {
  const params = new URLSearchParams({
    range: opts.range ?? '3mo',
    interval: '1d',
  })
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${params}`

  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) {
    throw new Error(`Yahoo fetch failed for ${symbol}: ${res.status} ${res.statusText}`)
  }

  const body = (await res.json()) as {
    chart?: {
      result?: {
        timestamp: number[]
        indicators: { quote: { close: (number | null)[] }[] }
      }[]
    }
  }

  const result = body.chart?.result?.[0]
  if (!result) throw new Error(`Yahoo returned no data for ${symbol}`)

  const closes = result.indicators.quote[0]?.close ?? []
  const points: SeriesPoint[] = result.timestamp
    .map((ts, i) => ({ date: new Date(ts * 1000).toISOString().slice(0, 10), value: closes[i] }))
    .filter((p): p is SeriesPoint => p.value != null)

  // Newest-first, to match FRED's convention and what the rule engine expects.
  return points.reverse()
}
