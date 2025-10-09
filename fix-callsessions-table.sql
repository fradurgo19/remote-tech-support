-- ================================================
-- SCRIPT PARA CREAR/VERIFICAR TABLA CallSessions
-- ================================================
-- Ejecutar en Supabase SQL Editor
-- ================================================

-- 1. Verificar si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'CallSessions'
);

-- 2. Si NO existe, crear la tabla
CREATE TABLE IF NOT EXISTS "CallSessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticketId" UUID NOT NULL REFERENCES "Tickets"("id") ON DELETE CASCADE,
  "initiatorId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "participantIds" UUID[] NOT NULL DEFAULT '{}',
  "status" VARCHAR(50) NOT NULL DEFAULT 'initiated',
  "startedAt" TIMESTAMP WITH TIME ZONE,
  "endedAt" TIMESTAMP WITH TIME ZONE,
  "duration" INTEGER,
  "recordingUrl" TEXT,
  "screenShareEnabled" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS "CallSessions_ticketId_idx" ON "CallSessions"("ticketId");
CREATE INDEX IF NOT EXISTS "CallSessions_initiatorId_idx" ON "CallSessions"("initiatorId");
CREATE INDEX IF NOT EXISTS "CallSessions_status_idx" ON "CallSessions"("status");
CREATE INDEX IF NOT EXISTS "CallSessions_createdAt_idx" ON "CallSessions"("createdAt");

-- 4. Crear tipo ENUM para status (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'callsession_status') THEN
        CREATE TYPE callsession_status AS ENUM (
            'initiated',
            'ringing',
            'active',
            'ended',
            'missed',
            'declined'
        );
    END IF;
END $$;

-- 5. Actualizar columna status para usar el ENUM (si la tabla ya existía)
-- ADVERTENCIA: Solo ejecutar si la tabla ya existía con VARCHAR
-- ALTER TABLE "CallSessions" 
-- ALTER COLUMN "status" TYPE callsession_status USING "status"::callsession_status;

-- 6. Crear trigger para actualizar updatedAt automáticamente
CREATE OR REPLACE FUNCTION update_callsessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "CallSessions_updated_at" ON "CallSessions";
CREATE TRIGGER "CallSessions_updated_at"
    BEFORE UPDATE ON "CallSessions"
    FOR EACH ROW
    EXECUTE FUNCTION update_callsessions_updated_at();

-- 7. Verificar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'CallSessions'
ORDER BY ordinal_position;

-- 8. Verificar si hay datos
SELECT COUNT(*) as total_call_sessions FROM "CallSessions";

-- ================================================
-- INSTRUCCIONES DE USO:
-- ================================================
-- 1. Copia TODO este script
-- 2. Ve a Supabase > SQL Editor > New Query
-- 3. Pega el script completo
-- 4. Ejecuta (Run)
-- 5. Revisa los resultados:
--    - Primera consulta: debe devolver 'true' si la tabla existe
--    - Última consulta: muestra cuántas sesiones de llamada hay
-- ================================================

