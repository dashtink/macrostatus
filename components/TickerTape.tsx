'use client'

import { useEffect, useRef } from 'react'

const SYMBOLS = [
  { proName: 'AMEX:SPY', title: 'SPY' },
  { proName: 'TVC:VIX', title: 'VIX' },
  { proName: 'NASDAQ:TLT', title: 'TLT' },
  { proName: 'TVC:DXY', title: 'DXY' },
  { proName: 'TVC:USOIL', title: 'WTI' },
]

/**
 * TradingView's free embeddable widget (script-tag embed, no API key) —
 * presentational only, layered on top of the rules engine, not a
 * replacement for it. TradingView requires the config JSON to be the
 * script tag's own text content, which isn't expressible as plain JSX, so
 * this builds the <script> element by hand and mounts it once.
 */
export function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null)
  // Tracks whether the script has already been injected. React 19 Strict Mode
  // double-invokes effects (mount → cleanup → mount); a ref survives that
  // cycle where a childElementCount check does not, because the inner widget
  // div is always present as child[0] before the script is appended.
  const mountedRef = useRef(false)

  useEffect(() => {
    if (mountedRef.current) return
    const container = containerRef.current
    if (!container) return

    mountedRef.current = true

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.textContent = JSON.stringify({
      symbols: SYMBOLS,
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'compact',
      locale: 'en',
    })
    container.appendChild(script)
  }, [])

  return (
    <div className="tradingview-widget-container overflow-hidden rounded-xl border" ref={containerRef}>
      <div className="tradingview-widget-container__widget" />
    </div>
  )
}
