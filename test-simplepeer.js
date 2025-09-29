// Script para probar SimplePeer
// Ejecutar en la consola del navegador

console.log('=== TESTING SIMPLEPEER ===');

// 1. Verificar si SimplePeer está disponible
try {
  // Intentar importar SimplePeer
  console.log('1. Verificando SimplePeer...');

  // Verificar si está en window
  if (window.SimplePeer) {
    console.log('✅ SimplePeer encontrado en window');
    console.log('SimplePeer:', window.SimplePeer);
  } else {
    console.log('❌ SimplePeer no encontrado en window');
  }

  // Verificar si está en node_modules
  console.log('2. Verificando importación...');

  // Crear un peer de prueba
  console.log('3. Creando peer de prueba...');

  // Simular configuración básica
  const testConfig = {
    initiator: true,
    trickle: false,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    },
  };

  console.log('Configuración de prueba:', testConfig);

  // Verificar si podemos crear un peer
  try {
    // Esto fallará si SimplePeer no está disponible
    const testPeer = new window.SimplePeer(testConfig);
    console.log('✅ Peer creado exitosamente:', testPeer);

    // Limpiar
    testPeer.destroy();
    console.log('✅ Peer destruido exitosamente');
  } catch (error) {
    console.log('❌ Error creando peer:', error);
    console.log('Error details:', error.message);
    console.log('Error stack:', error.stack);
  }
} catch (error) {
  console.log('❌ Error general:', error);
}

// 4. Verificar dependencias
console.log('\n4. VERIFICANDO DEPENDENCIAS:');
console.log('WebRTC disponible:', !!navigator.mediaDevices);
console.log('getUserMedia disponible:', !!navigator.mediaDevices?.getUserMedia);
console.log('RTCPeerConnection disponible:', !!window.RTCPeerConnection);

// 5. Verificar si hay errores en la consola
console.log('\n5. VERIFICANDO ERRORES:');
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

// 6. Instrucciones
console.log('\n6. INSTRUCCIONES:');
console.log('Si SimplePeer no está disponible:');
console.log('  1. Verificar que esté instalado: npm list simple-peer');
console.log('  2. Reinstalar: npm install simple-peer');
console.log('  3. Verificar importación en el código');
console.log('');
console.log('Si hay errores de importación:');
console.log('  1. Verificar que el archivo esté en node_modules');
console.log('  2. Verificar que la importación sea correcta');
console.log('  3. Verificar que no haya conflictos de versiones');
