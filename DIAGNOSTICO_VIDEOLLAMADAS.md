# 🔧 DIAGNÓSTICO COMPLETO: VIDEOLLAMADAS NO FUNCIONAN

## ❌ PROBLEMA REPORTADO

**Usuario:** "Cuando se está dentro del ticket tanto el cliente como el técnico y el usuario realiza la video llamada en la pantalla del técnico no genera el cuadro de diálogo de rechazar o aceptar y no se inicia la video llamada"

---

## 🔍 ANÁLISIS REALIZADO

### ✅ Componentes que FUNCIONAN correctamente:

1. **Frontend**: Botón "Iniciar Llamada" ejecuta `initiateCall()`
2. **CallContext**: Llama a `webRTCNativeService.initiateCall()`
3. **SocketService**: Emite evento `call-initiate` al servidor
4. **Backend Socket**: Recibe `call-initiate` y procesa la lógica

### ❌ PROBLEMA IDENTIFICADO (MUY PROBABLE):

#### 🎯 **CAUSA RAÍZ: Tabla `CallSessions` NO existe en Supabase**

**Evidencia:**

- El backend intenta crear una sesión de llamada aquí:

  ```typescript
  // server/src/socket.ts línea 125
  const callSession = await CallSession.create({
    ticketId,
    initiatorId: user.id,
    participantIds: [user.id, recipientId],
    status: 'initiated',
  });
  ```

- Si la tabla `CallSessions` **NO existe** en Supabase:
  - ❌ El `CallSession.create()` **FALLA**
  - ❌ El backend NO puede continuar
  - ❌ El evento `call-request` **NUNCA se envía** al destinatario
  - ❌ El modal de llamada entrante **NO aparece**

---

## 📋 PROBLEMAS SECUNDARIOS ENCONTRADOS Y CORREGIDOS:

### 1. ❌ Evento de Socket Incorrecto

**Problema:**

- Frontend enviaba: `join-ticket` (con guion)
- Backend esperaba: `join_ticket` (con guion bajo)

**Solución:** ✅ Corregido en commit anterior

### 2. ❌ Tipos de Datos Incompletos

**Problema:**

- El servidor envía: `{ from, fromName, fromEmail, fromAvatar, ticketId, callSessionId }`
- El tipo en SocketService solo tenía: `{ from, ticketId, callSessionId }`
- Faltaban: `fromName`, `fromEmail`, `fromAvatar`

**Solución:** ✅ Corregido en este commit

### 3. ⚠️ Falta de Logging para Debugging

**Problema:** No había logs suficientes para rastrear el flujo completo

**Solución:** ✅ Agregados logs extensivos en:

- `SocketService.onCallRequest()`
- `CallContext` (cuando recibe call-request)
- `IncomingCallHandler` (renderizado condicional)
- `IncomingCallModal` (visibilidad del modal)

---

## 🛠️ SOLUCIÓN PASO A PASO

### **PASO 1: Verificar y Crear Tabla `CallSessions`** ⭐ **MUY IMPORTANTE**

1. **Abrir Supabase Dashboard**

   - Project > SQL Editor > New Query

2. **Ejecutar el script `fix-callsessions-table.sql`**

   - Copia TODO el contenido del archivo `fix-callsessions-table.sql`
   - Pégalo en el SQL Editor
   - Click en "Run"

3. **Verificar resultados:**

   ```sql
   -- Debe mostrar la estructura de la tabla
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'CallSessions'
   ORDER BY ordinal_position;
   ```

   **Columnas esperadas:**

   - `id` (uuid, primary key)
   - `ticketId` (uuid, not null)
   - `initiatorId` (uuid, not null)
   - `participantIds` (uuid[], array)
   - `status` (varchar/enum)
   - `startedAt` (timestamp)
   - `endedAt` (timestamp)
   - `duration` (integer)
   - `recordingUrl` (text)
   - `screenShareEnabled` (boolean)
   - `metadata` (jsonb)
   - `createdAt` (timestamp)
   - `updatedAt` (timestamp)

---

### **PASO 2: Hacer Deploy de los Cambios de Frontend**

```bash
# 1. Commit y push de los cambios
git add -A
git commit -m "fix: Corregir videollamadas WebRTC

- Agregar tipos completos para call-request (fromName, fromEmail, fromAvatar)
- Corregir evento join_ticket (backend usa guion bajo)
- Agregar logging extensivo para debugging
- Documentar diagnóstico completo"

git push origin main

# 2. Vercel hará deploy automático
# 3. Esperar ~2-3 minutos para que se complete
```

---

### **PASO 3: Probar Videollamadas**

#### 🧪 **Prueba 1: Verificar Logs del Backend**

1. **Abrir logs del backend** (Fly.io Dashboard)
2. **Usuario 1 (Cliente)** entra al ticket
3. **Usuario 2 (Técnico)** entra al mismo ticket
4. **Usuario 1** va a pestaña "Video Llamada" y presiona "Iniciar Llamada"

**Logs esperados en el BACKEND:**

```
=== INICIANDO LLAMADA ===
De: Cliente (uuid...)
Para: uuid-tecnico
Ticket: uuid-ticket
Usuarios conectados: 2
Conectados: uuid-cliente(socketId1), uuid-tecnico(socketId2)
Sesión de llamada creada: uuid-call-session
Sockets del destinatario encontrados: 1
Enviando call-request a socketId2
```

