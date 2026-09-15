#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { MacrostatusStack } from '../lib/macrostatus-stack'

const app = new cdk.App()
new MacrostatusStack(app, 'MacrostatusStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
})
