import type { SeriesPoint } from '../types'

const CBOE_CSV_URLS: Record<string, string> = {
  '^VIX': 'https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv',
  '^VIX3M': 'https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX3M_History.csv',
}

/**
 * CBOE's own public CSVs — confirmed (by hand, per the verification step in
 * the plan) to be genuinely current, unlike the AAII/put-call sources that
 * looked promising on paper but turned out to be bot-blocked or stale.
 * Format is DATE,OPEN,HIGH,LOW,CLOSE, oldest-first — reversed here to match
 * the newest-first convention the rest of the ingestion pipeline expects.
 */
export async function fetchCboeCsv(symbol: '^VIX' | '^VIX3M'): Promise<SeriesPoint[]> {
  const url = CBOE_CSV_URLS[symbol]
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) {
    throw new Error(`CBOE fetch failed for ${symbol}: ${res.status} ${res.statusText}`)
  }

  const text = await res.text()
  const lines = text.trim().split('\n').slice(1) // drop header row

  const points = lines.map((line) => {
    const [date, , , , close] = line.split(',')
    const [month, day, year] = date.split('/')
    return { date: `${year}-${month}-${day}`, value: Number(close) }
  })

  return points.reverse()
}
