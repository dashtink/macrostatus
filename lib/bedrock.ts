import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import type { CategoryRollup, CompositeRegime, Indicator } from './types'

// Verify this against the current Bedrock console model list before first
// deploy — Bedrock model IDs occasionally change/rev, and this is the one
// fact in this file worth double-checking rather than trusting blindly.
const DEFAULT_MODEL_ID = 'anthropic.claude-haiku-4-5-20251001-v1:0'

/**
 * Bedrock touches ONLY this narrative overlay — never the bullish/bearish
 * computation itself. That separation matters for a regulated-industry
 * audience: the actual signal is deterministic and auditable, the prose
 * around it is a (clearly-labeled) generated summary.
 */
export async function generateNarrative(
  indicators: Indicator[],
  categories: CategoryRollup[],
  composite: CompositeRegime,
  opts: { modelId?: string; region?: string } = {},
): Promise<string | undefined> {
  const client = new BedrockRuntimeClient({ region: opts.region ?? 'us-east-1' })

  const summary = categories
    .map((c) => `${c.label}: ${c.signal} (${c.counts.bullish}B/${c.counts.bearish}Br/${c.counts.neutral}N/${c.counts.placeholder}P)`)
    .join('\n')
  const notable = indicators
    .filter((i) => !i.isPlaceholder)
    .map((i) => `- ${i.label}: ${i.rationale}`)
    .join('\n')

  const prompt = `You are writing a short market-regime narrative for a capital-markets risk-monitoring dashboard. The composite read is "${composite.regime}" (score ${composite.score.toFixed(2)}).

Category rollups:
${summary}

Notable individual indicator reads:
${notable}

Write a 2-4 sentence narrative overview a risk desk could read at a glance. Be specific about which categories are driving the read. Do not invent numbers not given above. Plain prose, no headers or bullet points.`

  try {
    const res = await client.send(
      new InvokeModelCommand({
        modelId: opts.modelId ?? DEFAULT_MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
      }),
    )

    const body = JSON.parse(new TextDecoder().decode(res.body)) as { content?: { text?: string }[] }
    return body.content?.[0]?.text?.trim()
  } catch (err) {
    // The narrative is a nice-to-have overlay, not the product's core value —
    // a Bedrock hiccup should never take down the whole ingestion run.
    console.error('[bedrock] narrative generation failed, continuing without it:', err)
    return undefined
  }
}
