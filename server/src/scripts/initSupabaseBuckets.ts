/**
 * Script para inicializar los buckets de Supabase Storage
 * Ejecutar una vez después de configurar Supabase
 */

import { initializeStorageBuckets } from '../config/supabase';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function main() {
  console.log('🚀 Inicializando buckets de Supabase Storage...\n');

  try {
    await initializeStorageBuckets();
    console.log('\n✅ Buckets de Supabase inicializados correctamente');
    console.log('\n📝 Buckets creados:');
    console.log('   - avatars (Para avatares de usuarios)');
    console.log('   - message-attachments (Para archivos de mensajes)');
    console.log('   - report-attachments (Para archivos de reportes)');
    console.log('\n⚠️  IMPORTANTE: Configura las políticas de seguridad (RLS) en Supabase Dashboard');
  } catch (error) {
    console.error('❌ Error al inicializar buckets:', error);
    process.exit(1);
  }
}

main();

