/**
 * Script para probar diferentes URLs de conexión a Supabase
 */

const { Client } = require('pg');

const password = 'C7HWoSu54jcdiW4v';
const projectRef = 'hcmnxrffuvitjkndlojr';

// Diferentes URLs para probar
const urls = [
  {
    name: 'Connection Pooling (Session Mode)',
    url: `postgresql://postgres.${projectRef}:${password}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`
  },
  {
    name: 'Connection Pooling (Transaction Mode)',
    url: `postgresql://postgres.${projectRef}:${password}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`
  },
  {
    name: 'Direct Connection (IPv4 preferida)',
    url: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`
  }
];

async function testConnection(name, url) {
  console.log(`\n🔍 Probando: ${name}`);
  console.log(`URL: ${url.replace(password, '***')}`);
  
  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✅ ÉXITO! Conexión establecida.`);
    console.log(`   Hora del servidor: ${result.rows[0].now}`);
    await client.end();
    return { success: true, url };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, url, error: error.message };
  }
}

async function main() {
  console.log('🚀 Probando conexiones a Supabase...\n');
  console.log('═'.repeat(60));
  
  const results = [];
  
  for (const config of urls) {
    const result = await testConnection(config.name, config.url);
    results.push({ ...config, ...result });
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 RESUMEN:\n');
  
  const working = results.filter(r => r.success);
  
  if (working.length > 0) {
    console.log('✅ Conexiones exitosas:\n');
    working.forEach(r => {
      console.log(`   - ${r.name}`);
    });
    
    console.log('\n💡 Usa esta URL en tu archivo server/.env:\n');
    console.log(`DATABASE_URL=${working[0].url}\n`);
  } else {
    console.log('❌ Ninguna conexión funcionó.');
    console.log('\n🔍 Verifica:');
    console.log('   1. Que el proyecto de Supabase esté activo');
    console.log('   2. Que la contraseña sea correcta');
    console.log('   3. Que tu IP no esté bloqueada (Network Restrictions en Supabase)');
  }
}

main().catch(console.error);

