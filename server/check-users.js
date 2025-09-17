const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  try {
    console.log('=== VERIFICANDO USUARIOS ===');
    
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'password']
    });
    
    console.log(`Total de usuarios: ${users.length}`);
    
    for (const user of users) {
      console.log(`\n--- Usuario: ${user.name} ---`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password hash: ${user.password.substring(0, 20)}...`);
      
      // Probar contraseña admin123
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log(`Contraseña 'admin123' válida: ${isValid}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
