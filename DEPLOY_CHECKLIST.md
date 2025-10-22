# ✅ Checklist de Deployment - Railway + Vercel

## 📋 Pre-Deployment (✅ Completado)

- [x] Código funcionando localmente
- [x] Supabase Pro configurado
  - [x] Base de datos PostgreSQL
  - [x] Storage buckets (avatars, messages, reports)
  - [x] Todas las tablas creadas
- [x] Email service configurado (Outlook SMTP)
- [x] Variables de entorno usando `import.meta.env`
- [x] Archivos de configuración creados
  - [x] `railway.json`
  - [x] `server/Procfile`
  - [x] `vercel.json`
- [x] Código pusheado a GitHub

---

## 🚀 DEPLOYMENT

### PARTE 1: Railway (Backend) ⏱️ 10 minutos

#### Paso 1: Crear Proyecto

- [ ] Ir a https://railway.app
- [ ] Click en "New Project"
- [ ] Seleccionar "Deploy from GitHub repo"
- [ ] Conectar con GitHub
- [ ] Seleccionar repositorio: `fradurgo19/remote-tech-support`

#### Paso 2: Configurar Build

- [ ] Ir a **Settings**
- [ ] **Root Directory**: `server`
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Start Command**: `npm start`
- [ ] Click "Save Changes"

#### Paso 3: Variables de Entorno (19 variables)

Ir a pestaña **Variables** y agregar:

**Supabase (3):**

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

**Database (1):**

- [ ] `DATABASE_URL`

**Server (2):**

- [ ] `PORT` = `3000`
- [ ] `NODE_ENV` = `production`

**JWT (2):**

- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRES_IN` = `7d`

**CORS (inicialmente localhost, actualizar después):**

- [ ] `CORS_ORIGIN` = `http://localhost:5173`
- [ ] `FRONTEND_URL` = `http://localhost:5173`

**Email/SMTP (4):**

- [ ] `SMTP_HOST` = `smtp-mail.outlook.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_SECURE` = `false`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`
- [ ] `SUPPORT_EMAIL`

**Storage Buckets (3):**

- [ ] `SUPABASE_BUCKET_AVATARS` = `avatars`
- [ ] `SUPABASE_BUCKET_MESSAGES` = `message-attachments`
- [ ] `SUPABASE_BUCKET_REPORTS` = `report-attachments`

**Rate Limiting (2):**

- [ ] `RATE_LIMIT_WINDOW_MS` = `900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS` = `100`

**Logging (1):**

- [ ] `LOG_LEVEL` = `info`

#### Paso 4: Deploy

- [ ] Click en "Deploy"
- [ ] Esperar 3-5 minutos
- [ ] **✏️ COPIAR URL de Railway**: `___________________________`

#### Paso 5: Verificar

- [ ] Abrir en navegador: `https://tu-proyecto.railway.app/api/categories`
- [ ] Debe mostrar JSON con categorías ✅

---

### PARTE 2: Vercel (Frontend) ⏱️ 5 minutos

#### Paso 1: Crear Proyecto

- [ ] Ir a https://vercel.com
- [ ] Click "Add New..." → "Project"
- [ ] Importar repositorio: `fradurgo19/remote-tech-support`

#### Paso 2: Configurar

