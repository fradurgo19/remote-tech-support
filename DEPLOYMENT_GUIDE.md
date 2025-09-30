# 🚀 Guía de Deployment - Vercel + Neon

## 📋 **Stack de Producción**

- **Frontend:** Vercel
- **Backend:** Vercel  
- **Base de Datos:** Neon PostgreSQL
- **File Storage:** Vercel Blob (o Cloudinary)

---

## 🎯 **Paso a Paso**

### **1. Crear Cuenta en Neon (Base de Datos)** 💾

#### **A. Registrarse:**
1. Ir a https://neon.tech/
2. Click en "Sign Up" (gratis para empezar)
3. Conectar con GitHub

#### **B. Crear Proyecto:**
1. Click en "New Project"
2. Nombre: `remote-tech-support`
3. Region: `US East` (Ohio) o el más cercano
4. PostgreSQL version: 16 (latest)
5. Click en "Create Project"

#### **C. Obtener Connection String:**
1. En el dashboard del proyecto, ver "Connection Details"
2. Copiar el "Connection String":
   ```
   postgresql://user:password@ep-xxx-yyy.us-east-2.aws.neon.tech/remote_support?sslmode=require
   ```
3. **GUARDAR ESTO** - lo necesitarás para las variables de entorno

---

### **2. Preparar el Backend** 🔧

#### **A. Crear archivo `.env` en server:**
```env
# server/.env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/remote_support?sslmode=require
JWT_SECRET=genera-un-secreto-aleatorio-de-32-caracteres-minimo
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend.vercel.app
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password
```

#### **B. Generar JWT_SECRET seguro:**
```bash
# En terminal (Git Bash, PowerShell con OpenSSL)
openssl rand -base64 32

# O usa un generador online:
# https://randomkeygen.com/
```

#### **C. Build del backend:**
```bash
cd server
npm run build
```

Verifica que compile sin errores.

---

### **3. Desplegar Backend en Vercel** 🚀

#### **A. Instalar Vercel CLI:**
```bash
npm install -g vercel
```

#### **B. Login en Vercel:**
```bash
vercel login
```

#### **C. Deploy del backend:**
```bash
cd server
vercel
```

**Responder las preguntas:**
- Set up and deploy? `Y`
- Which scope? `(tu cuenta)`
- Link to existing project? `N`
- Project name? `remote-tech-support-api`
- Directory? `./`
- Override settings? `N`

#### **D. Configurar variables de entorno en Vercel:**
```bash
# Desde el dashboard de Vercel o CLI:
vercel env add DATABASE_URL
# Pegar tu connection string de Neon

vercel env add JWT_SECRET
# Pegar tu secret generado

vercel env add CORS_ORIGIN
# Dejar vacío por ahora (lo configuraremos después)

vercel env add NODE_ENV
# production

# Email vars
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
```

#### **E. Deploy producción:**
```bash
vercel --prod
```

**Resultado:**
```
✅ Deployed to https://remote-tech-support-api.vercel.app
```

**GUARDAR ESTA URL** - la necesitas para el frontend

---

### **4. Migrar Base de Datos** 💾

#### **A. Aplicar migraciones en Neon:**
```bash
# Configurar DATABASE_URL temporalmente
export DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/..."

# Aplicar migraciones
cd server
npm run migrate
```

#### **B. O ejecutar SQL directamente en Neon:**
1. Ir a Neon Dashboard → SQL Editor
2. Copiar y ejecutar el SQL de cada migración en `server/migrations/`

---

### **5. Preparar el Frontend** 💻

#### **A. Crear archivo `.env.production`:**
```env
VITE_API_URL=https://remote-tech-support-api.vercel.app
VITE_WS_URL=https://remote-tech-support-api.vercel.app
```

#### **B. Actualizar servicios API:**

Verifica que `src/services/api.ts` use las variables de entorno:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

#### **C. Build del frontend:**
```bash
npm run build
```

Verifica que compile sin errores.

---

### **6. Desplegar Frontend en Vercel** 🎨

#### **A. Deploy desde raíz del proyecto:**
```bash
# Desde la raíz (no desde server)
vercel
```

