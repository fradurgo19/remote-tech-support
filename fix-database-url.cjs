/**
 * Script para arreglar el DATABASE_URL en server/.env
 * El problema es que Supabase necesita un formato específico
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'server', '.env');

// Leer el archivo actual
let envContent = fs.readFileSync(envPath, 'utf8');

// La URL correcta para Supabase con connection pooling
const correctUrl = 'postgresql://postgres.hcmnxrffuvitjkndlojr:C7HWoSu54jcdiW4v@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

// La URL directa (sin pooling) como backup
const directUrl = 'postgresql://postgres:C7HWoSu54jcdiW4v@db.hcmnxrffuvitjkndlojr.supabase.co:5432/postgres';

console.log('🔧 Arreglando DATABASE_URL...\n');

// Reemplazar la línea DATABASE_URL
envContent = envContent.replace(
  /DATABASE_URL=.*/,
  `DATABASE_URL=${directUrl}`
);

// Escribir el archivo corregido
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ DATABASE_URL corregido!');
console.log(`\n📝 URL configurada (Direct Connection):\n${directUrl}\n`);
console.log('💡 Si el error persiste, verifica en Supabase Dashboard:');
console.log('   Settings → Database → Connection String → URI (Direct connection)\n');

