# Desplegar contratos Elemental y Ruleta

Un solo comando despliega ambos y te da las direcciones para el `.env`.

---

## Requisitos

- **Foundry** instalado. En Windows (sin WSL) sigue **[INSTALL_FOUNDRY_WINDOWS.md](INSTALL_FOUNDRY_WINDOWS.md)** en esta misma carpeta: descarga el zip de Windows desde [Releases](https://github.com/foundry-rs/foundry/releases), descomprime y añade la carpeta al PATH.
- **Wallet operator** con MON para gas (la misma que usa `OPERATOR_PRIVATE_KEY` en el operator)
- Red **Monad** (mainnet o testnet)

---

## 1. Obtener la dirección del operator

La dirección que usa tu clave privada del operator:

```powershell
cast wallet address --private-key 0xTU_CLAVE_PRIVADA
```

Copia la dirección `0x...` (ej. `0x1234...abcd`). Es la misma que debe estar autorizada como operator en los contratos.

---

## 2. Desplegar Elemental + Ruleta (un solo comando)

Desde la raíz del repo, en **PowerShell**:

```powershell
cd packages\contracts

$env:OPERATOR_ADDRESS = "0xTU_DIRECCION_OPERATOR"
$env:RPC_URL = "https://rpc.monad.xyz"
$env:DEPLOYER_PRIVATE_KEY = "0xTU_CLAVE_PRIVADA"

forge script script/DeployElementalAndRuleta.s.sol --rpc-url $env:RPC_URL --broadcast --private-key $env:DEPLOYER_PRIVATE_KEY
```

Sustituye:
- `0xTU_DIRECCION_OPERATOR` → la dirección del paso 1
- `0xTU_CLAVE_PRIVADA` → la misma clave que usas en `OPERATOR_PRIVATE_KEY` del operator (con `0x` delante)

---

## 3. Copiar las direcciones al .env

Al final del comando verás algo como:

```
ElementalFactory proxy: 0x...
Ruleta proxy: 0x...
---
Add to packages/web/.env:
VITE_ELEMENTAL_FACTORY_ADDRESS=0x...
VITE_RULETA_ADDRESS=0x...
---
Add to packages/operator/.env:
ELEMENTAL_FACTORY_ADDRESS=0x...
RULETA_ADDRESS=0x...
```

- En **`packages/web/.env`** añade o reemplaza:
  - `VITE_ELEMENTAL_FACTORY_ADDRESS=0x...`
  - `VITE_RULETA_ADDRESS=0x...`
- En **`packages/operator/.env`** añade o reemplaza:
  - `ELEMENTAL_FACTORY_ADDRESS=0x...`
  - `RULETA_ADDRESS=0x...`

---

## 4. Reiniciar operator y web

- Reinicia el operator (`npm start` en `packages/operator`).
- En Vercel: pon las mismas variables en el dashboard y redeploy, o si usas local, reinicia `npm run dev`.

Con eso, Elemental y Ruleta deberían funcionar (el operator crea rondas y la web usa esas direcciones).
