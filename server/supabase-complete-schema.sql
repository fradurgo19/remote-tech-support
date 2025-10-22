-- =====================================================
-- SUPABASE SCHEMA COMPLETO - TODAS LAS COLUMNAS
-- =====================================================
-- Este script agrega TODAS las columnas necesarias para que
-- el código funcione exactamente como en desarrollo local
-- =====================================================

-- 1. AGREGAR COLUMNA STATUS A USERS
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('online', 'away', 'busy', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "status" user_status DEFAULT 'offline';

-- 2. AGREGAR COLUMNAS EXTRAS A USERS
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "department" VARCHAR(255);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(100) DEFAULT 'America/Bogota';
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "language" VARCHAR(10) DEFAULT 'es';

-- 3. AGREGAR COLUMNAS EXTRAS A TICKETS
ALTER TABLE "Tickets" ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "Tickets" ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "Tickets" ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "Tickets" ADD COLUMN IF NOT EXISTS "estimatedTime" INTEGER;
ALTER TABLE "Tickets" ADD COLUMN IF NOT EXISTS "actualTime" INTEGER;
ALTER TABLE "Tickets" ADD COLUMN IF NOT EXISTS "tags" TEXT[];

-- Agregar 'cancelled' al enum de status de Tickets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'cancelled' 
        AND enumtypid = 'ticket_status'::regtype
    ) THEN
        ALTER TYPE ticket_status ADD VALUE 'cancelled';
    END IF;
END $$;

-- 4. AGREGAR COLUMNAS EXTRAS A REPORTS
DO $$ BEGIN
    CREATE TYPE report_type AS ENUM ('bug', 'feature', 'technical', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Reports" ADD COLUMN IF NOT EXISTS "type" report_type DEFAULT 'technical';
ALTER TABLE "Reports" ADD COLUMN IF NOT EXISTS "priority" report_priority DEFAULT 'medium';
ALTER TABLE "Reports" ADD COLUMN IF NOT EXISTS "authorId" UUID;
ALTER TABLE "Reports" ADD COLUMN IF NOT EXISTS "reviewedById" UUID;
ALTER TABLE "Reports" ADD COLUMN IF NOT EXISTS "ticketId" UUID;
ALTER TABLE "Reports" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "Reports" ADD COLUMN IF NOT EXISTS "tags" TEXT[];

-- 5. AGREGAR FOREIGN KEYS A REPORTS (si no existen)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_reports_author'
    ) THEN
        ALTER TABLE "Reports" ADD CONSTRAINT "fk_reports_author" 
            FOREIGN KEY ("authorId") REFERENCES "Users"(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_reports_reviewer'
    ) THEN
        ALTER TABLE "Reports" ADD CONSTRAINT "fk_reports_reviewer" 
            FOREIGN KEY ("reviewedById") REFERENCES "Users"(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_reports_ticket'
    ) THEN
        ALTER TABLE "Reports" ADD CONSTRAINT "fk_reports_ticket" 
            FOREIGN KEY ("ticketId") REFERENCES "Tickets"(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. CREAR ÍNDICES ADICIONALES
CREATE INDEX IF NOT EXISTS idx_users_status ON "Users"("status");
CREATE INDEX IF NOT EXISTS idx_users_department ON "Users"("department");
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_at ON "Tickets"("assignedAt");
CREATE INDEX IF NOT EXISTS idx_tickets_resolved_at ON "Tickets"("resolvedAt");
CREATE INDEX IF NOT EXISTS idx_tickets_closed_at ON "Tickets"("closedAt");
CREATE INDEX IF NOT EXISTS idx_tickets_tags ON "Tickets" USING GIN("tags");
CREATE INDEX IF NOT EXISTS idx_reports_author ON "Reports"("authorId");
CREATE INDEX IF NOT EXISTS idx_reports_reviewer ON "Reports"("reviewedById");
CREATE INDEX IF NOT EXISTS idx_reports_ticket ON "Reports"("ticketId");
CREATE INDEX IF NOT EXISTS idx_reports_type ON "Reports"("type");
CREATE INDEX IF NOT EXISTS idx_reports_priority ON "Reports"("priority");
CREATE INDEX IF NOT EXISTS idx_reports_tags ON "Reports" USING GIN("tags");

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '✅ Schema completo actualizado exitosamente';
    RAISE NOTICE '📝 Todas las columnas agregadas correctamente';
    RAISE NOTICE '🔗 Foreign keys configuradas';
    RAISE NOTICE '⚡ Índices creados para mejor performance';
END $$;

