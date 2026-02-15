# 🐓 Palenque Arena - Complete Project Plan

**Created**: Feb 15, 2026  
**Status**: 85% Complete  
**Go-Live Target**: Feb 15, 2026  
**Submission**: moltiverse.dev

---

## 📋 EXECUTIVE SUMMARY

**Palenque Arena** is a fully automated, real-time rooster betting dapp on **Monad blockchain** (Chain 143).

**Key Features**:
- ✅ Matches created every 60 seconds (fully automated)
- ✅ Native MON betting (no wrapping required)
- ✅ PAL token boosting (ERC20 with approval flow)
- ✅ Commit-reveal randomness (no oracle dependency)
- ✅ Pro-rata payouts (winners split pool equally)
- ✅ Web UI with real-time updates (wagmi + viem)
- ✅ Operator scheduler (Node.js backend)

**Target Users**: Crypto traders/gamblers wanting fast-paced rooster betting

---

## 🎯 PROJECT GOALS

### Primary Goals
1. **Launch a working betting dapp** on Monad mainnet by Feb 15, 2026
2. **Automate match creation** without manual intervention (60s cycle)
3. **Enable real-money betting** with native MON + PAL token
4. **Provide seamless UX** with instant updates and notifications
5. **Submit to Moltiverse hackathon** and compete for prizes

### Success Metrics
- ✅ Web frontend live on Vercel
- ✅ Operator running on VPS (creating matches continuously)
- ✅ Smart contracts deployed and functional on mainnet
- ✅ E2E test passes (match creates → settles → payouts work)
- ✅ Users can bet, boost, and claim payouts
- ✅ Zero critical bugs on launch day

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────────────────────────────┐
│                    PALENQUE ARENA SYSTEM                     │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────┐         ┌────────────────────────┐  │
│  │   FRONTEND (Web)    │◄───────►│  SMART CONTRACTS       │  │
│  │                     │         │  (Monad Mainnet 143)   │  │
│  │ • React + Wagmi     │         │                        │  │
│  │ • Viem client       │         │ • MatchFactory.sol     │  │
│  │ • Real-time events  │         │ • Match.sol (instances)│  │
│  │ • Toast notify      │         │ • PAL token (ERC20)    │  │
│  └─────────────────────┘         └────────────────────────┘  │
│         ▲                                   ▲                  │
│         │ wagmi hooks                       │ read/write       │
│         │ (useWriteContract)                │ contract calls   │
│         │                                   │                  │
│  ┌──────┴───────────────────────────────────┴──────────────┐  │
│  │                    OPERATOR BACKEND                     │  │
│  │                   (Node.js on VPS)                      │  │
│  │                                                          │  │
│  │ • State machine (Open → Closed → Settled)              │  │
│  │ • Match creation (every 60s)                           │  │
│  │ • Commit-reveal randomness                             │  │
│  │ • Error handling + retry logic                         │  │
│  │ • Logging + monitoring                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
└──────────────────────────────────────────────────────────────┘

DATA FLOW:
  User → Frontend → Wagmi → Contract → Event → Frontend (updated)
  Operator → Contract (state machine) → Event → Frontend (real-time)
