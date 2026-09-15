/**
 * Local verification script: runs the exact same ingestion logic the Lambda
 * will run in AWS, against real live data sources, and writes the result to
 * data/indicators.sample.json so it can be eyeballed (or used as a frontend
 * fixture) before anything touches AWS at all.
 *
 * Usage: FRED_API_KEY=xxxxx npx tsx scripts/dry-run.ts
 */
import { writeFileSync } from 'node:fs'
import { runIngestion } from '../lib/ingest'

async function main() {
  const fredApiKey = process.env.FRED_API_KEY
  if (!fredApiKey) {
    console.error('Set FRED_API_KEY (get a free key at https://fred.stlouisfed.org/docs/api/api_key.html)')
    process.exit(1)
  }

  const data = await runIngestion({ fredApiKey })

  const outPath = new URL('../data/indicators.sample.json', import.meta.url)
  writeFileSync(outPath, JSON.stringify(data, null, 2))

  const real = data.indicators.filter((i) => !i.isPlaceholder)
  const placeholders = data.indicators.length - real.length
  console.log(`Wrote ${data.indicators.length} indicators (${real.length} real, ${placeholders} placeholder) to data/indicators.sample.json`)
  console.log(`Composite regime: ${data.composite.regime} (score ${data.composite.score.toFixed(2)})`)
  for (const i of data.indicators) {
    console.log(`  [${i.signal.padEnd(11)}] ${i.label}: ${i.displayValue} — ${i.rationale}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
