# 🔴 SOLUCIÓN: Error "Tenant or user not found" en Fly.io

## ❌ PROBLEMA

El backend no puede iniciar porque no se puede conectar a Supabase. El error es:
```
error: Unable to start server: Tenant or user not found
SequelizeConnectionError: Tenant or user not found
```

Esto causa que la máquina se reinicie infinitamente hasta alcanzar el límite de 10 intentos.

---

## ✅ SOLUCIÓN

### Paso 1: Verificar que Supabase esté Activo

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Verifica que el proyecto esté **activo** (no pausado)
4. Si está pausado, haz click en **"Restore"** o **"Resume"**

### Paso 2: Obtener la Connection String Correcta

1. En Supabase Dashboard, ve a **Settings → Database**
2. Busca la sección **"Connection string"**
3. Selecciona **"URI"** (no "JDBC" ni otros)
4. Selecciona **"Transaction"** o **"Session"** mode
5. Copia la connection string, debería verse así:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   
   **O si usas la conexión directa:**
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

### Paso 3: Actualizar DATABASE_URL en Fly.io

1. Ve a [Fly.io Dashboard](https://fly.io/dashboard)
2. Selecciona: **remote-tech-support-backend**
3. Ve a **Settings → Secrets**
4. Busca **DATABASE_URL**
5. Click en **Edit**
6. Pega la nueva connection string que copiaste de Supabase
7. **IMPORTANTE:** Asegúrate de:
   - Reemplazar `[PASSWORD]` con tu contraseña real de Supabase
   - Si no recuerdas la contraseña, ve a Supabase → Settings → Database → Reset database password
8. Click en **Save**

### Paso 4: Verificar el Formato de DATABASE_URL

La URL debe tener este formato:

**Para pgbouncer (recomendado para producción):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Para conexión directa:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Ejemplo real:**
```
postgresql://postgres.abcdefghijklmnop:TuPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Paso 5: Detener y Reiniciar la Máquina

**IMPORTANTE:** Primero detén la máquina para evitar más reinicios infinitos:

1. En Fly.io Dashboard, ve a **Machines**
2. Click en el botón de **Stop** (⏸️) para detener la máquina
3. Espera a que se detenga completamente
4. Luego click en **Start** (▶️) para iniciarla de nuevo

**O desde la terminal:**
```bash
# Detener
flyctl machine stop -a remote-tech-support-backend

# Esperar unos segundos, luego iniciar
flyctl machine start -a remote-tech-support-backend
```

### Paso 6: Verificar los Logs

Después de reiniciar, verifica los logs:

```bash
flyctl logs -a remote-tech-support-backend
```

**Deberías ver:**
```
✅ Database connection has been established successfully.
✅ Database models synchronized successfully.
✅ Server is running on 0.0.0.0:8080
```

**Si aún ves el error:**
- Verifica que la contraseña en `DATABASE_URL` sea correcta
- Verifica que el proyecto de Supabase esté activo
- Intenta usar la conexión directa (puerto 5432) en lugar de pgbouncer

---

## 🔍 VERIFICACIONES ADICIONALES

### Verificar que Supabase esté Activo

1. Ve a Supabase Dashboard
2. Verifica el estado del proyecto
3. Si está pausado, reactívalo
4. Verifica que la base de datos esté accesible

### Verificar la Contraseña de Supabase

1. En Supabase Dashboard → Settings → Database
2. Si no recuerdas la contraseña, haz click en **"Reset database password"**
3. Copia la nueva contraseña
4. Actualiza `DATABASE_URL` en Fly.io con la nueva contraseña

### Probar la Conexión Localmente

Puedes probar la connection string localmente:

```bash
# Instalar psql si no lo tienes
# Luego probar:
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Si la conexión funciona, la URL es correcta.

---

## 🚨 SI EL PROBLEMA PERSISTE

### Opción 1: Usar Conexión Directa

En lugar de pgbouncer, usa la conexión directa:

1. En Supabase → Settings → Database
2. Copia la connection string con puerto **5432** (no 6543)
3. Actualiza `DATABASE_URL` en Fly.io
4. Reinicia la máquina

### Opción 2: Verificar Variables de Entorno

Asegúrate de que estas variables estén configuradas en Fly.io:
- `DATABASE_URL` (la más importante)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Opción 3: Contactar Soporte de Supabase

Si el proyecto de Supabase fue eliminado o hay problemas con la cuenta:
1. Ve a Supabase Dashboard
2. Verifica el estado de tu proyecto
3. Contacta soporte si es necesario

---

## ✅ CHECKLIST

- [ ] Supabase proyecto está activo (no pausado)
- [ ] `DATABASE_URL` actualizada con connection string correcta
- [ ] Contraseña en `DATABASE_URL` es correcta
- [ ] Máquina detenida antes de reiniciar
- [ ] Máquina reiniciada después de actualizar variables
- [ ] Logs muestran conexión exitosa a la base de datos
- [ ] Health check funciona: `https://remote-tech-support-backend.fly.dev/health`

---

## 📝 NOTA IMPORTANTE

**NO actualices CORS_ORIGIN hasta que el backend esté funcionando correctamente.**

Primero soluciona el problema de la base de datos, luego actualiza CORS_ORIGIN.