```

---

## 🔧 TECH STACK

| Layer | Tech | Purpose |
|-------|------|---------|
| **Smart Contracts** | Solidity + Foundry | Match logic, betting, randomness |
| **Blockchain** | Monad (Chain 143) | Execution environment |
| **Backend** | Node.js + TypeScript | Operator scheduler |
| **Frontend** | React + TypeScript | User interface |
| **Web3 Library** | Wagmi + Viem | Contract interaction |
| **Wallet** | ConnectKit | Wallet connection UX |
| **Frontend Deploy** | Vercel | CI/CD + hosting |
| **Backend Deploy** | VPS + PM2 | Operator hosting |
| **Database** | None | All state on-chain |

---

## 📁 PROJECT STRUCTURE

```
palenque-arena-ai/
├── packages/
│   ├── contracts/
│   │   └── src/
│   │       ├── Match.sol              # Match contract (betting, boosting, settlement)
│   │       ├── MatchFactory.sol       # Factory to create matches
│   │       └── PALToken.sol           # ERC20 token (if needed)
│   │
│   ├── web/
│   │   ├── src/
│   │   │   ├── App.tsx                # Main app (WagmiConfig, components)
│   │   │   ├── hooks/
│   │   │   │   ├── useMatch.ts        # Polling + match state
│   │   │   │   ├── useMatchEvents.ts  # Event listeners
│   │   │   │   └── useToast.ts        # Notifications
│   │   │   ├── components/
│   │   │   │   ├── MatchCard.tsx      # Match display
│   │   │   │   ├── BetForm.tsx        # Native MON betting
│   │   │   │   ├── BoostForm.tsx      # PAL boosting (2-step)
│   │   │   │   ├── PayoutClaim.tsx    # Claim winnings
│   │   │   │   ├── MatchHistory.tsx   # Last 10 matches
│   │   │   │   ├── CountdownTimer.tsx # Time to close
│   │   │   │   ├── LiveOdds.tsx       # Betting odds
│   │   │   │   └── ToastContainer.tsx # Notification UI
│   │   │   └── context/
│   │   │       └── ToastContext.tsx   # Toast provider
│   │   ├── vercel.json                # SPA rewrite config
│   │   └── package.json
│   │
│   └── operator/
│       ├── src/
│       │   ├── index.ts               # Entry point (main loop)
│       │   ├── operator.ts            # State machine logic
│       │   ├── contract.ts            # Contract interactions
│       │   ├── config.ts              # Configuration (rooster pool, etc)
│       │   ├── e2e-test.ts            # End-to-end test script
│       │   └── utils/
│       │       ├── logger.ts          # Logging
│       │       ├── randomness.ts      # Commit-reveal logic
│       │       └── retry.ts           # Exponential backoff
│       ├── .env                       # Environment variables
│       └── package.json
│
├── DEPLOYMENT.md                      # Deployment runbook
├── PRODUCTION_CHECKLIST.md            # Go-live checklist
├── PROJECT_PLAN.md                    # This file
└── README.md                          # Getting started
```

---

## 🔄 MATCH LIFECYCLE (The Core Loop)

### **State Diagram**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STATE 0: OPEN                                      │
│  ├─ Users can bet MON                               │
│  ├─ Users can boost with PAL                        │
│  ├─ Duration: 60 seconds (configurable)             │
│  └─ Operator watches for closeTime                  │
│       │                                              │
│       └──[60s passes]──►  closeBets() TX            │
│                                │                     │
│                                ▼                     │
│  STATE 1: CLOSED                                    │
│  ├─ No more bets allowed                            │
│  ├─ Operator commits randomness hash                │
│  │  ├─ generateSeed() → random 256-bit number       │
│  │  └─ commitHash = keccak256(seed, operator)       │
│  ├─ commit(commitHash) TX                           │
│  └─ Wait autoSettleDelay (~10s)                     │
│       │                                              │
│       └──[10s delay]──►  reveal(seed) TX            │
│                                │                     │
│                                ▼                     │
│  STATE 2: SETTLED                                   │
│  ├─ Winner determined (A or B)                      │
│  ├─ Payouts calculated (pro-rata)                   │
│  ├─ Users can claimPayout()                         │
│  └─ Operator creates next match                     │
│       │                                              │
│       └──[immediately]──► createMatch() TX          │
│                                │                     │
│                                ▼                     │
│  RETURN TO STATE 0 (OPEN)                           │
│                                                     │
└─────────────────────────────────────────────────────┘

TIMING:
- Total cycle: ~90-120 seconds
- Open: 60s (users bet)
- Commit delay: 0s (immediate)
- Reveal delay: 10s (settle)
- Creation: <1s (deploy next)
```

---

## 💰 BETTING MECHANICS

### **Native MON Betting**
```
User Action: placeBet(roosterChoice, amount)

Input:
- roosterChoice: 0 (Rooster A) or 1 (Rooster B)
- amount: native MON (value sent in TX)

Execution:
1. Check match state == 0 (OPEN)
2. Add amount to betsA or betsB
3. Store user address → amount mapping
4. Emit BetPlaced event

Payout Logic (when winner revealed):
- totalPool = betsA + betsB
- winnerBets = betsA (if A won) or betsB (if B won)
- userPayout = (userBet / winnerBets) * totalPool
  (pro-rata: share winnings equally among winners)
```

