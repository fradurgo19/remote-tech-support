// Script para probar el flujo de señales WebRTC
// Ejecutar en la consola del navegador del RECEPTOR (Juan Técnico)

console.log('🔍 === PRUEBA DE FLUJO DE SEÑALES WEBRTC ===');

// 1. Verificar que el socket está conectado
const socket = window.socketService?.socket;
if (!socket) {
  console.error('❌ Socket no encontrado. ¿Está inicializado socketService?');
} else {
  console.log('✅ Socket encontrado:', socket.id);
  console.log('✅ Socket conectado:', socket.connected);
}

// 2. Verificar listeners de eventos
console.log('\n📡 === VERIFICANDO LISTENERS ===');

// Simular recepción de señal
const testSignal = {
  type: 'offer',
  sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test\r\na=ice-options:trickle\r\na=fingerprint:sha-256 test\r\na=setup:actpass\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:96 VP8/90000\r\na=ssrc:1234567890 cname:test\r\na=ssrc:1234567890 msid:test test\r\na=ssrc:1234567890 mslabel:test\r\na=label:test\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test\r\na=ice-options:trickle\r\na=fingerprint:sha-256 test\r\na=setup:actpass\r\na=mid:1\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:111 opus/48000/2\r\na=ssrc:0987654321 cname:test\r\na=ssrc:0987654321 msid:test test\r\na=ssrc:0987654321 mslabel:test\r\na=label:test\r\n',
};

// 3. Verificar si hay handlers de señal
console.log('\n🎯 === VERIFICANDO HANDLERS DE SEÑAL ===');

// Buscar el servicio WebRTC
const webrtcService = window.webRTCNativeService;
if (webrtcService) {
  console.log('✅ WebRTC Native Service encontrado');

  // Verificar si tiene el método handleSignal
  if (typeof webrtcService.handleSignal === 'function') {
    console.log('✅ Método handleSignal encontrado');
  } else {
    console.log('❌ Método handleSignal no encontrado');
  }
} else {
  console.log('❌ WebRTC Native Service no encontrado');
}

// 4. Verificar CallContext
const callContext = window.callContext;
if (callContext) {
  console.log('✅ CallContext encontrado');
} else {
  console.log('❌ CallContext no encontrado');
}

// 5. Simular recepción de señal manualmente
console.log('\n🧪 === SIMULANDO RECEPCIÓN DE SEÑAL ===');

// Crear un peer connection de prueba
const testPeerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
});

testPeerConnection.onicecandidate = event => {
  if (event.candidate) {
    console.log('✅ ICE candidate generado:', event.candidate.candidate);
  }
};

testPeerConnection.ontrack = event => {
  console.log('✅ Track recibido:', event.track.kind);
};

// Simular procesamiento de offer
testPeerConnection
  .setRemoteDescription({
    type: 'offer',
    sdp: testSignal.sdp,
  })
  .then(() => {
    console.log('✅ Remote description establecida correctamente');
    return testPeerConnection.createAnswer();
  })
  .then(answer => {
    console.log('✅ Answer creado:', answer.type);
    return testPeerConnection.setLocalDescription(answer);
  })
  .then(() => {
    console.log('✅ Local description establecida correctamente');
    console.log('🎉 WebRTC funciona correctamente en este navegador');
  })
  .catch(error => {
    console.error('❌ Error en WebRTC:', error);
  });

// 6. Verificar eventos de socket
console.log('\n📡 === VERIFICANDO EVENTOS DE SOCKET ===');

if (socket) {
  // Agregar listener temporal para signal
  socket.on('signal', data => {
    console.log('🎯 SEÑAL RECIBIDA:', data);
  });

  // Agregar listener temporal para call-request
  socket.on('call-request', data => {
    console.log('📞 LLAMADA RECIBIDA:', data);
  });

  console.log('✅ Listeners temporales agregados');
}

console.log('\n✅ === PRUEBA COMPLETADA ===');
console.log(
  'Ahora intenta hacer una llamada desde el otro navegador y observa los logs aquí.'
);
