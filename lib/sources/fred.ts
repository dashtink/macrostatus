import type { SeriesPoint } from '../types'

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations'

/**
 * Fetches the most recent `limit` observations for one FRED series,
 * newest-first. FRED always returns whatever its native frequency is
 * (daily/weekly/monthly/quarterly) — callers don't need to special-case
 * cadence, they just get "the last N readings" and a rule's `lookback`
 * picks how far back to compare.
 */
export async function fetchFredSeries(
  seriesId: string,
  apiKey: string,
  opts: { units?: string; limit?: number } = {},
): Promise<SeriesPoint[]> {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    sort_order: 'desc',
    limit: String(opts.limit ?? 30),
  })
  if (opts.units) params.set('units', opts.units)

  const res = await fetch(`${FRED_BASE}?${params}`)
  if (!res.ok) {
    throw new Error(`FRED fetch failed for ${seriesId}: ${res.status} ${res.statusText}`)
  }

  const body = (await res.json()) as { observations?: { date: string; value: string }[] }
  const observations = body.observations ?? []

  // FRED uses "." for a not-yet-published/missing observation — drop those
  // rather than parsing them into NaN and silently corrupting a trend rule.
  return observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: Number(o.value) }))
}