### **PAL Token Boosting**
```
User Action: boost(roosterChoice, amount)

Input:
- roosterChoice: 0 or 1
- amount: PAL tokens

Pre-requisites:
1. User approves Match contract for ≥amount PAL
2. User has ≥amount PAL in wallet

Execution:
1. TransferFrom PAL from user to Match contract
2. Add amount to boostPoolA or boostPoolB
3. Boosts affect odds (not payout pool)

Odds Calculation:
- rawOdds_A = betsA / (betsA + betsB)
- boostedOdds_A = rawOdds_A * sqrt(boostPoolA / boostPoolB)
- (Diminishing returns: quadratic boost)

Payout Pool:
- MON payout only from bets (betsA + betsB)
- PAL is burned/kept by protocol (not returned)
```

---

## 🎮 USER FLOWS

### **Flow 1: New User Placing Bet**

```
1. Open palenque-arena.vercel.app
   └─ See current match + countdown

2. Click "Connect Wallet"
   └─ MetaMask / WalletConnect popup
   └─ Approve connection

3. View match details
   └─ "Firebird vs Shadow"
   └─ Current odds: 45% vs 55%
   └─ Timer: 32 seconds left

4. Enter bet amount (e.g., 5 MON)
   └─ Select rooster (Firebird)
   └─ Click "Place Bet"

5. Wallet asks for confirmation
   └─ User reviews TX details
   └─ Confirms

6. Transaction processing
   └─ Toast: "Pending confirmation..."
   └─ Frontend waits for block confirmation

7. Bet confirmed
   └─ Toast: "✅ Bet placed! TX: 0x123abc..."
   └─ BetForm updates showing bet received
   └─ MatchHistory shows new entry

8. Wait for match to close
   └─ Countdown reaches 0
   └─ Toast: "Match closed. Awaiting result..."
   └─ BetForm disappears (can't bet anymore)

9. Match settles (~10s later)
   └─ Toast: "✅ Firebird wins!"
   └─ PayoutClaim appears (if user wins)

10. User claims payout
    └─ Click "Claim Payout"
    └─ TX confirms
    └─ Toast: "✅ Payout claimed! 8.5 MON received"
    └─ User balance increases
```

### **Flow 2: Boosting a Bet**

```
1. User clicks "Boost Firebird"

2. Two-step process shown:
   ├─ Step 1: Approve PAL
   └─ Step 2: Boost match

3. Step 1: Approve PAL
   └─ BoostForm shows "Approve PAL"
   └─ Input: boost amount (e.g., 100 PAL)
   └─ Click "Approve"
   └─ Wallet TX: "Approve 100 PAL spending"
   └─ User confirms
   └─ Toast: "✅ PAL approved"
   └─ UI moves to Step 2

4. Step 2: Boost Match
   └─ Click "Boost Firebird" (Step 2 button now active)
   └─ Wallet TX: "Send 100 PAL to Match"
   └─ User confirms
   └─ Toast: "✅ Boost confirmed! TX: 0x456def..."
   └─ boostPoolA increases by 100 PAL
   └─ Odds recalculated in real-time
   └─ LiveOdds component updates
```

### **Flow 3: Checking Match History**

```
1. MatchHistory auto-loads in background
   └─ Queries last 10 matches from factory

2. For each match:
   └─ Read state + rooster names
   └─ Read final bets
   └─ Determine winner
   └─ Calculate total pool

3. Display:
   └─ "Firebird vs Shadow"
   └─ "Settled 30 minutes ago"
   └─ "Total pool: 50 MON"
   └─ "Winner: Firebird"
   └─ "2 winners, 8 losers"

4. Auto-refresh every 30s
   └─ Checks for new settled matches
   └─ Updates display
```

---

## 🤖 OPERATOR BEHAVIOR

### **Main Loop (runs continuously)**

