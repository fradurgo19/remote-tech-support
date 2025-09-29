// Script para probar el flujo completo de videollamada
// Ejecutar en la consola del navegador

console.log('=== TESTING CALL FLOW ===');

// 1. Verificar estado inicial
console.log('\n1. ESTADO INICIAL:');
console.log('Token:', localStorage.getItem('authToken') ? '✅' : '❌');
console.log(
  'Usuario:',
  localStorage.getItem('currentUserEmail') || 'No encontrado'
);

if (window.socketService) {
  console.log(
    'Socket conectado:',
    window.socketService.isConnected() ? '✅' : '❌'
  );
  console.log('Socket ID:', window.socketService.getSocket()?.id || 'None');
} else {
  console.log('SocketService: ❌ No disponible');
}

// 2. Simular datos de prueba
const testData = {
  recipientId: 'test-recipient-id',
  ticketId: 'test-ticket-id',
};

console.log('\n2. DATOS DE PRUEBA:');
console.log('Recipient ID:', testData.recipientId);
console.log('Ticket ID:', testData.ticketId);

// 3. Verificar que el socket esté escuchando eventos
console.log('\n3. VERIFICANDO LISTENERS:');
if (window.socketService && window.socketService.getSocket()) {
  const socket = window.socketService.getSocket();
  console.log('Socket listeners:', socket._callbacks || 'No callbacks found');

  // Verificar si está escuchando call-request
  const hasCallRequestListener =
    socket._callbacks && socket._callbacks['call-request'];
  console.log('Escuchando call-request:', hasCallRequestListener ? '✅' : '❌');
} else {
  console.log('No se puede verificar listeners - socket no disponible');
}

// 4. Función para probar iniciar llamada
window.testInitiateCall = function (recipientId, ticketId) {
  console.log('\n4. PROBANDO INICIAR LLAMADA:');
  console.log('Recipient:', recipientId);
  console.log('Ticket:', ticketId);

  if (window.socketService) {
    window.socketService.initiateCall(recipientId, ticketId);
    console.log('✅ initiateCall llamado');
  } else {
    console.log('❌ SocketService no disponible');
  }
};

// 5. Función para simular recibir llamada
window.testReceiveCall = function () {
  console.log('\n5. SIMULANDO RECIBIR LLAMADA:');

  // Simular evento call-request
  const mockCallData = {
    from: 'test-caller-id',
    ticketId: 'test-ticket-id',
    callSessionId: 'test-session-id',
  };

  console.log('Datos simulados:', mockCallData);

  // Disparar evento manualmente si es posible
  if (window.socketService && window.socketService.getSocket()) {
    const socket = window.socketService.getSocket();
    socket.emit('call-request', mockCallData);
    console.log('✅ Evento call-request simulado');
  } else {
    console.log('❌ No se puede simular - socket no disponible');
  }
};

// 6. Instrucciones
console.log('\n6. INSTRUCCIONES:');
console.log('Para probar iniciar llamada:');
console.log('  testInitiateCall("recipient-id", "ticket-id")');
console.log('');
console.log('Para simular recibir llamada:');
console.log('  testReceiveCall()');
console.log('');
console.log('Para ver logs del servidor:');
console.log('  Revisar terminal del servidor (npm run dev)');

// 7. Verificar CallContext
console.log('\n7. VERIFICANDO CALL CONTEXT:');
if (window.React && window.React.useContext) {
  console.log('React disponible: ✅');
} else {
  console.log('React disponible: ❌');
}

// 8. Verificar si hay errores en consola
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
