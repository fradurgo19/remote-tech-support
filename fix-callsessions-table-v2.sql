-- ================================================
-- SCRIPT PARA CREAR/VERIFICAR TABLA CallSessions
-- VERSIÓN 2: Corregida para PostgreSQL (snake_case)
-- ================================================
-- Ejecutar en Supabase SQL Editor
-- ================================================

-- 1. Verificar si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'CallSessions'
);

-- 2. Crear tabla con nombres en snake_case (sin comillas)
CREATE TABLE IF NOT EXISTS "CallSessions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES "Tickets"(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  participant_ids UUID[] NOT NULL DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'initiated',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  recording_url TEXT,
  screen_share_enabled BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_callsessions_ticket_id ON "CallSessions"(ticket_id);
CREATE INDEX IF NOT EXISTS idx_callsessions_initiator_id ON "CallSessions"(initiator_id);
CREATE INDEX IF NOT EXISTS idx_callsessions_status ON "CallSessions"(status);
CREATE INDEX IF NOT EXISTS idx_callsessions_created_at ON "CallSessions"(created_at);

-- 4. Crear tipo ENUM para status (opcional, por ahora usamos VARCHAR)
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

-- 5. Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_callsessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS callsessions_updated_at_trigger ON "CallSessions";
CREATE TRIGGER callsessions_updated_at_trigger
    BEFORE UPDATE ON "CallSessions"
    FOR EACH ROW
    EXECUTE FUNCTION update_callsessions_updated_at();

-- 6. Verificar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'CallSessions'
ORDER BY ordinal_position;

-- 7. Verificar si hay datos
SELECT COUNT(*) as total_call_sessions FROM "CallSessions";

-- ================================================
-- RESULTADO ESPERADO:
-- ================================================
-- Columnas de la tabla CallSessions:
-- - id (uuid, primary key)
-- - ticket_id (uuid, not null)
-- - initiator_id (uuid, not null)
-- - participant_ids (uuid[], array)
-- - status (varchar)
-- - started_at (timestamp)
-- - ended_at (timestamp)
-- - duration (integer)
-- - recording_url (text)
-- - screen_share_enabled (boolean)
-- - metadata (jsonb)
-- - created_at (timestamp)
-- - updated_at (timestamp)
--
-- Total: 0 registros (tabla nueva)
-- ================================================

