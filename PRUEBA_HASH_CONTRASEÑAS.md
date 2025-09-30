# 🧪 Guía de Prueba - Hash de Contraseñas

## 📋 **Instrucciones para Probar**

### **Paso 1: Reiniciar el Servidor** 🔄

El servidor tiene un script que automáticamente resetea todas las contraseñas a "admin123" (hasheadas) al iniciar.

```bash
# Detener el servidor actual (Ctrl+C si está corriendo)

# Iniciar el servidor
cd server
npm run dev
```

**Deberías ver en los logs:**

```
info: === RESETEANDO CONTRASEÑAS ===
info: Encontrados 8 usuarios
info: Reseteando contraseña para: [nombre usuario]
info: ✅ Contraseña actualizada para [nombre usuario]
...
info: ✅ Todas las contraseñas han sido reseteadas a "admin123"
```

---

### **Paso 2: Verificar que las Contraseñas están Hasheadas** 🔍

```bash
cd server
node test-password-hash.js
```

**Resultado esperado:**

```
✅ Todas las contraseñas están correctamente hasheadas
✅ Login exitoso para todos los usuarios con "admin123"
```

---

### **Paso 3: Probar Login en la Aplicación** 🔐

#### **Abrir el Frontend:**

```bash
# En otra terminal
npm run dev
```

#### **Hacer Login:**

1. Ir a `http://localhost:5173`
2. **Usuario de Prueba:**
   - Email: `pruebasuser@example.com`
   - Password: `admin123`
3. Click en "Iniciar Sesión"

**Resultado esperado:** ✅ Login exitoso

#### **Otros Usuarios para Probar:**

| Email                    | Password   | Rol        |
| ------------------------ | ---------- | ---------- |
| `admin@partequipos.com`  | `admin123` | admin      |
| `juan@example.com`       | `admin123` | technician |
| `ana.garcia@empresa.com` | `admin123` | customer   |

---

### **Paso 4: Probar Cambio de Contraseña** 🔄

1. **Login exitoso** con cualquier usuario
2. **Ir a Configuración** (icono de engranaje o menú)
3. **Cambiar Contraseña:**
   - Contraseña actual: `admin123`
   - Nueva contraseña: `miNuevaPassword123`
   - Confirmar
4. **Logout**
5. **Login con la nueva contraseña**

**Resultado esperado:**

- ✅ Cambio exitoso
- ✅ Login con nueva contraseña funciona
- ❌ Login con contraseña antigua falla

---

### **Paso 5: Verificar Logs del Servidor** 📊

Mientras haces las pruebas, observa los logs del servidor:

**Al hacer login:**

```
info: Intento de login para email: pruebasuser@example.com
info: Usuario encontrado: Sí
info: Verificando contraseña para usuario: PruebasUsers
info: Contraseña válida: Sí
info: Login exitoso para usuario: PruebasUsers
```

**Al cambiar contraseña:**

```
info: Cambio de contraseña solicitado para usuario: PruebasUsers
info: Contraseña actualizada exitosamente para usuario: PruebasUsers
```

---

## 🐛 **Troubleshooting**

### **Problema: Login falla con "admin123"**

**Causa:** Las contraseñas hasheadas no corresponden a "admin123"

**Solución:**

```bash
# Reiniciar el servidor (resetea automáticamente)
cd server
# Ctrl+C para detener
npm run dev
```

---

### **Problema: "Contraseña inválida"**

**Verificar:**

1. El servidor está corriendo
2. Las contraseñas fueron reseteadas (ver logs)
3. Estás usando "admin123" (sin espacios, minúsculas)

---

### **Problema: Script de prueba falla**

**Verificar:**

1. Base de datos está corriendo
2. Variables en `.env` son correctas
3. Tabla "Users" existe (con mayúscula)

---

## ✅ **Checklist de Prueba**

- [ ] Servidor reiniciado
- [ ] Logs muestran "Contraseñas reseteadas"
- [ ] Script de prueba pasa (8/8 contraseñas hasheadas)
- [ ] Login exitoso con "admin123"
- [ ] Cambio de contraseña funciona
- [ ] Login con nueva contraseña funciona
- [ ] Login con contraseña anterior falla

---

## 🎉 **Si Todas las Pruebas Pasan:**

**¡El hash de contraseñas está funcionando correctamente!**

**Siguiente paso:**

- ✅ Hash de contraseñas implementado
- ⏳ Variables de entorno para producción
- ⏳ Configuración de CORS
- ⏳ HTTPS/SSL

**¡Estás un paso más cerca de producción!** 🚀
