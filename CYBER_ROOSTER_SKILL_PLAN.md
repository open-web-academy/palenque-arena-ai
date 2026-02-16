# Cyber Rooster Skill - Development Plan

## Skill Overview
AgentSkill to interact with Palenque Arena (Cyber Rooster League) on Monad blockchain.

## Features
1. **Get Current Match** - Read live match state
2. **Place Bet** - Bet MON on rooster A or B
3. **Boost** - Boost with PAL tokens
4. **Check Odds** - Live probability calculation
5. **Claim Payout** - Withdraw winnings
6. **Match History** - Last 5 matches with results

## Contract Addresses
- Factory: `0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3` (Monad Mainnet)
- PAL Token: `0x0dfBc608339aeA55F5EEedE640335dAC062a7777`
- RPC: `https://rpc.monad.xyz`

## Skill Structure
```
cyber-rooster/
├── SKILL.md
├── lib/
│   ├── monadClient.ts        # viem client setup
│   ├── contractAbis.ts       # Match + Factory ABIs
│   └── types.ts              # TypeScript interfaces
├── commands/
│   ├── getCurrentMatch.ts
│   ├── placebet.ts
│   ├── boost.ts
│   ├── claimPayout.ts
│   ├── getOdds.ts
│   └── getHistory.ts
├── package.json
└── tsconfig.json
```

## Key ABIs Needed
```typescript
// Match.sol
- state(): uint8 (0=Open, 1=Closed, 2=Settled)
- roosterA/B(): string
- winnerA(): bool
- betPoolA/B(): uint256
- boostPoolA/B(): uint256
- currentOdds(): (uint256 pA, uint256 pB)
- bet(bool side, uint256 amount)
- boost(bool side, uint256 amount)
- claimPayout(address user)

// Factory.sol
- getLastMatch(): address
- matchCount(): uint256
```

## Command Examples

### getCurrentMatch
```bash
cyber-rooster match current
# Output: NEXUS vs INFERNO (OPEN) - 48% vs 52% odds
```

### placebet
```bash
cyber-rooster bet A 10 MON
# TX: 0x... pending
```

### boost
```bash
cyber-rooster boost A 100 PAL
# Approve + boost transaction
```

### claimPayout
```bash
cyber-rooster claim
# You won! +500 MON
```

## Environment Vars (skill will read from user session)
- MONAD_RPC_URL (default: public RPC)
- FACTORY_ADDRESS (hardcoded)
- PAL_TOKEN_ADDRESS (hardcoded)
- User wallet (from wagmi/ethers session)

## Build Checklist
- [ ] viem client setup
- [ ] Contract ABIs defined
- [ ] getCurrentMatch command
- [ ] placebet command (with approval flow)
- [ ] boost command (with PAL approval)
- [ ] claimPayout command
- [ ] getOdds calculation
- [ ] getHistory pagination
- [ ] Error handling (rate limits, user balance, etc)
- [ ] Tests
- [ ] SKILL.md documentation
- [ ] Publish to clawhub

## Time Estimate
2-3 hours of development + testing

## Next Session
```bash
# Start in new OpenClaw session (200k fresh tokens)
cd /home/ubuntu/.openclaw/workspace
read CYBER_ROOSTER_SKILL_PLAN.md
# Then use skill-creator to build
```
