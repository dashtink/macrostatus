import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

const FLOW = [
  { label: 'EventBridge', detail: 'Cron, twice daily' },
  { label: 'Lambda', detail: 'Fetch + compute + narrate' },
  { label: 'DynamoDB', detail: 'History (every run)' },
  { label: 'S3 + CloudFront', detail: 'latest.json' },
  { label: 'Amplify / Next.js', detail: 'Public site' },
]

const CHOICES = [
  {
    title: 'DynamoDB over a flat file',
    body: 'Every ingestion run writes a row per indicator, keyed by that reading’s own date — not just the latest value. That’s what makes a future "30-day trend" view possible without re-architecting anything, and it’s an audit trail: every historical read the dashboard ever showed is still there.',
  },
  {
    title: 'Parameter Store, never a hardcoded key',
    body: 'The FRED API key lives only in SSM Parameter Store (SecureString), which CloudFormation can’t even create directly by design — it has to be set out-of-band via CLI. The Lambda’s IAM role can read exactly that one parameter and nothing else.',
  },
  {
    title: 'CloudFront in front of S3, not a public bucket',
    body: 'The S3 bucket blocks all public access; CloudFront reaches it through an Origin Access Control. The only thing the public internet can ever see is the one latest.json object, never the bucket itself.',
  },
  {
    title: 'Bedrock touches only the narrative, never the signal',
    body: 'Every bullish/bearish/neutral read is a deterministic threshold rule, computed before Bedrock is ever called. Bedrock writes the 2-4 sentence summary on top of numbers that are already final — a regulated-industry buyer needs to trust the number, not just the prose around it.',
  },
]

const COST = [
  { tier: 'Always free', items: 'Lambda (1M req/mo), DynamoDB on-demand at this volume, EventBridge Rules' },
  { tier: '12 months free', items: 'Amplify Hosting (build minutes, SSR requests), S3 storage/requests, CloudFront transfer' },
  { tier: 'Metered (trivial at this scale)', items: 'Bedrock (Claude Haiku 4.5, ~$1/1M in + $5/1M out — two short calls/day is a fraction of a cent)' },
]

export default function ArchitecturePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Architecture</h1>
        <p className="text-muted-foreground mt-2">
          What&apos;s actually running today, and why — as opposed to{' '}
          <Link href="/roadmap" className="underline">
            the roadmap
          </Link>
          , which is what I&apos;d add given more budget.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Data flow</h2>
        <div className="flex flex-wrap items-center gap-2">
          {FLOW.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="rounded-lg border px-3 py-2 text-center">
                <div className="text-sm font-medium">{step.label}</div>
                <div className="text-muted-foreground text-xs">{step.detail}</div>
              </div>
              {i < FLOW.length - 1 && <ArrowRight className="text-muted-foreground size-4 shrink-0" />}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Why these choices</h2>
        <div className="flex flex-col gap-5">
          {CHOICES.map((c) => (
            <div key={c.title}>
              <h3 className="font-medium">{c.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">What this costs to run</h2>
        <div className="flex flex-col gap-3">
          {COST.map((row) => (
            <div key={row.tier} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
              <Badge variant="outline" className="w-fit shrink-0">
                {row.tier}
              </Badge>
              <span className="text-muted-foreground text-sm">{row.items}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
