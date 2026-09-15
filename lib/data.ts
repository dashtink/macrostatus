import { readFileSync } from 'node:fs'
import path from 'node:path'
import { IndicatorsDataSchema, type IndicatorsData } from './types'

/**
 * Reads the live snapshot from CloudFront once NEXT_PUBLIC_SNAPSHOT_URL is
 * configured (post-deploy); falls back to the local dry-run fixture before
 * that, so the UI is buildable before any AWS resource exists. Either way
 * the result is Zod-validated — a malformed snapshot fails loudly here
 * rather than rendering a broken page.
 */
export async function getIndicatorsData(): Promise<IndicatorsData> {
  const snapshotUrl = process.env.NEXT_PUBLIC_SNAPSHOT_URL

  const raw = snapshotUrl
    ? await fetch(snapshotUrl, { next: { revalidate: 300 } }).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch indicators snapshot: ${res.status}`)
        return res.json()
      })
    : JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'indicators.sample.json'), 'utf-8'))

  return IndicatorsDataSchema.parse(raw)
}
