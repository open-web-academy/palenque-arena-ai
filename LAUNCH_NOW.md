# Lanzar en 5 minutos

Todo el código está listo. Los **tres juegos funcionan**: Classic Arena (on-chain), Elemental y Roulette (simulados si no hay contrato; sin mensajes de error).

---

## 1. Arrancar el operator (Classic Arena con partidos reales)

En una terminal:

```powershell
cd c:\Users\giova\palenque-arena-ai\packages\operator
npm start
```

Déjalo abierto. Si falla por clave o factory, revisa que `FACTORY_ADDRESS` en `.env` sea la que tiene tu wallet como operator.

---

## 2. Arrancar la web (local o subir a Vercel)

**Local:**

```powershell
cd c:\Users\giova\palenque-arena-ai\packages\web
npm run dev
```

Abre la URL que salga (ej. http://localhost:5173).

**Vercel:** Push al repo, en Vercel Root Directory = `packages/web`, añade en env: `VITE_RPC_URL`, `VITE_FACTORY_ADDRESS`, `VITE_PAL_TOKEN_ADDRESS`. Deploy.

---

## 3. Comprobar

- **Hub** → tres cartas: Classic Arena, Elemental, Roulette. Todas llevan a un juego jugable.
- **Classic Arena** → partido OPEN cuando el operator esté corriendo, apostar con MON.
- **Elemental** → ronda simulada (badge "Simulated"), apostar y Next round.
- **Roulette** → ronda simulada (badge "Simulated"), elegir símbolo, apostar y Next round.

No hay páginas "not configured". Si el RPC da 429, en producción usa un RPC con API key en `VITE_RPC_URL`.
