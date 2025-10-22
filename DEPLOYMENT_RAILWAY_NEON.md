# 🚀 Guía de Deployment - Railway (Backend) + Vercel (Frontend) + Neon (Database)

## 🎯 **Arquitectura de Producción**

```
┌─────────────────────────┐
│  Vercel (Frontend)      │ ← React App, GRATIS
│  remote-tech-support    │
└───────────┬─────────────┘
            │
            │ HTTPS/WSS
            ↓
┌─────────────────────────┐
│  Railway (Backend)      │ ← Node.js + Socket.IO, $5-10/mes
│  Express + WebSockets   │
└───────────┬─────────────┘
            │
            │ PostgreSQL
            ↓
┌─────────────────────────┐
│  Neon (Database)        │ ← PostgreSQL, GRATIS
│  PostgreSQL 16          │
└─────────────────────────┘
```

**Costo Total: ~$5-10/mes** 💰

---

## 📋 **Paso a Paso Completo**

### **PASO 1: Crear Base de Datos en Neon** 💾 (5 minutos)

#### **A. Crear cuenta:**

1. Ir a https://neon.tech/
2. Click "Sign Up" → Sign in with GitHub
3. Autorizar Neon

#### **B. Crear proyecto:**

1. Click "Create a project"
2. **Project name:** `remote-tech-support`
3. **Region:** US East (Ohio) - más cercano
4. **PostgreSQL version:** 16
5. Click "Create Project"

#### **C. Obtener Connection String:**

1. En el dashboard, ir a "Connection Details"
2. **Copiar** el "Connection string":
   ```
   postgresql://neondb_owner:xxxxx@ep-xxx-yyy.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. **GUARDAR ESTO** en un lugar seguro

#### **D. Aplicar Schema (SQL Editor):**

**OPCIÓN 1 - SQL Editor (Recomendado):**

1. En Neon Dashboard → "SQL Editor"
2. Abrir el archivo `server/neon-database-setup.sql` de tu proyecto
3. **Copiar TODO el contenido** del archivo
4. **Pegar** en el SQL Editor de Neon
5. Click "Run" (toma ~10 segundos)
6. ✅ Deberías ver: "5 usuarios, 6 categorías creadas"

**OPCIÓN 2 - psql (Avanzado):**

```bash
# Conectar a Neon
psql "postgresql://neondb_owner:xxxxx@ep-xxx.neon.tech/neondb?sslmode=require"

# Ejecutar el script
\i server/neon-database-setup.sql

# Salir
\q
```

**Usuarios creados por defecto:**

- ✅ `admin@partequipos.com` - Admin (contraseña: `admin123`)
- ✅ `auxiliar.garantiasbg@partequipos.com` - Técnico
- ✅ `analista.mantenimiento@partequipos.com` - Técnico
- ✅ `miguel@empresa.com` - Cliente
- ✅ `ana.garcia@empresa.com` - Cliente

**TODOS tienen la contraseña: `admin123`** 🔑

---

### **PASO 2: Desplegar Backend en Railway** 🚂 (10 minutos)

#### **A. Crear cuenta en Railway:**

1. Ir a https://railway.app/
2. Click "Login" → Sign in with GitHub
3. Autorizar Railway

#### **B. Crear nuevo proyecto:**

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. **Seleccionar tu repositorio:** `remote-tech-support`
4. Click en el repositorio

#### **C. Configurar el servicio:**

1. Railway detectará automáticamente que es Node.js
2. **Root Directory:** Click "Settings" → "Root Directory" → `server`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm run start`
5. Click "Save"

#### **D. Agregar Variables de Entorno:**

En Railway Dashboard → Variables:

```env
NODE_ENV=production

# Database (pegar tu connection string de Neon)
DATABASE_URL=postgresql://neondb_owner:xxxxx@ep-xxx.neon.tech/neondb?sslmode=require

# JWT Secret (generar uno nuevo)
# Usa: openssl rand -base64 32
JWT_SECRET=tu-secreto-super-seguro-de-32-caracteres-minimo-cambiar
JWT_EXPIRES_IN=24h

# CORS (agregar después de desplegar frontend)
CORS_ORIGIN=https://your-app.vercel.app

# Email (tus credenciales reales)
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=analista.mantenimiento@partequipos.com
SMTP_PASSWORD=tu-password-de-email

# Port (Railway lo asigna automáticamente, pero por si acaso)
PORT=3000
```

#### **E. Deploy:**

1. Railway desplegará automáticamente
2. Esperar a que termine (2-3 minutos)
3. **Copiar la URL pública:**
   ```
   https://remote-tech-support-api-production.up.railway.app
   ```
4. **GUARDAR ESTA URL** - la necesitas para el frontend

#### **F. Verificar deployment:**

1. Abrir la URL en el navegador
2. Deberías ver un mensaje del servidor o una respuesta JSON
3. Verificar logs en Railway Dashboard

---

### **PASO 3: Desplegar Frontend en Vercel** 🎨 (5 minutos)

#### **A. Crear cuenta en Vercel:**

1. Ir a https://vercel.com/
2. "Sign Up" → Continue with GitHub
3. Autorizar Vercel

#### **B. Crear nuevo proyecto:**

1. Click "Add New..." → "Project"
2. Import tu repositorio `remote-tech-support`
3. **Framework Preset:** Vite
4. **Root Directory:** `./` (raíz, NO server)
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. **Install Command:** `npm install`

