# Test de Videollamada - Pasos Rápidos

## Preparación

1. **Terminal 1:** `cd server && npm run dev`
2. **Terminal 2:** `npm run dev`
3. **Navegador 1:** Chrome - http://localhost:5173
4. **Navegador 2:** Firefox - http://localhost:5173

## Test Paso a Paso

### Paso 1: Login

- **Navegador 1:** Login con usuario 1 (ej: admin@test.com / admin123)
- **Navegador 2:** Login con usuario 2 (ej: user@test.com / admin123)

### Paso 2: Verificar Conexión

- En ambos navegadores, verificar en la esquina inferior derecha:
  - ✅ Connected
  - ✅ Server Available
  - ✅ Token

### Paso 3: Crear/Acceder a Ticket

- **Navegador 1:** Ir a Tickets → Crear nuevo ticket o abrir uno existente
- **Navegador 2:** Ir al mismo ticket

### Paso 4: Iniciar Llamada

- **Navegador 1:** En el ticket → pestaña "Videollamada" → "Iniciar Llamada"
- **Verificar logs en consola:**
  ```
  CallContext: Iniciating call to: [id] ticket: [id]
  SocketService: initiateCall called with: {recipientId: "[id]", ticketId: "[id]"}
  SocketService: Emitting call-initiate event
  ```

### Paso 5: Verificar Llamada Entrante

- **Navegador 2:** Debería aparecer modal "Llamada entrante"
- **Verificar logs en consola:**
  ```
  CallContext: Llamada entrante recibida: {from: "[id]", ticketId: "[id]", callSessionId: "[id]"}
  ```

### Paso 6: Aceptar Llamada

- **Navegador 2:** Hacer clic en "Aceptar"
- **Ambos navegadores:** Deberían mostrar el grid de video

## Si No Funciona

### Verificar Servidor

```bash
# En terminal del servidor, debería mostrar:
Usuario conectado: [nombre] ([id])
Llamada iniciada de [usuario1] a [usuario2] en ticket [id]
```

### Verificar Cliente

```javascript
// En consola del navegador:
console.log('Socket connected:', window.socketService?.isConnected());
console.log('Token:', localStorage.getItem('token'));
```

### Limpiar y Reiniciar

```bash
# Limpiar localStorage
# En DevTools > Application > Storage > Clear All

# Reiniciar servidores
# Ctrl+C en ambas terminales
# Volver a ejecutar los comandos del Paso 1
```

## Problemas Comunes

1. **"Connected: ❌"** → Servidor no está ejecutándose
2. **"Token: ❌"** → Hacer logout/login
3. **No aparece modal** → Verificar logs de consola
4. **Error CORS** → Verificar puertos (3000 y 5173)

## Logs de Éxito

### Cliente (Iniciador):

```
CallContext: Iniciating call to: [id] ticket: [id]
SocketService: initiateCall called with: {recipientId: "[id]", ticketId: "[id]"}
SocketService: Emitting call-initiate event
WebRTC: Initiating call to: [id] ticket: [id]
WebRTC: Calling socketService.initiateCall
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
