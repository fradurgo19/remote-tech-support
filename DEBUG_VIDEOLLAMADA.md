# Debug de Videollamada - Paso a Paso

## Problema Actual

- ✅ Ambos usuarios conectados
- ✅ Socket funcionando
- ❌ Llamada no se notifica al receptor

## Pasos de Debug

### 1. Verificar Logs del Servidor

```bash
# En la terminal del servidor
cd server
npm run dev
```

**Buscar estos logs cuando inicies la llamada:**

```
=== INICIANDO LLAMADA ===
De: [Usuario] ([ID])
Para: [ID del receptor]
Ticket: [ID del ticket]
Usuarios conectados: [número]
Conectados: [lista de usuarios]
Sesión de llamada creada: [ID]
Socket del destinatario encontrado: [SÍ/NO]
Enviando call-request a [socket-id]: [datos]
```

### 2. Verificar Logs del Cliente

**En la consola del navegador del receptor:**

```
=== CALL REQUEST RECEIVED ===
Data: {from: "...", ticketId: "...", callSessionId: "..."}
Socket ID: [socket-id]
User: [nombre]
```

### 3. Script de Prueba

Ejecutar en consola del navegador:

```javascript
// Copiar y pegar el contenido de test-call-flow.js
```

### 4. Verificar IDs de Usuario

**Problema común:** Los IDs no coinciden

**Verificar en consola:**

```javascript
// Usuario 1 (Iniciador)
console.log('Mi ID:', localStorage.getItem('currentUserEmail'));

// Usuario 2 (Receptor)
console.log('Mi ID:', localStorage.getItem('currentUserEmail'));
```

**Verificar en servidor:**

- Los logs deben mostrar los mismos IDs
- Si no coinciden, hay problema de autenticación

### 5. Verificar Socket IDs

**En consola del navegador:**

```javascript
console.log('Socket ID:', window.socketService.getSocket()?.id);
```

**En servidor:**

- Los logs deben mostrar el mismo Socket ID
- Si no coincide, hay problema de conexión

### 6. Verificar Eventos Socket

**En consola del navegador:**

```javascript
// Verificar si está escuchando call-request
const socket = window.socketService.getSocket();
console.log('Listeners:', socket._callbacks);
```

### 7. Probar Manualmente

**Usuario 1 (Iniciador):**

1. Ir a ticket
2. Hacer clic en "Videollamada"
3. Hacer clic en "Iniciar Llamada"
4. Verificar logs en consola

**Usuario 2 (Receptor):**

1. Estar en el mismo ticket
2. Verificar que aparezca modal "Llamada entrante"
3. Si no aparece, verificar logs en consola

### 8. Verificar Base de Datos

**En servidor, verificar tabla CallSession:**

```sql
SELECT * FROM "CallSessions" ORDER BY "createdAt" DESC LIMIT 5;
```

**Buscar:**

- `status: 'initiated'` - Llamada iniciada
- `status: 'missed'` - Receptor no encontrado
- `status: 'active'` - Llamada aceptada

### 9. Problemas Comunes

#### A. Receptor no encontrado

**Síntoma:** Log muestra "Socket del destinatario encontrado: NO"
**Causa:** ID del receptor no coincide con usuarios conectados
**Solución:** Verificar IDs de usuario

#### B. Evento no llega

**Síntoma:** Servidor envía pero cliente no recibe
**Causa:** Socket ID incorrecto o desconexión
**Solución:** Reconectar socket

#### C. CallContext no responde

**Síntoma:** Evento llega pero no aparece modal
**Causa:** Error en CallContext o componente
**Solución:** Verificar errores en consola

### 10. Comandos de Debug

#### En Consola del Navegador:

```javascript
// Verificar estado completo
console.log('Socket:', window.socketService.isConnected());
console.log('User:', localStorage.getItem('currentUserEmail'));
console.log('Token:', localStorage.getItem('authToken'));

// Forzar reconexión
window.socketService.reconnect();

// Simular llamada
window.testInitiateCall('recipient-id', 'ticket-id');
```

#### En Servidor:

```bash
# Ver logs en tiempo real
tail -f logs/combined.log

# Ver solo errores
tail -f logs/error.log
```

### 11. Solución Rápida

Si nada funciona:

1. **Limpiar localStorage:**

   ```javascript
   localStorage.clear();
   ```

2. **Reiniciar servidores:**

   ```bash
   # Ctrl+C en ambas terminales
   # Volver a ejecutar
   ```

3. **Hacer logout/login:**
   - Cerrar sesión
   - Iniciar sesión nuevamente
   - Probar videollamada

### 12. Logs Esperados

#### Servidor (Iniciador):

```
Usuario conectado: Juan Técnico (uuid-123)
=== INICIANDO LLAMADA ===
De: Juan Técnico (uuid-123)
Para: uuid-456
Ticket: ticket-789
Usuarios conectados: 2
Conectados: uuid-123(socket-abc), uuid-456(socket-def)
Sesión de llamada creada: session-xyz
Socket del destinatario encontrado: SÍ
Socket ID del destinatario: socket-def
Enviando call-request a socket-def: {from: "uuid-123", ticketId: "ticket-789", callSessionId: "session-xyz"}
Llamada iniciada de Juan Técnico a uuid-456 en ticket ticket-789
```

#### Cliente (Receptor):

```
=== CALL REQUEST RECEIVED ===
Data: {from: "uuid-123", ticketId: "ticket-789", callSessionId: "session-xyz"}
Socket ID: socket-def
User: PruebasUsers
CallContext: Llamada entrante recibida: {from: "uuid-123", ticketId: "ticket-789", callSessionId: "session-xyz"}
```

### 13. Si Aún No Funciona

1. **Verificar que ambos usuarios estén en el mismo ticket**
2. **Verificar que el servidor esté ejecutándose en puerto 3000**
3. **Verificar que no haya errores de CORS**
4. **Verificar que la base de datos esté funcionando**
5. **Revisar logs de error del servidor**

### 14. Contacto

Si el problema persiste, proporcionar:

- Logs del servidor
- Logs de la consola del navegador
- IDs de usuario de ambos usuarios
- Socket IDs de ambos usuarios
- Estado de la base de datos (tabla CallSessions)
