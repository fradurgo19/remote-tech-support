const bcrypt = require('bcryptjs');

async function resetPasswords() {
  try {
    // Importar después de que la base de datos esté configurada
    const { User } = require('./src/models');
    
    console.log('=== RESETEANDO CONTRASEÑAS ===');
    
    const users = await User.findAll();
    console.log(`Encontrados ${users.length} usuarios`);
    
    for (const user of users) {
      console.log(`\nReseteando contraseña para: ${user.name} (${user.email})`);
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await user.update({ password: hashedPassword });
      
      console.log(`✅ Contraseña actualizada para ${user.name}`);
    }
    
    console.log('\n=== VERIFICACIÓN ===');
    for (const user of users) {
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log(`${user.name}: contraseña 'admin123' válida = ${isValid}`);
    }
    
    console.log('\n✅ Todas las contraseñas han sido reseteadas a "admin123"');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPasswords();
