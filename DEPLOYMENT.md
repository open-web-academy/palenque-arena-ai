# Palenque Arena - Complete Deployment Runbook

## System Architecture

**Operator:** Automated match creation + settlement (Node.js)  
**Contracts:** Monad Mainnet (Chain 143)  
**Frontend:** React + Viem (real-time polling)

---

## PHASE 3A: OPERATOR SETUP

### 1. Environment

```bash
cd packages/operator
cp .env.example .env
```

Fill `.env`:
```
RPC_URL=https://rpc.monad.xyz
OPERATOR_PRIVATE_KEY=0x<your-operator-key>
FACTORY_ADDRESS=0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3
PAL_TOKEN_ADDRESS=0x0dfBc608339aeA55F5EEedE640335dAC062a7777
MATCH_INTERVAL=60
BETTING_WINDOW=60
AUTO_SETTLE_DELAY=5
ROOSTERS=Phoenix,Dragon,Cyber-Falcon,Neon-Hawk
LOG_LEVEL=info
```

### 2. Build & Run

```bash
npm install
npm run build
npm start
```

**Expected output:**
```
[ISO-TIME] [INFO] Initializing operator...
[ISO-TIME] [INFO] Operator started. Tick every 60s
[ISO-TIME] [INFO] Creating match: Phoenix vs Dragon
[ISO-TIME] [INFO] Match created: tx 0x...
```

### 3. Verify On-Chain

Open explorer: `https://monadscan.com`
- Search Factory: `0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3`
- See matches created every 60s

---

## PHASE 3B: FRONTEND SETUP

### 1. Environment

```bash
cd packages/web
cp .env.example .env
```

Fill `.env`:
```
REACT_APP_RPC_URL=https://rpc.monad.xyz
REACT_APP_FACTORY_ADDRESS=0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3
REACT_APP_PAL_TOKEN_ADDRESS=0x0dfBc608339aeA55F5EEedE640335dAC062a7777
```

### 2. Build & Run

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

**Expected behavior:**
- MatchCard shows current fight (Phoenix vs Dragon)
- Countdown timer updates every second
- Live odds display
- When match settles → new match appears automatically (no refresh)

---

## PHASE 3C: END-TO-END TEST

### Timeline

**T+0s:** Operator creates match A (Open)  
**T+5s:** Frontend shows match A, timer counting down  
**T+30s:** User bets/boosts  
**T+60s:** Operator closes bets (state → Closed)  
**T+61s:** Operator commits randomness  
**T+66s:** Operator reveals & settles (state → Settled, winner determined)  
**T+67s:** Frontend shows match A settled + winner  
**T+120s:** Operator creates match B automatically

---

## TROUBLESHOOTING

### Operator won't start
```
Error: OPERATOR_PRIVATE_KEY missing
```
→ Check `.env` file filled correctly

### Operator can't create match
```
Error: Failed to create match: Error: insufficient balance
```
→ Send ~10 MON to operator wallet

### Frontend shows "No active match"
```
→ Operator might be in reveal phase (wait 5s)
→ Check RPC_URL is correct
→ Check FACTORY_ADDRESS matches explorer
```

---

## DEFINITIONS OF DONE

✅ Operator creates matches automatically at interval  
✅ Bets open/close correctly  
✅ Commit-reveal runs, match settles  
✅ Web UI updates without manual refresh  
✅ Match history visible  
✅ Deployed & tested end-to-end

---

## DEPLOY TO PRODUCTION

### Operator (VPS/Server)

```bash
# Install pm2
npm install -g pm2

# Start operator
pm2 start "npm start" --name palenque-operator
pm2 save
pm2 startup
```

### Frontend (Vercel)

```bash
# Push to GitHub
git push origin main

# Deploy via Vercel dashboard
# Settings → Environment Variables → Add from .env
# Deploy button
```

URL: `https://palenque-arena.vercel.app`

---

## MONITORING

Operator logs:
```bash
pm2 logs palenque-operator
```

Real-time match status:
```bash
cast call 0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3 "getLastMatch()" --rpc-url https://rpc.monad.xyz
```

Explorer: https://monadscan.com
