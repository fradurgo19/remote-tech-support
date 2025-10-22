# Migración a WebRTC Nativo

## Problema con SimplePeer

SimplePeer estaba causando el error:

```
TypeError: Cannot read properties of undefined (reading 'call')
    at _Peer.Readable (_stream_readable.js:178:10)
    at new Duplex (_stream_duplex.js:51:12)
    at new _Peer (index.js:34:5)
```

## Solución Implementada

### 1. Nuevo Servicio WebRTC Nativo

Creado `src/services/webrtc-native.ts` que usa WebRTC nativo en lugar de SimplePeer.

### 2. Ventajas del WebRTC Nativo

- ✅ **Más confiable**: No depende de librerías externas
- ✅ **Mejor rendimiento**: Implementación nativa del navegador
- ✅ **Más control**: Acceso directo a todas las APIs de WebRTC
- ✅ **Mejor debugging**: Logs más claros y detallados
- ✅ **Compatibilidad**: Funciona en todos los navegadores modernos

### 3. Cambios Realizados

#### En `src/context/CallContext.tsx`:

```typescript
// Antes
import { webRTCService } from '../services/webrtc';

// Después
import { webRTCNativeService } from '../services/webrtc-native';
```

#### Todos los métodos reemplazados:

- `webRTCService` → `webRTCNativeService`
- Mantiene la misma interfaz pública
- Implementación interna completamente diferente

### 4. Funcionalidades Implementadas

#### ✅ Funcionalidades Básicas:

- **Iniciar llamada**: `initiateCall()`
- **Aceptar llamada**: `acceptCall()`
- **Finalizar llamada**: `endCall()`
- **Toggle video/audio**: `toggleVideo()`, `toggleAudio()`
- **Compartir pantalla**: `startScreenSharing()`, `stopScreenSharing()`

#### ✅ Funcionalidades Avanzadas:

- **Cambiar cámara**: `switchCamera()`
- **Cambiar micrófono**: `switchMicrophone()`
- **Múltiples cámaras**: `addCamera()`, `removeCamera()`, `toggleCamera()`
- **Enumerar dispositivos**: `getAvailableDevices()`

#### ⏳ Funcionalidades Pendientes:

- **Grabación**: `startRecording()`, `stopRecording()` (placeholder)

### 5. Arquitectura del Servicio Nativo

#### Clase Principal:

```typescript
class WebRTCNativeService {
  private peerConnections: Map<string, RTCPeerConnection>;
  private localStream: MediaStream | null;
  private screenStream: MediaStream | null;
  private multipleCameraStreams: Map<string, MediaStream>;
  // ... otros campos
}
```

#### Flujo de Llamada:

1. **Iniciador**: Crea `RTCPeerConnection` → Crea offer → Envía via Socket.IO
2. **Receptor**: Recibe offer → Crea answer → Envía via Socket.IO
3. **Ambos**: Intercambian ICE candidates → Establecen conexión P2P

### 6. Configuración ICE

```typescript
const configuration: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
```

### 7. Manejo de Señales

#### Tipos de Señales:

- **offer**: Oferta de conexión
- **answer**: Respuesta a la oferta
- **candidate**: Candidato ICE

#### Flujo de Señales:

```typescript
// Enviar señal
socketService.sendSignal(peerId, {
  type: 'offer',
  sdp: offer.sdp,
});

// Recibir señal
peerConnection.setRemoteDescription(
  new RTCSessionDescription({
    type: 'offer',
    sdp: signal.sdp,
  })
);
```

### 8. Logging Detallado

#### Logs de Inicio:

```
WebRTC Native: Initiating call to: [recipientId] ticket: [ticketId]
WebRTC Native: Socket connected? true
WebRTC Native: Creating peer connection: {peerId: "...", initiator: true}
WebRTC Native: Sending offer: [offer object]
```

#### Logs de Recepción:

```
WebRTC Native: Handling signal from: [peerId] type: offer
WebRTC Native: Processing offer
WebRTC Native: Sending answer: [answer object]
```

### 9. Cómo Probar

#### 1. Script de Verificación:

```javascript
// Ejecutar en consola del navegador
// Copiar y pegar el contenido de test-webrtc-native.js
```

#### 2. Probar Videollamada:

1. **Refrescar la página** (Ctrl+F5)
2. **Abrir consola del navegador**
3. **Iniciar videollamada**
4. **Verificar logs** en consola

#### 3. Logs Esperados:

```
WebRTC Native: Initiating call to: [id] ticket: [id]
WebRTC Native: Creating peer connection: {peerId: "...", initiator: true}
WebRTC Native: Sending offer: [offer]
WebRTC Native: Processing answer
WebRTC Native: Connection state: connected
```

### 10. Diferencias con SimplePeer

#### SimplePeer (Antes):

```typescript
const peer = new SimplePeer({
  initiator,
  stream,
  trickle: true,
  config: { iceServers: [...] }
});
```

#### WebRTC Nativo (Después):

```typescript
const peerConnection = new RTCPeerConnection({
  iceServers: [...]
});

// Agregar stream manualmente
stream.getTracks().forEach(track => {
  peerConnection.addTrack(track, stream);
});

// Crear offer manualmente
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);
```

### 11. Ventajas de la Migración

#### ✅ Confiabilidad:

- No más errores de SimplePeer
- Implementación nativa del navegador
- Mejor manejo de errores

#### ✅ Rendimiento:

- Menos overhead de librerías
- Mejor control de recursos
- Optimizaciones nativas

#### ✅ Debugging:

- Logs más claros
- Mejor visibilidad del flujo
- Fácil identificación de problemas

#### ✅ Mantenimiento:

- No depende de librerías externas
- Actualizaciones automáticas del navegador
- Menos dependencias

### 12. Estado Actual

- ✅ **Servicio nativo implementado**
- ✅ **CallContext migrado**
- ✅ **Todas las funcionalidades básicas**
- ✅ **Logging detallado**
- ✅ **Scripts de prueba**
- ⏳ **Pendiente**: Probar videollamada

### 13. Próximos Pasos

1. **Probar videollamada** con el servicio nativo
2. **Verificar logs** en consola del navegador
3. **Si funciona**: Continuar con testing completo
4. **Si hay problemas**: Revisar logs específicos

### 14. Rollback

Si es necesario volver a SimplePeer:

1. Revertir cambios en `CallContext.tsx`
2. Usar `src/services/webrtc.ts` original
3. Reinstalar SimplePeer si es necesario

### 15. Contacto

Si hay problemas con la migración:

- Logs de la consola del navegador
- Logs del servidor
- Navegador y versión utilizada
- Errores específicos encontrados
