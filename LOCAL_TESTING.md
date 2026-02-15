# Probar Palenque Arena en local

Pasos para levantar **operator** + **frontend** en tu máquina y probar apuestas, boost y cobro antes de mandar a producción.

---

## Requisitos

- **Node.js** 18+
- **Wallet** con red Monad (Chain 143) y algo de MON para gas (y PAL si quieres probar boost)
- Contratos ya desplegados en Monad Mainnet (Factory, PAL) — el frontend y el operator se conectan a mainnet

---

## 1. Operator (crea partidos cada 60s)

En una terminal:

```bash
cd packages/operator
cp .env.example .env
```

Edita `.env` y rellena:

- `OPERATOR_PRIVATE_KEY`: wallet que pague gas (crear partido, commit, reveal)
- `FACTORY_ADDRESS=0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3`
- `PAL_TOKEN_ADDRESS=0x0dfBc608339aeA55F5EEedE640335dAC062a7777`
- `RPC_URL=https://rpc.monad.xyz`
- `MATCH_INTERVAL=60` (opcional; partido nuevo cada 60s)

Luego:

```bash
npm install
npm run build
npm start
```

Deberías ver logs tipo: `Creating match: Phoenix vs Dragon` y `Match created: tx 0x...`.

---

## 2. Frontend (UI en el navegador)

En **otra** terminal:

```bash
cd packages/web
cp .env.example .env
```

El `.env.example` usa ya `VITE_*`. Ajusta si quieres otro RPC o contratos (por defecto apuntan a mainnet):

- `VITE_RPC_URL=https://rpc.monad.xyz`
- `VITE_FACTORY_ADDRESS=0xae6bF7d376374a4D28C78726d9Fdb27289CCF5f3`
- `VITE_PAL_TOKEN_ADDRESS=0x0dfBc608339aeA55F5EEedE640335dAC062a7777`
- `VITE_WALLETCONNECT_PROJECT_ID=` (opcional; si tienes proyecto en WalletConnect, pon el id)

Luego:

```bash
npm install
npm run dev
```

Abre **http://localhost:5173**.

---

## 3. Qué probar en local

1. **Conectar wallet** (Monad Mainnet).
2. **Ver partido en vivo**: si el operator está corriendo, en ~60s debería aparecer un partido nuevo; si no, puede que ya haya uno abierto en la factory.
3. **Apostar (MON)**: elige lado, monto y "Place Bet"; revisa el toast y el TX en el explorer.
4. **Boost (PAL)**: si tienes PAL, Approve y luego Boost; revisa toasts y TX.
5. **Esperar cierre**: el partido pasa a Closed y luego a Settled (el operator hace commit/reveal).
6. **Reclamar**: si ganaste, "Claim Payout" y confirma; revisa que recibas MON.

---

## Resumen de comandos

| Dónde              | Comando              |
|--------------------|----------------------|
| Terminal 1 (operator) | `cd packages/operator && npm run build && npm start` |
| Terminal 2 (web)      | `cd packages/web && npm run dev` |
| Navegador             | http://localhost:5173 |

Cuando todo funcione en local, puedes desplegar frontend (p. ej. Vercel) y operator en un VPS siguiendo `DEPLOYMENT.md` y `PRODUCTION_CHECKLIST.md`.
