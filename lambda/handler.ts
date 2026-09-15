import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import { BatchWriteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { runIngestion } from '../lib/ingest'

const TABLE_NAME = process.env.TABLE_NAME!
const BUCKET_NAME = process.env.BUCKET_NAME!
const FRED_API_KEY_PARAM = process.env.FRED_API_KEY_PARAM!

const ssm = new SSMClient({})
const s3 = new S3Client({})
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))

/** Splits into chunks of at most 25 — DynamoDB's BatchWriteItem hard limit. */
function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export async function handler() {
  const { Parameter } = await ssm.send(new GetParameterCommand({ Name: FRED_API_KEY_PARAM, WithDecryption: true }))
  const fredApiKey = Parameter?.Value
  if (!fredApiKey) throw new Error(`Missing SSM parameter ${FRED_API_KEY_PARAM}`)

  const data = await runIngestion({ fredApiKey }, { withNarrative: true })

  // History: one row per indicator per run, keyed by the underlying reading's
  // own `asOf` date (not the run time) so two runs on data that hasn't moved
  // yet overwrite the same row instead of cluttering history with
  // near-duplicate points. `ingestedAt` still records when this run happened.
  const rows = [
    ...data.indicators.map((i) => ({ indicatorId: i.id, ingestedAt: data.generatedAt, ...i })),
    { indicatorId: '__composite__', ingestedAt: data.generatedAt, ...data.composite },
  ]
  for (const batch of chunk(rows, 25)) {
    await ddb.send(
      new BatchWriteCommand({
        RequestItems: { [TABLE_NAME]: batch.map((Item) => ({ PutRequest: { Item } })) },
      }),
    )
  }

  // Latest snapshot: what the Next.js app actually reads, via CloudFront.
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'latest.json',
      Body: JSON.stringify(data),
      ContentType: 'application/json',
      CacheControl: 'max-age=300',
    }),
  )

  console.log(`Ingestion complete: ${data.indicators.length} indicators, regime=${data.composite.regime}`)
  return { statusCode: 200 }
}
