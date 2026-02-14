# Monad Betting Dapp - Project Snapshot

## Goal
Build complete betting dapp on Monad blockchain for Moltiverse hackathon (rolling submission, deadline Feb 15, 2026).

## Status: 80% Complete

### Deployed Contracts (Monad Mainnet 143)
- **Factory proxy**: `0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3`
- **Operator**: `0x21BC8b95e5F03aFCb609CCCbE9B974F62Af0cFe3`
- **PAL token**: `0x0dfBc608339aeA55F5EEedE640335dAC062a7777`

### Completed
✅ Phase 1: Smart Contracts (Match.sol, MatchFactory.sol) - UUPS proxies on mainnet
✅ Phase 3A: Operator scheduler (contract integration, state machine, randomness, config)
✅ Phase 3B: Frontend components
  - BetForm.tsx (native MON betting, wagmi hooks)
  - BoostForm.tsx (PAL token approval + boost, two-step)
  - PayoutClaim.tsx (claim winnings when settled)
  - MatchHistory.tsx (last 10 matches with auto-refresh 30s)
✅ Config + deployment runbook (DEPLOYMENT.md)

### Next Blockers
- [ ] Event listeners for MatchCreated/Settled (real-time updates)
- [ ] App.tsx integration (wire components + WagmiConfig)
- [ ] E2E test: operator creates match → user bets/boosts → settle → claim
- [ ] Deploy web to Vercel
- [ ] Deploy operator to VPS (pm2)
- GitHub push auth: 403 "Permission denied to alannetwork" (needs PAT or manual push)

## Key Tech Decisions
- **Betting**: Native MON (simpler)
- **Boosting**: PAL token (ERC20) with diminishing returns (sqrt)
- **Randomness**: Commit-reveal (no oracle)
- **Polling**: 5s when Open, 30s when Closed/Settled
- **Component Pattern**: All use wagmi (`useWriteContract`, `useWaitForTransactionReceipt`) + viem reads
- **Work Style**: Micro-steps (one file/step per message to avoid rate limits)

## Match States
- 0 = Open (betting enabled)
- 1 = Closed (awaiting reveal)
- 2 = Settled (payouts available)

## Key Files
- Contracts: `packages/contracts/src/Match.sol`, `MatchFactory.sol`
- Operator: `packages/operator/src/{contract.ts, operator.ts, index.ts, config.ts, utils/}`
- Web: `packages/web/src/hooks/useMatch.ts`, `components/{BetForm, BoostForm, PayoutClaim, MatchHistory}`

## Environment Vars (Set)
**Operator**: RPC_URL, OPERATOR_PRIVATE_KEY, FACTORY_ADDRESS, PAL_TOKEN_ADDRESS, MATCH_INTERVAL=60
**Web**: REACT_APP_RPC_URL, REACT_APP_FACTORY_ADDRESS, REACT_APP_PAL_TOKEN_ADDRESS
