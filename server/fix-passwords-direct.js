const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function fixPasswordsDirect() {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'remote_support',
    password: 'postgres',
    port: 5432,
  });

  try {
    console.log('=== ARREGLANDO CONTRASEÑAS CON SQL DIRECTO ===');
    
    // Crear hash de admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Hash generado:', hashedPassword.substring(0, 20) + '...');
    
    // Actualizar todas las contraseñas usando SQL directo
    const result = await pool.query(`
      UPDATE "Users" 
      SET password = $1, "updatedAt" = NOW()
      WHERE id IS NOT NULL
    `, [hashedPassword]);
    
    console.log(`✅ Actualizadas ${result.rowCount} contraseñas`);
    
    // Verificar que funcionó
    const users = await pool.query(`
      SELECT id, name, email, password 
      FROM "Users" 
      ORDER BY name
    `);
    
    console.log('\n=== VERIFICACIÓN ===');
    for (const user of users.rows) {
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log(`${user.name}: contraseña 'admin123' válida = ${isValid}`);
    }
    
    console.log('\n✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixPasswordsDirect();
