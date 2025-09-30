/**
 * Script de Prueba: Verificación de Hash de Contraseñas
 *
 * Este script verifica que las contraseñas estén correctamente hasheadas
 * y que el login funcione con bcrypt
 *
 * Uso:
 * cd server
 * node test-password-hash.js
 */

const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'remote_support',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
  }
);

async function testPasswordHash() {
  try {
    console.log('🧪 ===== PRUEBA DE HASH DE CONTRASEÑAS =====');
    console.log('');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    console.log('');

    // Obtener todos los usuarios
    const [users] = await sequelize.query(
      'SELECT id, name, email, password FROM "Users" ORDER BY name'
    );

    console.log(`📋 Encontrados ${users.length} usuarios`);
    console.log('');

    // Verificar formato de hash
    console.log('🔍 ===== VERIFICACIÓN DE FORMATO =====');
    console.log('');

    let hashedCount = 0;
    let plainTextCount = 0;

    for (const user of users) {
      const isHashed = user.password && user.password.startsWith('$2');

      if (isHashed) {
        console.log(`✅ ${user.name.padEnd(30)} - Hasheada`);
        console.log(`   Hash: ${user.password.substring(0, 35)}...`);
        hashedCount++;
      } else {
        console.log(`❌ ${user.name.padEnd(30)} - TEXTO PLANO ⚠️`);
        console.log(`   Value: ${user.password}`);
        plainTextCount++;
      }
      console.log('');
    }

    console.log('📊 Resumen:');
    console.log(`   Hasheadas: ${hashedCount}`);
    console.log(`   Texto plano: ${plainTextCount}`);
    console.log('');

    if (plainTextCount > 0) {
      console.log('⚠️  ADVERTENCIA: Hay contraseñas en texto plano!');
      console.log('   Ejecuta: npm run dev (resetea automáticamente)');
      console.log('   O ejecuta: node migrate-passwords-to-hash.js');
      console.log('');
    }

    // Probar verificación con bcrypt
    console.log('🔐 ===== PRUEBA DE VERIFICACIÓN =====');
    console.log('');

    const testPassword = 'admin123';
    console.log(`Probando contraseña: "${testPassword}"`);
    console.log('');

    for (const user of users.slice(0, 5)) {
      // Probar solo los primeros 5
      try {
        const isValid = await bcrypt.compare(testPassword, user.password);

        if (isValid) {
          console.log(`✅ ${user.name.padEnd(30)} - Login exitoso`);
        } else {
          console.log(`❌ ${user.name.padEnd(30)} - Login fallido`);
        }
      } catch (error) {
        console.log(`⚠️  ${user.name.padEnd(30)} - Error: ${error.message}`);
      }
    }

    console.log('');

    // Probar creación de nuevo hash
    console.log('🔨 ===== PRUEBA DE CREACIÓN DE HASH =====');
    console.log('');

    const testPasswords = ['password123', 'Test@123', 'admin456'];

    for (const pwd of testPasswords) {
      const hash = await bcrypt.hash(pwd, 10);
      const isValid = await bcrypt.compare(pwd, hash);

      console.log(`Password: "${pwd}"`);
      console.log(`Hash: ${hash.substring(0, 40)}...`);
      console.log(`Verificación: ${isValid ? '✅ Válida' : '❌ Inválida'}`);
      console.log('');
    }

    // Verificar tiempo de hash
    console.log('⏱️  ===== PRUEBA DE PERFORMANCE =====');
    console.log('');

    const start = Date.now();
    await bcrypt.hash('testPassword', 10);
    const duration = Date.now() - start;

    console.log(`Tiempo de hash (factor 10): ${duration}ms`);

    if (duration < 50) {
      console.log('✅ Excelente performance');
    } else if (duration < 150) {
      console.log('✅ Buena performance');
    } else {
      console.log('⚠️  Performance aceptable');
    }

    console.log('');

    // Resumen final
    console.log('✅ ===== PRUEBA COMPLETADA =====');
    console.log('');

    if (hashedCount === users.length) {
      console.log('🎉 ¡Todas las contraseñas están correctamente hasheadas!');
      console.log('');
      console.log('📝 Puedes hacer login con:');
      console.log('   Email: cualquier email de usuario');
      console.log('   Password: admin123');
      console.log('');
      console.log('✅ El sistema está listo para usar con seguridad');
    } else {
      console.log('⚠️  Algunas contraseñas no están hasheadas');
      console.log('   Reinicia el servidor para hashearlas automáticamente');
    }

    console.log('');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ ERROR en la prueba:', error);
    console.error('');
    process.exit(1);
  }
}

// Ejecutar prueba
testPasswordHash();
