# Deploy frontend on Vercel

Everything is set up so that pushing this repo and connecting it to Vercel deploys the web app without extra config.

---

## 1. On Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub).
2. **Add New Project** → Import your repo `palenque-arena-ai`.
3. **Root Directory:** set to **`packages/web`** (required for this monorepo).
4. **Framework Preset:** Vite (auto-detected).
5. **Build Command:** `npm run build` (default).
6. **Output Directory:** `dist` (default).
7. **Install Command:** `npm install` (default).

---

## 2. Environment variables (Vercel dashboard)

In the project → **Settings → Environment Variables**, add:

| Name | Value | Notes |
|------|--------|--------|
| `VITE_RPC_URL` | `https://rpc.monad.xyz` or your RPC with API key | Required |
| `VITE_FACTORY_ADDRESS` | Tu dirección de Factory (ej. `0x0ffFFD9CD72d8779706e421bf68F36FF4aE22b0f`) | Required for Classic Arena |
| `VITE_PAL_TOKEN_ADDRESS` | `0x0dfBc608339aeA55F5EEedE640335dAC062a7777` | Required for Classic Arena |
| `VITE_ELEMENTAL_FACTORY_ADDRESS` | (leave empty or your deployed address) | Optional |
| `VITE_RULETA_ADDRESS` | (leave empty or your deployed address) | Optional |
| `VITE_WALLETCONNECT_PROJECT_ID` | (your WalletConnect project id) | Optional, for ConnectKit |

Then **Redeploy** so the build uses these variables.

---

## 3. Deploy

- **Automatic:** every push to `main` (or your production branch) triggers a new deploy.
- **Manual:** Deployments → … → Redeploy.

The app will be at `https://your-project.vercel.app`. SPA routing is already configured (all routes → `index.html`).

---

## 4. Todos los modos con tokens (MON) en producción

Para que **los tres modos** (Arena Clásica, Elemental, Ruleta) usen tokens reales en producción:

| Modo | En Vercel (web) | En el servidor (operator) | Qué hacer |
|------|------------------|---------------------------|-----------|
| **Arena Clásica** | `VITE_RPC_URL`, `VITE_FACTORY_ADDRESS`, `VITE_PAL_TOKEN_ADDRESS` | `RPC_URL`, `FACTORY_ADDRESS`, `PAL_TOKEN_ADDRESS`, `OPERATOR_PRIVATE_KEY`, `ROOSTERS` | Ya funciona si el operator está corriendo y estas variables están en Vercel. |
| **Elemental** | `VITE_ELEMENTAL_FACTORY_ADDRESS` (dirección del contrato desplegado) | `ELEMENTAL_FACTORY_ADDRESS` en `.env` del operator | Desplegar contratos con `DeployElementalAndRuleta.s.sol`, copiar la dirección de Elemental a web (Vercel) y al operator. |
| **Ruleta** | `VITE_RULETA_ADDRESS` (dirección del contrato desplegado) | `RULETA_ADDRESS` en `.env` del operator | Mismo script; copiar la dirección de Ruleta a web (Vercel) y al operator. |

- Si **no** pones `VITE_ELEMENTAL_FACTORY_ADDRESS` ni `VITE_RULETA_ADDRESS` en Vercel, Elemental y Ruleta siguen jugables en **modo simulado** (demo, sin MON real). No hay páginas rotas.
- Para producción con MON en los tres modos: despliega Elemental y Ruleta (`packages/contracts`), rellena las 4 variables (2 en Vercel, 2 en el operator) y mantén el operator corriendo con esas direcciones.
