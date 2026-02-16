# Instalar Foundry en Windows (sin WSL)

Si WSL falla o no quieres usarlo, instala Foundry con los binarios para Windows.

---

## 1. Descargar Foundry

1. Abre en el navegador: **https://github.com/foundry-rs/foundry/releases**
2. En la sección **Latest** (o el último release estable), baja hasta **Assets**.
3. Descarga el archivo para **Windows**, por ejemplo:
   - `foundry_nightly_win32_amd64.zip`, o
   - `foundry_1.6.0-rc1_win32_amd64.zip`  
   (el nombre puede variar; el que diga `win` y `amd64`).

---

## 2. Descomprimir

1. Abre el `.zip` descargado.
2. Extrae todo en una carpeta que recuerdes, por ejemplo:
   - `C:\foundry`  
   Dentro deberías ver `forge.exe`, `cast.exe`, `anvil.exe`, `chisel.exe`.

---

## 3. Añadir al PATH

1. Pulsa **Win + R**, escribe `sysdm.cpl` y Enter.
2. Pestaña **Opciones avanzadas** → **Variables de entorno**.
3. En "Variables del sistema" selecciona **Path** → **Editar** → **Nuevo**.
4. Escribe la ruta de la carpeta donde descomprimiste, p. ej. `C:\foundry`.
5. **Aceptar** en todas las ventanas.

---

## 4. Comprobar

1. **Cierra** todas las ventanas de PowerShell o Terminal que tuvieras abiertas.
2. Abre una **nueva** PowerShell.
3. Ejecuta:
   ```powershell
   forge --version
   ```
   Deberías ver algo como `forge 1.6.0` (o la versión que descargaste).

Si `forge` no se reconoce, revisa que la ruta en el PATH sea la carpeta que contiene `forge.exe` y que hayas abierto una terminal nueva.

---

## Siguiente paso

Cuando `forge --version` funcione, sigue **`DEPLOY_ELEMENTAL_RULETA.md`** para desplegar los contratos (usa PowerShell desde `packages\contracts`).
