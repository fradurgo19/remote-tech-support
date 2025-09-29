// Script simplificado para probar recepción de señales
console.log('🔍 === SCRIPT SIMPLIFICADO DE SOCKET ===');

// Verificar si el socket está expuesto
if (window.socketService) {
  console.log('✅ socketService encontrado');
  console.log('   - Socket ID:', window.socketService.getSocket()?.id);
  console.log('   - Conectado:', window.socketService.isConnected());

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
