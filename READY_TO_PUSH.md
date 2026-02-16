# Listo para subir al repo (desde tu PC)

Sigue estos pasos en tu PC para dejar todo instalado y listo; luego subes al repo y conectas Vercel.

---

## 1. Instalar dependencias (solo una vez)

En la raíz del repo (o en cada package si prefieres):

**Web (frontend para Vercel):**
```powershell
cd packages\web
npm install
```

**Operator (para cuando lo corras en AWS o en local):**
```powershell
cd packages\operator
npm install
```

---

## 2. Comprobar que el frontend construye

Desde `packages/web`:

```powershell
cd packages\web
npm run build
```

Debe terminar sin errores y generar la carpeta `dist/`. Esa es la build que usará Vercel.

---

## 3. No subir secretos

- **No** hagas commit de archivos `.env` (ya están en `.gitignore`).
- En Vercel configuras las variables en el dashboard (ver `VERCEL_DEPLOY.md`).

---

## 4. Subir al repo

```powershell
cd c:\Users\giova\palenque-arena-ai
git status
git add .
git commit -m "Ready for deploy: docs, env examples, Vercel setup"
git push origin main
```

(Ajusta la rama si usas otra, por ejemplo `master`.)

---

## 5. Conectar Vercel

1. En [vercel.com](https://vercel.com) → Import repo `palenque-arena-ai`.
2. **Root Directory:** `packages/web`.
3. Añade las variables de entorno (ver `VERCEL_DEPLOY.md`).
4. Deploy.

Con eso el frontend queda desplegado en Vercel; cada push a `main` volverá a desplegar.