```typescript
while (true) {
  await operator.tick()  // ~1 second
  
  // Inside tick():
  const lastMatch = await factory.lastMatch()
  const matchState = await match.state()
  const now = Math.floor(Date.now() / 1000)
  
  // STATE MACHINE:
  
  if (state === 0) { // OPEN
    if (now >= closeTime) {
      await closeBets(match)  // → state 1
    }
  }
  
  else if (state === 1) { // CLOSED
    if (!commitSeed) {
      seed = generateSeed()
      hash = keccak256(seed, operator)
      await commit(match, hash)  // Stores commitment
    } else {
      await sleep(autoSettleDelay)
      await reveal(match, seed)  // → state 2
    }
  }
  
  else if (state === 2) { // SETTLED
    commitSeed = null  // Reset for next match
    await createMatch()  // Deploy new Match instance
  }
  
  catch (error) {
    log(`Error: ${error}`)  // Continue on next tick
  }
}
```

### **Error Handling**

Every transaction has retry logic:
```typescript
withRetry(async () => {
  return await contractCall()
}, {
  maxAttempts: 3,
  baseDelayMs: 1000,  // 1s
  // Subsequent: 2s, 4s
  name: "transaction-name"
})
```

---

## 🌐 FRONTEND COMPONENT TREE

```
App.tsx (Wagmi + ConnectKit provider)
│
├─ AppContent
│  ├─ MatchCard
│  │  └─ Shows: roosterA, roosterB, bets, boosts
│  │
│  ├─ CountdownTimer
│  │  └─ Shows: seconds until close
│  │
│  ├─ LiveOdds
│  │  └─ Shows: probability A%, probability B%
│  │
│  ├─ BetForm (visible only when state === 0)
│  │  ├─ Input: amount in MON
│  │  ├─ Select: rooster choice
│  │  └─ Button: "Place Bet"
│  │
│  ├─ BoostForm (visible only when state === 0)
│  │  ├─ Step 1: Approve PAL
│  │  ├─ Step 2: Boost match
│  │  └─ Shows: current boost amounts
│  │
│  ├─ PayoutClaim (visible only when state === 2)
│  │  ├─ Shows: "You won! 12.5 MON"
│  │  └─ Button: "Claim Payout"
│  │
│  └─ MatchHistory
│     ├─ Lists: last 10 matches
│     └─ Shows: winner, total pool, rooster names
│
└─ ToastContainer
   └─ Shows: success/error notifications
```

---

## 🧪 TESTING STRATEGY

### **Unit Tests** (Per component)
```
BetForm:
- Input validation (amount > 0)
- Rooster selection (A or B)
- Submit button enabled only with valid input

BoostForm:
- Two-step approval flow
- Allowance checking
- Disabled when state !== 0

Operator:
- State transitions (0 → 1 → 2)
- Timing (60s cycle)
- Randomness (seed generation, commitment verification)
```

### **Integration Tests** (Component + Contract)
```
Test: Place bet → confirm → read state
- User sends TX
- Contract receives MON
- betsA increases
- Event fires
- Frontend updates
```

### **E2E Test** (Full match lifecycle)
```
Run: npx ts-node src/e2e-test.ts

1. Operator creates match
   └─ Verify: Match deployed, state === 0

2. Wait for closeTime
   └─ Verify: Operator calls closeBets(), state === 1

3. Wait for reveal delay
   └─ Verify: Operator calls reveal(), state === 2

4. Verify payout calculation
   └─ Check: Winner can claimPayout()

Expected duration: ~90-120 seconds
```

### **User Acceptance Testing (UAT)**
```
Scenarios:
1. Connect wallet
2. Place bet on rooster A (5 MON)
3. Boost rooster A (100 PAL)
4. Watch match close
5. Watch match settle
6. Claim payout (if won)
7. Repeat with different rooster

Success: All TXs confirm, all notifications show
```

---

## 📊 DEPLOYMENT ARCHITECTURE

### **Frontend (Vercel)**