#### **C. Agregar Variables de Entorno:**

Click "Environment Variables":

```env
# URL del backend en Railway (la que copiaste antes)
VITE_API_URL=https://remote-tech-support-api-production.up.railway.app

# URL de WebSocket (la misma)
VITE_WS_URL=https://remote-tech-support-api-production.up.railway.app
```

#### **D. Deploy:**

1. Click "Deploy"
2. Esperar 2-3 minutos
3. **Copiar la URL del frontend:**
   ```
   https://remote-tech-support.vercel.app
   ```

---

### **PASO 4: Actualizar CORS en Railway** 🔒 (2 minutos)

#### **Ahora que tienes la URL del frontend:**

1. Ir a Railway Dashboard → tu proyecto → Variables
2. **Editar** `CORS_ORIGIN`
3. **Valor:** `https://remote-tech-support.vercel.app`
4. Railway redesplegará automáticamente

---

### **PASO 5: Testing en Producción** 🧪 (15 minutos)

#### **A. Abrir la aplicación:**

```
https://remote-tech-support.vercel.app
```

#### **B. Verificar funcionalidades:**

**Login:**

- [ ] Email: `admin@gmail.com`
- [ ] Password: `admin123`
- [ ] ✅ Login exitoso

**Socket.IO:**

- [ ] Verificar Socket Debug Info en la app
- [ ] Debe mostrar "Connected: ✅"

**Tickets:**

- [ ] Crear un ticket
- [ ] Enviar mensajes
- [ ] Ver actualización en tiempo real

**Videollamadas:**

- [ ] Login con 2 usuarios diferentes
- [ ] Abrir mismo ticket
- [ ] Iniciar videollamada
- [ ] ✅ Debe funcionar sin problemas

---

## 🛠️ **Comandos Útiles**

### **Ver logs de Railway:**

```bash
# Instalar CLI (opcional)
npm install -g @railway/cli

# Login
railway login

# Ver logs en tiempo real
railway logs
```

### **Redeploy Railway:**

```bash
railway up
```

### **Redeploy Vercel:**

```bash
vercel --prod
```

---

## ⚙️ **Variables de Entorno Completas**

### **Railway (Backend):**

```env
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=genera-secreto-aleatorio-32-caracteres-minimo
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://remote-tech-support.vercel.app
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-email-password
PORT=3000
```

### **Vercel (Frontend):**

```env
VITE_API_URL=https://your-backend.up.railway.app
VITE_WS_URL=https://your-backend.up.railway.app
```

---

## 💰 **Costos Mensuales**

### **Plan Gratuito (Para empezar):**

- **Neon:** GRATIS

  - 512 MB storage
  - 3 GB transfer
  - Perfecto para empezar

- **Railway:** $5 de crédito gratis

  - Después ~$5-10/mes según uso
  - Incluye:
    - CPU: 0.5 vCPU
    - RAM: 512 MB - 8 GB
    - Bandwidth ilimitado

- **Vercel:** GRATIS
  - Bandwidth: 100 GB
  - Builds ilimitados
  - SSL incluido

**Total: $5-10/mes después del crédito gratis** ✅

---

## 🎯 **Ventajas de Railway sobre Vercel para Backend:**

| Feature                 | Railway         | Vercel Serverless   |
| ----------------------- | --------------- | ------------------- |
| WebSockets              | ✅ Full support | ⚠️ Limitado         |
| Conexiones persistentes | ✅ Sí           | ❌ No               |
| Timeout                 | ✅ Ilimitado    | ⚠️ 10-60s           |
| Cold starts             | ✅ Mínimos      | ⚠️ Frecuentes       |
| Socket.IO               | ✅ Perfecto     | ⚠️ Problemas        |
| Videollamadas           | ✅ Excelente    | ❌ No funciona bien |
| Precio                  | $5-10/mes       | Gratis\*            |

**Para tu app con videollamadas: Railway es la opción correcta** ✅

---

## 📝 **Checklist de Deployment**

### **Pre-deployment:**

- [x] Código limpio (0 errores)
- [x] Hash de contraseñas
- [x] Variables de entorno configuradas
- [x] CORS configurado
- [ ] Cuenta en Neon creada
- [ ] Cuenta en Railway creada
- [ ] Cuenta en Vercel creada

### **Deployment:**

- [ ] Base de datos Neon creada y configurada
- [ ] Backend desplegado en Railway
- [ ] Variables configuradas en Railway
- [ ] Frontend desplegado en Vercel
- [ ] Variables configuradas en Vercel
- [ ] CORS actualizado con URL real

### **Post-deployment:**

- [ ] Login funciona
- [ ] Socket.IO conecta
- [ ] Mensajes en tiempo real
- [ ] Videollamadas funcionan
- [ ] Todo verificado ✅

---

## 🚀 **¡Listo para Deploy!**

**El proyecto está perfectamente configurado para:**

- ✅ Railway (Backend con WebSockets)
- ✅ Vercel (Frontend)
- ✅ Neon (Base de datos PostgreSQL)

**Siguiente paso:**

1. Crear cuenta en Neon
2. Crear cuenta en Railway
3. Deploy (15-20 minutos total)

**¿Quieres que te guíe en el proceso de crear las cuentas y hacer el deploy?** 🎯✨
