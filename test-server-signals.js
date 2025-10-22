// Script para probar si las señales llegan al servidor
// Ejecutar en la consola del navegador del EMISOR (PruebasUsers)

console.log('🔍 === PRUEBA DE SEÑALES AL SERVIDOR ===');

// 1. Verificar conexión del socket
const socket = window.socketService?.socket;
if (!socket) {
  console.error('❌ Socket no encontrado');
} else {
  console.log('✅ Socket encontrado:', socket.id);
  console.log('✅ Socket conectado:', socket.connected);
}

// 2. Función para enviar señal de prueba
function sendTestSignal() {
  console.log('\n🧪 === ENVIANDO SEÑAL DE PRUEBA ===');

  if (!socket) {
    console.error('❌ No se puede enviar: Socket no encontrado');
    return;
  }

  const testSignal = {
    type: 'offer',
    sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test\r\na=ice-options:trickle\r\na=fingerprint:sha-256 test\r\na=setup:actpass\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:96 VP8/90000\r\na=ssrc:1234567890 cname:test\r\na=ssrc:1234567890 msid:test test\r\na=ssrc:1234567890 mslabel:test\r\na=label:test\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test\r\na=ice-options:trickle\r\na=fingerprint:sha-256 test\r\na=setup:actpass\r\na=mid:1\r\na=sendrecv\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:111 opus/48000/2\r\na=ssrc:0987654321 cname:test\r\na=ssrc:0987654321 msid:test test\r\na=ssrc:0987654321 mslabel:test\r\na=label:test\r\n',
  };

  const recipientId = '550e8400-e29b-41d4-a716-446655440011'; // Juan Técnico

  console.log('📤 Enviando señal a:', recipientId);
  console.log('📋 Tipo:', testSignal.type);
  console.log('📋 SDP length:', testSignal.sdp.length);

  // Enviar señal directamente
  socket.emit('signal', { to: recipientId, signal: testSignal });

  console.log('✅ Señal enviada directamente al socket');
}

// 3. Función para enviar call-initiate de prueba
function sendTestCallInitiate() {
  console.log('\n📞 === ENVIANDO CALL-INITIATE DE PRUEBA ===');

  if (!socket) {
    console.error('❌ No se puede enviar: Socket no encontrado');
    return;
  }

  const recipientId = '550e8400-e29b-41d4-a716-446655440011'; // Juan Técnico
  const ticketId = '5af2d586-39d0-4686-a68c-7fab14c31e68';

  console.log('📤 Enviando call-initiate a:', recipientId);
  console.log('📋 Ticket ID:', ticketId);

  // Enviar call-initiate directamente
  socket.emit('call-initiate', { to: recipientId, ticketId });

  console.log('✅ Call-initiate enviado directamente al socket');
}

// 4. Función para verificar listeners del socket
function checkSocketListeners() {
  console.log('\n📡 === VERIFICANDO LISTENERS DEL SOCKET ===');

  if (!socket) {
    console.error('❌ Socket no encontrado');
    return;
  }

  // Verificar si tiene listeners
  const listeners = socket._callbacks || {};
  console.log('📋 Eventos con listeners:', Object.keys(listeners));

  // Agregar listeners temporales para verificar respuestas
  socket.on('signal-response', data => {
    console.log('📨 Respuesta de señal recibida:', data);
  });

  socket.on('call-response', data => {
    console.log('📞 Respuesta de llamada recibida:', data);
  });

  socket.on('call-error', data => {
    console.log('❌ Error de llamada:', data);
  });

  console.log('✅ Listeners temporales agregados');
}

// 5. Función para verificar el estado del socket
function checkSocketState() {
  console.log('\n🔍 === ESTADO DEL SOCKET ===');

  if (!socket) {
    console.error('❌ Socket no encontrado');
    return;
  }

  console.log('Socket ID:', socket.id);
  console.log('Conectado:', socket.connected);
  console.log('Transport:', socket.io.engine.transport.name);
  console.log('URL:', socket.io.uri);
  console.log('Auth:', socket.auth);

  // Verificar si está autenticado
  const user = window.socketService?.user;
  if (user) {
    console.log('Usuario autenticado:', user.name, user.id);
  } else {
    console.log('❌ Usuario no autenticado');
  }
}

// Ejecutar verificaciones
checkSocketState();
checkSocketListeners();

console.log('\n🎯 === FUNCIONES DISPONIBLES ===');
console.log('sendTestSignal() - Envía señal de prueba');
console.log('sendTestCallInitiate() - Envía call-initiate de prueba');
console.log('checkSocketListeners() - Verifica listeners del socket');
console.log('checkSocketState() - Verifica estado del socket');

console.log('\n✅ === PRUEBA COMPLETADA ===');
console.log('💡 Usa las funciones disponibles para probar el envío de señales');
console.log('📋 Revisa los logs del servidor para ver si las señales llegan');
