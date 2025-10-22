# 🚀 Guía de Deployment Profesional - Railway + Vercel

Esta guía te llevará paso a paso para desplegar tu aplicación de Soporte Técnico de manera profesional.

---

## 📋 **Pre-requisitos**

✅ Cuenta en [Railway.app](https://railway.app)  
✅ Cuenta en [Vercel](https://vercel.com)  
✅ Cuenta en [Supabase](https://supabase.com) (ya configurada)  
✅ Repositorio en GitHub (ya tienes uno)  

---

## 🎯 **PARTE 1: Desplegar Backend en Railway**

### **Paso 1.1: Crear proyecto en Railway**

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza acceso a tu repositorio de GitHub
5. Selecciona el repositorio: `fradurgo19/remote-tech-support`
6. Railway detectará automáticamente que es un proyecto Node.js

### **Paso 1.2: Configurar el directorio raíz**

Railway necesita saber que el backend está en la carpeta `server/`:

1. En el proyecto de Railway, ve a **Settings**
2. En **"Root Directory"**, ingresa: `server`
3. En **"Build Command"**, ingresa: `npm install && npm run build`
4. En **"Start Command"**, ingresa: `npm start`
5. Click en **"Save Changes"**

### **Paso 1.3: Configurar Variables de Entorno**

En Railway, ve a la pestaña **"Variables"** y agrega TODAS estas variables (copia los valores de tu `.env` local):

```env
# Supabase
SUPABASE_URL=https://hcmnxrffuvitjkndlojr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbW54cmZmdXZpdGprbmRsb2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjQxNjQsImV4cCI6MjA3NTM0MDE2NH0.mWuAxSuE_L5X0RZ_At7RYB1uMQaq7DKzlsituv2NeMk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbW54cmZmdXZpdGprbmRsb2pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc2NDE2NCwiZXhwIjoyMDc1MzQwMTY0fQ.UKNMq_xmBu3EUxn_CJCK22qfye3QVSHBaBtTvW0zh_E

# Database
DATABASE_URL=postgresql://postgres.hcmnxrffuvitjkndlojr:C7HWoSu54jcdiW4v@aws-1-sa-east-1.pooler.supabase.com:5432/postgres

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=c014f67682ef5b37ec7b360b10bae0ad223032f92dab02a21c8fdc0ff9c382aca02543efd23e03aa33b0f36ae96d4bec27fffe024f3ad12cfa5f865308d2b0d3
JWT_EXPIRES_IN=7d

# CORS (actualizarás esto después de desplegar en Vercel)
CORS_ORIGIN=http://localhost:5173

# Email/SMTP
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=analista.mantenimiento@partequipos.com
SMTP_PASS=Ipuwer19.$
SUPPORT_EMAIL=analista.mantenimiento@partequipos.com

# Frontend URL (actualizarás esto después)
FRONTEND_URL=http://localhost:5173

# Supabase Storage
SUPABASE_BUCKET_AVATARS=avatars
SUPABASE_BUCKET_MESSAGES=message-attachments
SUPABASE_BUCKET_REPORTS=report-attachments

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### **Paso 1.4: Desplegar**

1. Click en **"Deploy"**
2. Espera a que termine el build (3-5 minutos)
3. Railway te dará una URL pública, algo como: `https://tu-proyecto.railway.app`
4. **COPIA ESTA URL** - la necesitarás para el frontend

### **Paso 1.5: Verificar el deployment**

Abre en tu navegador:
```
https://tu-proyecto.railway.app/api/categories
```

Deberías ver un JSON con las categorías. ✅

---

## 🎨 **PARTE 2: Desplegar Frontend en Vercel**

### **Paso 2.1: Preparar el frontend**

Antes de desplegar, necesitas actualizar la URL del backend en tu código.

1. Abre el archivo: `src/services/api.ts`
2. Busca la línea que tiene: `http://localhost:3000`
3. Reemplázala con la URL de Railway que copiaste

**O mejor aún**, usa variables de entorno:

Crea el archivo `.env.production` en la raíz del proyecto (frontend):

```env
VITE_API_URL=https://tu-proyecto.railway.app
```

Luego actualiza `src/services/api.ts` para usar:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### **Paso 2.2: Hacer commit de los cambios**

```bash
git add .
git commit -m "feat: Add production configuration for Railway and Vercel"
git push origin main
```

### **Paso 2.3: Desplegar en Vercel**

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New..."** → **"Project"**
3. Importa el repositorio: `fradurgo19/remote-tech-support`
4. Vercel detectará automáticamente que es un proyecto Vite/React

### **Paso 2.4: Configurar el proyecto**

En la configuración de Vercel:

**Framework Preset**: Vite  
**Root Directory**: `.` (raíz del proyecto, NO `src`)  
**Build Command**: `npm run build`  
**Output Directory**: `dist`  

### **Paso 2.5: Agregar Variables de Entorno**

En la sección **"Environment Variables"**, agrega:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://tu-proyecto.railway.app` |

### **Paso 2.6: Deploy**

1. Click en **"Deploy"**
2. Espera 2-3 minutos
3. Vercel te dará una URL, algo como: `https://tu-proyecto.vercel.app`
4. **COPIA ESTA URL**

---

## 🔄 **PARTE 3: Conectar Frontend y Backend**

### **Paso 3.1: Actualizar CORS en Railway**

Vuelve a Railway y actualiza estas variables de entorno:

| Variable | Nuevo Valor |
|----------|-------------|
| `CORS_ORIGIN` | `https://tu-proyecto.vercel.app` |
| `FRONTEND_URL` | `https://tu-proyecto.vercel.app` |

Esto permitirá que el frontend en Vercel se comunique con el backend en Railway.

### **Paso 3.2: Redeploy automático**

Railway automáticamente redesplegará con las nuevas variables. Espera 1-2 minutos.

---

## ✅ **PARTE 4: Verificación Final**

### **Pruebas a realizar:**

1. **Login**: Abre `https://tu-proyecto.vercel.app` e intenta iniciar sesión
   - Usuario: `admin@partequipos.com`
   - Contraseña: `admin123`

2. **Dashboard**: Verifica que cargue tickets, usuarios, reportes

3. **Crear Ticket**: Intenta crear un nuevo ticket

4. **Upload de archivos**: 
   - Sube un avatar
   - Crea un reporte con archivos adjuntos
   - Los archivos deben guardarse en Supabase Storage

5. **Emails**: Cambia el estado de un ticket y verifica que llegue el email

6. **WebRTC/Video**: Prueba una llamada de video (si tienes otro usuario)

---

## 🔐 **PARTE 5: Seguridad Post-Deployment**

### **5.1: Cambiar credenciales de producción**

**IMPORTANTE**: Las contraseñas por defecto (`admin123`) son solo para desarrollo.

En producción, debes:

1. Conectarte a Supabase SQL Editor
2. Ejecutar:
```sql
-- Cambiar contraseña del admin
UPDATE "Users" 
SET password = '$2a$10$tu_nuevo_hash_bcrypt_aqui'
WHERE email = 'admin@partequipos.com';
```

O crear un endpoint para cambiar contraseñas desde la app.

### **5.2: Configurar dominio personalizado (Opcional)**

**En Vercel:**
1. Ve a **Settings** → **Domains**
2. Agrega tu dominio (ej: `soporte.partequipos.com`)
3. Configura los DNS según las instrucciones de Vercel

**Actualizar CORS:**
- Vuelve a Railway
- Cambia `CORS_ORIGIN` y `FRONTEND_URL` a tu dominio personalizado

### **5.3: Habilitar HTTPS (Ya incluido)**

✅ Railway y Vercel incluyen HTTPS automáticamente

---

## 🎉 **¡Deployment Completado!**

Tu aplicación ahora está en producción:

- **Frontend**: `https://tu-proyecto.vercel.app`
- **Backend**: `https://tu-proyecto.railway.app`
- **Base de datos**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Emails**: Outlook SMTP

---

## 📊 **Monitoreo y Logs**

### **Railway (Backend):**
- **Logs**: Railway Dashboard → Pestaña "Deployments" → Click en deployment → Ver logs
- **Métricas**: CPU, RAM, Network en tiempo real

### **Vercel (Frontend):**
- **Analytics**: Dashboard → Analytics (gratis hasta 100k requests/mes)
- **Logs**: Dashboard → Deployments → Click en deployment

### **Supabase:**
- **Database**: Table Editor para ver datos
- **Storage**: Storage para ver archivos subidos
- **Logs**: Logs & Analytics

---

## 🆘 **Troubleshooting**

### **Error: CORS blocked**
- Verifica que `CORS_ORIGIN` en Railway tenga la URL exacta de Vercel
- No incluyas `/` al final

### **Error: Cannot connect to database**
- Verifica que `DATABASE_URL` esté correcta
- Usa la URL de "Connection Pooling" de Supabase

### **Error: 502 Bad Gateway en Railway**
- Revisa los logs en Railway
- Verifica que `npm start` esté ejecutando `node dist/index.js`
- Asegúrate de que `npm run build` haya compilado correctamente

### **Frontend no se conecta al backend**
- Verifica `VITE_API_URL` en Vercel
- Abre Developer Tools → Network para ver los requests

---

## 🔄 **Deploy de actualizaciones**

Cada vez que hagas `git push origin main`:

- ✅ **Vercel** redesplegará automáticamente el frontend
- ✅ **Railway** redesplegará automáticamente el backend

**¡Es automático!** 🎉

---

## 📞 **Soporte**

Si algo no funciona:
1. Revisa los logs en Railway y Vercel
2. Verifica todas las variables de entorno
3. Asegúrate de que Supabase esté accesible

---

**¡Felicitaciones! Tu aplicación está en producción de manera profesional** 🚀
