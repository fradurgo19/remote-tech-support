# 🚀 Guía de Deployment en Fly.io

## ✅ Por qué Fly.io es mejor para esta app:

- ✅ **Sin restricciones de red** (conecta a Supabase sin problemas)
- ✅ **Excelente para WebSockets** (Socket.IO funciona perfecto)
- ✅ **Excelente para WebRTC** (videollamadas)
- ✅ **3 apps gratis** (256MB RAM cada una)
- ✅ **Sin sleep** en free tier
- ✅ **Auto-deploy** desde GitHub
- ✅ **Región en Miami** (más cerca de Supabase SA)

---

## 📋 **PASO 1: Instalar Fly.io CLI**

### **En Windows (PowerShell como Administrador):**

```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### **Verificar instalación:**

Cierra y abre una nueva terminal, luego:

```bash
flyctl version
```

Deberías ver algo como: `flyctl v0.x.x`

---

## 🔐 **PASO 2: Crear cuenta y login**

```bash
flyctl auth signup
```

O si ya tienes cuenta:

```bash
flyctl auth login
```

Esto abrirá tu navegador para autenticarte con GitHub.

---

## 🚀 **PASO 3: Crear app en Fly.io**

```bash
cd "C:\Users\Frank Duran\OneDrive - Partequipos S.A.S\Escritorio\Soporte\project\server"
flyctl launch
```

Fly.io te hará preguntas:

| Pregunta | Respuesta |
|----------|-----------|
| **App name** | `remote-tech-support-backend` |
| **Region** | `mia` (Miami - más cercano a SA) |
| **Set up Postgresql?** | **No** (ya tienes Supabase) |
| **Set up Redis?** | **No** |
| **Deploy now?** | **No** (primero configuramos variables) |

Esto creará el archivo `fly.toml` automáticamente.

---

## 🔧 **PASO 4: Configurar Variables de Entorno**

```bash
# Supabase
flyctl secrets set SUPABASE_URL=https://hcmnxrffuvitjkndlojr.supabase.co
flyctl secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbW54cmZmdXZpdGprbmRsb2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjQxNjQsImV4cCI6MjA3NTM0MDE2NH0.mWuAxSuE_L5X0RZ_At7RYB1uMQaq7DKzlsituv2NeMk
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbW54cmZmdXZpdGprbmRsb2pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc2NDE2NCwiZXhwIjoyMDc1MzQwMTY0fQ.UKNMq_xmBu3EUxn_CJCK22qfye3QVSHBaBtTvW0zh_E

# Database
flyctl secrets set DATABASE_URL=postgresql://postgres.hcmnxrffuvitjkndlojr:C7HWoSu54jcdiW4v@aws-1-sa-east-1.pooler.supabase.com:6543/postgres

# JWT
flyctl secrets set JWT_SECRET=c014f67682ef5b37ec7b360b10bae0ad223032f92dab02a21c8fdc0ff9c382aca02543efd23e03aa33b0f36ae96d4bec27fffe024f3ad12cfa5f865308d2b0d3
flyctl secrets set JWT_EXPIRES_IN=7d

# CORS (actualizar después de desplegar)
flyctl secrets set CORS_ORIGIN=https://remote-tech-support.vercel.app
flyctl secrets set FRONTEND_URL=https://remote-tech-support.vercel.app

# Email
flyctl secrets set SMTP_HOST=smtp-mail.outlook.com
flyctl secrets set SMTP_PORT=587
flyctl secrets set SMTP_SECURE=false
flyctl secrets set SMTP_USER=analista.mantenimiento@partequipos.com
flyctl secrets set SMTP_PASS=Fradurgo19.$
flyctl secrets set SUPPORT_EMAIL=analista.mantenimiento@partequipos.com

# Storage
flyctl secrets set SUPABASE_BUCKET_AVATARS=avatars
flyctl secrets set SUPABASE_BUCKET_MESSAGES=message-attachments
flyctl secrets set SUPABASE_BUCKET_REPORTS=report-attachments

# Rate Limiting
flyctl secrets set RATE_LIMIT_WINDOW_MS=900000
flyctl secrets set RATE_LIMIT_MAX_REQUESTS=100
flyctl secrets set LOG_LEVEL=info

# Pool
flyctl secrets set DB_POOL_MAX=5
```

---

## 🚀 **PASO 5: Desplegar**

```bash
flyctl deploy
```

Fly.io:
1. Construirá la imagen Docker
2. Subirá a su registry
3. Desplegará en la región de Miami
4. Te dará una URL: `https://remote-tech-support-backend.fly.dev`

---

## 🎨 **PASO 6: Actualizar Vercel**

En Vercel → Environment Variables:

```
VITE_API_URL=https://remote-tech-support-backend.fly.dev
VITE_SOCKET_URL=https://remote-tech-support-backend.fly.dev
```

Redeploy en Vercel.

---

## ✅ **VENTAJAS DE FLY.IO:**

1. ✅ Conexión estable a Supabase
2. ✅ WebSockets sin problemas
3. ✅ Sin sleep (siempre activo)
4. ✅ 3 apps gratis
5. ✅ Región en Miami (baja latencia a SA)

---

**¿Ya instalaste flyctl?** Cuando esté listo, ejecuta `flyctl auth signup` y avísame para continuar con el deployment. 🚀
