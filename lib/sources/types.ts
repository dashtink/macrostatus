/**
 * How to fetch the raw number(s) behind one indicator. `seriesIds`/`symbols` is
 * an array because a few indicators are derived from more than one underlying
 * series (e.g. net liquidity = WALCL - TGA - RRP) — `combine` reduces them
 * (aligned point-by-point, newest-first) into the single number the rule
 * engine actually evaluates. Default combine is "just take the first series."
 */
export type SourceConfig =
  | {
      type: 'fred'
      seriesIds: string[]
      /** FRED `units` transform (e.g. 'pc1' for YoY % change). Applied to every series. Default: 'lin' (raw level). */
      units?: string
      combine?: (values: number[]) => number
      name: string
      url: string
    }
  | {
      type: 'yahoo'
      symbols: string[]
      combine?: (values: number[]) => number
      name: string
      url: string
    }
  | {
      type: 'cboe'
      symbols: ('^VIX' | '^VIX3M')[]
      combine?: (values: number[]) => number
      name: string
      url: string
    }
  | { type: 'finra'; name: string; url: string }
