/**
 * Script de Prueba: Múltiples Cámaras
 * 
 * Para ejecutar este script en la consola del navegador:
 * 1. Abrir DevTools (F12)
 * 2. Ir a la pestaña "Console"
 * 3. Copiar y pegar todo este script
 * 4. Presionar Enter
 * 
 * El script verificará:
 * - Cámaras disponibles en el sistema
 * - Capacidad de activar múltiples cámaras
 * - Estado de las cámaras activas
 * - Permisos de dispositivos
 */

(async function testMultipleCameras() {
  console.log('🎥 ===== PRUEBA DE MÚLTIPLES CÁMARAS =====');
  console.log('');

  // 1. Verificar API de Media Devices
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error('❌ API de Media Devices no disponible');
    console.log('Tu navegador no soporta acceso a cámara y micrófono');
    return;
  }

  console.log('✅ API de Media Devices disponible');
  console.log('');

  // 2. Solicitar permisos iniciales
  console.log('📋 Solicitando permisos de cámara y micrófono...');
  try {
    const initialStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    console.log('✅ Permisos concedidos');
    
    // Detener el stream inicial
    initialStream.getTracks().forEach(track => track.stop());
  } catch (error) {
    console.error('❌ Error al solicitar permisos:', error);
    console.log('');
    console.log('💡 Solución:');
    console.log('1. Haz clic en el ícono de candado en la barra de direcciones');
    console.log('2. Permite el acceso a cámara y micrófono');
    console.log('3. Recarga la página y ejecuta este script nuevamente');
    return;
  }

  console.log('');

  // 3. Enumerar dispositivos disponibles
  console.log('📹 Enumerando dispositivos de video disponibles...');
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  const audioDevices = devices.filter(device => device.kind === 'audioinput');

  console.log(`✅ Encontradas ${videoDevices.length} cámara(s)`);
  console.log(`✅ Encontrados ${audioDevices.length} micrófono(s)`);
  console.log('');

  // Mostrar lista de dispositivos
  console.log('📋 Lista de Cámaras:');
  videoDevices.forEach((device, index) => {
    console.log(`  ${index + 1}. ${device.label}`);
    console.log(`     ID: ${device.deviceId}`);
  });
  console.log('');

  console.log('📋 Lista de Micrófonos:');
  audioDevices.forEach((device, index) => {
    console.log(`  ${index + 1}. ${device.label}`);
    console.log(`     ID: ${device.deviceId}`);
  });
  console.log('');

  // 4. Probar activación de múltiples cámaras
  if (videoDevices.length < 2) {
    console.log('⚠️  Solo se detectó 1 cámara');
    console.log('   No se puede probar múltiples cámaras simultáneamente');
    console.log('');
    console.log('💡 Para probar múltiples cámaras:');
    console.log('   - Conecta una cámara USB externa');
    console.log('   - O usa un dispositivo con cámara frontal y trasera');
    console.log('');
  } else {
    console.log(`🎬 Probando activación de ${videoDevices.length} cámaras simultáneamente...`);
    console.log('');

    const streams = [];
    const streamInfo = [];

    for (let i = 0; i < Math.min(videoDevices.length, 4); i++) {
      const device = videoDevices[i];
      console.log(`  Activando cámara ${i + 1}: ${device.label}...`);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: device.deviceId } },
          audio: false,
        });

        streams.push(stream);
        streamInfo.push({
          deviceId: device.deviceId,
          label: device.label,
          tracks: stream.getVideoTracks().length,
          active: stream.active,
        });

        console.log(`    ✅ Activada exitosamente`);
        console.log(`       Tracks: ${stream.getVideoTracks().length}`);
        console.log(`       Estado: ${stream.active ? 'Activo' : 'Inactivo'}`);
      } catch (error) {
        console.error(`    ❌ Error al activar: ${error.message}`);
        
        if (error.name === 'NotReadableError') {
          console.log('    💡 Cámara en uso por otra aplicación');
        } else if (error.name === 'NotFoundError') {
          console.log('    💡 Dispositivo no encontrado');
        }
      }

      console.log('');
    }

    // Resumen
    console.log('📊 Resumen de Cámaras Activas:');
    console.log(`   Total intentadas: ${Math.min(videoDevices.length, 4)}`);
    console.log(`   Activadas exitosamente: ${streams.length}`);
    console.log('');

    if (streams.length > 1) {
      console.log('✅ ¡Múltiples cámaras funcionando simultáneamente!');
    } else if (streams.length === 1) {
      console.log('⚠️  Solo se pudo activar 1 cámara');
      console.log('   Es posible que las otras estén en uso');
    } else {
      console.log('❌ No se pudo activar ninguna cámara');
    }

    console.log('');

    // Limpiar streams
    console.log('🧹 Limpiando streams de prueba...');
    streams.forEach((stream, index) => {
      stream.getTracks().forEach(track => track.stop());
      console.log(`   ✅ Stream ${index + 1} detenido`);
    });

    console.log('');
  }

  // 5. Verificar webRTCNativeService si está disponible
  console.log('🔍 Verificando servicio de WebRTC...');
  
  if (typeof window !== 'undefined' && (window as any).webRTCNativeService) {
    const service = (window as any).webRTCNativeService;
    console.log('✅ webRTCNativeService disponible en window');
    console.log('');

    console.log('📋 Métodos disponibles:');
    console.log('   - getLocalStream()');
    console.log('   - addCamera(deviceId)');
    console.log('   - removeCamera(deviceId)');
    console.log('   - toggleCamera(deviceId)');
    console.log('   - getActiveCameraStreams()');
    console.log('   - getActiveCameraIds()');
    console.log('   - getAvailableDevices()');
    console.log('');

    // Obtener cámaras activas
    try {
      const activeStreams = service.getActiveCameraStreams();
      const activeCameraIds = service.getActiveCameraIds();

      console.log(`📹 Cámaras activas actualmente: ${activeCameraIds.length}`);
      if (activeCameraIds.length > 0) {
        console.log('   IDs:', activeCameraIds);
      }
    } catch (error) {
      console.log('   (No se pudieron obtener cámaras activas)');
    }

    console.log('');
    console.log('💡 Prueba manual:');
    console.log('   Para agregar una cámara:');
    console.log(`   > const service = window.webRTCNativeService`);
    console.log(`   > const devices = await service.getAvailableDevices()`);
    console.log(`   > const camera = devices.find(d => d.kind === 'videoinput')`);
    console.log(`   > await service.addCamera(camera.deviceId)`);
    console.log('');
  } else {
    console.log('⚠️  webRTCNativeService no disponible en window');
    console.log('   El servicio solo está disponible dentro de componentes React');
    console.log('');
  }

  // 6. Información adicional
  console.log('📚 Información Adicional:');
  console.log('');
  console.log('🔧 Límites del Sistema:');
  console.log('   - Máximo recomendado: 4 cámaras simultáneas');
  console.log('   - Depende del hardware y navegador');
  console.log('   - Puede afectar el rendimiento');
  console.log('');

  console.log('🌐 Compatibilidad de Navegadores:');
  console.log('   - Chrome/Edge: ✅ Excelente');
  console.log('   - Firefox: ✅ Bueno');
  console.log('   - Safari: ⚠️  Limitado');
  console.log('');

  console.log('💡 Consejos:');
  console.log('   1. Cierra otras aplicaciones que usen cámaras');
  console.log('   2. Usa cámaras de buena calidad para mejor rendimiento');
  console.log('   3. Monitorea el uso de CPU al usar múltiples cámaras');
  console.log('   4. Considera reducir la resolución si hay lag');
  console.log('');

  console.log('✅ ===== PRUEBA COMPLETADA =====');
})();

/**
 * FUNCIONES AUXILIARES PARA TESTING MANUAL
 */

// Función para probar agregar una cámara específica
window.testAddCamera = async function(deviceId) {
  if (!(window as any).webRTCNativeService) {
    console.error('webRTCNativeService no disponible');
    return;
  }

  try {
    console.log(`Agregando cámara: ${deviceId}`);
    const stream = await (window as any).webRTCNativeService.addCamera(deviceId);
    console.log('✅ Cámara agregada exitosamente:', stream);
    return stream;
  } catch (error) {
    console.error('❌ Error al agregar cámara:', error);
  }
};

// Función para listar todas las cámaras disponibles
window.listCameras = async function() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    
    console.log(`📹 Cámaras disponibles (${videoDevices.length}):`);
    videoDevices.forEach((device, index) => {
      console.log(`  ${index + 1}. ${device.label}`);
      console.log(`     DeviceId: ${device.deviceId}`);
    });

    return videoDevices;
  } catch (error) {
    console.error('Error al listar cámaras:', error);
  }
};

console.log('');
console.log('📝 Funciones auxiliares disponibles:');
console.log('   - window.testAddCamera(deviceId)');
console.log('   - window.listCameras()');
console.log('');
