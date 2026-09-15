# macrostatus

A live macro/market regime monitor for US equities — a grid of glowing indicator cards (bullish/bearish/neutral), synthesized into an overall Risk-On/Neutral/Risk-Off read. Built as a capital-markets risk-monitoring demo on AWS: EventBridge → Lambda (fetch + compute + Bedrock narrative) → DynamoDB + S3/CloudFront → Amplify Hosting. See `/architecture` and `/roadmap` in the running app for the full story.

## Local development

```bash
npm install
npm run dev
```

The dashboard reads `data/indicators.sample.json` locally until `NEXT_PUBLIC_SNAPSHOT_URL` is set (post-deploy), so it's fully browsable before any AWS resource exists.

## Running the ingestion pipeline locally

1. Get a free FRED API key: https://fred.stlouisfed.org/docs/api/api_key.html
2. `FRED_API_KEY=your-key npm run dry-run` — fetches real data from FRED/CBOE/FINRA, computes every indicator's signal, and overwrites `data/indicators.sample.json`. Prints a one-line summary per indicator so you can eyeball the signals before trusting them.

`npm run test` runs the rule-evaluator tests — the pure functions that turn a raw number into bullish/bearish/neutral. Getting a `direction` backwards there silently inverts a card's color, so these are worth keeping green.

## Deploying to AWS

Everything under `infra/` is a self-contained CDK (TypeScript) app.

```bash
cd infra
npm install
npx cdk bootstrap   # once per AWS account/region
npx cdk deploy
```

After the first deploy, set the FRED key (CloudFormation can't create a `SecureString` parameter directly, so this is a manual step):

```bash
aws ssm put-parameter --name /macrostatus/fred-api-key --type SecureString --value <your-key>
```

Then connect **Amplify Hosting** to this GitHub repo via the AWS Console (Amplify → New app → Host web app → connect the repo/branch) — this is a one-time interactive step, not scripted here. Set `NEXT_PUBLIC_SNAPSHOT_URL` in the Amplify app's environment variables to the `SnapshotUrl` CDK output (also printed after `cdk deploy`).

Before making the deployed app or repo public: run a security review (secrets, IAM scope, bucket access) — see the checklist in `/architecture`.

## Known source-availability findings

Verified by hand while building this — worth knowing if you extend the indicator list in `config/indicators.config.ts`:

- **CBOE's VIX/VIX3M CSVs are genuinely current** (confirmed by checking the last row's date) — used directly instead of a third-party proxy.
- **AAII's sentiment.xls is bot-blocked** (Incapsula JS challenge) — looked like a clean free source on paper, doesn't actually work from a server. Currently a placeholder.
- **CBOE's put/call ratio CSV is stale** (stopped updating in 2019) — also a placeholder.
- **FINRA's margin-debt XLSX is genuinely live** (same URL, updated in place monthly, confirmed via `Last-Modified`).