- [ ] **Framework Preset**: Vite
- [ ] **Root Directory**: `.` (dejar vacío o poner punto)
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`

#### Paso 3: Variables de Entorno (2)

- [ ] `VITE_API_URL` = (URL de Railway del Paso 1.4)
- [ ] `VITE_SOCKET_URL` = (misma URL de Railway)

#### Paso 4: Deploy

- [ ] Click "Deploy"
- [ ] Esperar 2-3 minutos
- [ ] **✏️ COPIAR URL de Vercel**: `___________________________`

---

### PARTE 3: Conectar Frontend ↔ Backend ⏱️ 2 minutos

#### Actualizar CORS en Railway

- [ ] Volver a Railway → Pestaña "Variables"
- [ ] Editar `CORS_ORIGIN` → (URL de Vercel del Paso 2.4)
- [ ] Editar `FRONTEND_URL` → (URL de Vercel del Paso 2.4)
- [ ] Railway redesplegará automáticamente (esperar 1-2 min)

---

## ✅ VERIFICACIÓN FINAL

### Tests a realizar:

- [ ] **Login**

  - Abrir: (URL de Vercel)
  - Usuario: `admin@partequipos.com`
  - Contraseña: `admin123`
  - ✅ Login exitoso

- [ ] **Dashboard**

  - ✅ Carga tickets
  - ✅ Carga usuarios
  - ✅ Carga reportes
  - ✅ Muestra estadísticas

- [ ] **Crear Ticket**

  - ✅ Formulario funciona
  - ✅ Ticket creado
  - ✅ Email recibido

- [ ] **Upload Avatar**

  - ✅ Subir imagen
  - ✅ Avatar actualizado
  - ✅ Archivo en Supabase Storage

- [ ] **Crear Reporte con Archivos**

  - ✅ Subir PDF/imagen
  - ✅ Reporte creado
  - ✅ Archivo en Supabase Storage

- [ ] **Cambiar Estado de Ticket**

  - ✅ Cambiar a "En Progreso"
  - ✅ Email de notificación recibido

- [ ] **WebSocket/Chat**
  - ✅ Socket conectado
  - ✅ Mensajes en tiempo real

---

## 🎉 DEPLOYMENT COMPLETADO

### URLs de Producción:

| Servicio     | URL                                         |
| ------------ | ------------------------------------------- |
| **Frontend** | `https://_____________________.vercel.app`  |
| **Backend**  | `https://_____________________.railway.app` |
| **Database** | Supabase PostgreSQL                         |
| **Storage**  | Supabase Storage                            |
| **Email**    | Outlook SMTP                                |

### Auto-Deploy Activo:

✅ Cada `git push origin main` desplegará automáticamente:

- Frontend en Vercel
- Backend en Railway

---

## 📊 Monitoreo

### Railway (Backend)

- **Logs**: Dashboard → Deployments → Ver logs
- **Métricas**: CPU, RAM, Network en tiempo real
- **URL**: https://railway.app/dashboard

### Vercel (Frontend)

- **Analytics**: Dashboard → Analytics
- **Logs**: Dashboard → Deployments
- **URL**: https://vercel.com/dashboard

### Supabase

- **Database**: Table Editor
- **Storage**: Ver archivos subidos
- **Logs**: Logs & Analytics
- **URL**: https://supabase.com/dashboard

---

## 🔐 Seguridad Post-Deployment

### ⚠️ IMPORTANTE - Cambiar contraseñas por defecto

Las contraseñas actuales son de desarrollo (`admin123`). Para producción:

1. **Opción 1: SQL en Supabase**

```sql
-- Cambiar contraseña del admin
UPDATE "Users"
SET password = '$2a$10$nuevo_hash_bcrypt_aqui'
WHERE email = 'admin@partequipos.com';
```

2. **Opción 2: Crear endpoint de cambio de contraseña**
   - Agregar ruta en backend
   - Usar desde la app

### 🌐 Dominio Personalizado (Opcional)

**Vercel:**

1. Settings → Domains
2. Agregar `soporte.partequipos.com`
3. Configurar DNS según instrucciones

**Railway:**

1. Settings → Domains
2. Agregar `api.partequipos.com`

**Actualizar CORS:**

- En Railway: `CORS_ORIGIN` = nuevo dominio de Vercel
- En Railway: `FRONTEND_URL` = nuevo dominio de Vercel

---

## 🆘 Troubleshooting

| Error                         | Solución                                                           |
| ----------------------------- | ------------------------------------------------------------------ |
| **CORS blocked**              | Verifica `CORS_ORIGIN` en Railway = URL exacta de Vercel (sin `/`) |
| **Cannot connect to backend** | Verifica `VITE_API_URL` en Vercel = URL de Railway                 |
| **Database error**            | Verifica `DATABASE_URL` en Railway con Connection Pooling          |
| **502 Bad Gateway**           | Revisa logs en Railway, verifica `npm start`                       |
| **Files not uploading**       | Verifica credenciales Supabase en Railway                          |
| **Email not sending**         | Verifica `SMTP_*` variables en Railway                             |

---

## 📞 Soporte

**Logs en Railway:**

```
Dashboard → Project → Deployments → Click en deployment → Ver logs
```

**Logs en Vercel:**

```
Dashboard → Project → Deployments → Click en deployment → Ver logs
```

**Base de datos en Supabase:**

```
Dashboard → SQL Editor → Ejecutar queries
```

---

**🎉 ¡Felicitaciones! Tu aplicación está en producción** 🚀
