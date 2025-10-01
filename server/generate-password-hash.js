/**
 * Script para generar hash de contraseña para Neon
 * Uso: node server/generate-password-hash.js
 */

const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const saltRounds = 10;
  
  console.log('\n🔐 Generando hash de contraseña para Neon...\n');
  
  const hash = await bcrypt.hash(password, saltRounds);
  
  console.log('Contraseña original:', password);
  console.log('Hash generado:', hash);
  console.log('\n✅ Usa este hash en el archivo neon-database-setup.sql\n');
  
  // Verificar que el hash funciona
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verificación:', isValid ? '✅ Hash válido' : '❌ Hash inválido');
}

generateHash().catch(console.error);

