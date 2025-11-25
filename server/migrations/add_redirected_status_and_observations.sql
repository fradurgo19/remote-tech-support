-- Migración para agregar el estado 'redirected' y el campo 'technicalObservations'
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar el nuevo valor al enum de status (si no existe)
DO $$ 
BEGIN
    -- Verificar si el valor 'redirected' ya existe en el enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'redirected' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_Tickets_status')
    ) THEN
        ALTER TYPE "enum_Tickets_status" ADD VALUE 'redirected';
    END IF;
END $$;

-- 2. Agregar la columna technicalObservations si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Tickets' AND column_name = 'technicalObservations'
    ) THEN
        ALTER TABLE "Tickets" ADD COLUMN "technicalObservations" TEXT;
    END IF;
END $$;

-- Verificar que los cambios se aplicaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Tickets' 
AND column_name IN ('status', 'technicalObservations');