**Responder:**
- Set up and deploy? `Y`
- Which scope? `(tu cuenta)`
- Link to existing project? `N`
- Project name? `remote-tech-support`
- Directory? `./` (raíz)
- Override settings? `Y`
  - Build Command? `npm run build`
  - Output Directory? `dist`
  - Install Command? `npm install`

#### **B. Configurar variables de entorno:**
```bash
vercel env add VITE_API_URL
# https://remote-tech-support-api.vercel.app

vercel env add VITE_WS_URL  
# https://remote-tech-support-api.vercel.app
```

#### **C. Deploy producción:**
```bash
vercel --prod
```

**Resultado:**
```
✅ Deployed to https://remote-tech-support.vercel.app
```

---

### **7. Actualizar CORS en Backend** 🔒

Ahora que tienes la URL del frontend:

#### **En Vercel Dashboard del Backend:**
1. Ir a Settings → Environment Variables
2. Editar `CORS_ORIGIN`
3. Valor: `https://remote-tech-support.vercel.app`
4. Save

#### **Redeploy el backend:**
```bash
cd server
vercel --prod
```

---

### **8. Testing en Producción** 🧪

#### **A. Abrir la app:**
```
https://remote-tech-support.vercel.app
```

#### **B. Verificar:**
- [ ] La app carga correctamente
- [ ] Puedes hacer login (admin@gmail.com / admin123)
- [ ] Socket.IO se conecta
- [ ] Puedes crear tickets
- [ ] Mensajes en tiempo real funcionan
- [ ] Videollamadas funcionan

---

## ⚙️ **Configuraciones Adicionales**

### **Cloudinary para File Storage (Opcional pero Recomendado):**

#### **A. Crear cuenta:**
1. https://cloudinary.com/ (gratis)
2. Obtener: Cloud Name, API Key, API Secret

#### **B. Instalar SDK:**
```bash
cd server
npm install cloudinary
```

#### **C. Configurar en código:**
```typescript
// server/src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

---

## 📝 **Checklist de Deployment**

### **Pre-deployment:**
- [x] Hash de contraseñas implementado
- [x] Variables de entorno configuradas
- [x] CORS configurado
- [ ] Base de datos Neon creada
- [ ] Migraciones aplicadas en Neon
- [ ] Frontend buildea sin errores
- [ ] Backend buildea sin errores

### **Deployment:**
- [ ] Backend desplegado en Vercel
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] CORS actualizado con URL del frontend

### **Post-deployment:**
- [ ] Testing completo en producción
- [ ] Verificar logs
- [ ] Configurar dominio custom (opcional)
- [ ] Configurar SSL (automático en Vercel)

---

## 💰 **Costos Estimados**

### **Plan Gratis (Para empezar):**
- **Vercel:** Gratis (proyectos personales)
  - Frontend: Gratis
  - Backend: Gratis (con límites)
- **Neon:** Gratis
  - 512 MB storage
  - 3 GB data transfer
  - 1 proyecto

**Total: $0/mes** (perfecto para staging/testing)

### **Plan Escalable:**
Cuando necesites más:
- **Vercel Pro:** $20/mes (más bandwidth, sin ads)
- **Neon Scale:** $19/mes (3 GB storage, autoscaling)

**Total: ~$40/mes** (producción pequeña-mediana)

---

## ⚠️ **Limitaciones de Vercel para Backend**

### **Consideraciones:**
- **Serverless Functions:** 10s timeout (puede afectar videollamadas largas)
- **WebSockets:** Limitados en Vercel (Socket.IO puede tener issues)

### **Alternativa Recomendada para Backend:**
Si las videollamadas son críticas, considera:
- **Railway:** $5-20/mes (mejor para WebSockets)
- **Render:** $7/mes (siempre activo)
- **Fly.io:** ~$5/mes (global deployment)

---

## 🎯 **Próximos Pasos**

1. **Crear cuenta en Neon** ✅
2. **Copiar DATABASE_URL** ✅
3. **Deploy backend en Vercel** ✅
4. **Deploy frontend en Vercel** ✅
5. **Actualizar CORS** ✅
6. **Testing en producción** ✅

---

## 📞 **Soporte**

Si tienes problemas:
1. Vercel Docs: https://vercel.com/docs
2. Neon Docs: https://neon.tech/docs
3. Revisar logs en Vercel Dashboard
4. Verificar variables de entorno

---

**¡Todo está configurado y listo para deploy!** 🚀✨