```
Repository: upload/openclaw branch
Build command: npm run build (in web/)
Output directory: dist/
Environment variables:
  REACT_APP_RPC_URL=https://rpc.monad.xyz
  REACT_APP_FACTORY_ADDRESS=0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3
  REACT_APP_PAL_TOKEN_ADDRESS=0x0dfBc608339aeA55F5EEedE640335dAC062a7777

vercel.json:
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

URL: https://palenque-arena.vercel.app
Auto-deploy: On push to upload/openclaw
```

### **Operator (VPS)**

```
Server: Linux VPS (t2.micro or similar)
Software:
  - Node.js 18+
  - PM2 (process manager)
  - git

Setup:
1. Clone repo
2. Set .env (RPC_URL, OPERATOR_PRIVATE_KEY, etc)
3. npm install && npm run build
4. pm2 start dist/index.js --name "palenque-operator"
5. pm2 save && pm2 startup  (auto-restart on reboot)

Monitoring:
  pm2 monit  (real-time stats)
  pm2 logs   (live logs)
  pm2 ps     (running processes)

Auto-restart: If operator crashes, pm2 restarts it immediately
```

### **Smart Contracts (Monad Mainnet)**

```
Network: Monad Chain 143
RPC: https://rpc.monad.xyz

Deployed:
- Factory: 0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3 (UUPS proxy)
- Operator: 0x21BC8b95e5F03aFCb609CCCbE9B974F62Af0cFe3
- PAL Token: 0x0dfBc608339aeA55F5EEedE640335dAC062a7777

No additional deployment needed (already live)
```

---

## 📅 PROJECT TIMELINE

### **Phase 1: Smart Contracts** ✅ COMPLETE
- [x] Design Match.sol (betting, boosting, settlement)
- [x] Design MatchFactory.sol
- [x] Implement commit-reveal randomness
- [x] Deploy UUPS proxies
- [x] Test on mainnet
- **Status**: Deployed and live

### **Phase 2: Frontend** ✅ COMPLETE
- [x] React app setup + Wagmi config
- [x] Connect wallet (ConnectKit)
- [x] BetForm component
- [x] BoostForm component
- [x] PayoutClaim component
- [x] MatchHistory component
- [x] useMatch hook (polling)
- [x] useMatchEvents hook (real-time)
- [x] Toast notifications
- [x] App.tsx integration
- **Status**: Ready, needs Vercel verification

### **Phase 3: Backend Operator** ✅ COMPLETE
- [x] State machine logic
- [x] Match creation (60s interval)
- [x] Commit-reveal implementation
- [x] Error handling + retry logic
- [x] Configuration system
- [x] Logging
- [x] E2E test script
- **Status**: Built, needs VPS deployment

### **Phase 4: Testing & QA** ⏳ IN PROGRESS
- [ ] E2E test execution (run locally)
- [ ] User acceptance testing
- [ ] Performance testing
- [ ] Security review (optional)
- **Status**: Scripts ready, needs execution

### **Phase 5: Deployment** ⏳ PENDING
- [ ] Verify Vercel deployment (frontend live)
- [ ] Deploy operator to VPS
- [ ] Monitor first 24h
- [ ] Submit to moltiverse.dev
- **Status**: ~4-5 hours remaining

---

## ✅ SUCCESS CRITERIA (Go-Live Checklist)

### **Frontend**
- [ ] Vercel deployment live
- [ ] Root URL loads without errors
- [ ] React Router routes work (hard refresh = no 404)
- [ ] Wallet connection works
- [ ] No console errors

### **Operator**
- [ ] Running on VPS with pm2
- [ ] Creating matches every 60s
- [ ] Logs show: match creation, commit, reveal, settlement
- [ ] No critical errors
- [ ] Auto-restarts on crash

### **Contracts**
- [ ] Deployed on Monad mainnet (chain 143)
- [ ] Factory: 0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3
- [ ] Operating normally (no failed TXs)

### **E2E**
- [ ] E2E test passes (match → settle → payout)
- [ ] Full cycle completes in <2 minutes
- [ ] No state transition failures

### **User Testing**
- [ ] User can connect wallet
- [ ] User can place bet (5 MON)
- [ ] User can boost (100 PAL)
- [ ] Bet/boost TXs confirm on explorer
- [ ] Toast notifications show
- [ ] Match settles correctly
- [ ] User can claim payout
- [ ] Payout amount is correct

