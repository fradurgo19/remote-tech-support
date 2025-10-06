# 🚀 Supabase Quick Start Guide

Guía rápida para configurar Supabase en 10 minutos.

---

## 📝 Checklist Rápido

- [ ] Crear proyecto en Supabase
- [ ] Copiar credenciales
- [ ] Ejecutar script SQL
- [ ] Inicializar buckets de Storage
- [ ] Configurar variables de entorno
- [ ] Probar localmente
- [ ] Desplegar en Railway + Vercel

---

## 1️⃣ Crear Proyecto en Supabase (2 min)

1. Ve a [supabase.com](https://supabase.com) → **Sign Up / Log In**
2. Clic en **"New Project"**
3. Configura:
   - **Name**: `partequipos-soporte`
   - **Database Password**: (genera y guarda)
   - **Region**: `South America (São Paulo)`
   - **Plan**: **Pro** ($25/mes)
4. Clic en **"Create new project"**
5. Espera 2-3 minutos ☕

---

## 2️⃣ Copiar Credenciales (1 min)

### En Supabase Dashboard:

**Settings → API**:
```
Project URL:     https://xxxxxxxxxx.supabase.co
anon key:        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ⚠️ SECRETO
```

**Settings → Database → Connection String → Connection pooling**:
```
postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**⚠️ Reemplaza `[PASSWORD]` con tu contraseña de BD**

---

## 3️⃣ Ejecutar Script SQL (2 min)

### Opción A: Supabase SQL Editor (Más fácil)

1. Ve a **SQL Editor** en Supabase Dashboard
2. Clic en **"New query"**
3. Abre `server/supabase-database-setup.sql`
4. **Copia TODO** el contenido
5. **Pega** en el editor
6. Clic en **"Run"** ▶️
7. Espera... Deberías ver: `✅ Success`

### Verificar

Ejecuta en el SQL Editor:
```sql
SELECT id, name, email, role FROM "Users";
```

Deberías ver 3 usuarios:
- admin@partequipos.com
- auxiliar.garantiasbg@partequipos.com
- ana.garcia@empresa.com

---

## 4️⃣ Configurar Storage (2 min)

### Configurar Backend

1. En `server/` crea `.env`:

```bash
cd server
cp env.supabase.example .env
```

2. Edita `.env` y completa:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1N...
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@...pooler.supabase.com:6543/postgres

JWT_SECRET=genera-uno-con-openssl-rand-hex-32
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

3. Inicializa los buckets:

```bash
npm install
npm run init-supabase-buckets
```

Deberías ver:
```
✅ Bucket avatars created successfully
✅ Bucket message-attachments created successfully
✅ Bucket report-attachments created successfully
```

### Configurar Políticas RLS (opcional en desarrollo)

Para desarrollo, puedes desactivar RLS temporalmente:

En **SQL Editor**:
```sql
ALTER TABLE "Users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Tickets" DISABLE ROW LEVEL SECURITY;
-- ... etc para todas las tablas
```

**⚠️ NO HACER ESTO EN PRODUCCIÓN**

---

## 5️⃣ Configurar Frontend (1 min)

1. En la raíz del proyecto crea `.env`:

```bash
cp env.supabase.example .env
```

2. Edita `.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1N...
```

---

## 6️⃣ Probar Localmente (2 min)

### Terminal 1: Backend
```bash
cd server
npm run dev
```

Deberías ver:
```
✅ Database connection established successfully
✅ Server is running on port 3000
```

### Terminal 2: Frontend
```bash
npm run dev
```

Deberías ver:
```
➜ Local:   http://localhost:5173/
```

### Probar

1. Abre http://localhost:5173
2. Login con: `admin@partequipos.com` / `admin123`
3. Crea un ticket
4. Sube un avatar en Configuración
5. Verifica en Supabase Storage que el avatar se subió

---

## 🎉 ¡Listo para Producción!

Ahora puedes seguir la guía completa: `SUPABASE_DEPLOYMENT_GUIDE.md`

---

## 🔧 Troubleshooting Rápido

### Error: "Database connection failed"

```bash
# Verifica que DATABASE_URL esté correcta
echo $DATABASE_URL

# Prueba la conexión
psql "$DATABASE_URL"
```

### Error: "Supabase is not defined"

```bash
# Reinstala dependencias
cd server
npm install @supabase/supabase-js
```

### Error: "Bucket does not exist"

```bash
# Ejecuta de nuevo
npm run init-supabase-buckets
```

### Los archivos no se suben

1. Verifica en Supabase Dashboard → **Storage** que los buckets existan
2. Verifica en **Storage** → **Policies** que las políticas estén configuradas
3. Verifica los logs del backend: busca errores de Supabase

---

## 📞 URLs Útiles

- **Supabase Dashboard**: https://app.supabase.com
- **Supabase Docs**: https://supabase.com/docs
- **Railway Dashboard**: https://railway.app
- **Vercel Dashboard**: https://vercel.com

---

## 💡 Consejos Pro

1. **Backups**: Supabase Pro incluye backups diarios automáticos
2. **Monitoreo**: Ve a **Reports** en Supabase para ver uso
3. **Logs**: Ve a **Logs** para debugging en tiempo real
4. **API Logs**: Monitorea todas las requests a tu API
5. **Escalabilidad**: Supabase Pro soporta 50GB de BD y 100GB de Storage

---

**¿Necesitas ayuda?** Consulta `SUPABASE_DEPLOYMENT_GUIDE.md` para más detalles.

