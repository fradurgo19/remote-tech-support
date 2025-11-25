# 🚀 Pasos para Desplegar en Vercel y Configurar Fly.io

## 📋 RESUMEN

- **Frontend**: Vercel (solo necesita 2 variables)
- **Backend**: Fly.io (ya está desplegado, solo necesita actualizar CORS_ORIGIN)

---

## 🔵 PARTE 1: VARIABLES EN VERCEL (Frontend)

### Variables de Entorno Necesarias

Ve a **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables** y agrega:

```
VITE_API_URL=https://remote-tech-support-backend.fly.dev
VITE_SOCKET_URL=https://remote-tech-support-backend.fly.dev
```

**Importante:**

- Estas variables deben empezar con `VITE_` para que Vite las incluya en el build
- Marca ambas para **Production**, **Preview** y **Development**

---

## 🔴 PARTE 2: VARIABLES EN FLY.IO (Backend)

### Variables que DEBES tener configuradas en Fly.io:

#### Base de Datos (Supabase)

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

#### Supabase

```
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[TU-SERVICE-ROLE-KEY]
```

#### JWT

```
JWT_SECRET=[TU-JWT-SECRET-32-CARACTERES]
JWT_EXPIRES_IN=24h
```

#### CORS (⚠️ ESTA ES LA QUE DEBES ACTUALIZAR)

```
CORS_ORIGIN=https://tu-proyecto.vercel.app
```

**IMPORTANTE:** Después de desplegar en Vercel, actualiza `CORS_ORIGIN` con la URL exacta de tu frontend.

#### Email (SMTP)

```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=[TU-EMAIL]@partequipos.com
SMTP_PASS=[TU-PASSWORD]
```

#### Opcionales

```
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
SUPABASE_BUCKET_AVATARS=avatars
SUPABASE_BUCKET_MESSAGES=message-attachments
SUPABASE_BUCKET_REPORTS=report-attachments
```

---

## 📝 PASO A PASO COMPLETO

### Paso 1: Conectar Repositorio en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New Project"**
3. Conecta tu cuenta de GitHub si es necesario
4. Busca y selecciona: `fradurgo19/remote-tech-support`
5. Click en **"Import"**

### Paso 2: Configurar Variables de Entorno en Vercel

1. En la configuración del proyecto, ve a **Settings → Environment Variables**
2. Agrega estas dos variables:

   **Variable 1:**

   - Key: `VITE_API_URL`
   - Value: `https://remote-tech-support-backend.fly.dev`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**

   - Key: `VITE_SOCKET_URL`
   - Value: `https://remote-tech-support-backend.fly.dev`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. Click en **"Save"**

### Paso 3: Desplegar en Vercel

1. Ve a la pestaña **"Deployments"**
2. Click en **"Deploy"** (o espera el despliegue automático)
3. Espera a que termine el build
4. **Anota la URL generada** (ejemplo: `https://remote-tech-support.vercel.app`)

### Paso 4: Actualizar CORS en Fly.io

1. Ve a [Fly.io Dashboard](https://fly.io/dashboard)
2. Selecciona tu app: `remote-tech-support-backend`
3. Ve a **Settings → Secrets**
4. Busca la variable `CORS_ORIGIN`
5. Actualiza su valor con la URL de Vercel que obtuviste en el Paso 3:

   ```
   CORS_ORIGIN=https://tu-proyecto.vercel.app
   ```

   **O si tienes múltiples orígenes permitidos:**

   ```
   CORS_ORIGIN=https://tu-proyecto.vercel.app,https://tu-proyecto-git-main.vercel.app
   ```

6. Guarda los cambios

### Paso 5: Reiniciar el Backend en Fly.io

Después de actualizar `CORS_ORIGIN`, reinicia la aplicación:

1. En Fly.io Dashboard, ve a tu app
2. Click en **"Machines"**
3. Click en el botón de **restart** (🔄) o usa el comando:
   ```bash
   flyctl restart -a remote-tech-support-backend
   ```

### Paso 6: Verificar que Todo Funciona

1. **Frontend:**

   - Visita la URL de Vercel
   - Deberías ver la aplicación cargando

2. **Backend:**

   - Visita: `https://remote-tech-support-backend.fly.dev/health`
   - Deberías ver: `{"status":"ok","timestamp":"..."}`

3. **Conexión Frontend-Backend:**
   - Intenta hacer login en el frontend
   - Si funciona, la conexión está correcta
   - Si hay error de CORS, verifica que `CORS_ORIGIN` en Fly.io coincida exactamente con la URL de Vercel

---

## ✅ CHECKLIST FINAL

### Vercel

- [ ] Repositorio conectado
- [ ] `VITE_API_URL` configurada
- [ ] `VITE_SOCKET_URL` configurada
- [ ] Despliegue exitoso
- [ ] URL del frontend anotada

### Fly.io

- [ ] `CORS_ORIGIN` actualizada con URL de Vercel
- [ ] Backend reiniciado
- [ ] Health check funcionando
- [ ] Login desde frontend funciona

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: CORS bloqueado

**Síntoma:** El navegador muestra error de CORS al intentar conectar al backend.

**Solución:**

1. Verifica que `CORS_ORIGIN` en Fly.io sea exactamente igual a la URL de Vercel (incluyendo `https://`)
2. Si usas preview deployments, agrega también esas URLs:
   ```
   CORS_ORIGIN=https://tu-proyecto.vercel.app,https://tu-proyecto-git-main.vercel.app,https://tu-proyecto-git-*.vercel.app
   ```
3. Reinicia el backend después de cambiar `CORS_ORIGIN`

### Error: No se puede conectar al backend

**Síntoma:** El frontend no puede hacer requests al backend.

**Solución:**

1. Verifica que `VITE_API_URL` en Vercel sea: `https://remote-tech-support-backend.fly.dev`
2. Verifica que el backend esté funcionando: `https://remote-tech-support-backend.fly.dev/health`
3. Revisa la consola del navegador para ver el error específico

### Error: Socket.IO no conecta

**Síntoma:** Los mensajes en tiempo real no funcionan.

**Solución:**

1. Verifica que `VITE_SOCKET_URL` en Vercel sea: `https://remote-tech-support-backend.fly.dev`
2. Verifica que `CORS_ORIGIN` en Fly.io incluya la URL de Vercel
3. Socket.IO también necesita CORS configurado correctamente

---

## 📞 URLs IMPORTANTES

- **Backend (Fly.io):** https://remote-tech-support-backend.fly.dev
- **Frontend (Vercel):** https://tu-proyecto.vercel.app (se generará después del despliegue)
- **Fly.io Dashboard:** https://fly.io/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 🔄 ACTUALIZACIONES FUTURAS

- Cada push a `main` en GitHub desplegará automáticamente en Vercel
- Si cambias la URL de Vercel, recuerda actualizar `CORS_ORIGIN` en Fly.io
- Si cambias variables de entorno, reinicia el backend en Fly.io
