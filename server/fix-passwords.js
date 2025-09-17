const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');

async function fixPasswords() {
  try {
    console.log('=== ARREGLANDO CONTRASEÑAS CON SQL DIRECTO ===');
    
    // Crear hash de admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Hash generado:', hashedPassword.substring(0, 20) + '...');
    
    // Actualizar todas las contraseñas usando SQL directo
    const [results] = await sequelize.query(`
      UPDATE "Users" 
      SET password = :hashedPassword, "updatedAt" = NOW()
      WHERE id IS NOT NULL
    `, {
      replacements: { hashedPassword }
    });
    
    console.log(`✅ Actualizadas ${results[1]} contraseñas`);
    
    // Verificar que funcionó
    const [users] = await sequelize.query(`
      SELECT id, name, email, password 
      FROM "Users" 
      ORDER BY name
    `);
    
    console.log('\n=== VERIFICACIÓN ===');
    for (const user of users) {
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log(`${user.name}: contraseña 'admin123' válida = ${isValid}`);
    }
    
    console.log('\n✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPasswords();
