// Script para probar el manejo de cámara compartida
console.log('🔍 === PROBANDO CÁMARA COMPARTIDA ===');

// Función para verificar el estado de la cámara
function checkCameraStatus() {
  console.log('📷 Verificando estado de la cámara...');

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(stream => {
      console.log('✅ Cámara disponible');
      console.log('   - Video tracks:', stream.getVideoTracks().length);
      console.log('   - Audio tracks:', stream.getAudioTracks().length);

      // Detener el stream de prueba
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Stream de prueba detenido');
    })
    .catch(error => {
      console.log('❌ Cámara no disponible:', error.name);
      console.log('   - Error:', error.message);

      if (error.name === 'NotReadableError') {
        console.log('💡 La cámara está siendo usada por otro proceso');
        console.log('💡 Juan Técnico puede aceptar la llamada sin cámara');
      }
    });
}

// Función para probar solo audio
function testAudioOnly() {
  console.log('🎤 Probando solo audio...');

  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then(stream => {
      console.log('✅ Audio disponible');
      console.log('   - Audio tracks:', stream.getAudioTracks().length);

      // Detener el stream de prueba
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Stream de audio detenido');
    })
    .catch(error => {
      console.log('❌ Audio no disponible:', error.name);
      console.log('   - Error:', error.message);
    });
}

// Función para crear stream vacío
function testEmptyStream() {
  console.log('🔇 Probando stream vacío...');

  try {
    const emptyStream = new MediaStream();
    console.log('✅ Stream vacío creado');
    console.log('   - Tracks:', emptyStream.getTracks().length);
    return emptyStream;
  } catch (error) {
    console.log('❌ Error creando stream vacío:', error);
    return null;
  }
}

// Ejecutar todas las pruebas
console.log('🚀 Ejecutando pruebas de cámara...');
checkCameraStatus();
testAudioOnly();
testEmptyStream();

console.log('💡 Ahora intenta aceptar la llamada en Juan Técnico');
console.log('📋 El sistema debería manejar automáticamente la falta de cámara');
