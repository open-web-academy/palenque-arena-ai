# AWS Lambda Deployment Guide

## Overview
The Operator runs as a Lambda function triggered every 60 seconds by EventBridge.

## Step 1: Build the Operator

```bash
cd packages/operator
npm install
npm run build
```

This creates `dist/` folder.

## Step 2: Create AWS Lambda Function

### 2a. Via AWS Console (Easiest)

1. Go to https://console.aws.amazon.com/lambda
2. Click **Create function**
3. **Function name:** `palenque-operator`
4. **Runtime:** Node.js 20.x
5. **Architecture:** x86_64
6. Click **Create function**

### 2b. Upload Code

1. Download the `dist/` folder locally:
   ```bash
   # From your machine
   git clone <repo>
   cd packages/operator
   npm install
   npm run build
   zip -r dist.zip dist node_modules package.json
   ```

2. AWS Console → **Upload from**:
   - Choose `.zip file`
   - Select `dist.zip`
   - Wait for upload

3. **Handler:** Change to `dist/lambda.handler`

### 2c. Set Environment Variables

In Lambda Console → **Configuration** → **Environment variables**:

```
OPERATOR_PRIVATE_KEY = <your key>
FACTORY_ADDRESS = 0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3
PAL_TOKEN_ADDRESS = 0x0dfBc608339aeA55F5EEedE640335dAC062a7777
MONAD_RPC_URL = https://rpc.monad.xyz
MATCH_INTERVAL_SECONDS = 60
LOG_LEVEL = info
```

### 2d. Increase Timeout

**Configuration** → **General** → **Timeout:** Change to **30 seconds**

## Step 3: Create EventBridge Rule

1. Go to https://console.aws.amazon.com/events
2. Click **Create rule**
3. **Name:** `palenque-operator-trigger`
4. **Schedule expression:** `rate(1 minute)`
5. Click **Next**
6. **Target type:** AWS service
7. **Service:** Lambda function
8. **Function:** `palenque-operator`
9. Click **Create rule**

## Step 4: Test

1. Lambda Console → **Test**
2. Event JSON (leave empty or use `{}`):
3. Click **Test**
4. Should see green checkmark + execution result

## Step 5: Monitor

### CloudWatch Logs
1. Lambda Console → **Monitor** tab
2. Click **View CloudWatch Logs**
3. Should see operator logs every 60s

### Set Alarm (Optional)
1. CloudWatch → **Alarms** → **Create alarm**
2. Metric: `Lambda → Errors`
3. Threshold: > 0
4. SNS notification: your email

## Troubleshooting

### "Handler not found"
- Fix: Handler field should be `dist/lambda.handler` (not `lambda.handler`)

### "Out of memory"
- Go to Configuration → Memory → increase to 512 MB

### "Timeout"
- Increase timeout to 60 seconds (RPC calls can be slow)

### "Cannot import modules"
- Make sure `node_modules` is included in zip

### "Environment variables not set"
- Double-check spelling (case-sensitive)
- Redeploy after changing vars

## Cost Estimate

- Free tier: 1 million requests/month
- You'll use: ~1,440 requests/month (60s × 24h × 30 days)
- **Cost: $0** (free tier covers it)

## Next Steps

- Test in Lambda for 10 minutes (should see 10 executions in CloudWatch)
- Monitor for errors
- Once confident, frontend will auto-update as matches are created

## Rollback

To stop operator:
1. EventBridge → Disable rule
2. Or delete Lambda function

To restart:
1. EventBridge → Enable rule
