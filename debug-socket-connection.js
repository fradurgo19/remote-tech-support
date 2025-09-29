// Script para debuggear la conexión del socket
// Ejecutar en la consola del navegador

console.log('=== DEBUG SOCKET CONNECTION ===');

// Verificar si socketService está disponible
if (typeof window !== 'undefined' && window.socketService) {
  console.log('SocketService encontrado');
  console.log('Socket conectado:', window.socketService.isConnected());
  console.log(
    'Servidor disponible:',
    window.socketService.isServerAvailableStatus()
  );
} else {
  console.log('SocketService no encontrado en window');
}

// Verificar localStorage
console.log('Token en localStorage:', localStorage.getItem('token'));

// Verificar si hay usuarios conectados
console.log('Usuario actual:', localStorage.getItem('currentUserEmail'));

// Verificar conexión WebSocket manual
const testSocket = new WebSocket('ws://localhost:3000');
testSocket.onopen = () => {
  console.log('WebSocket manual conectado');
  testSocket.close();
};
testSocket.onerror = error => {
  console.log('Error WebSocket manual:', error);
};
