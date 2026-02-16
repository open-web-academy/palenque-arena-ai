# Local Deploy & How to Test Each Game Mode

Commands to deploy contracts (local/mainnet) and how users interact with **Classic Arena**, **Elemental**, and **Ruleta**.

---

## Prerequisites

- **Node.js** 18+
- **Foundry** (Forge) for contract deployment: [getfoundry.sh](https://getfoundry.sh)
- **Wallet** with MON on Monad (mainnet or testnet) for gas; same wallet can be the operator and deployer
- **PAL** token address (for Classic Arena boosts); already deployed on Monad or deploy your own

---

## 1. Deploy Contracts (run from repo root)

All game modes need the **Classic Arena** (MatchFactory) first. Elemental and Ruleta are optional.

### 1.1 Classic Arena (MatchFactory + PAL)

Set env and deploy from `packages/contracts`:

```bash
cd packages/contracts
```

Create `.env` (or export in shell):

```bash
# Your operator/deployer wallet (will be allowed to create matches)
export OPERATOR_ADDRESS=0xYourEoaAddress
# PAL token (e.g. Monad mainnet)
export PAL_TOKEN_ADDRESS=0x0dfBc608339aeA55F5EEedE640335dAC062a7777
```

Deploy (use mainnet RPC or testnet; replace with your RPC and key):

```bash
# Mainnet example
export RPC_URL=https://rpc.monad.xyz
export DEPLOYER_PRIVATE_KEY=0xYourPrivateKey

forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --private-key $DEPLOYER_PRIVATE_KEY
```

Or use `DeployProxy.s.sol` (same args):

```bash
forge script script/DeployProxy.s.sol --rpc-url $RPC_URL --broadcast --private-key $DEPLOYER_PRIVATE_KEY
```

**Save the printed Factory proxy address** (e.g. `0x...`) for operator and web.

---

### 1.2 Elemental (optional)

Same `OPERATOR_ADDRESS` (operator wallet):

```bash
cd packages/contracts
export OPERATOR_ADDRESS=0xYourOperatorAddress
export RPC_URL=https://rpc.monad.xyz
export DEPLOYER_PRIVATE_KEY=0xYourPrivateKey

forge script script/DeployElemental.s.sol --rpc-url $RPC_URL --broadcast --private-key $DEPLOYER_PRIVATE_KEY
```

Save the **ElementalFactory proxy** address.

---

### 1.3 Ruleta (optional)

```bash
cd packages/contracts
export OPERATOR_ADDRESS=0xYourOperatorAddress
export RPC_URL=https://rpc.monad.xyz
export DEPLOYER_PRIVATE_KEY=0xYourPrivateKey

forge script script/DeployRuleta.s.sol --rpc-url $RPC_URL --broadcast --private-key $DEPLOYER_PRIVATE_KEY
```

Save the **Ruleta proxy** address.

---

## 2. Configure Operator

```bash
cd packages/operator
cp .env.example .env
```

Edit `packages/operator/.env`:

```env
RPC_URL=https://rpc.monad.xyz
OPERATOR_PRIVATE_KEY=0x...   # same as OPERATOR_ADDRESS used in deploy
FACTORY_ADDRESS=0x...       # MatchFactory proxy from step 1.1
PAL_TOKEN_ADDRESS=0x...      # PAL token

# Optional: enable Elemental and Ruleta
ELEMENTAL_FACTORY_ADDRESS=0x...   # from step 1.2 (omit if not deployed)
RULETA_ADDRESS=0x...              # from step 1.3 (omit if not deployed)

TICK_INTERVAL_SEC=10
MATCH_INTERVAL=60
AUTO_SETTLE_DELAY=5
ROOSTERS=Phoenix,Dragon,Cyber-Falcon,Neon-Hawk
LOG_LEVEL=info
```

Run:

```bash
npm install
npm run build
npm start
```

You should see logs like: `[ARENA] Match 0x... state=OPEN` and match creation.

---

## 3. Configure Web

```bash
cd packages/web
cp .env.example .env
```

Edit `packages/web/.env`:

```env
VITE_RPC_URL=https://rpc.monad.xyz
VITE_FACTORY_ADDRESS=0x...       # MatchFactory proxy
VITE_PAL_TOKEN_ADDRESS=0x...     # PAL token

# Optional (only if you deployed Elemental / Ruleta)
VITE_ELEMENTAL_FACTORY_ADDRESS=0x...
VITE_RULETA_ADDRESS=0x...

VITE_WALLETCONNECT_PROJECT_ID=   # optional, for ConnectKit
```

Run:

```bash
npm install
npm run dev
```

Open **http://localhost:5173** (or the port Vite prints).

---

## 4. Quick Command Summary

| Step | Where | Command |
|------|--------|---------|
| Deploy Classic Arena | `packages/contracts` | `forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --private-key $DEPLOYER_PRIVATE_KEY` |
| Deploy Elemental | `packages/contracts` | `forge script script/DeployElemental.s.sol --rpc-url $RPC_URL --broadcast --private-key $DEPLOYER_PRIVATE_KEY` |
| Deploy Ruleta | `packages/contracts` | `forge script script/DeployRuleta.s.sol --rpc-url $RPC_URL --broadcast --private-key $DEPLOYER_PRIVATE_KEY` |
| Run operator | `packages/operator` | `npm install && npm run build && npm start` |
| Run web | `packages/web` | `npm install && npm run dev` |

---

## 5. How the User Interacts With Each Mode

### Classic Arena

1. Open the app → Hub → **Classic Arena** (or **Game Modes → Classic Arena**).
2. Connect wallet (Monad network, MON for bets).
3. Wait for a match in state **OPEN** (badge on the card). If you see "Betting closed", wait or tap **Retry** until the next match is OPEN.
4. Enter MON amount and tap **Bet on [Rooster A]** or **Bet on [Rooster B]**; confirm in wallet.
5. (Optional) **Boost** with PAL on A or B (approve PAL once, then Boost).
6. When the countdown ends, the operator closes bets, then commits and reveals; the match goes **SETTLED** and a winner is shown.
7. If you won, tap **Claim Winnings** and confirm; you receive your share of the pool in MON.

---

### Elemental

1. Hub → **Elemental** (or Game Modes → Elemental).
2. Connect wallet (MON).
3. When a round is **OPEN**, choose **Fire**, **Water**, **Air**, or **Earth** and enter MON amount; tap **Bet on [element]** and confirm.
4. When the round closes, one element wins at random; if you bet on that element, your share is proportional to the pool.
5. Tap **Claim Winnings** to receive MON; the operator starts the next round.

*(If `VITE_ELEMENTAL_FACTORY_ADDRESS` is not set, the page shows a config message and you cannot play.)*

---

### Ruleta

1. Hub → **Ruleta** (or Game Modes → Ruleta).
2. Connect wallet (MON).
3. When a round is **OPEN**, pick a symbol (Jaguar, Eagle, Serpent, Fire, Skull), enter MON amount, tap **Place Bet** and confirm.
4. When the round closes, the operator resolves the wheel; if your symbol wins, you get a share of the pool.
5. Tap **Claim Winnings** to receive MON; the operator starts the next round.

*(If `VITE_RULETA_ADDRESS` is not set, the page shows a config message and you cannot play.)*

---

## 6. Troubleshooting

- **Operator:** "OPERATOR_PRIVATE_KEY missing" → set it in `packages/operator/.env`. It must be the same address as `OPERATOR_ADDRESS` used when deploying.
- **Operator:** "Only operator" / create match fails → the factory’s `operator` is set at deploy time; use that wallet’s key in the operator.
- **Web: "No active match"** → Ensure operator is running; wait or use **Retry**. Check `VITE_FACTORY_ADDRESS` and `VITE_RPC_URL`.
- **Web: "Betting closed" and never OPEN** → Operator must be running and ticking every `TICK_INTERVAL_SEC`; new matches stay OPEN for `MATCH_INTERVAL` seconds. Check operator logs.
- **RPC 429** → Use an RPC URL with an API key in both operator and web `.env`.