### **Documentation**
- [ ] DEPLOYMENT.md updated
- [ ] PRODUCTION_CHECKLIST.md complete
- [ ] README.md with setup instructions
- [ ] Code comments for complex logic

---

## 🚨 KNOWN ISSUES & SOLUTIONS

| Issue | Severity | Solution |
|-------|----------|----------|
| Vercel SPA routing (404 on routes) | 🔴 CRITICAL | vercel.json rewrite rule (✅ added) |
| Operator not deployed | 🔴 CRITICAL | Deploy to VPS with pm2 |
| No user testing | 🟠 HIGH | UAT with real MON/PAL |
| No loading states in forms | 🟡 MEDIUM | Add isPending spinners |
| No balance checking | 🟡 MEDIUM | Show "insufficient balance" |
| Single operator (SPOF) | 🟡 MEDIUM | Use pm2 + systemd auto-restart |
| RPC rate limiting | 🟡 MEDIUM | Event listeners reduce polling 80% |
| No contract audit | 🟢 LOW | Optional before mainnet |

---

## 💡 FUTURE IMPROVEMENTS

### **Short-term** (Post-launch)
- [ ] Add leaderboard (top bettors, luckiest roosters)
- [ ] Add user bet history (personal stats)
- [ ] Add seasonal rewards/battle pass
- [ ] Mobile responsive UI
- [ ] Dark/light theme toggle
- [ ] Sound effects for events

### **Medium-term**
- [ ] Add affiliate system (referral bonuses)
- [ ] Staking rewards for PAL holders
- [ ] Multi-language support
- [ ] Telegram bot for notifications
- [ ] Discord integration

### **Long-term**
- [ ] DAO governance (community decides roosters)
- [ ] NFT rooster avatars
- [ ] Cross-chain betting (layer 2s, other L1s)
- [ ] Perpetual rooster leagues (seasons, tournaments)
- [ ] Mobile app (iOS/Android)

---

## 📞 CONTACT & SUPPORT

**Repository**: https://github.com/open-web-academy/palenque-arena-ai  
**Submission**: https://moltiverse.dev  
**Network**: Monad Chain 143 (Mainnet)

**Key Contacts**:
- Owner: Giovas (@Giovassz)
- Developer: Assistant
- Smart Contracts: Deployed at addresses above

---

## 📋 QUICK REFERENCE

### **Important Addresses**

| Entity | Address |
|--------|---------|
| MatchFactory | 0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3 |
| Operator | 0x21BC8b95e5F03aFCb609CCCbE9B974F62Af0cFe3 |
| PAL Token | 0x0dfBc608339aeA55F5EEedE640335dAC062a7777 |

### **Key URLs**

| Service | URL |
|---------|-----|
| Frontend | https://palenque-arena.vercel.app |
| RPC | https://rpc.monad.xyz |
| Explorer | (TBD - Monad block explorer) |
| Repo | https://github.com/open-web-academy/palenque-arena-ai |

### **Important Files**

| File | Purpose |
|------|---------|
| packages/contracts/src/Match.sol | Betting contract |
| packages/web/src/App.tsx | Main UI |
| packages/operator/src/operator.ts | State machine |
| DEPLOYMENT.md | Deployment guide |
| PRODUCTION_CHECKLIST.md | Launch checklist |

### **Commands**

```bash
# Run frontend locally
cd packages/web && npm run dev

# Run operator locally
cd packages/operator && npx ts-node src/index.ts

# Run E2E test
cd packages/operator && npx ts-node src/e2e-test.ts

# Build for production
cd packages/web && npm run build
cd packages/operator && npm run build

# Deploy operator to VPS
ssh -i key.pem ubuntu@<IP>
npm install && npm run build
pm2 start dist/index.js --name "palenque-operator"
pm2 save && pm2 startup
```

---

**Last Updated**: Feb 15, 2026  
**Status**: 85% Complete  
**Next Step**: Verify Vercel → Deploy Operator → Submit to Moltiverse
