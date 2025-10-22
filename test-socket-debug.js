// Script mejorado para probar recepción de señales
console.log('🔍 === SCRIPT DE DEBUGGING DE SOCKET ===');

// Función para verificar el socket expuesto
function checkExposedSocket() {
  console.log('🔍 Verificando socket expuesto...');

  if (window.socketService) {
    console.log('✅ socketService encontrado en window');
    console.log('   - Socket ID:', window.socketService.getSocket()?.id);
    console.log('   - Conectado:', window.socketService.isConnected());
    console.log(
      '   - Servidor disponible:',
      window.socketService.isServerAvailableStatus()
    );
    return window.socketService;
  } else if (window.socket) {
    console.log('✅ socket encontrado en window');
    console.log('   - Socket ID:', window.socket.id);
    console.log('   - Conectado:', window.socket.connected);
    return window.socket;
  } else {
    console.log('❌ No se encontró socket en window');
    return null;
  }
}

// Función para agregar listeners de prueba
function addTestListeners(socketService) {
  console.log('🔍 Agregando listeners de prueba...');

  if (socketService) {
    // Listener para señales WebRTC
    const unsubscribeSignal = socketService.onSignal(data => {
      console.log('🎯 SEÑAL RECIBIDA:', data);
      console.log('   - De:', data.from);
      console.log('   - Tipo:', data.signal?.type);
      console.log('   - SDP length:', data.signal?.sdp?.length || 0);
    });

    // Listener para llamadas entrantes
    const unsubscribeCallRequest = socketService.onCallRequest(data => {
      console.log('📞 LLAMADA ENTRANTE:', data);
      console.log('   - De:', data.from);
      console.log('   - Ticket:', data.ticketId);
      console.log('   - Sesión:', data.callSessionId);
    });

    console.log('✅ Listeners agregados');

    // Retornar funciones para limpiar
    return () => {
      unsubscribeSignal();
      unsubscribeCallRequest();
    };
  } else {
    console.log('❌ No se pudo agregar listeners');
    return null;
  }
}

// Función para verificar el estado del socket
function checkSocketState() {
  console.log('🔍 === ESTADO DEL SOCKET ===');

  const socketService = checkExposedSocket();

  if (socketService) {
    console.log('📊 Estado detallado:');
    console.log('   - Socket ID:', socketService.getSocket()?.id);
    console.log('   - Conectado:', socketService.isConnected());
    console.log(
      '   - Servidor disponible:',
      socketService.isServerAvailableStatus()
    );
    console.log('   - Usuario:', socketService.user?.name);

    return socketService;
  }

  return null;
}

// Función principal
function main() {
  console.log('🚀 Iniciando debugging de socket...');

  const socketService = checkSocketState();

  if (socketService) {
    const cleanup = addTestListeners(socketService);

    console.log('✅ === SCRIPT CONFIGURADO ===');
    console.log('💡 Ahora haz una llamada desde PruebasUsers');
    console.log('📋 Observa la consola para ver los eventos recibidos');

    // Exponer funciones para limpieza
    window.cleanupSocketDebug = cleanup;

    return true;
  } else {
    console.log('❌ No se pudo configurar el debugging');
    console.log(
      '💡 Intenta recargar la página y ejecutar el script nuevamente'
    );
    return false;
  }
}

// Ejecutar función principal
const success = main();

// Exponer funciones globalmente para uso manual
window.socketDebug = {
  checkSocket: checkExposedSocket,
  addListeners: addTestListeners,
  checkState: checkSocketState,
  cleanup: () => {
    if (window.cleanupSocketDebug) {
      window.cleanupSocketDebug();
      console.log('🧹 Listeners limpiados');
    }
  },
};

console.log('🎯 === FUNCIONES DISPONIBLES ===');
console.log('window.socketDebug.checkSocket() - Verificar socket');
console.log('window.socketDebug.addListeners() - Agregar listeners');
console.log('window.socketDebug.checkState() - Verificar estado');
console.log('window.socketDebug.cleanup() - Limpiar listeners');
