import * as XLSX from 'xlsx'
import type { SeriesPoint } from '../types'

const FINRA_MARGIN_XLSX_URL = 'https://www.finra.org/sites/default/files/2021-03/margin-statistics.xlsx'

/**
 * FINRA republishes this same URL in place every month (the "2021-03" in the
 * path is just its original upload date on their CMS, not a version marker —
 * verified via Last-Modified before trusting it). Sheet: "Customer Margin
 * Balances", column 1 = Debit Balances = margin debt, in $ millions,
 * newest-month-first.
 */
export async function fetchFinraMarginDebt(): Promise<SeriesPoint[]> {
  const res = await fetch(FINRA_MARGIN_XLSX_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) {
    throw new Error(`FINRA fetch failed: ${res.status} ${res.statusText}`)
  }

  const buffer = await res.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets['Customer Margin Balances']
  if (!sheet) throw new Error('FINRA workbook missing "Customer Margin Balances" sheet')

  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 })

  return rows
    .slice(1) // drop header row
    .filter((row) => row[0] && typeof row[1] === 'number')
    .map((row) => ({ date: `${row[0]}-01`, value: row[1] as number }))
}
