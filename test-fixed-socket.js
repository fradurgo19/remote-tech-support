// Script para probar el socket corregido
console.log('🔍 === PROBANDO SOCKET CORREGIDO ===');

if (window.socketService) {
  const socket = window.socketService.getSocket();
  console.log('📊 Socket actual:', socket?.id);

  // Agregar listeners
  const unsubscribeSignal = window.socketService.onSignal(data => {
    console.log('🎯 SEÑAL RECIBIDA:', data);
    console.log('   - De:', data.from);
    console.log('   - Tipo:', data.signal?.type);
  });

  const unsubscribeCallRequest = window.socketService.onCallRequest(data => {
    console.log('📞 LLAMADA ENTRANTE:', data);
    console.log('   - De:', data.from);
    console.log('   - Ticket:', data.ticketId);
  });

  console.log('✅ Listeners agregados');
  console.log('💡 Haz una llamada desde PruebasUsers');
  console.log('📋 Ahora deberías ver los eventos en la consola');

  // Exponer función de limpieza
  window.cleanupSocket = () => {
    unsubscribeSignal();
    unsubscribeCallRequest();
    console.log('🧹 Listeners limpiados');
  };
} else {
  console.log('❌ socketService no encontrado');
  console.log('💡 Recarga la página y ejecuta el script nuevamente');
}
