-- =====================================================
-- AGREGAR COLUMNAS FALTANTES A SUPABASE
-- =====================================================
-- Este script agrega las columnas que existen en desarrollo local
-- pero no están en el script inicial de Supabase
-- =====================================================

-- 1. Agregar columnas faltantes a la tabla Users
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "department" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(100) DEFAULT 'America/Bogota',
ADD COLUMN IF NOT EXISTS "language" VARCHAR(10) DEFAULT 'es';

-- 2. Agregar columnas faltantes a la tabla Tickets
ALTER TABLE "Tickets"
ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "estimatedTime" INTEGER,
ADD COLUMN IF NOT EXISTS "actualTime" INTEGER,
ADD COLUMN IF NOT EXISTS "tags" TEXT[];

-- 3. Agregar el valor 'cancelled' al enum de status de Tickets
-- Primero verificar si existe
DO $$
BEGIN
    -- Agregar 'cancelled' al tipo ticket_status si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'cancelled' 
        AND enumtypid = 'ticket_status'::regtype
    ) THEN
        ALTER TYPE ticket_status ADD VALUE 'cancelled';
    END IF;
END
$$;

-- 4. Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_at ON "Tickets"("assignedAt");
CREATE INDEX IF NOT EXISTS idx_tickets_resolved_at ON "Tickets"("resolvedAt");
CREATE INDEX IF NOT EXISTS idx_tickets_closed_at ON "Tickets"("closedAt");
CREATE INDEX IF NOT EXISTS idx_tickets_tags ON "Tickets" USING GIN("tags");

-- 5. Comentarios para documentación
COMMENT ON COLUMN "Users"."department" IS 'Departamento del usuario';
COMMENT ON COLUMN "Users"."timezone" IS 'Zona horaria del usuario';
COMMENT ON COLUMN "Users"."language" IS 'Idioma preferido del usuario';

COMMENT ON COLUMN "Tickets"."assignedAt" IS 'Fecha y hora en que se asignó el ticket';
COMMENT ON COLUMN "Tickets"."resolvedAt" IS 'Fecha y hora en que se resolvió el ticket';
COMMENT ON COLUMN "Tickets"."closedAt" IS 'Fecha y hora en que se cerró el ticket';
COMMENT ON COLUMN "Tickets"."estimatedTime" IS 'Tiempo estimado en minutos';
COMMENT ON COLUMN "Tickets"."actualTime" IS 'Tiempo real en minutos';
COMMENT ON COLUMN "Tickets"."tags" IS 'Etiquetas del ticket';

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Columnas agregadas exitosamente';
    RAISE NOTICE '📝 Columnas agregadas a Users: department, timezone, language';
    RAISE NOTICE '📝 Columnas agregadas a Tickets: assignedAt, resolvedAt, closedAt, estimatedTime, actualTime, tags';
    RAISE NOTICE '📝 Valor "cancelled" agregado al enum ticket_status';
END $$;

