// Script para probar WebRTC nativo
// Ejecutar en la consola del navegador

console.log('=== TESTING WEBRTC NATIVE ===');

// 1. Verificar WebRTC nativo
console.log('\n1. VERIFICANDO WEBRTC NATIVO:');
console.log('RTCPeerConnection disponible:', !!window.RTCPeerConnection);
console.log('MediaDevices disponible:', !!navigator.mediaDevices);
console.log('getUserMedia disponible:', !!navigator.mediaDevices?.getUserMedia);
console.log(
  'getDisplayMedia disponible:',
  !!navigator.mediaDevices?.getDisplayMedia
);

// 2. Verificar configuración ICE
console.log('\n2. VERIFICANDO CONFIGURACIÓN ICE:');
const testConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
console.log('Configuración ICE:', testConfig);

// 3. Crear peer connection de prueba
console.log('\n3. CREANDO PEER CONNECTION DE PRUEBA:');
try {
  const peerConnection = new RTCPeerConnection(testConfig);
  console.log('✅ Peer connection creado exitosamente:', peerConnection);

  // Verificar eventos
  peerConnection.onicecandidate = event => {
    console.log('ICE candidate:', event.candidate);
  };

  peerConnection.ontrack = event => {
    console.log('Track recibido:', event);
  };

  peerConnection.onconnectionstatechange = () => {
    console.log('Estado de conexión:', peerConnection.connectionState);
  };

  // Limpiar
  peerConnection.close();
  console.log('✅ Peer connection cerrado exitosamente');
} catch (error) {
  console.log('❌ Error creando peer connection:', error);
}

// 4. Verificar permisos de medios
console.log('\n4. VERIFICANDO PERMISOS DE MEDIOS:');
if (navigator.permissions) {
  navigator.permissions.query({ name: 'camera' }).then(result => {
    console.log('Permiso de cámara:', result.state);
  });

  navigator.permissions.query({ name: 'microphone' }).then(result => {
    console.log('Permiso de micrófono:', result.state);
  });
} else {
  console.log('API de permisos no disponible');
}

// 5. Verificar dispositivos
console.log('\n5. VERIFICANDO DISPOSITIVOS:');
navigator.mediaDevices
  .enumerateDevices()
  .then(devices => {
    console.log('Dispositivos encontrados:', devices.length);
    devices.forEach(device => {
      console.log(`- ${device.kind}: ${device.label || device.deviceId}`);
    });
  })
  .catch(error => {
    console.log('Error enumerando dispositivos:', error);
  });

// 6. Función para probar getUserMedia
window.testGetUserMedia = async function () {
  console.log('\n6. PROBANDO getUserMedia:');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    console.log('✅ Stream obtenido:', {
      id: stream.id,
      videoTracks: stream.getVideoTracks().length,
      audioTracks: stream.getAudioTracks().length,
    });

    // Detener stream
    stream.getTracks().forEach(track => track.stop());
    console.log('✅ Stream detenido');
  } catch (error) {
    console.log('❌ Error obteniendo stream:', error);
  }
};

// 7. Función para probar createOffer
window.testCreateOffer = async function () {
  console.log('\n7. PROBANDO createOffer:');
  try {
    const peerConnection = new RTCPeerConnection(testConfig);
    const offer = await peerConnection.createOffer();
    console.log('✅ Offer creado:', offer);
    peerConnection.close();
  } catch (error) {
    console.log('❌ Error creando offer:', error);
  }
};

// 8. Instrucciones
console.log('\n8. INSTRUCCIONES:');
console.log('Para probar getUserMedia:');
console.log('  testGetUserMedia()');
console.log('');
console.log('Para probar createOffer:');
console.log('  testCreateOffer()');
console.log('');
console.log('Para probar videollamada:');
console.log('  1. Refrescar la página');
console.log('  2. Iniciar videollamada');
console.log('  3. Verificar logs en consola');

// 9. Verificar si hay errores
console.log('\n9. VERIFICANDO ERRORES:');
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
