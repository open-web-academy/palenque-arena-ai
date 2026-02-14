# 🚀 Palenque Arena - Production Readiness Checklist

**Target Deadline**: Feb 15, 2026  
**Current Status**: ~85% Complete

---

## ✅ COMPLETED TASKS

### Smart Contracts (Phase 1)
- [x] Match.sol implementation (betting, boosting, randomness)
- [x] MatchFactory.sol deployment
- [x] UUPS proxy upgradeable pattern
- [x] Deployed to Monad Mainnet (Chain 143)
  - Factory: `0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3`
  - Operator: `0x21BC8b95e5F03aFCb609CCCbE9B974F62Af0cFe3`
  - PAL Token: `0x0dfBc608339aeA55F5EEedE640335dAC062a7777`

### Backend (Phase 3A)
- [x] Operator state machine (Open → Closed → Settled)
- [x] Match creation (every 60s)
- [x] Commit-reveal randomness
- [x] Configuration system (rooster pool, intervals)
- [x] Error handling with retry logic (3 attempts, exponential backoff)
- [x] Comprehensive logging

### Frontend (Phase 3B)
- [x] BetForm component (native MON betting)
- [x] BoostForm component (PAL token approval + boost)
- [x] PayoutClaim component (winnings claim)
- [x] MatchHistory component (last 10 matches)
- [x] CountdownTimer component
- [x] LiveOdds component
- [x] MatchCard component
- [x] useMatch hook (polling)
- [x] useMatchEvents hook (real-time event listeners)
- [x] useToast hook (user notifications)
- [x] ToastContainer component (notification UI)
- [x] App.tsx integration (WagmiConfig + all components)

### Deployment Config
- [x] DEPLOYMENT.md runbook
- [x] Environment variables (.env setup)
- [x] Vercel SPA rewrite rule (vercel.json)

### Testing & Validation
- [x] E2E test script (e2e-test.ts)

---

## ⏳ PENDING TASKS (MUST COMPLETE)

### 1. Vercel Deployment Validation ⚠️ **CRITICAL**
**Status**: Awaiting user verification  
**What needs to happen**:
- [ ] User verifies Vercel dashboard
  - Confirm Production Branch = `upload/openclaw`
  - Confirm latest deployment (commit 5e75f57) status
  - If Failed: Pull build logs and fix
  - If Ready: Test routes
- [ ] Test deployed routes (hard refresh to confirm SPA)
  - [ ] `/` (root loads)
  - [ ] `/betting` (loads without 404)
  - [ ] `/match` (loads without 404)
- [ ] Confirm ToastContainer displays properly

### 2. Operator VPS Deployment
**Estimated Time**: 1-2 hours  
**Steps**:
```bash
# SSH into VPS
ssh -i ~/.ssh/key.pem ubuntu@<VPS_IP>

# Clone repo
git clone git@github.com:open-web-academy/palenque-arena-ai.git
cd palenque-arena-ai/packages/operator

# Install dependencies
npm install

# Set env vars
cat > .env << EOF
RPC_URL=https://rpc.monad.xyz
OPERATOR_PRIVATE_KEY=<YOUR_KEY>
FACTORY_ADDRESS=0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3
PAL_TOKEN_ADDRESS=0x0dfBc608339aeA55F5EEedE640335dAC062a7777
MATCH_INTERVAL=60
ROOSTERS=["Firebird","Shadow","Titanium","Plasma","Nexus","Void","Storm","Inferno"]
EOF

# Install pm2
npm i -g pm2

# Start operator
npm run build
pm2 start dist/index.js --name "palenque-operator"

# Set up systemd for auto-restart on reboot
pm2 save
pm2 startup
EOF
```

### 3. Full E2E Test (Mainnet)
**What to test**:
```bash
cd packages/operator
npx ts-node src/e2e-test.ts
```

**Expected flow**:
- Operator creates a match (rooster A vs rooster B)
- Match transitions: Open (60s) → Closed (commit) → Settled (reveal)
- Verify final state = 2 (Settled)
- Expected duration: ~90-120 seconds

### 4. User Acceptance Testing (UAT)
**Scenarios**:
- [ ] Connect wallet (via ConnectKit)
- [ ] View live match on home page
- [ ] Place a bet (native MON)
  - Verify toast success message with TX hash
  - Verify TX confirms on explorer
  - Verify bet appears in MatchHistory
- [ ] Boost a bet (PAL token)
  - Step 1: Approve PAL allowance → confirm toast
  - Step 2: Boost match → confirm toast
  - Verify TX on explorer
