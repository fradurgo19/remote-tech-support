# 🚀 Guía Rápida de Deployment

## ✅ Pre-requisitos completados
- ✅ Código funcionando localmente
- ✅ Supabase configurado (DB + Storage)
- ✅ Email service configurado
- ✅ Repositorio en GitHub actualizado

---

## 📦 PASO 1: Railway (Backend)

### 1.1 Crear proyecto
1. Ve a [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Selecciona: `fradurgo19/remote-tech-support`

### 1.2 Configurar
- **Settings** → **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 1.3 Variables de Entorno
Copia TODAS las variables de tu `server/.env` local a Railway:

```env
SUPABASE_URL=https://hcmnxrffuvitjkndlojr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.hcmnxrffuvitjkndlojr:C7HWoSu54jcdiW4v@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
PORT=3000
NODE_ENV=production
JWT_SECRET=c014f67682ef5b37ec7b360b10bae0ad223032f92dab02a21c8fdc0ff9c382aca02543efd23e03aa33b0f36ae96d4bec27fffe024f3ad12cfa5f865308d2b0d3
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=analista.mantenimiento@partequipos.com
SMTP_PASS=Fradurgo19.$
SUPPORT_EMAIL=analista.mantenimiento@partequipos.com
FRONTEND_URL=http://localhost:5173
SUPABASE_BUCKET_AVATARS=avatars
SUPABASE_BUCKET_MESSAGES=message-attachments
SUPABASE_BUCKET_REPORTS=report-attachments
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### 1.4 Deploy
- Click **Deploy**
- Espera 3-5 minutos
- **COPIA LA URL** de Railway (ej: `https://tu-proyecto.railway.app`)

---

## 🎨 PASO 2: Vercel (Frontend)

### 2.1 Desplegar
1. Ve a [vercel.com](https://vercel.com)
2. **Add New** → **Project**
3. Importa: `fradurgo19/remote-tech-support`

### 2.2 Configurar
- **Framework Preset**: Vite
- **Root Directory**: `.` (raíz)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2.3 Variables de Entorno
En **Environment Variables**, agrega:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://tu-proyecto.railway.app` |
| `VITE_SOCKET_URL` | `https://tu-proyecto.railway.app` |

### 2.4 Deploy
- Click **Deploy**
- Espera 2-3 minutos
- **COPIA LA URL** de Vercel (ej: `https://tu-proyecto.vercel.app`)

---

## 🔄 PASO 3: Conectar Frontend y Backend

### 3.1 Actualizar CORS en Railway
Vuelve a Railway → **Variables** → Edita:

| Variable | Nuevo Valor |
|----------|-------------|
| `CORS_ORIGIN` | `https://tu-proyecto.vercel.app` |
| `FRONTEND_URL` | `https://tu-proyecto.vercel.app` |

Railway redesplegará automáticamente (1-2 min).

---

## ✅ PASO 4: Verificar

### Abre tu app en Vercel
```
https://tu-proyecto.vercel.app
```

### Prueba:
1. ✅ Login: `admin@partequipos.com` / `admin123`
2. ✅ Dashboard carga tickets/usuarios/reportes
3. ✅ Crear ticket
4. ✅ Upload avatar
5. ✅ Crear reporte con archivos
6. ✅ Cambiar estado → Email enviado

---

## 🎉 ¡LISTO!

Tu app está en producción:
- **Frontend**: Vercel (auto-deploy en cada push)
- **Backend**: Railway (auto-deploy en cada push)
- **DB**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Emails**: Outlook SMTP

---

## 🔧 Troubleshooting

**❌ CORS Error**
→ Verifica `CORS_ORIGIN` en Railway = URL exacta de Vercel (sin `/` al final)

**❌ Cannot connect to backend**
→ Verifica `VITE_API_URL` en Vercel = URL de Railway

**❌ Database error**
→ Verifica `DATABASE_URL` en Railway

**❌ Files not uploading**
→ Verifica credenciales de Supabase en Railway

---

## 📝 Próximos pasos (Opcional)

### Dominio personalizado
**Vercel**: Settings → Domains → Agregar `soporte.partequipos.com`

**Railway**: Settings → Domains → Agregar `api.partequipos.com`

**Actualizar CORS**: Cambiar `CORS_ORIGIN` al nuevo dominio

### Cambiar contraseñas
```sql
-- En Supabase SQL Editor
UPDATE "Users" 
SET password = '$2a$10$nuevo_hash_bcrypt_aqui'
WHERE email = 'admin@partequipos.com';
```

---

**¿Dudas?** Revisa los logs:
- **Railway**: Deployments → Ver logs
- **Vercel**: Deployments → Ver logs

