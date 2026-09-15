import * as path from 'node:path'
import * as cdk from 'aws-cdk-lib'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

/**
 * Name of the SSM parameter holding the FRED API key. CloudFormation can't
 * create a SecureString parameter directly (a long-standing CFN limitation),
 * so this stack only *references* it — set the actual value once, out of
 * band, after the first deploy:
 *   aws ssm put-parameter --name /macrostatus/fred-api-key --type SecureString --value <key>
 */
const FRED_API_KEY_PARAM = '/macrostatus/fred-api-key'

// The Lambda's source lives at the repo root (lambda/handler.ts), shared with
// the Next.js app's lib/config code — not under infra/'s own package root,
// so NodejsFunction needs to be told explicitly where the real project root
// (and its package-lock.json / node_modules) actually is.
const REPO_ROOT = path.join(__dirname, '..', '..')

export class MacrostatusStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // ── Storage ──────────────────────────────────────────────────────────
    const table = new dynamodb.Table(this, 'ReadingsTable', {
      tableName: 'macrostatus-readings',
      partitionKey: { name: 'indicatorId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'asOf', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // negligible cost at this write volume, no capacity planning needed
      removalPolicy: cdk.RemovalPolicy.RETAIN, // this is the historical record — don't lose it to a stack teardown
    })

    const bucket = new s3.Bucket(this, 'SnapshotBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // only reachable via CloudFront's Origin Access Control below
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    const cachePolicy = new cloudfront.CachePolicy(this, 'SnapshotCachePolicy', {
      defaultTtl: cdk.Duration.minutes(5),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.minutes(5),
    })

    const distribution = new cloudfront.Distribution(this, 'SnapshotDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy,
      },
    })

    // ── Ingestion Lambda ─────────────────────────────────────────────────
    const ingestFn = new lambdaNode.NodejsFunction(this, 'IngestFunction', {
      entry: path.join(REPO_ROOT, 'lambda', 'handler.ts'),
      projectRoot: REPO_ROOT,
      depsLockFilePath: path.join(REPO_ROOT, 'package-lock.json'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(120),
      memorySize: 256,
      environment: {
        TABLE_NAME: table.tableName,
        BUCKET_NAME: bucket.bucketName,
        FRED_API_KEY_PARAM,
      },
    })

    table.grantWriteData(ingestFn)
    bucket.grantWrite(ingestFn)

    ingestFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter${FRED_API_KEY_PARAM}`],
      }),
    )
    ingestFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        // Scoped to Anthropic models specifically, not every model in the account.
        resources: [`arn:aws:bedrock:${this.region}::foundation-model/anthropic.*`],
      }),
    )

    // ── Twice-daily schedule ─────────────────────────────────────────────
    // Classic EventBridge Rules (not the newer Scheduler service) — equally
    // capable for a fixed cron and a more battle-tested CDK construct.
    new events.Rule(this, 'MorningSchedule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '13' }), // ~9am ET
      targets: [new targets.LambdaFunction(ingestFn)],
    })
    new events.Rule(this, 'EveningSchedule', {
      schedule: events.Schedule.cron({ minute: '30', hour: '21' }), // ~5:30pm ET, after US close
      targets: [new targets.LambdaFunction(ingestFn)],
    })

    new cdk.CfnOutput(this, 'SnapshotUrl', { value: `https://${distribution.distributionDomainName}/latest.json` })
    new cdk.CfnOutput(this, 'TableName', { value: table.tableName })
  }
}
