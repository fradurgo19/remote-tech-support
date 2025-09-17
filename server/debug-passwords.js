const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');

async function debugPasswords() {
  try {
    console.log('=== DEBUGGING CONTRASEÑAS ===');
    
    // Verificar contraseñas actuales
    const [users] = await sequelize.query(`
      SELECT id, name, email, password 
      FROM "Users" 
      ORDER BY name
    `);
    
    console.log(`\nUsuarios encontrados: ${users.length}`);
    
    for (const user of users) {
      console.log(`\n--- ${user.name} (${user.email}) ---`);
      console.log(`Hash actual: ${user.password.substring(0, 30)}...`);
      
      // Probar admin123
      const isValidAdmin = await bcrypt.compare('admin123', user.password);
      console.log(`admin123 válida: ${isValidAdmin}`);
      
      // Crear nuevo hash de admin123
      const newHash = await bcrypt.hash('admin123', 10);
      console.log(`Nuevo hash: ${newHash.substring(0, 30)}...`);
      
      // Verificar que el nuevo hash funciona
      const isValidNew = await bcrypt.compare('admin123', newHash);
      console.log(`Nuevo hash válido: ${isValidNew}`);
    }
    
    // Actualizar con SQL directo
    console.log('\n=== ACTUALIZANDO CONTRASEÑAS ===');
    const newHash = await bcrypt.hash('admin123', 10);
    
    const [result] = await sequelize.query(`
      UPDATE "Users" 
      SET password = :newHash, "updatedAt" = NOW()
      WHERE id IS NOT NULL
    `, {
      replacements: { newHash }
    });
    
    console.log(`✅ Actualizadas ${result[1]} contraseñas`);
    
    // Verificar después de la actualización
    console.log('\n=== VERIFICACIÓN POST-ACTUALIZACIÓN ===');
    const [updatedUsers] = await sequelize.query(`
      SELECT id, name, email, password 
      FROM "Users" 
      ORDER BY name
    `);
    
    for (const user of updatedUsers) {
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log(`${user.name}: admin123 válida = ${isValid}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugPasswords();
