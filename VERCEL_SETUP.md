# Vercel Deployment Setup

## Step 1: Configure Environment Variables

Go to: `https://vercel.com/palenque-arena-ai/settings/environment-variables`

Add these env vars (for **Production**):

```
VITE_FACTORY_ADDRESS=0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3
VITE_PAL_TOKEN_ADDRESS=0x0dfBc608339aeA55F5EEedE640335dAC062a7777
VITE_RPC_URL=https://rpc.monad.xyz
VITE_CHAIN_ID=143
```

## Step 2: Verify Build Settings

Settings → Build & Development:
- **Framework Preset:** Vite
- **Build Command:** (leave default or use: `pnpm install && pnpm -r build`)
- **Output Directory:** `packages/web/dist`
- **Install Command:** (leave default)

## Step 3: Test Deployment

After env vars are set, redeploy manually:
1. Go to Deployments
2. Click the latest deployment
3. Click "Redeploy"

Expected result: ✅ Build succeeds, site loads at https://palenque-arena-ai.vercel.app

## Step 4: Verify Routes

Test these routes work (no 404):
- `https://palenque-arena-ai.vercel.app/`
- `https://palenque-arena-ai.vercel.app/betting`
- `https://palenque-arena-ai.vercel.app/match`
- Refresh page on each (should not 404)

## Troubleshooting

**Still getting 404?**

1. Check Vercel Deployment Logs
2. Verify `vercel.json` is in root (it is)
3. Check that `packages/web/dist/index.html` exists after build
4. Clear Vercel cache: Settings → Git → Purge Cache

**Env vars not being used?**

1. Redeploy after setting env vars
2. Check that env vars appear in build logs: `https://vercel.com/.../logs`
3. Make sure vars are set to "Production" (not just Preview)