- [ ] Watch match settle
  - Match transitions from Open → Closed → Settled (watch for event listener)
  - Verify toast notification for settlement
- [ ] Claim payout (if user won)
  - Click "Claim Payout" button
  - Confirm TX with toast
  - Verify MON received

### 5. Performance & Load Testing
- [ ] Operator can handle >100 concurrent bets per match
- [ ] RPC rate limits: No excessive polling (use event listeners first)
- [ ] Frontend responsiveness on low bandwidth
- [ ] Verify no memory leaks in polling/subscriptions

### 6. Security Review
- [ ] Operator private key not exposed in git
- [ ] Environment variables in VPS use systemd service
- [ ] HTTPS enforced on Vercel (automatic)
- [ ] Contract audit status (optional but recommended)

---

## 📋 TECHNICAL VALIDATION

### Smart Contracts ✓
- Match states: 0 (Open), 1 (Closed), 2 (Settled)
- MON betting: Direct value transfer
- PAL boosting: ERC20 transferFrom with approval
- Randomness: Commit-reveal (no oracle dependency)
- Payouts: Pro-rata distribution

### Operator ✓
- Interval: 60s match creation
- Retry logic: 3 attempts, exponential backoff (1s → 2s → 4s)
- Logging: All actions logged with timestamps
- Config: Rooster pool, intervals, addresses

### Frontend ✓
- Wagmi hooks: `useWriteContract`, `useWaitForTransactionReceipt`
- Event listeners: `watchContractEvent` for MatchCreated/Settled
- Component pattern: Functional + React hooks
- Toast notifications: Success/error feedback
- SPA routing: React Router with fallback to index.html

---

## 🚨 CRITICAL ISSUES TO WATCH

### 1. Vercel SPA Rewrite ⚠️
**Issue**: Routes like `/betting`, `/match` return 404 if not properly configured  
**Solution**: vercel.json with rewrite rule (✓ ADDED)  
**Validation**: Test hard refresh on all routes

### 2. Event Listener Fallback
**Issue**: If WebSocket disconnects, no real-time updates  
**Solution**: useMatch polling + event listeners work together  
**Current**: useMatch has fallback to polling

### 3. Operator Downtime
**Issue**: Single operator instance; if it crashes, matches stop  
**Solution**: pm2 auto-restart + systemd  
**Monitoring**: `pm2 monit` or external monitoring service

### 4. Gas Costs
**Issue**: Operator pays gas for commit + reveal  
**Solution**: Operator wallet must have sufficient MON for gas  
**Current**: Not validated; ensure sufficient balance before launch

### 5. RPC Rate Limits
**Issue**: If Monad RPC is rate-limited, polling breaks  
**Solution**: Event listeners reduce RPC calls by ~80%  
**Current**: useMatchEvents implemented

---

## 📦 DEPLOYMENT TIMELINE

| Task | Est. Time | Status |
|------|-----------|--------|
| Verify Vercel deployment | 15 min | ⏳ Awaiting |
| Deploy operator to VPS | 1-2 hrs | ⏳ Pending |
| Run E2E test | 5 min | ⏳ Pending |
| UAT (betting, boosting, claim) | 30 min | ⏳ Pending |
| Performance testing | 30 min | ⏳ Pending |
| Security review | 1 hr | ⏳ Pending |
| **Total** | **4-5 hrs** | |

**Go-Live**: ~5-6 hours from now (if all tasks executed sequentially)

---

## 📝 FINAL SUBMISSION CHECKLIST

Before submitting to moltiverse.dev:

- [ ] Vercel deployment is live and routes work
- [ ] Operator running on VPS (pm2)
- [ ] E2E test passes (match creates, settles, payouts available)
- [ ] UAT complete (tested betting, boosting, claiming)
- [ ] No console errors in browser
- [ ] Operator logs clean (no persistent errors)
- [ ] Gas balance sufficient on operator wallet
- [ ] All env vars set correctly on VPS
- [ ] DEPLOYMENT.md is up-to-date

**Once complete**: Submit to moltiverse.dev with deployment URL + repository link

---

## 🎯 SUCCESS CRITERIA

✅ **System is production-ready when**:
1. Vercel live with working SPA routes
2. Operator creates matches every 60s
3. Full match lifecycle works: Open → Closed → Settled
4. Users can bet, boost, and claim payouts
5. All notifications show correctly
6. E2E test passes consistently
7. No critical errors in logs

**Estimated completion**: Feb 15, 2026 ✅
