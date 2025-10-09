-- ================================================
-- SCRIPT PARA CREAR TABLA CallSessions
-- VERSIÓN FINAL: camelCase (como otras tablas de Sequelize)
-- ================================================
-- Ejecutar en Supabase SQL Editor
-- ================================================

-- 1. Eliminar tabla si existe (para empezar limpio)
-- ADVERTENCIA: Esto eliminará datos existentes
DROP TABLE IF EXISTS "CallSessions" CASCADE;

-- 2. Crear tabla con nombres en camelCase (como Sequelize)
CREATE TABLE "CallSessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticketId" UUID NOT NULL,
  "initiatorId" UUID NOT NULL,
  "participantIds" UUID[] NOT NULL DEFAULT '{}',
  "status" VARCHAR(50) NOT NULL DEFAULT 'initiated',
  "startedAt" TIMESTAMP WITH TIME ZONE,
  "endedAt" TIMESTAMP WITH TIME ZONE,
  "duration" INTEGER,
  "recordingUrl" TEXT,
  "screenShareEnabled" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT "CallSessions_ticketId_fkey" FOREIGN KEY ("ticketId") 
    REFERENCES "Tickets"("id") ON DELETE CASCADE,
  CONSTRAINT "CallSessions_initiatorId_fkey" FOREIGN KEY ("initiatorId") 
    REFERENCES "Users"("id") ON DELETE CASCADE
);

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX "CallSessions_ticketId_idx" ON "CallSessions"("ticketId");
CREATE INDEX "CallSessions_initiatorId_idx" ON "CallSessions"("initiatorId");
CREATE INDEX "CallSessions_status_idx" ON "CallSessions"("status");
CREATE INDEX "CallSessions_createdAt_idx" ON "CallSessions"("createdAt");

-- 4. Crear trigger para actualizar updatedAt automáticamente
CREATE OR REPLACE FUNCTION update_callsessions_updatedat()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CallSessions_updatedAt_trigger"
    BEFORE UPDATE ON "CallSessions"
    FOR EACH ROW
    EXECUTE FUNCTION update_callsessions_updatedat();

-- 5. Verificar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'CallSessions'
ORDER BY ordinal_position;

-- 6. Verificar índices creados
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'CallSessions';

-- 7. Verificar foreign keys
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    a.attname AS column_name,
    confrelid::regclass AS foreign_table_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = '"CallSessions"'::regclass
AND c.contype = 'f';

-- 8. Verificar si hay datos
SELECT COUNT(*) as total_call_sessions FROM "CallSessions";

-- ================================================
-- RESULTADO ESPERADO:
-- ================================================
-- ✅ Tabla "CallSessions" creada
-- ✅ 4 índices creados
-- ✅ 1 trigger creado
-- ✅ 2 foreign keys creadas
-- ✅ 0 registros (tabla nueva)
-- ================================================

