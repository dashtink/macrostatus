import Link from 'next/link'

const PILLARS = [
  {
    name: 'Security & Compliance',
    quote: '"security, compliance, and resilience at scale"',
    ideas: [
      { service: 'AWS WAF', body: 'In front of the public app — rate limiting and managed rule sets against common web exploits.' },
      { service: 'Amazon GuardDuty', body: 'Threat detection across the account, not just the app.' },
      {
        service: 'AWS Config + Security Hub',
        body: 'Continuous compliance auditing — directly relevant to a regulated-industry buyer who has to prove control posture, not just have one.',
      },
      { service: 'AWS KMS', body: 'Customer-managed encryption keys for the DynamoDB table, instead of default S3-managed encryption.' },
    ],
  },
  {
    name: 'Resilience',
    quote: '"mission-critical workloads anywhere with confidence"',
    ideas: [
      {
        service: 'Multi-region + Route 53 failover',
        body: 'A second region on standby with Route 53 health-check failover — what a bank actually needs for a market-facing tool, not just a hobby project.',
      },
      { service: 'AWS Global Accelerator', body: 'Lower, steadier latency for a globally distributed trading-desk audience.' },
    ],
  },
  {
    name: 'Data & Analytics',
    quote: '"the power of a universe of financial market data"',
    ideas: [
      {
        service: 'Amazon QuickSight',
        body: 'A BI-style historical dashboard on top of the DynamoDB history — trend lines and drill-downs, not just today’s read.',
      },
      { service: 'Amazon OpenSearch Service', body: 'Full-text search across historical narratives once there’s a year of them to search.' },
      {
        service: 'Amazon Kinesis',
        body: 'A genuinely real-time pipeline if a paid market-data vendor were in play, instead of today’s twice-daily batch.',
      },
    ],
  },
  {
    name: 'Generative AI',
    quote: '"agentic AI reshaping banking operations"',
    ideas: [
      {
        service: 'Amazon SageMaker',
        body: 'A trained regime-classification model as the next step past today’s hand-written threshold rules — the “if I had a data science team” evolution.',
      },
      {
        service: 'Bedrock Agents',
        body: 'A conversational agent that can answer "why did the read change since yesterday" over the DynamoDB history, instead of only a fixed narrative.',
      },
    ],
  },
]

export default function RoadmapPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roadmap</h1>
        <p className="text-muted-foreground mt-2">
          What I&apos;d add if budget weren&apos;t a constraint — mapped to the four pillars AWS itself markets for
          Financial Services, plus one industry-specific idea. See{' '}
          <Link href="/architecture" className="underline">
            the architecture page
          </Link>{' '}
          for what&apos;s actually running today.
        </p>
      </div>

      {PILLARS.map((pillar) => (
        <section key={pillar.name}>
          <h2 className="text-lg font-semibold">{pillar.name}</h2>
          <p className="text-muted-foreground mb-4 text-sm italic">{pillar.quote}</p>
          <div className="flex flex-col gap-4">
            {pillar.ideas.map((idea) => (
              <div key={idea.service}>
                <h3 className="font-medium">{idea.service}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{idea.body}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className="text-lg font-semibold">One industry-specific callout</h2>
        <div className="mt-4">
          <h3 className="font-medium">AWS PrivateLink</h3>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            The realistic case for a bank: pulling from a paid market-data vendor without traversing the public
            internet. Every source this dashboard uses today is free and public, so PrivateLink has nothing to
            connect to yet — but it&apos;s the first thing that changes the moment a real vendor feed is in play.
          </p>
        </div>
      </section>
    </div>
  )
}
