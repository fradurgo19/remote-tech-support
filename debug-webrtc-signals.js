// Script para debuggear señales WebRTC
// Ejecutar en la consola del navegador del EMISOR (PruebasUsers)

console.log('🔍 === DEBUG DE SEÑALES WEBRTC ===');

// 1. Verificar el servicio WebRTC
const webrtcService = window.webRTCNativeService;
if (!webrtcService) {
  console.error('❌ WebRTC Native Service no encontrado');
  console.log('💡 Asegúrate de que el servicio esté inicializado');
} else {
  console.log('✅ WebRTC Native Service encontrado');

  // Verificar peer connections
  console.log('📊 Peer connections:', webrtcService.peerConnections?.size || 0);

  // Verificar local stream
  console.log(
    '📹 Local stream:',
    webrtcService.localStream ? 'Presente' : 'Ausente'
  );
  if (webrtcService.localStream) {
    console.log(
      '   - Video tracks:',
      webrtcService.localStream.getVideoTracks().length
    );
    console.log(
      '   - Audio tracks:',
      webrtcService.localStream.getAudioTracks().length
    );
  }
}

// 2. Verificar el servicio de socket
const socketService = window.socketService;
if (!socketService) {
  console.error('❌ Socket Service no encontrado');
} else {
  console.log('✅ Socket Service encontrado');
  console.log('📡 Socket conectado:', socketService.isConnected());
  console.log('👤 Usuario:', socketService.user?.name);
}

// 3. Verificar el contexto de llamada
const callContext = window.callContext;
if (!callContext) {
  console.error('❌ CallContext no encontrado');
} else {
  console.log('✅ CallContext encontrado');
  console.log('📞 En llamada:', callContext.isInCall);
  console.log(
    '📹 Stream local:',
    callContext.localStream ? 'Presente' : 'Ausente'
  );
  console.log('📺 Streams remotos:', callContext.remoteStreams?.length || 0);
}

// 4. Función para simular envío de señal
function simulateSignalSend() {
  console.log('\n🧪 === SIMULANDO ENVÍO DE SEÑAL ===');

  if (!socketService) {
    console.error('❌ No se puede simular: Socket Service no encontrado');
    return;
  }

  const testSignal = {
    type: 'offer',
    sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test\r\na=ice-options:trickle\r\na=fingerprint:sha-256 test\r\na=setup:actpass\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:96 VP8/90000\r\na=ssrc:1234567890 cname:test\r\na=ssrc:1234567890 msid:test test\r\na=ssrc:1234567890 mslabel:test\r\na=label:test\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test\r\na=ice-options:trickle\r\na=fingerprint:sha-256 test\r\na=setup:actpass\r\na=mid:1\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:111 opus/48000/2\r\na=ssrc:0987654321 cname:test\r\na=ssrc:0987654321 msid:test test\r\na=ssrc:0987654321 mslabel:test\r\na=label:test\r\n',
  };

  const recipientId = '550e8400-e29b-41d4-a716-446655440011'; // Juan Técnico

  console.log('📤 Enviando señal de prueba a:', recipientId);
  console.log('📋 Tipo de señal:', testSignal.type);

  try {
    socketService.sendSignal(recipientId, testSignal);
    console.log('✅ Señal enviada correctamente');
  } catch (error) {
    console.error('❌ Error enviando señal:', error);
  }
}

// 5. Función para verificar listeners del socket
function checkSocketListeners() {
  console.log('\n📡 === VERIFICANDO LISTENERS DEL SOCKET ===');

  if (!socketService?.socket) {
    console.error('❌ Socket no encontrado');
    return;
  }

  const socket = socketService.socket;

  // Verificar si tiene listeners
  const listeners = socket._callbacks || {};
  console.log('📋 Eventos con listeners:', Object.keys(listeners));

  // Agregar listener temporal para verificar recepción
  socket.on('signal-response', data => {
    console.log('📨 Respuesta de señal recibida:', data);
  });

  console.log('✅ Listener temporal agregado para signal-response');
}

// 6. Función para verificar el estado completo
function checkCompleteState() {
  console.log('\n🔍 === ESTADO COMPLETO DEL SISTEMA ===');

  // Verificar WebRTC
  if (webrtcService) {
    console.log('WebRTC Service:');
    console.log(
      '  - Peer connections:',
      webrtcService.peerConnections?.size || 0
    );
    console.log('  - Local stream:', webrtcService.localStream ? '✅' : '❌');
    console.log('  - Screen stream:', webrtcService.screenStream ? '✅' : '❌');
    console.log(
      '  - Multiple cameras:',
      webrtcService.multipleCameraStreams?.size || 0
    );
  }

  // Verificar Socket
  if (socketService) {
    console.log('Socket Service:');
    console.log('  - Conectado:', socketService.isConnected() ? '✅' : '❌');
    console.log('  - Usuario:', socketService.user?.name || 'No definido');
    console.log('  - Socket ID:', socketService.socket?.id || 'No definido');
  }

  // Verificar CallContext
  if (callContext) {
    console.log('Call Context:');
    console.log('  - En llamada:', callContext.isInCall ? '✅' : '❌');
    console.log('  - Cargando:', callContext.isLoading ? '✅' : '❌');
    console.log('  - Stream local:', callContext.localStream ? '✅' : '❌');
    console.log('  - Streams remotos:', callContext.remoteStreams?.length || 0);
    console.log(
      '  - Video habilitado:',
      callContext.videoEnabled ? '✅' : '❌'
    );
    console.log(
      '  - Audio habilitado:',
      callContext.audioEnabled ? '✅' : '❌'
    );
  }
}

// Ejecutar verificaciones
checkCompleteState();
checkSocketListeners();

console.log('\n🎯 === FUNCIONES DISPONIBLES ===');
console.log('simulateSignalSend() - Simula envío de señal');
console.log('checkSocketListeners() - Verifica listeners del socket');
console.log('checkCompleteState() - Verifica estado completo');

console.log('\n✅ === DEBUG COMPLETADO ===');
console.log('💡 Usa las funciones disponibles para debuggear el problema');
