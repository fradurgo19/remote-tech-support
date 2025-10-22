import { emailService } from './src/services/email.service';

async function testEmailService() {
  console.log('🧪 Probando servicio de correo electrónico...\n');

  // Verificar configuración
  console.log('📧 Configuración SMTP:');
  console.log(`   Host: ${process.env.SMTP_HOST || 'No configurado'}`);
  console.log(`   Puerto: ${process.env.SMTP_PORT || 'No configurado'}`);
  console.log(`   Usuario: ${process.env.SMTP_USER || 'No configurado'}`);
  console.log(`   Contraseña: ${process.env.SMTP_PASS ? 'Configurada' : 'No configurada'}`);
  console.log(`   Email de soporte: ${process.env.SUPPORT_EMAIL || 'No configurado'}\n`);

  // Probar conexión
  console.log('🔗 Probando conexión SMTP...');
  try {
    const isConnected = await (emailService as any).verifyConnection();
    if (isConnected) {
      console.log('✅ Conexión SMTP exitosa\n');
    } else {
      console.log('❌ Error en conexión SMTP\n');
      return;
    }
  } catch (error) {
    console.log('❌ Error verificando conexión:', error);
    return;
  }

  // Probar envío de email
  const testEmail = process.env.SMTP_USER || 'test@example.com';
  console.log(`📤 Enviando email de prueba a: ${testEmail}`);
  
  try {
    const emailSent = await emailService.sendTestEmail(testEmail);
    if (emailSent) {
      console.log('✅ Email de prueba enviado exitosamente');
      console.log('📬 Revisa tu bandeja de entrada');
    } else {
      console.log('❌ Error enviando email de prueba');
    }
  } catch (error) {
    console.log('❌ Error enviando email:', error);
  }

  console.log('\n🏁 Prueba completada');
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  testEmailService()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error en prueba:', error);
      process.exit(1);
    });
}

export { testEmailService };
