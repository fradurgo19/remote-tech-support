/**
 * Prueba manual de login con las contraseñas actuales
 */

const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

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

async function testLogin() {
  try {
    console.log('🧪 PRUEBA DE LOGIN MANUAL\n');

    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // Listar todos los usuarios disponibles
    const [allUsers] = await sequelize.query('SELECT name, email FROM "Users"');
    console.log('📋 Usuarios disponibles:');
    allUsers.forEach(u => console.log(`   - ${u.name} (${u.email})`));
    console.log('');

    // Obtener el primer usuario para prueba
    const [users] = await sequelize.query(
      'SELECT * FROM "Users" LIMIT 1'
    );

    if (!users || users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      await sequelize.close();
      return;
    }

    const user = users[0];
    console.log('📋 Usuario encontrado:');
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password hash: ${user.password.substring(0, 40)}...`);
    console.log('');

    // Probar diferentes contraseñas
    const testPasswords = ['admin123', 'password', '123456', 'Test123'];

    console.log('🔐 Probando contraseñas:\n');

    for (const testPwd of testPasswords) {
      const isValid = await bcrypt.compare(testPwd, user.password);
      console.log(`   "${testPwd}": ${isValid ? '✅ VÁLIDA' : '❌ Inválida'}`);
    }

    console.log('');

    // Crear un nuevo hash para comparar
    console.log('🔨 Creando nuevo hash de "admin123":\n');
    
    const newHash = await bcrypt.hash('admin123', 10);
    console.log(`   Nuevo hash: ${newHash.substring(0, 40)}...`);
    console.log(`   Hash actual: ${user.password.substring(0, 40)}...`);
    console.log('');
    
    const testWithNewHash = await bcrypt.compare('admin123', newHash);
    console.log(`   Verificación con nuevo hash: ${testWithNewHash ? '✅' : '❌'}`);
    console.log('');

    // Actualizar manualmente el usuario con el nuevo hash
    console.log('💾 Actualizando usuario con nuevo hash...\n');
    
    await sequelize.query(
      'UPDATE "Users" SET password = $1 WHERE id = $2',
      { bind: [newHash, user.id] }
    );

    console.log('✅ Usuario actualizado');
    console.log('');

    // Verificar que ahora funcione
    const [updatedUsers] = await sequelize.query(
      'SELECT * FROM "Users" WHERE id = $1',
      { bind: [user.id] }
    );

    const updatedUser = updatedUsers[0];
    const finalTest = await bcrypt.compare('admin123', updatedUser.password);

    console.log('🧪 Prueba final después de actualización:');
    console.log(`   Login con "admin123": ${finalTest ? '✅ EXITOSO' : '❌ Fallido'}`);
    console.log('');

    if (finalTest) {
      console.log('🎉 ¡HASH DE CONTRASEÑAS FUNCIONANDO CORRECTAMENTE!');
      console.log('');
      console.log('📝 Ahora puedes:');
      console.log('   1. Hacer login en la app con:');
      console.log(`      Email: ${user.email}`);
      console.log('      Password: admin123');
      console.log('');
      console.log('   2. Para actualizar TODOS los usuarios:');
      console.log('      Reinicia el servidor (npm run dev)');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

testLogin();