**Si NO aparece "Sesión de llamada creada":**
❌ La tabla `CallSessions` NO existe o hay un error de base de datos

---

#### 🧪 **Prueba 2: Verificar Logs del Frontend (Técnico)**

**En la consola del navegador del TÉCNICO, deberías ver:**

```
=== CALL REQUEST RECEIVED ===
Data: {
  "from": "uuid-cliente",
  "fromName": "Ana García",
  "fromEmail": "ana.garcia@empresa.com",
  "fromAvatar": "https://...",
  "ticketId": "uuid-ticket",
  "callSessionId": "uuid-call-session"
}

=== CALLCONTEXT: CALL-REQUEST RECIBIDO ===
CallContext: Datos completos recibidos: { ... }
CallContext: Objeto incomingCall creado: { ... }
CallContext: Estado incomingCall actualizado
CallContext: ¿Modal debería mostrarse? isIncoming = true

=== INCOMING CALL HANDLER RENDER ===
incomingCall: { "isIncoming": true, "caller": { ... } }
IncomingCallHandler: SÍ hay llamada entrante, renderizando modal

=== INCOMING CALL MODAL RENDER ===
isOpen: true
caller: { "id": "...", "name": "Ana García", "email": "..." }
✅ Modal SE ESTÁ MOSTRANDO
```

**Si los logs se detienen antes de "Modal SE ESTÁ MOSTRANDO":**
❌ Hay un problema en el renderizado del modal

---

#### 🧪 **Prueba 3: Verificar Modal Visible**

**En pantalla del TÉCNICO:**

- ✅ Debería aparecer un **modal oscuro con fondo negro/70%**
- ✅ Avatar del cliente
- ✅ Nombre: "Ana García"
- ✅ Email: "ana.garcia@empresa.com"
- ✅ Botones: "Rechazar" (rojo) y "Aceptar" (verde)

---

## 🐛 DEBUGGING ADICIONAL

### Si el modal NO aparece después de PASO 1:

#### Verificar en consola del navegador (Cliente que llama):

```javascript
// Ver estado del socket
window.socketService.isConnected(); // debe ser true
window.socket.connected; // debe ser true

// Ver si el evento se envió
// Buscar en logs:
// "SocketService: Emitting call-initiate event"
// "SocketService: call-initiate event emitted"
```

#### Verificar en consola del navegador (Técnico que recibe):

```javascript
// Ver estado del CallContext
// En React DevTools > Components > CallProvider
// incomingCall debería tener:
{
  isIncoming: true,
  caller: { id, name, email, avatar },
  ticketId: "...",
  callSessionId: "..."
}
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

### Base de Datos (Supabase):

- [ ] Tabla `CallSessions` existe
- [ ] Tiene todas las columnas necesarias
- [ ] Índices creados
- [ ] Trigger para `updatedAt` funciona

### Backend (Fly.io):

- [ ] Socket.IO está corriendo
- [ ] Eventos `call-initiate` se reciben
- [ ] `CallSession.create()` funciona sin errores
- [ ] Eventos `call-request` se envían

### Frontend (Vercel):

- [ ] Cambios desplegados
- [ ] Socket conectado correctamente
- [ ] Evento `join_ticket` se envía (con guion bajo)
- [ ] `CallContext` recibe `call-request`
- [ ] `IncomingCallHandler` renderiza
- [ ] `IncomingCallModal` se muestra

---

## 🎯 PRÓXIMOS PASOS

1. **EJECUTAR `fix-callsessions-table.sql` EN SUPABASE** ⭐⭐⭐
2. Hacer commit y push de los cambios
3. Esperar deploy de Vercel
4. Probar videollamada siguiendo "Prueba 1, 2, 3"
5. Revisar logs en consola y backend
6. Reportar resultados

---

## 💡 NOTAS IMPORTANTES

- **La tabla `CallSessions` es CRÍTICA** para que las videollamadas funcionen
- Sin esta tabla, el backend falla silenciosamente al crear la sesión
- Los logs agregados ayudarán a identificar exactamente dónde está el problema
- Una vez que la tabla exista, el flujo debería funcionar completamente

---

## 📞 FLUJO COMPLETO (Cuando TODO funciona):

```
1. Cliente → Click "Iniciar Llamada"
   ↓
2. Frontend → initiateCall(recipientId, ticketId)
   ↓
3. WebRTC → getLocalStream() (cámara + micrófono)
   ↓
4. SocketService → emit('call-initiate', { to, ticketId })
   ↓
5. Backend → Recibe 'call-initiate'
   ↓
6. Backend → CallSession.create() ⭐ NECESITA TABLA
   ↓
7. Backend → emit('call-request', { from, fromName, ... })
   ↓
8. Frontend (Técnico) → SocketService recibe 'call-request'
   ↓
9. CallContext → setIncomingCall({ isIncoming: true, caller: {...} })
   ↓
10. IncomingCallHandler → Renderiza IncomingCallModal
    ↓
11. Técnico ve modal → Click "Aceptar"
    ↓
12. WebRTC Handshake → Conexión P2P establecida
    ↓
13. 🎥 VIDEOLLAMADA ACTIVA 🎉
```

---

**Creado:** 2025-10-09  
**Especialista:** AI WebRTC Specialist  
**Prioridad:** CRÍTICA ⭐⭐⭐
