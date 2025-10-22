# 🚀 Guía de Deployment con Supabase + Railway + Vercel

Esta guía completa te llevará paso a paso para desplegar tu aplicación de Soporte Técnico usando:
- **Supabase Pro** - Base de datos PostgreSQL + Storage
- **Railway** - Backend (Node.js + Socket.IO)
- **Vercel** - Frontend (React + Vite)

---

## 📋 Índice

1. [Configurar Supabase (Base de Datos + Storage)](#1-configurar-supabase)
2. [Configurar Variables de Entorno](#2-configurar-variables-de-entorno)
3. [Desplegar Backend en Railway](#3-desplegar-backend-en-railway)
4. [Desplegar Frontend en Vercel](#4-desplegar-frontend-en-vercel)
5. [Verificación y Pruebas](#5-verificación-y-pruebas)

---

## 1. Configurar Supabase

### 1.1 Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en **"New Project"**
4. Completa los datos:
   - **Name**: `partequipos-soporte`
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana (ej: `South America (São Paulo)`)
   - **Pricing Plan**: **Supabase Pro** ✨

5. Haz clic en **"Create new project"**
6. Espera 2-3 minutos mientras Supabase configura tu proyecto

### 1.2 Obtener Credenciales de Supabase

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia y guarda estos valores:

```
Project URL:        https://tu-proyecto.supabase.co
anon public key:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key:   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (⚠️ MANTENER SECRETO)
```

3. Ve a **Settings** → **Database**
4. Copia el **Connection String** (en la sección **Connection pooling**):

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

⚠️ **IMPORTANTE**: Reemplaza `[PASSWORD]` con tu contraseña de base de datos.

### 1.3 Configurar Base de Datos

#### Opción A: Usando Supabase SQL Editor (Recomendado)

1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Haz clic en **"New query"**
3. Abre el archivo `server/supabase-database-setup.sql`
4. Copia y pega **TODO** el contenido del archivo en el editor
5. Haz clic en **"Run"** (esquina inferior derecha)
6. Espera unos segundos. Deberías ver:
   ```
   ✅ Success. 0 rows returned
   ```

#### Opción B: Usando psql (línea de comandos)

```bash
# Navega al directorio del servidor
cd server

# Ejecuta el script SQL
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < supabase-database-setup.sql
```

### 1.4 Configurar Supabase Storage

1. **Inicializar buckets automáticamente**:

```bash
# Navega al directorio del servidor
cd server

# Configura tu .env con las credenciales de Supabase
cp env.supabase.example .env

# Edita .env y completa:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL

# Ejecuta el script de inicialización
npm run build
node dist/scripts/initSupabaseBuckets.js
```

2. **Configurar políticas de seguridad (RLS)**:

Ve a **Storage** en tu dashboard de Supabase y configura las siguientes políticas para cada bucket:

#### Bucket: `avatars`

```sql
-- Política: Los usuarios pueden subir su propio avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Todos pueden ver avatares
CREATE POLICY "Public avatars are viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Política: Los usuarios pueden actualizar su propio avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Los usuarios pueden eliminar su propio avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Bucket: `message-attachments`

```sql
-- Política: Los usuarios autenticados pueden subir archivos
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message-attachments');

-- Política: Los usuarios autenticados pueden ver archivos
CREATE POLICY "Authenticated users can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'message-attachments');
```

#### Bucket: `report-attachments`

```sql
-- Política: Los usuarios autenticados pueden subir reportes
CREATE POLICY "Authenticated users can upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'report-attachments');

-- Política: Los usuarios autenticados pueden ver reportes
CREATE POLICY "Authenticated users can view reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'report-attachments');
```

### 1.5 Verificar Configuración

Ejecuta estas consultas en **SQL Editor** para verificar:

```sql
-- Verificar que las tablas se crearon
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar usuarios de ejemplo
SELECT id, name, email, role FROM "Users";

-- Verificar categorías
SELECT id, name FROM "Categories";
```

Deberías ver:
- 9 tablas creadas
- 3 usuarios (admin, técnico, cliente)
- 5 categorías

---

## 2. Configurar Variables de Entorno

### 2.1 Backend (Railway)

Crea un archivo `.env` en el directorio `server/`:

```env
# =====================================================
# SUPABASE CONFIGURATION
# =====================================================
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Database URL (Connection Pooling - para producción)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# =====================================================
# SERVER CONFIGURATION
# =====================================================
PORT=3000
NODE_ENV=production

# =====================================================
# JWT CONFIGURATION
# =====================================================
# Genera uno seguro con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=tu-jwt-secret-super-seguro-de-64-caracteres-minimo
JWT_EXPIRES_IN=7d

# =====================================================
# CORS CONFIGURATION
# =====================================================
# Tu URL de Vercel (actualizar después del deploy)
CORS_ORIGIN=https://tu-app.vercel.app

# =====================================================
# EMAIL CONFIGURATION
# =====================================================
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=analista.mantenimiento@partequipos.com
EMAIL_PASSWORD=tu-password-de-email
EMAIL_FROM=Soporte Técnico Partequipos <analista.mantenimiento@partequipos.com>

# =====================================================
# FRONTEND URL
# =====================================================
FRONTEND_URL=https://tu-app.vercel.app

# =====================================================
# SUPABASE STORAGE BUCKETS
# =====================================================
SUPABASE_BUCKET_AVATARS=avatars
SUPABASE_BUCKET_MESSAGES=message-attachments
SUPABASE_BUCKET_REPORTS=report-attachments
```

### 2.2 Frontend (Vercel)

Crea un archivo `.env` en el directorio raíz:

```env
# Backend URL (actualizar después del deploy en Railway)
VITE_API_URL=https://tu-backend.railway.app
VITE_SOCKET_URL=https://tu-backend.railway.app

# Supabase (solo para acceso público desde el cliente)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

---

## 3. Desplegar Backend en Railway

### 3.1 Preparar el Proyecto

El proyecto ya está configurado con:
- ✅ `Procfile` (comando de inicio)
- ✅ `railway.json` (configuración de build)

### 3.2 Crear Cuenta en Railway

1. Ve a [https://railway.app](https://railway.app)
2. Haz clic en **"Start a New Project"**
3. Inicia sesión con GitHub

### 3.3 Crear Nuevo Proyecto

1. Haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Selecciona tu repositorio: `partequipos-soporte` (o el nombre que tengas)
4. Railway detectará automáticamente que es un proyecto Node.js

### 3.4 Configurar Variables de Entorno en Railway

1. Haz clic en tu servicio
2. Ve a la pestaña **"Variables"**
3. Agrega **TODAS** las variables de entorno del archivo `.env` del backend:

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
PORT
NODE_ENV
JWT_SECRET
JWT_EXPIRES_IN
CORS_ORIGIN
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASSWORD
EMAIL_FROM
FRONTEND_URL
SUPABASE_BUCKET_AVATARS
SUPABASE_BUCKET_MESSAGES
SUPABASE_BUCKET_REPORTS
```

⚠️ **IMPORTANTE**: 
- Actualiza `CORS_ORIGIN` y `FRONTEND_URL` después de desplegar el frontend
- Usa `NODE_ENV=production`

### 3.5 Configurar el Build

Railway debería detectar automáticamente:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

Si no, configúralos manualmente en **Settings** → **Deploy**.

### 3.6 Desplegar

1. Railway desplegará automáticamente
2. Espera 2-5 minutos
3. Una vez completado, verás una URL como: `https://tu-backend.up.railway.app`
4. Copia esta URL

### 3.7 Actualizar Variables de Entorno

Ahora que tienes la URL del backend:

1. Ve al **Frontend** en Vercel
2. Actualiza las variables:
   ```
   VITE_API_URL=https://tu-backend.up.railway.app
   VITE_SOCKET_URL=https://tu-backend.up.railway.app
   ```

3. Ve al **Backend** en Railway
4. Actualiza las variables:
   ```
   CORS_ORIGIN=https://tu-app.vercel.app
   FRONTEND_URL=https://tu-app.vercel.app
   ```

---

## 4. Desplegar Frontend en Vercel

### 4.1 Preparar el Proyecto

El proyecto ya está configurado con:
- ✅ `vite.config.ts` (configuración de build)
- ✅ `vercel.json` (si existe, configuración de Vercel)

### 4.2 Crear Cuenta en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Inicia sesión con GitHub

### 4.3 Importar Proyecto

1. Haz clic en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio de GitHub
3. Vercel detectará automáticamente que es un proyecto Vite

### 4.4 Configurar el Proyecto

**Framework Preset**: Vite
**Root Directory**: `./` (raíz del proyecto)
**Build Command**: `npm run build`
**Output Directory**: `dist`

### 4.5 Configurar Variables de Entorno

Antes de desplegar, agrega las variables de entorno:

```
VITE_API_URL=https://tu-backend.up.railway.app
VITE_SOCKET_URL=https://tu-backend.up.railway.app
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 4.6 Desplegar

1. Haz clic en **"Deploy"**
2. Vercel construirá y desplegará automáticamente
3. Espera 2-3 minutos
4. Una vez completado, verás una URL como: `https://tu-app.vercel.app`

### 4.7 Configurar Dominio Personalizado (Opcional)

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado: `soporte.partequipos.com`
3. Sigue las instrucciones para configurar DNS

---

## 5. Verificación y Pruebas

### 5.1 Verificar Backend

Abre en tu navegador:
```
https://tu-backend.up.railway.app/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 5.2 Verificar Frontend

1. Abre: `https://tu-app.vercel.app`
2. Deberías ver la página de login
3. Credenciales de prueba:
   - **Admin**: `admin@partequipos.com` / `admin123`
   - **Técnico**: `auxiliar.garantiasbg@partequipos.com` / `admin123`
   - **Cliente**: `ana.garcia@empresa.com` / `admin123`

### 5.3 Pruebas Completas

1. **Login**: Inicia sesión con cada rol
2. **Crear Ticket**: Crea un ticket como cliente
3. **Videollamada**: Prueba una videollamada entre cliente y técnico
4. **Chat**: Envía mensajes y archivos
5. **Subir Avatar**: Sube una foto de perfil
6. **Notificaciones**: Verifica que las notificaciones funcionen

### 5.4 Monitoreo

#### Railway
- **Logs**: Ve a tu servicio → **Deployments** → clic en deployment → **View Logs**
- **Metrics**: Monitorea CPU, RAM, Network

#### Vercel
- **Analytics**: Ve a **Analytics** para métricas de rendimiento
- **Logs**: Ve a **Deployments** → clic en deployment → **Function Logs**

#### Supabase
- **Database**: Ve a **Database** → **Tables** para ver datos
- **Storage**: Ve a **Storage** para ver archivos subidos
- **Logs**: Ve a **Logs** para debugging

---

## 🔒 Seguridad en Producción

### Cambiar Contraseñas por Defecto

⚠️ **IMPORTANTE**: Las contraseñas por defecto son `admin123`. Cámbialas inmediatamente:

1. Inicia sesión como admin
2. Ve a **Configuración** → **Cambiar Contraseña**
3. O ejecuta este script en Supabase SQL Editor:

```sql
-- Cambiar contraseña del admin (reemplaza 'tu-nueva-contraseña-hasheada')
UPDATE "Users" 
SET password = 'tu-nueva-contraseña-hasheada'
WHERE email = 'admin@partequipos.com';
```

Para generar el hash:
```bash
node server/generate-password-hash.js tu-nueva-contraseña
```

### Configurar Rate Limiting

El backend ya tiene rate limiting configurado. Ajusta según necesidad en `server/src/index.ts`.

### Configurar HTTPS

Railway y Vercel proveen HTTPS automáticamente. ✅

### Backup de Base de Datos

Supabase Pro incluye backups automáticos diarios. Ve a **Database** → **Backups**.

---

## 🚨 Troubleshooting

### Error: "Database connection failed"

1. Verifica que `DATABASE_URL` esté correctamente configurada
2. Asegúrate de usar la **Connection Pooling URL** (puerto 6543)
3. Verifica que la contraseña no tenga caracteres especiales sin codificar

### Error: "Supabase Storage upload failed"

1. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
2. Ejecuta el script de inicialización de buckets
3. Verifica las políticas RLS en Supabase Dashboard

### Error: "CORS policy blocked"

1. Verifica que `CORS_ORIGIN` en Railway coincida con tu URL de Vercel
2. Actualiza y redespliega el backend

### Videollamadas no funcionan

1. Verifica que Socket.IO esté funcionando:
   ```bash
   curl https://tu-backend.up.railway.app/socket.io/
   ```
2. Railway soporta WebSockets nativamente, no requiere configuración extra

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisa los logs en Railway y Vercel
2. Consulta la documentación de Supabase
3. Contacta a tu equipo de desarrollo

---

## 🎉 ¡Felicitaciones!

Tu aplicación de Soporte Técnico está ahora desplegada en producción con:
- ✅ Base de datos PostgreSQL escalable (Supabase Pro)
- ✅ Storage seguro para archivos (Supabase Storage)
- ✅ Backend con WebSockets (Railway)
- ✅ Frontend ultrarrápido (Vercel)
- ✅ SSL/HTTPS automático
- ✅ Despliegues automáticos desde GitHub

**¡A brindar soporte técnico de clase mundial!** 🚀

