# Guía de Pruebas de Videollamada

## Funcionalidades Implementadas

### ✅ Funcionalidades Básicas

1. **Iniciar videollamada** - Desde el panel de videollamada en detalles del ticket
2. **Cámara funciona** - Se puede activar/desactivar
3. **Compartir pantalla** - Implementado con `getDisplayMedia`
4. **Activar/desactivar cámara** - Control de video tracks
5. **Cambio de dispositivos** - Selector de cámaras y micrófonos

### ✅ Nuevas Funcionalidades Implementadas

1. **Múltiples cámaras simultáneas** - Permite activar varias cámaras al mismo tiempo
2. **Handlers de videollamada en servidor** - Manejo completo de sesiones de llamada
3. **UI para aceptar llamadas entrantes** - Modal para recibir llamadas
4. **Señalización WebRTC completa** - Manejo de señales entre cliente y servidor

## Cómo Probar las Funcionalidades

### 1. Prueba de Videollamada Cliente-Soporte

#### Preparación:

1. Asegúrate de que el servidor esté ejecutándose (`npm run dev` en la carpeta `server`)
2. Asegúrate de que el cliente esté ejecutándose (`npm run dev` en la raíz del proyecto)
3. Ten al menos 2 usuarios diferentes logueados en navegadores separados

#### Pasos:

1. **Usuario 1 (Soporte):**

   - Ve a un ticket específico
   - Haz clic en la pestaña "Videollamada"
   - Haz clic en "Iniciar Llamada"
   - Selecciona el destinatario (Usuario 2)

2. **Usuario 2 (Cliente):**

   - Debería aparecer un modal de "Llamada entrante"
   - Haz clic en "Aceptar" para aceptar la llamada
   - O haz clic en "Rechazar" para rechazarla

3. **Durante la llamada:**
   - Verifica que ambos usuarios puedan verse
   - Prueba activar/desactivar la cámara
   - Prueba activar/desactivar el micrófono
   - Prueba compartir pantalla

### 2. Prueba de Múltiples Cámaras

#### Pasos:

1. **Durante una videollamada activa:**

   - Haz clic en "Configurar Dispositivos"
   - En la sección de cámaras, verás cada cámara disponible
   - Para cada cámara adicional:
     - Haz clic en "Activar Cámara Adicional"
     - La cámara debería aparecer en el grid de video
     - Haz clic en "Desactivar Cámara" para quitarla

2. **Verificaciones:**
   - Todas las cámaras activas deberían mostrarse en el grid
   - Cada cámara debería tener una etiqueta "Cámara X"
   - El grid debería ajustarse automáticamente según el número de cámaras

### 3. Prueba de Cambio de Dispositivos

#### Pasos:

1. **Durante una videollamada:**
   - Haz clic en "Configurar Dispositivos"
   - Cambia la cámara principal seleccionando una diferente
   - Cambia el micrófono seleccionando uno diferente
   - Verifica que los cambios se apliquen inmediatamente

### 4. Prueba de Compartir Pantalla

#### Pasos:

1. **Durante una videollamada:**
   - Haz clic en el botón de compartir pantalla
   - Selecciona la ventana/pantalla a compartir
   - Verifica que la pantalla compartida aparezca en el grid
   - Haz clic nuevamente para dejar de compartir

## Estructura de Archivos Modificados

### Frontend:

- `src/services/webrtc.ts` - Servicio WebRTC con soporte para múltiples cámaras
- `src/context/CallContext.tsx` - Contexto de llamadas con nuevas funcionalidades
- `src/molecules/VideoGrid.tsx` - Grid de video que muestra múltiples cámaras
- `src/molecules/DeviceSelector.tsx` - Selector de dispositivos con controles de múltiples cámaras
- `src/organisms/VideoCallPanel.tsx` - Panel principal de videollamada
- `src/molecules/IncomingCallModal.tsx` - Modal para llamadas entrantes
- `src/components/IncomingCallHandler.tsx` - Manejador global de llamadas entrantes
- `src/App.tsx` - App principal con el manejador de llamadas

### Backend:

- `server/src/socket.ts` - Handlers de Socket.IO para videollamadas
- `server/src/models/CallSession.ts` - Modelo de sesión de llamada (ya existía)

## Posibles Problemas y Soluciones

### 1. Error de Permisos de Cámara

**Problema:** El navegador no permite acceso a la cámara
**Solución:**

- Asegúrate de usar HTTPS en producción
- Verifica que el usuario haya dado permisos de cámara/micrófono
- Prueba en modo incógnito para evitar conflictos de permisos

### 2. Error de Conexión WebRTC

**Problema:** Los usuarios no pueden conectarse
**Solución:**

- Verifica que el servidor Socket.IO esté ejecutándose
- Revisa la consola del navegador para errores de WebRTC
- Asegúrate de que ambos usuarios estén en la misma red o que haya un servidor TURN

### 3. Múltiples Cámaras No Funcionan

**Problema:** Solo se puede usar una cámara a la vez
**Solución:**

- Verifica que el navegador soporte múltiples streams simultáneos
- Algunos navegadores tienen limitaciones en el número de cámaras simultáneas
- Prueba con diferentes navegadores (Chrome, Firefox, Safari)

### 4. Modal de Llamada Entrante No Aparece

**Problema:** No se muestra el modal cuando llega una llamada
**Solución:**

- Verifica que el Socket.IO esté conectado correctamente
- Revisa la consola para errores de conexión
- Asegúrate de que el usuario esté autenticado

## Comandos para Ejecutar

```bash
# Servidor (Terminal 1)
cd server
npm run dev

# Cliente (Terminal 2)
npm run dev
```

## URLs de Prueba

- Cliente: http://localhost:5173
- Servidor: http://localhost:3000

## Notas Importantes

1. **HTTPS Requerido:** En producción, las videollamadas requieren HTTPS para funcionar correctamente
2. **Permisos del Navegador:** Los usuarios deben dar permisos de cámara y micrófono
3. **Red:** Para pruebas locales, ambos usuarios deben estar en la misma red
4. **Navegadores Soportados:** Chrome, Firefox, Safari (Edge también debería funcionar)

## Próximos Pasos Sugeridos

1. **Implementar grabación de llamadas** - Ya está parcialmente implementado
2. **Agregar chat durante la llamada** - Para comunicación adicional
3. **Implementar sala de espera** - Para cuando hay múltiples participantes
4. **Agregar indicadores de calidad de conexión** - Para mostrar la calidad de la llamada
5. **Implementar notificaciones push** - Para llamadas cuando el usuario no está en la página
