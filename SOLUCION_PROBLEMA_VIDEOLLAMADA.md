# Solución al Problema de Videollamada

## Problema Identificado

**Síntoma:** Se inicia la llamada desde un usuario pero el otro usuario no recibe la notificación de llamada entrante.

## Posibles Causas y Soluciones

### 1. **Problema de Conexión Socket.IO**

#### Verificar:

- Abrir la consola del navegador (F12)
- Buscar el componente de debug en la esquina inferior derecha
- Verificar que "Connected" y "Server Available" estén en ✅

#### Solución:

```bash
# Asegúrate de que el servidor esté ejecutándose
cd server
npm run dev

# En otra terminal, ejecuta el cliente
npm run dev
```

### 2. **Problema de Autenticación**

#### Verificar:

- En la consola del navegador, buscar logs que digan "SocketService: Socket connected?"
- Verificar que el token esté presente en localStorage

#### Solución:

```javascript
// En la consola del navegador, ejecutar:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('currentUserEmail'));
```

Si no hay token, hacer logout y login nuevamente.

### 3. **Problema de Configuración CORS**

#### Verificar:

- El servidor debe estar ejecutándose en puerto 3000
- El cliente debe estar ejecutándose en puerto 5173
- Verificar que no haya errores de CORS en la consola

#### Solución:

```bash
# Verificar que ambos servidores estén ejecutándose
# Servidor: http://localhost:3000
# Cliente: http://localhost:5173
```

### 4. **Problema de Eventos Socket**

#### Verificar:

- En la consola del navegador, buscar logs que digan:
  - "SocketService: initiateCall called with:"
  - "SocketService: Emitting call-initiate event"
  - "CallContext: Llamada entrante recibida:"

#### Solución:

Si no aparecen estos logs, el problema está en la conexión del socket.

### 5. **Problema de Base de Datos**

#### Verificar:

- El servidor debe mostrar "Database connection has been established successfully"
- No debe haber errores de conexión a la base de datos

#### Solución:

```bash
# Verificar que PostgreSQL esté ejecutándose
# En Windows:
net start postgresql-x64-13

# En Linux/Mac:
sudo systemctl start postgresql
```

## Pasos de Debugging

### Paso 1: Verificar Conexión Socket

1. Abrir dos navegadores diferentes (Chrome y Firefox)
2. Hacer login con usuarios diferentes en cada uno
3. Verificar que ambos muestren "Connected: ✅" en el debug info

### Paso 2: Verificar Logs

1. Abrir DevTools en ambos navegadores
2. Ir a la pestaña Console
3. Intentar iniciar una llamada
4. Verificar que aparezcan los logs de debug

### Paso 3: Verificar Servidor

1. En la terminal del servidor, verificar que aparezcan logs como:
   ```
   Usuario conectado: [nombre] ([id])
   Llamada iniciada de [usuario1] a [usuario2] en ticket [id]
   ```

### Paso 4: Verificar Red

1. En DevTools, ir a Network
2. Verificar que haya conexiones WebSocket activas
3. Verificar que no haya errores 404 o 500

## Comandos de Debug

### En la Consola del Navegador:

```javascript
// Verificar estado del socket
console.log('Socket connected:', window.socketService?.isConnected());
console.log(
  'Server available:',
  window.socketService?.isServerAvailableStatus()
);

// Verificar token
console.log('Token:', localStorage.getItem('token'));

// Verificar usuario
console.log('User:', localStorage.getItem('currentUserEmail'));

// Forzar reconexión
window.socketService?.disconnect();
window.socketService?.connect(window.currentUser);
```

### En el Servidor:

```bash
# Verificar logs del servidor
tail -f server/logs/combined.log

# Verificar conexiones activas
netstat -an | grep 3000
```

## Solución Rápida

Si nada funciona, ejecutar estos comandos en orden:

```bash
# 1. Detener todos los procesos
# Ctrl+C en ambas terminales

# 2. Limpiar cache
npm run clean  # Si existe el script
# O manualmente:
rm -rf node_modules/.cache
rm -rf server/node_modules/.cache

# 3. Reinstalar dependencias
npm install
cd server && npm install && cd ..

# 4. Reiniciar servidor
cd server && npm run dev

# 5. En otra terminal, reiniciar cliente
npm run dev

# 6. Limpiar localStorage del navegador
# En DevTools > Application > Storage > Clear All
```

## Verificación Final

Después de aplicar las soluciones:

1. **Usuario 1:** Ir a un ticket → Videollamada → Iniciar Llamada
2. **Usuario 2:** Debería aparecer el modal de "Llamada entrante"
3. **Usuario 2:** Hacer clic en "Aceptar"
4. **Ambos usuarios:** Deberían verse en el grid de video

## Logs Esperados

### En el Cliente (Usuario que inicia):

```
CallContext: Iniciating call to: [id] ticket: [id]
SocketService: initiateCall called with: {recipientId: "[id]", ticketId: "[id]"}
SocketService: Emitting call-initiate event
```

### En el Cliente (Usuario que recibe):

```
CallContext: Llamada entrante recibida: {from: "[id]", ticketId: "[id]", callSessionId: "[id]"}
```

### En el Servidor:

```
Usuario conectado: [nombre] ([id])
Llamada iniciada de [usuario1] a [usuario2] en ticket [id]
```

Si estos logs no aparecen, el problema está en la conexión Socket.IO.
