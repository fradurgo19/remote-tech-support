// Script para verificar la conexión después de los cambios
// Ejecutar en la consola del navegador

console.log('=== VERIFICACIÓN DE CONEXIÓN ===');

// 1. Verificar token
const token = localStorage.getItem('authToken');
console.log('1. Token encontrado:', token ? '✅' : '❌');
if (token) {
  console.log('   Token (primeros 20 chars):', token.substring(0, 20) + '...');
}

// 2. Verificar usuario
const userEmail = localStorage.getItem('currentUserEmail');
console.log('2. Usuario encontrado:', userEmail ? '✅' : '❌');
if (userEmail) {
  console.log('   Email:', userEmail);
}

// 3. Verificar socket service
if (typeof window !== 'undefined' && window.socketService) {
  console.log('3. SocketService disponible:', '✅');
  console.log(
    '   Conectado:',
    window.socketService.isConnected() ? '✅' : '❌'
  );
  console.log(
    '   Servidor disponible:',
    window.socketService.isServerAvailableStatus() ? '✅' : '❌'
  );

  const socket = window.socketService.getSocket();
  if (socket) {
    console.log('   Socket ID:', socket.id || 'None');
    console.log('   Estado:', socket.connected ? 'Conectado' : 'Desconectado');
  }
} else {
  console.log('3. SocketService disponible:', '❌');
}

// 4. Verificar servidor
console.log('4. Probando conexión al servidor...');
fetch('http://localhost:3000/api/auth/me', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then(response => {
    if (response.ok) {
      console.log('   Servidor respondiendo:', '✅');
      return response.json();
    } else {
      console.log(
        '   Servidor respondiendo:',
        '❌ (Status:',
        response.status,
        ')'
      );
      throw new Error('Servidor no responde correctamente');
    }
  })
  .then(data => {
    console.log('   Usuario autenticado:', data.user?.name || 'Desconocido');
  })
  .catch(error => {
    console.log('   Servidor respondiendo:', '❌');
    console.log('   Error:', error.message);
  });

// 5. Recomendaciones
console.log('\n=== RECOMENDACIONES ===');
if (!token) {
  console.log('❌ No hay token. Hacer logout y login nuevamente.');
} else if (!window.socketService?.isConnected()) {
  console.log(
    '❌ Socket no conectado. Hacer clic en "Reconectar" en el debug info.'
  );
} else {
  console.log('✅ Todo parece estar bien. Probar videollamada.');
}
