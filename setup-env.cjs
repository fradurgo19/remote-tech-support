/**
 * Script para configurar archivos .env con credenciales de Supabase
 * Ejecutar: node setup-env.js
 */

const fs = require('fs');
const path = require('path');

// Configuración para el backend (server/.env)
const backendEnv = `# =====================================================
# SUPABASE CONFIGURATION
# =====================================================
SUPABASE_URL=https://hcmnxrffuvitjkndlojr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbW54cmZmdXZpdGprbmRsb2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjQxNjQsImV4cCI6MjA3NTM0MDE2NH0.mWuAxSuE_L5X0RZ_At7RYB1uMQaq7DKzlsituv2NeMk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbW54cmZmdXZpdGprbmRsb2pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc2NDE2NCwiZXhwIjoyMDc1MzQwMTY0fQ.UKNMq_xmBu3EUxn_CJCK22qfye3QVSHBaBtTvW0zh_E

# Database URL - Connection Pooling (puerto 6543 para mejor performance)
DATABASE_URL=postgresql://postgres.hcmnxrffuvitjkndlojr:C7HWoSu54jcdiW4v@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# Database URL Direct (puerto 5432 - solo si connection pooling da problemas)
DATABASE_URL_DIRECT=postgresql://postgres:C7HWoSu54jcdiW4v@db.hcmnxrffuvitjkndlojr.supabase.co:5432/postgres

# =====================================================
# SERVER CONFIGURATION
# =====================================================
PORT=3000
NODE_ENV=development

# =====================================================
# JWT CONFIGURATION
# =====================================================
JWT_SECRET=c014f67682ef5b37ec7b360b10bae0ad223032f92dab02a21c8fdc0ff9c382aca02543efd23e03aa33b0f36ae96d4bec27fffe024f3ad12cfa5f865308d2b0d3
JWT_EXPIRES_IN=7d

# =====================================================
# CORS CONFIGURATION
# =====================================================
CORS_ORIGIN=http://localhost:5173

# =====================================================
# EMAIL CONFIGURATION (Outlook/Office 365)
# =====================================================
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=analista.mantenimiento@partequipos.com
EMAIL_PASSWORD=tu-password-de-email-aqui
EMAIL_FROM=Soporte Técnico Partequipos <analista.mantenimiento@partequipos.com>

# =====================================================
# FRONTEND URL (para links en emails)
# =====================================================
FRONTEND_URL=http://localhost:5173

# =====================================================
# SUPABASE STORAGE BUCKETS
# =====================================================
SUPABASE_BUCKET_AVATARS=avatars
SUPABASE_BUCKET_MESSAGES=message-attachments
SUPABASE_BUCKET_REPORTS=report-attachments

# =====================================================
# RATE LIMITING
# =====================================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# =====================================================
# LOGGING
# =====================================================
LOG_LEVEL=info
`;

// Configuración para el frontend (.env)
const frontendEnv = `# =====================================================
# FRONTEND ENVIRONMENT VARIABLES - SUPABASE
# =====================================================

# Backend API URL (Railway en producción)
VITE_API_URL=http://localhost:3000

# Backend Socket.IO URL
VITE_SOCKET_URL=http://localhost:3000

# Supabase Configuration (solo para acceso público)
VITE_SUPABASE_URL=https://hcmnxrffuvitjkndlojr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbW54cmZmdXZpdGprbmRsb2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjQxNjQsImV4cCI6MjA3NTM0MDE2NH0.mWuAxSuE_L5X0RZ_At7RYB1uMQaq7DKzlsituv2NeMk
`;

// Escribir archivos
try {
  // Backend .env
  const backendPath = path.join(__dirname, 'server', '.env');
  fs.writeFileSync(backendPath, backendEnv, 'utf8');
  console.log('✅ Archivo server/.env creado exitosamente');

  // Frontend .env
  const frontendPath = path.join(__dirname, '.env');
  fs.writeFileSync(frontendPath, frontendEnv, 'utf8');
  console.log('✅ Archivo .env creado exitosamente');

  console.log('\n🎉 Archivos .env configurados correctamente!');
  console.log('\n📝 Próximos pasos:');
  console.log('1. Edita server/.env y agrega tu EMAIL_PASSWORD');
  console.log('2. Ejecuta: cd server && npm run init-supabase-buckets');
  console.log('3. Ejecuta: cd server && npm run dev (en una terminal)');
  console.log('4. Ejecuta: npm run dev (en otra terminal, desde la raíz)');
} catch (error) {
  console.error('❌ Error al crear archivos .env:', error.message);
  process.exit(1);
}

