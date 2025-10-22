// Script para probar recepción de señales
// Ejecutar en la consola del navegador del RECEPTOR (Juan Técnico)

console.log('🔍 === PRUEBA DE RECEPCIÓN DE SEÑALES ===');

// 1. Verificar conexión del socket
const socket = window.socketService?.socket;
if (!socket) {
  console.error('❌ Socket no encontrado');
} else {
  console.log('✅ Socket encontrado:', socket.id);
  console.log('✅ Socket conectado:', socket.connected);
}

// 2. Verificar el servicio WebRTC
const webrtcService = window.webRTCNativeService;
if (!webrtcService) {
  console.error('❌ WebRTC Native Service no encontrado');
} else {
  console.log('✅ WebRTC Native Service encontrado');
}

// 3. Verificar el contexto de llamada
const callContext = window.callContext;
if (!callContext) {
  console.error('❌ CallContext no encontrado');
} else {
  console.log('✅ CallContext encontrado');
}

// 4. Función para agregar listeners de prueba
function addTestListeners() {
  console.log('\n📡 === AGREGANDO LISTENERS DE PRUEBA ===');

  if (!socket) {
    console.error('❌ No se puede agregar listeners: Socket no encontrado');
    return;
  }

  // Listener para señales WebRTC
  socket.on('signal', data => {
    console.log('🎯 SEÑAL RECIBIDA:', data);
    console.log('   - De:', data.from);
    console.log('   - Tipo:', data.signal?.type);
    console.log('   - SDP length:', data.signal?.sdp?.length || 0);

    // Verificar si el WebRTC service puede procesar la señal
    if (webrtcService && typeof webrtcService.handleSignal === 'function') {
      console.log('📤 Procesando señal con WebRTC service...');
      try {
        webrtcService.handleSignal(data.from, data.signal);
        console.log('✅ Señal procesada correctamente');
      } catch (error) {
        console.error('❌ Error procesando señal:', error);
      }
    } else {
      console.log('❌ WebRTC service no puede procesar la señal');
    }
  });

  // Listener para llamadas entrantes
  socket.on('call-request', data => {
    console.log('📞 LLAMADA ENTRANTE:', data);
    console.log('   - De:', data.caller?.name);
    console.log('   - Ticket:', data.ticketId);
    console.log('   - Sesión:', data.callSessionId);

    // Verificar si el CallContext puede procesar la llamada
    if (callContext && typeof callContext.acceptCall === 'function') {
      console.log('📤 Procesando llamada con CallContext...');
      try {
        callContext.acceptCall(data.caller.id);
        console.log('✅ Llamada procesada correctamente');
      } catch (error) {
        console.error('❌ Error procesando llamada:', error);
      }
    } else {
      console.log('❌ CallContext no puede procesar la llamada');
    }
  });

  // Listener para errores
  socket.on('call-error', data => {
    console.log('❌ ERROR DE LLAMADA:', data);
  });

  console.log('✅ Listeners de prueba agregados');
}

// 5. Función para verificar el estado del receptor
function checkReceiverState() {
  console.log('\n🔍 === ESTADO DEL RECEPTOR ===');

  // Verificar Socket
  if (socket) {
    console.log('Socket:');
    console.log('  - ID:', socket.id);
    console.log('  - Conectado:', socket.connected);
    console.log('  - Transport:', socket.io.engine.transport.name);
  }

  // Verificar Usuario
  const user = window.socketService?.user;
  if (user) {
    console.log('Usuario:');
    console.log('  - Nombre:', user.name);
    console.log('  - ID:', user.id);
    console.log('  - Rol:', user.role);
  }

  // Verificar WebRTC
  if (webrtcService) {
    console.log('WebRTC:');
    console.log(
      '  - Peer connections:',
      webrtcService.peerConnections?.size || 0
    );
    console.log('  - Local stream:', webrtcService.localStream ? '✅' : '❌');
    console.log('  - Usuario inicializado:', webrtcService.user?.name || 'No');
  }

  // Verificar CallContext
  if (callContext) {
    console.log('CallContext:');
    console.log('  - En llamada:', callContext.isInCall ? '✅' : '❌');
    console.log('  - Cargando:', callContext.isLoading ? '✅' : '❌');
    console.log('  - Stream local:', callContext.localStream ? '✅' : '❌');
    console.log('  - Streams remotos:', callContext.remoteStreams?.length || 0);
  }
}

// 6. Función para simular recepción de señal
function simulateSignalReception() {
  console.log('\n🧪 === SIMULANDO RECEPCIÓN DE SEÑAL ===');

  if (!webrtcService) {
    console.error('❌ No se puede simular: WebRTC service no encontrado');
    return;
  }

  const testSignal = {
    type: 'offer',
    sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test\r\na=ice-options:trickle\r\na=fingerprint:sha-256 test\r\na=setup:actpass\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:96 VP8/90000\r\na=ssrc:1234567890 cname:test\r\na=ssrc:1234567890 msid:test test\r\na=ssrc:1234567890 mslabel:test\r\na=label:test\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test\r\na=ice-options:trickle\r\na=fingerprint:sha-256 test\r\na=setup:actpass\r\na=mid:1\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:111 opus/48000/2\r\na=ssrc:0987654321 cname:test\r\na=ssrc:0987654321 msid:test test\r\na=ssrc:0987654321 mslabel:test\r\na=label:test\r\n',
  };

  const senderId = '4da675ec-04c3-4e0a-897d-f810f6a190da'; // PruebasUsers

  console.log('📨 Simulando recepción de señal de:', senderId);
  console.log('📋 Tipo:', testSignal.type);

  try {
    webrtcService.handleSignal(senderId, testSignal);
    console.log('✅ Señal simulada procesada correctamente');
  } catch (error) {
    console.error('❌ Error procesando señal simulada:', error);
  }
}

// Ejecutar verificaciones
checkReceiverState();
addTestListeners();

console.log('\n🎯 === FUNCIONES DISPONIBLES ===');
console.log('addTestListeners() - Agrega listeners de prueba');
console.log('checkReceiverState() - Verifica estado del receptor');
console.log('simulateSignalReception() - Simula recepción de señal');

console.log('\n✅ === PRUEBA COMPLETADA ===');
console.log('💡 Ahora intenta hacer una llamada desde el otro navegador');
console.log('📋 Observa los logs aquí para ver si las señales llegan');
