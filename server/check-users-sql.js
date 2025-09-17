const { sequelize } = require('./src/config/database');

async function checkUsers() {
  try {
    console.log('=== VERIFICANDO USUARIOS ===');
    
    const [results] = await sequelize.query(`
      SELECT id, name, email, role, 
             SUBSTRING(password, 1, 20) as password_start
      FROM "Users" 
      ORDER BY name
    `);
    
    console.log(`Total de usuarios: ${results.length}`);
    
    results.forEach(user => {
      console.log(`\n--- Usuario: ${user.name} ---`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password hash: ${user.password_start}...`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
