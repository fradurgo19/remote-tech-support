# 🚀 Guía de Deployment - Render.com + Vercel

> **Nota:** Render.com es una excelente alternativa gratuita a Railway, muy similar en funcionalidad.

---

## 🎯 PARTE 1: Render.com (Backend) ⏱️ 10 minutos

### Paso 1.1: Crear cuenta y proyecto

1. Ve a [render.com](https://render.com) y crea una cuenta (gratis, no requiere tarjeta)
2. Click en **"New +"** → **"Web Service"**
3. Conecta con tu cuenta de GitHub
4. Selecciona el repositorio: `fradurgo19/remote-tech-support`

### Paso 1.2: Configurar el servicio

En la configuración del Web Service:

| Campo | Valor |
|-------|-------|
| **Name** | `remote-tech-support-backend` |
| **Region** | Oregon (USA) o la más cercana |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### Paso 1.3: Variables de Entorno

Haz scroll hasta **"Environment Variables"** y agrega TODAS estas (19 variables):

#### Supabase (3 variables)
```
SUPABASE_URL=https://hcmnxrffuvitjkndlojr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbW54cmZmdXZpdGprbmRsb2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjQxNjQsImV4cCI6MjA3NTM0MDE2NH0.mWuAxSuE_L5X0RZ_At7RYB1uMQaq7DKzlsituv2NeMk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbW54cmZmdXZpdGprbmRsb2pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc2NDE2NCwiZXhwIjoyMDc1MzQwMTY0fQ.UKNMq_xmBu3EUxn_CJCK22qfye3QVSHBaBtTvW0zh_E
```

#### Database (1 variable)
```
DATABASE_URL=postgresql://postgres.hcmnxrffuvitjkndlojr:C7HWoSu54jcdiW4v@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

#### Server (2 variables)
```
PORT=3000
NODE_ENV=production
```

#### JWT (2 variables)
```
JWT_SECRET=c014f67682ef5b37ec7b360b10bae0ad223032f92dab02a21c8fdc0ff9c382aca02543efd23e03aa33b0f36ae96d4bec27fffe024f3ad12cfa5f865308d2b0d3
JWT_EXPIRES_IN=7d
```

#### CORS (2 variables - actualizar después)
```
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

#### Email/SMTP (6 variables)
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=analista.mantenimiento@partequipos.com
SMTP_PASS=Fradurgo19.$
SUPPORT_EMAIL=analista.mantenimiento@partequipos.com
```

#### Storage Buckets (3 variables)
```
SUPABASE_BUCKET_AVATARS=avatars
SUPABASE_BUCKET_MESSAGES=message-attachments
SUPABASE_BUCKET_REPORTS=report-attachments
```

#### Rate Limiting (2 variables)
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Logging (1 variable)
```
LOG_LEVEL=info
```

### Paso 1.4: Deploy

1. Click en **"Create Web Service"**
2. Render comenzará a construir y desplegar (3-5 minutos)
3. Verás logs en tiempo real
4. Cuando termine, verás: **"Your service is live 🎉"**

### Paso 1.5: Copiar URL

1. En la parte superior verás la URL del servicio
2. Será algo como: `https://remote-tech-support-backend.onrender.com`
3. **✏️ COPIA ESTA URL** - la necesitarás para Vercel

### Paso 1.6: Verificar

Abre en tu navegador:
```
https://tu-servicio.onrender.com/api/categories
```

Deberías ver un JSON con las categorías ✅

---

## 🎨 PARTE 2: Vercel (Frontend) ⏱️ 5 minutos

### Paso 2.1: Crear proyecto

1. Ve a [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Importa el repositorio: `fradurgo19/remote-tech-support`

### Paso 2.2: Configurar

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (dejar vacío) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Paso 2.3: Variables de Entorno

En **"Environment Variables"**, agrega:

| Name | Value |
|------|-------|
| `VITE_API_URL` | (URL de Render del Paso 1.5) |
| `VITE_SOCKET_URL` | (misma URL de Render) |

**Ejemplo:**
```
VITE_API_URL=https://remote-tech-support-backend.onrender.com
VITE_SOCKET_URL=https://remote-tech-support-backend.onrender.com
```

### Paso 2.4: Deploy

1. Click **"Deploy"**
2. Espera 2-3 minutos
3. Verás: **"Congratulations! 🎉"**
4. **✏️ COPIA LA URL** de Vercel (ej: `https://tu-proyecto.vercel.app`)

---

## 🔄 PARTE 3: Conectar Frontend ↔ Backend ⏱️ 2 minutos

### Paso 3.1: Actualizar CORS en Render

1. Vuelve a Render → Tu servicio → **"Environment"**
2. Edita estas variables:

| Variable | Nuevo Valor |
|----------|-------------|
| `CORS_ORIGIN` | (URL de Vercel del Paso 2.4) |
| `FRONTEND_URL` | (URL de Vercel del Paso 2.4) |

3. Click **"Save Changes"**
4. Render redesplegará automáticamente (1-2 minutos)

---

## ✅ VERIFICACIÓN FINAL

### Abrir la app
```
https://tu-proyecto.vercel.app
```

### Tests:

1. ✅ **Login**: `admin@partequipos.com` / `admin123`
2. ✅ **Dashboard**: Carga tickets, usuarios, reportes
3. ✅ **Crear ticket**: Funciona y envía email
4. ✅ **Upload avatar**: Sube a Supabase Storage
5. ✅ **Crear reporte con archivos**: Archivos en Supabase
6. ✅ **WebSocket**: Mensajes en tiempo real

---

## 🎉 ¡DEPLOYMENT COMPLETADO!

### URLs de Producción:

| Servicio | URL |
|----------|-----|
| **Frontend** | `https://tu-proyecto.vercel.app` |
| **Backend** | `https://tu-servicio.onrender.com` |
| **Database** | Supabase PostgreSQL |
| **Storage** | Supabase Storage |
| **Email** | Outlook SMTP |

### Auto-Deploy:

✅ Cada `git push origin main` desplegará automáticamente en Vercel y Render

---

## ⚠️ IMPORTANTE: Free Tier de Render

**Render Free tier tiene estas características:**

- ✅ **750 horas/mes** (suficiente para 1 app 24/7)
- ✅ **512 MB RAM**
- ✅ **Auto-deploy** desde GitHub
- ⚠️ **Sleep después de 15 min de inactividad** (primer request tarda 30-60 seg en despertar)
- ✅ **SSL/HTTPS** automático

**Para evitar el sleep:**
- Opción 1: Upgrade a plan de pago ($7/mes)
- Opción 2: Usar un servicio de "keep-alive" (UptimeRobot, etc.)
- Opción 3: Aceptar el pequeño delay del primer request

---

## 📊 Monitoreo

### Render
- **Logs**: Dashboard → Logs (en tiempo real)
- **Métricas**: Dashboard → Metrics
- **Events**: Dashboard → Events

### Vercel
- **Analytics**: Dashboard → Analytics
- **Logs**: Dashboard → Deployments

### Supabase
- **Database**: Table Editor
- **Storage**: Ver archivos
- **Logs**: Logs & Analytics

---

## 🆘 Troubleshooting

| Error | Solución |
|-------|----------|
| **CORS blocked** | Verifica `CORS_ORIGIN` en Render = URL exacta de Vercel |
| **Slow first request** | Normal en Render Free (el servicio "despierta") |
| **Build failed** | Revisa logs en Render, verifica `npm run build` |
| **Cannot connect** | Verifica `VITE_API_URL` en Vercel |

---

## 💡 Ventajas de Render vs Railway

✅ **Totalmente gratuito** (no requiere tarjeta)  
✅ **750 horas/mes** (suficiente para 1 app)  
✅ **Auto-deploy** desde GitHub  
✅ **Logs en tiempo real**  
✅ **SSL automático**  
✅ **Muy fácil de usar**  

⚠️ **Único "contra":** Sleep después de 15 min (solo en plan free)

---

**¡Listo para deployment en Render!** 🚀

¿Tienes alguna duda? Puedo ayudarte durante el proceso paso a paso.

