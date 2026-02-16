# Enable Elemental and Ruleta

If you see "Elemental is not configured" or "Ruleta is not configured", you need to **deploy** those contracts and **set the addresses** in both the web and operator `.env` files.

---

## 1. Get your operator address

The deploy scripts need `OPERATOR_ADDRESS` = the same wallet that runs the operator (the one in `OPERATOR_PRIVATE_KEY`).

With **Foundry** (cast):

```bash
cast wallet address --private-key YOUR_OPERATOR_PRIVATE_KEY
```

Example: if your key is `0x992dc8c2...`, run:

```bash
cast wallet address --private-key 0x992dc8c2dba27f86f68833c80f4f944cdba1f8387299c229b87939e8136eab1c
```

Copy the `0x...` address (e.g. `0x1234...abcd`).

---

## 2. Deploy Elemental

From the repo root, in **PowerShell**:

```powershell
cd packages\contracts
$env:OPERATOR_ADDRESS = "0xYourOperatorAddress"   # paste the address from step 1
$env:RPC_URL = "https://rpc.monad.xyz"
$env:DEPLOYER_PRIVATE_KEY = "0xYourPrivateKey"     # same as OPERATOR_PRIVATE_KEY

forge script script/DeployElemental.s.sol --rpc-url $env:RPC_URL --broadcast --private-key $env:DEPLOYER_PRIVATE_KEY
```

In the output you’ll see something like: **ElementalFactory proxy: 0x...**  
Copy that address.

---

## 3. Deploy Ruleta

Same terminal:

```powershell
forge script script/DeployRuleta.s.sol --rpc-url $env:RPC_URL --broadcast --private-key $env:DEPLOYER_PRIVATE_KEY
```

Copy the **Ruleta proxy: 0x...** address.

---

## 4. Configure web `.env`

Edit **`packages/web/.env`** and add (use the addresses you copied):

```env
VITE_ELEMENTAL_FACTORY_ADDRESS=0x...
VITE_RULETA_ADDRESS=0x...
```

Save the file.

---

## 5. Configure operator `.env`

Edit **`packages/operator/.env`** and add:

```env
ELEMENTAL_FACTORY_ADDRESS=0x...
RULETA_ADDRESS=0x...
```

Save the file.

---

## 6. Restart and test

1. **Restart the operator** (stop and run again):
   ```powershell
   cd packages\operator
   npm start
   ```
2. **Restart the web** (or hard refresh the browser):
   ```powershell
   cd packages\web
   npm run dev
   ```
3. Open the app, go to **Elemental** and **Ruleta** — the “not configured” message should be gone and you can place bets when a round is OPEN.

---

## If you don’t want to deploy yet

Elemental and Ruleta **require** deployed contracts and env vars. There is no demo mode. To use them you must:

- Have **Foundry** installed (`forge --version`)
- Use the **same wallet** as operator (has MON for gas)
- Run the two deploy commands above and set the four env vars in web and operator.

---

## 404 in the browser

A “Failed to load resource: 404” often comes from the browser requesting `/favicon.ico`, which the app doesn’t serve. It doesn’t affect Elemental or Ruleta. You can ignore it or add a favicon to `packages/web/public/` if you want.
