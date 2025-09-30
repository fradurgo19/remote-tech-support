/**
 * Script para migrar contraseñas de texto plano a hash bcrypt
 *
 * IMPORTANTE:
 * - Ejecutar SOLO UNA VEZ antes de ir a producción
 * - Hacer backup de la base de datos antes de ejecutar
 * - Todos los usuarios tendrán la contraseña "admin123" hasheada
 *
 * Uso:
 * cd server
 * node migrate-passwords-to-hash.js
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

async function migratePasswords() {
  try {
    console.log('🔐 ===== MIGRACIÓN DE CONTRASEÑAS A HASH =====');
    console.log('');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    console.log('');

    // Obtener todos los usuarios
    const [users] = await sequelize.query(
      'SELECT id, name, email, password FROM users'
    );
    console.log(`📋 Encontrados ${users.length} usuarios`);
    console.log('');

    // Contraseña por defecto para todos
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    console.log('🔒 Hash generado para contraseña por defecto "admin123"');
    console.log(`   Hash: ${hashedPassword.substring(0, 30)}...`);
    console.log('');

    // Contador de actualizaciones
    let updated = 0;
    let alreadyHashed = 0;

    for (const user of users) {
      // Verificar si la contraseña ya está hasheada
      // Los hashes de bcrypt empiezan con $2a$, $2b$ o $2y$
      const isAlreadyHashed = user.password && user.password.startsWith('$2');

      if (isAlreadyHashed) {
        console.log(`⏭️  ${user.name} - Ya tiene contraseña hasheada`);
        alreadyHashed++;
      } else {
        console.log(`🔄 Actualizando: ${user.name} (${user.email})`);

        await sequelize.query('UPDATE users SET password = $1 WHERE id = $2', {
          bind: [hashedPassword, user.id],
        });

        console.log(`   ✅ Contraseña actualizada`);
        updated++;
      }
    }

    console.log('');
    console.log('📊 ===== RESUMEN =====');
    console.log(`   Total de usuarios: ${users.length}`);
    console.log(`   Actualizados: ${updated}`);
    console.log(`   Ya tenían hash: ${alreadyHashed}`);
    console.log('');

    // Verificación
    console.log('🧪 ===== VERIFICACIÓN =====');
    console.log('Probando que las contraseñas hasheadas funcionen...');
    console.log('');

    for (const user of users.slice(0, 3)) {
      // Probar solo los primeros 3
      const [updatedUser] = await sequelize.query(
        'SELECT password FROM users WHERE id = $1',
        {
          bind: [user.id],
        }
      );

      if (updatedUser && updatedUser[0]) {
        const isValid = await bcrypt.compare(
          defaultPassword,
          updatedUser[0].password
        );
        console.log(`   ${user.name}: ${isValid ? '✅ Válida' : '❌ Error'}`);
      }
    }

    console.log('');
    console.log('✅ ===== MIGRACIÓN COMPLETADA =====');
    console.log('');
    console.log('📝 IMPORTANTE:');
    console.log(
      '   - Todos los usuarios ahora tienen la contraseña: "admin123"'
    );
    console.log('   - Las contraseñas están hasheadas con bcrypt');
    console.log('   - Los usuarios pueden cambiar su contraseña desde la app');
    console.log('   - Ya NO puedes hacer login con contraseñas en texto plano');
    console.log('');
    console.log('⚠️  RECUERDA:');
    console.log('   - Hacer backup de la base de datos regularmente');
    console.log('   - Cambiar JWT_SECRET en producción');
    console.log('   - Pedir a los usuarios que cambien su contraseña');
    console.log('');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ ERROR en la migración:', error);
    console.error('');
    console.error('💡 Soluciones:');
    console.error('   1. Verifica que la base de datos esté corriendo');
    console.error('   2. Verifica las credenciales en .env');
    console.error('   3. Verifica que la tabla "users" exista');
    console.error('');
    process.exit(1);
  }
}

// Ejecutar migración
migratePasswords();
