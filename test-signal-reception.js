// Script para probar la recepción de señales WebRTC
// Ejecutar en la consola del navegador del RECEPTOR

console.log('=== TESTING SIGNAL RECEPTION ===');

// 1. Verificar socket service
console.log('\n1. VERIFICANDO SOCKET SERVICE:');
if (window.socketService) {
  console.log('✅ SocketService disponible');
  console.log('Conectado:', window.socketService.isConnected());
  console.log('Socket ID:', window.socketService.getSocket()?.id);
} else {
  console.log('❌ SocketService no disponible');
}

// 2. Verificar WebRTC Native Service
console.log('\n2. VERIFICANDO WEBRTC NATIVE SERVICE:');
if (window.webRTCNativeService) {
  console.log('✅ WebRTCNativeService disponible');
} else {
  console.log('❌ WebRTCNativeService no disponible');
}

// 3. Verificar listeners de socket
console.log('\n3. VERIFICANDO LISTENERS DE SOCKET:');
if (window.socketService && window.socketService.getSocket()) {
  const socket = window.socketService.getSocket();
  console.log('Socket listeners:', Object.keys(socket._callbacks || {}));

  // Verificar si está escuchando 'signal'
  const hasSignalListener = socket._callbacks && socket._callbacks['signal'];
  console.log('Escuchando signal:', hasSignalListener ? '✅' : '❌');

  // Verificar si está escuchando 'call-request'
  const hasCallRequestListener =
    socket._callbacks && socket._callbacks['call-request'];
  console.log('Escuchando call-request:', hasCallRequestListener ? '✅' : '❌');
} else {
  console.log('❌ No se puede verificar listeners - socket no disponible');
}

// 4. Función para simular recepción de señal
window.testSignalReception = function () {
  console.log('\n4. SIMULANDO RECEPCIÓN DE SEÑAL:');

  // Simular evento signal
  const mockSignal = {
    from: 'test-caller-id',
    signal: {
      type: 'offer',
      sdp: 'v=0\r\no=- 1234567890 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test\r\na=ice-options:trickle\r\na=fingerprint:sha-256 test\r\na=setup:actpass\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n',
    },
  };

  console.log('Datos simulados:', mockSignal);

  // Disparar evento manualmente si es posible
  if (window.socketService && window.socketService.getSocket()) {
    const socket = window.socketService.getSocket();
    socket.emit('signal', mockSignal);
    console.log('✅ Evento signal simulado');
  } else {
    console.log('❌ No se puede simular - socket no disponible');
  }
};

// 5. Función para verificar estado de conexión
window.checkConnectionStatus = function () {
  console.log('\n5. ESTADO DE CONEXIÓN:');
  console.log('Socket conectado:', window.socketService?.isConnected());
  console.log(
    'Servidor disponible:',
    window.socketService?.isServerAvailableStatus()
  );
  console.log('Usuario actual:', localStorage.getItem('currentUserEmail'));
  console.log('Token presente:', !!localStorage.getItem('authToken'));
};

// 6. Función para verificar logs del servidor
window.checkServerLogs = function () {
  console.log('\n6. VERIFICAR LOGS DEL SERVIDOR:');
  console.log('Revisar terminal del servidor para:');
  console.log('- "=== SEÑAL WEBRTC RECIBIDA ==="');
  console.log('- "✅ Señal WebRTC enviada"');
  console.log('- "❌ Destinatario no encontrado"');
};

// 7. Instrucciones
console.log('\n7. INSTRUCCIONES:');
console.log('Para verificar estado:');
console.log('  checkConnectionStatus()');
console.log('');
console.log('Para simular recepción de señal:');
console.log('  testSignalReception()');
console.log('');
console.log('Para verificar logs del servidor:');
console.log('  checkServerLogs()');
console.log('');
console.log('Para probar videollamada real:');
console.log('  1. Usuario 1: Iniciar llamada');
console.log('  2. Usuario 2: Verificar que aparezca modal');
console.log('  3. Usuario 2: Aceptar llamada');
console.log('  4. Verificar logs en consola y servidor');

// 8. Verificar si hay errores
console.log('\n8. VERIFICANDO ERRORES:');
const errors = [];
const originalError = console.error;
console.error = function (...args) {
  errors.push(args.join(' '));
  originalError.apply(console, args);
};

setTimeout(() => {
  console.log('Errores encontrados:', errors.length);
  if (errors.length > 0) {
    console.log('Errores:', errors);
  }
}, 1000);
