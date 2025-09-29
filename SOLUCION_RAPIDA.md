# Solución Rápida al Problema de Videollamada

## Problema Identificado

- **Token incorrecto**: El socket buscaba `'token'` pero se guardaba como `'authToken'`
- **SimplePeer sin configuración**: Faltaban servidores STUN para WebRTC

## Solución Aplicada

### 1. Corregido el Token

- ✅ Socket ahora busca `localStorage.getItem('authToken')`
- ✅ Debug info muestra el token correcto

### 2. Agregada Configuración WebRTC

- ✅ Servidores STUN de Google agregados
- ✅ Configuración ICE para conexiones P2P

### 3. Botón de Reconexión

- ✅ Botón "Reconectar" en el debug info
- ✅ Método `reconnect()` en SocketService

## Pasos para Probar

### Paso 1: Verificar Conexión

1. **Refrescar la página** (Ctrl+F5)
2. **Verificar debug info** en esquina inferior derecha:
   - ✅ Connected
   - ✅ Server Available
   - ✅ Token

### Paso 2: Si No Está Conectado

1. **Hacer clic en "Reconectar"** en el debug info
2. **O hacer logout/login** nuevamente

### Paso 3: Probar Videollamada

1. **Usuario 1**: Ir a ticket → Videollamada → Iniciar Llamada
2. **Usuario 2**: Debería aparecer modal "Llamada entrante"
3. **Usuario 2**: Hacer clic en "Aceptar"

## Logs Esperados

### Cliente (Iniciador):

```
CallContext: Iniciating call to: [id] ticket: [id]
SocketService: initiateCall called with: {recipientId: "[id]", ticketId: "[id]"}
SocketService: Emitting call-initiate event
WebRTC: Initiating call to: [id] ticket: [id]
WebRTC: Creating peer connection
WebRTC: Call initiation completed
```

### Cliente (Receptor):

```
CallContext: Llamada entrante recibida: {from: "[id]", ticketId: "[id]", callSessionId: "[id]"}
```

### Servidor:

```
Usuario conectado: [nombre] ([id])
Llamada iniciada de [usuario1] a [usuario2] en ticket [id]
```

## Si Aún No Funciona

### Verificar Servidor

```bash
# Asegúrate de que el servidor esté ejecutándose
cd server
npm run dev
```

### Verificar Token

```javascript
// En consola del navegador:
console.log('Token:', localStorage.getItem('authToken'));
console.log('User:', localStorage.getItem('currentUserEmail'));
```

### Limpiar y Reiniciar

```bash
# Limpiar localStorage
# En DevTools > Application > Storage > Clear All

# Reiniciar servidores
# Ctrl+C en ambas terminales
# Volver a ejecutar
```

## Comandos de Debug

### En Consola del Navegador:

```javascript
// Verificar estado
console.log('Socket connected:', window.socketService?.isConnected());
console.log('Token:', localStorage.getItem('authToken'));

// Forzar reconexión
window.socketService?.reconnect();
```

### Verificar Servidor:

```bash
# Verificar que esté ejecutándose en puerto 3000
netstat -an | grep 3000
```

## Estado Esperado

Después de aplicar la solución:

- ✅ Debug info muestra todo en verde
- ✅ Socket conectado con ID visible
- ✅ Token presente
- ✅ Videollamada funciona entre usuarios
