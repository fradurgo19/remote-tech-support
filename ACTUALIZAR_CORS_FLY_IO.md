# 🔴 ACTUALIZAR CORS_ORIGIN EN FLY.IO

## URL de Vercel (Cuenta Anterior)
**https://remote-tech-support.vercel.app**

---

## 📝 PASOS PARA ACTUALIZAR

### Paso 1: Ir a Fly.io Dashboard
1. Ve a: https://fly.io/dashboard
2. Selecciona la app: **remote-tech-support-backend**

### Paso 2: Actualizar CORS_ORIGIN
1. Ve a **Settings → Secrets**
2. Busca la variable **CORS_ORIGIN**
3. Click en **Edit**
4. Actualiza el valor con:
   ```
   https://remote-tech-support.vercel.app
   ```
   
   **IMPORTANTE:**
   - Debe incluir `https://`
   - NO debe tener barra al final (`/`)
   - Si necesitas permitir múltiples URLs (producción + previews), usa:
     ```
     https://remote-tech-support.vercel.app,https://remote-tech-support-*.vercel.app
     ```
5. Click en **Save**

### Paso 3: Actualizar FRONTEND_URL (Opcional pero recomendado)
1. En la misma sección de Secrets, busca **FRONTEND_URL**
2. Click en **Edit**
3. Actualiza el valor con:
   ```
   https://remote-tech-support.vercel.app
   ```
4. Click en **Save**

### Paso 4: Reiniciar la Aplicación
**IMPORTANTE:** Primero verifica que el backend esté funcionando (sin errores de base de datos).

Si el backend está funcionando correctamente:

**Opción 1: Desde el Dashboard**
1. Ve a la pestaña **Machines**
2. Click en el botón de **restart** (🔄)

**Opción 2: Desde la terminal**
```bash
flyctl restart -a remote-tech-support-backend
```

**⚠️ ADVERTENCIA:** Si el backend tiene errores de base de datos, NO reinicies todavía. Primero soluciona el problema de la base de datos.

---

## ✅ VERIFICACIÓN

### 1. Verificar Health Check
Visita: https://remote-tech-support-backend.fly.dev/health

Deberías ver:
```json
{"status":"ok","timestamp":"..."}
```

### 2. Verificar CORS desde el Frontend
1. Abre: https://remote-tech-support.vercel.app/login
2. Abre la consola del navegador (F12)
3. Intenta hacer login
4. Si no hay errores de CORS, está funcionando correctamente

### 3. Verificar en los Logs
En Fly.io Dashboard → Logs, deberías ver conexiones exitosas sin errores de CORS.

---

## 🐛 SI HAY ERRORES DE CORS

### Error: "Access to fetch at ... has been blocked by CORS policy"

**Solución:**
1. Verifica que `CORS_ORIGIN` sea exactamente: `https://remote-tech-support.vercel.app`
2. No debe tener barra al final (`/`)
3. Debe incluir el protocolo `https://`
4. Reinicia la aplicación después de cambiar

### Si usas Preview Deployments
Si Vercel genera URLs de preview (como `remote-tech-support-git-main.vercel.app`), actualiza `CORS_ORIGIN` con:
```
https://remote-tech-support.vercel.app,https://remote-tech-support-*.vercel.app
```

---

## 📋 RESUMEN DE CAMBIOS

**Variables a actualizar en Fly.io:**
- ✅ `CORS_ORIGIN` → `https://remote-tech-support.vercel.app`
- ✅ `FRONTEND_URL` → `https://remote-tech-support.vercel.app` (opcional)

**Después de actualizar:**
- ✅ Verificar que el backend esté funcionando (sin errores de DB)
- ✅ Reiniciar la aplicación
- ✅ Verificar que funciona desde el frontend

---

## ⚠️ IMPORTANTE

**NO reinicies si el backend tiene errores de base de datos.**

Primero verifica que el backend esté funcionando:
```bash
flyctl logs -a remote-tech-support-backend
```

Si ves errores de "Tenant or user not found", primero soluciona el problema de `DATABASE_URL` antes de reiniciar.

