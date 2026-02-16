# Cómo desplegar: desde tu PC vs Ubuntu en AWS

Resumen: **prepara y sube todo desde acá al repo** para que el despliegue sea sin problemas; **el operator lo corres en Ubuntu (AWS)** porque tiene que estar 24/7.

---

## Recomendación

| Qué | Dónde / cómo |
|-----|----------------|
| **Código y contratos** | Desde **tu PC**: commits, push al repo. Despliegue de contratos (Forge) **una vez** desde tu PC (o desde AWS si quieres). |
| **Frontend (web)** | Repo conectado a **Vercel** (o similar). Push al repo → despliegue automático. Las env vars se configuran en el dashboard de Vercel (no en el repo). |
| **Operator** | **Ubuntu en AWS** (o cualquier VPS). Ahí clonas el repo, configuras `.env` y lo ejecutas con `pm2`. |

Así el repo queda listo para desplegar sin problema: quien despliegue solo clona, pone env y arranca.

---

## Opción A: Todo desde tu PC y subir al repo

**Ventaja:** Un solo lugar de trabajo; el repo queda listo para que cualquier despliegue funcione.

1. **En tu PC (Windows)**
   - Despliegue de contratos (si aún no están):
     - Foundry en tu PC.
     - Desde `packages/contracts`: `forge script script/Deploy.s.sol ...` (y si quieres Elemental/Ruleta, esos también).
   - Anota las direcciones (Factory, Elemental, Ruleta) en un lugar seguro (no las subas al repo).
   - Deja el repo “deploy-ready”:
     - `.env` **no** se sube (debe estar en `.gitignore`).
     - `.env.example` actualizado con todas las variables (web y operator).
   - Push al repo:
     ```bash
     git add .
     git commit -m "Deploy-ready: env example, docs"
     git push origin main
     ```

2. **Frontend**
   - Conectas el repo a Vercel (o Netlify).
   - En el dashboard añades las **Environment Variables** (las mismas que en tu `.env` local: `VITE_RPC_URL`, `VITE_FACTORY_ADDRESS`, etc.).  
   - Cada push a `main` despliega sin problema.

3. **Operator**
   - Lo instalas y ejecutas **en Ubuntu (AWS)** (ver abajo). No hace falta “subirlo” al repo; el repo ya está listo para clonar en el servidor.

---

## Opción B: Instalarlo todo en Ubuntu (AWS)

**Ventaja:** Un solo sitio (AWS) para operator y, si quieres, para servir el frontend.

1. **Crear una instancia Ubuntu en AWS** (EC2), SSH, Node 18+.

2. **Clonar el repo en el servidor**
   ```bash
   git clone https://github.com/TU_USUARIO/palenque-arena-ai.git
   cd palenque-arena-ai
   ```

3. **Contratos (solo si los despliegas desde AWS)**
   - Instalar Foundry en Ubuntu, luego:
   ```bash
   cd packages/contracts
   export OPERATOR_ADDRESS=0x...
   export RPC_URL=https://...
   export DEPLOYER_PRIVATE_KEY=0x...
   forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --private-key $DEPLOYER_PRIVATE_KEY
   ```
   - Si ya desplegaste desde tu PC, no hace falta; solo necesitas las direcciones en los `.env`.

4. **Operator en Ubuntu (AWS)**
   ```bash
   cd packages/operator
   cp .env.example .env
   nano .env   # RPC_URL, OPERATOR_PRIVATE_KEY, FACTORY_ADDRESS, PAL_TOKEN_ADDRESS, etc.
   npm install
   npm run build
   npm install -g pm2
   pm2 start "npm start" --name palenque-operator
   pm2 save
   pm2 startup
   ```

5. **Frontend (opcional en la misma máquina)**
   - Opción 1 (recomendada): no instalar en AWS; usar Vercel conectado al repo (push desde tu PC y despliega solo).
   - Opción 2: en Ubuntu construir y servir con nginx:
     ```bash
     cd packages/web
     cp .env.example .env
     nano .env   # VITE_* con las mismas direcciones
     npm install
     npm run build
     # Servir dist/ con nginx u otro
     ```

---

## Qué dejar listo en el repo para “despliegue sin problema”

1. **No subir secretos**
   - `.env` en `.gitignore` (ya suele estar).
   - No commitear `OPERATOR_PRIVATE_KEY` ni API keys de RPC.

2. **Documentación y ejemplos**
   - `.env.example` en `packages/web` y `packages/operator` con todas las variables (incluidas Elemental/Ruleta si aplica).
   - Este archivo (`DEPLOY_OPTIONS.md`) y `DEPLOYMENT.md` / `PENDING_CHECKLIST.md` indicando qué variables configurar en producción.

3. **Un solo lugar de verdad**
   - Contratos desplegados **una vez** (desde tu PC o desde AWS).
   - Direcciones guardadas solo en los `.env` de cada entorno (local, Vercel, AWS), no en el código.

---

## Respuesta directa

- **¿Lo instalo desde Ubuntu en AWS o lo hago desde acá y lo subo al repo?**  
  - **Desde acá:** prepara el repo (código, `.env.example`, docs), despliega contratos si toca, y **sube todo al repo**. El frontend despliega sin problema vía Vercel (o similar) al hacer push.  
  - **En Ubuntu (AWS):** úsalo para **correr el operator** (y, si quieres, para desplegar contratos o servir el frontend). Clonas el repo ahí, configuras `.env` con las mismas direcciones y secretos, y arrancas con `pm2`.

Con eso el despliegue queda claro y sin pasos extra: desde acá subes y despliegas frontend; en AWS solo clonas, configuras env y ejecutas el operator.
