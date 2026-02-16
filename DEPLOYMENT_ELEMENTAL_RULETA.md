# Deploying Elemental & Ruleta (Monad)

To run all three game modes (Arena Clásica, Elemental, Ruleta) you need to deploy the Elemental and Ruleta contracts and configure the operator and web app.

## 1. Deploy Elemental

From `packages/contracts`:

```bash
export OPERATOR_ADDRESS=0x...   # same as your Arena operator
forge script script/DeployElemental.s.sol --rpc-url $RPC_URL --broadcast --private-key $DEPLOYER_PRIVATE_KEY
```

Set in **operator** `.env`:

- `ELEMENTAL_FACTORY_ADDRESS=<ElementalFactory proxy address>`

Set in **web** `.env`:

- `VITE_ELEMENTAL_FACTORY_ADDRESS=<ElementalFactory proxy address>`

## 2. Deploy Ruleta

From `packages/contracts`:

```bash
export OPERATOR_ADDRESS=0x...
forge script script/DeployRuleta.s.sol --rpc-url $RPC_URL --broadcast --private-key $DEPLOYER_PRIVATE_KEY
```

Set in **operator** `.env`:

- `RULETA_ADDRESS=<Ruleta proxy address>`

Set in **web** `.env`:

- `VITE_RULETA_ADDRESS=<Ruleta proxy address>`

## 3. Bootstrap Ruleta first round

The operator automatically calls `startRound(closeTime)` when `roundCount` is 0, so no manual step is needed. Restart the operator after setting `RULETA_ADDRESS`.

## 4. Run operator

With all three configured, the operator runs:

- **Arena** (MatchFactory): OPEN → CLOSED → COMMIT → REVEAL → SETTLED → create new match
- **Elemental** (ElementalFactory): same lifecycle for 4-element matches
- **Ruleta**: start round → OPEN → CLOSED → COMMIT → REVEAL → start next round

```bash
cd packages/operator && npm run dev
```

## 5. Run web

```bash
cd packages/web && npm run dev
```

Open the Hub and use **Arena Clásica**, **Elemental**, and **Casino** (Ruleta). All three use MON for betting and require the operator to be running for rounds to advance.
