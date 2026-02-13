# 🐓 Palenque Arena: Cyber Rooster League on Monad

**MVP: Betting + Boosting + Verifiable Randomness on Monad Testnet**

## Overview

Palenque Arena is a fully on-chain arcade-style rooster battle dapp where users:
- **Bet** native MON on rooster matchups (A vs B)
- **Boost** their chosen rooster with PAL tokens (diminishing returns)
- **Win** payouts based on verified randomness (commit-reveal)

---

## 🎯 Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Smart Contracts | Foundry + Solidity 0.8.28 | Fast deploy/test; EVM Prague support |
| Frontend SDK | viem + wagmi | Native Monad chain support |
| Betting Asset | Native MON | Simplest; native gas token |
| Boost Asset | PAL (ERC20) | Already deployed on Nad.fun |
| Randomness | Commit-Reveal | Hackathon-friendly; no oracle dependency |
| Indexing | Event listeners | No backend needed; frontend reads events |

---

## 📁 Project Structure

```
palenque-arena/
├── packages/
│   ├── contracts/          # Foundry project
│   │   ├── src/
│   │   │   ├── Match.sol           # Match lifecycle + betting/boosting
│   │   │   ├── MatchFactory.sol    # Creates matches
│   │   │   └── interfaces/
│   │   │       └── IERC20.sol      # PAL token interface
│   │   ├── test/
│   │   │   └── Match.t.sol         # Unit tests
│   │   ├── script/
│   │   │   └── Deploy.s.sol        # Deployment script
│   │   └── foundry.toml
│   │
│   ├── operator/           # Node.js scheduler (Phase 3)
│   │   └── src/
│   │       └── index.ts            # Match creation + settlement loop
│   │
│   └── web/                # React UI (Phase 2)
│       └── src/
│           └── App.tsx             # UI components
│
└── README.md
```

---

## 🚀 Quickstart

### Phase 1: Contracts

**1. Setup**
```bash
cd packages/contracts
cp .env.example .env
# Fill in OPERATOR_ADDRESS, OPERATOR_PRIVATE_KEY, PAL_TOKEN_ADDRESS
```

**2. Install deps & test**
```bash
forge install OpenZeppelin/openzeppelin-contracts
forge test
```

**3. Deploy to testnet**
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $OPERATOR_PRIVATE_KEY \
  --broadcast
```

---

## 🔐 Security Notes

- **Private keys:** Never commit `.env`. Use `.env.example` as template.
- **Testnet only:** All Phase 1-4 is testnet-only. Mainnet requires security audit.
- **Token storage:** PAL token approval happens via web UI (Phase 2).

---

## 🌐 Networks

| Network | Chain ID | RPC |
|---------|----------|-----|
| Monad Testnet | 10143 | https://testnet-rpc.monad.xyz |
| Monad Mainnet | 143 | https://rpc.monad.xyz |

---

## 📚 Resources

- [Monad Docs](https://docs.monad.xyz)
- [Foundry Book](https://book.getfoundry.sh)
- [Moltiverse Hackathon](https://moltiverse.dev)

_MVP built for speed. Built with Openclaw AI._
