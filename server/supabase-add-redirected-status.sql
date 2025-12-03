-- =====================================================
-- AGREGAR ESTADO 'REDIRECTED' AL ENUM DE TICKETS
-- =====================================================
-- Este script agrega el estado 'redirected' al enum ticket_status
-- y verifica que la columna technicalObservations exista
-- =====================================================

-- 1. Agregar 'redirected' al enum ticket_status
DO $$ 
BEGIN
    -- Verificar si el valor 'redirected' ya existe
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'ticket_status' 
        AND e.enumlabel = 'redirected'
    ) THEN
        -- Agregar el nuevo valor al enum
        ALTER TYPE ticket_status ADD VALUE 'redirected' AFTER 'in_progress';
        RAISE NOTICE '✅ Estado "redirected" agregado al enum ticket_status';
    ELSE
        RAISE NOTICE 'ℹ️  Estado "redirected" ya existe en el enum ticket_status';
    END IF;
END $$;

-- 2. Verificar/Agregar columna technicalObservations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Tickets' 
        AND column_name = 'technicalObservations'
    ) THEN
        ALTER TABLE "Tickets" ADD COLUMN "technicalObservations" TEXT;
        RAISE NOTICE '✅ Columna "technicalObservations" agregada a la tabla Tickets';
    ELSE
        RAISE NOTICE 'ℹ️  Columna "technicalObservations" ya existe en la tabla Tickets';
    END IF;
END $$;

-- 3. Verificación final
DO $$
DECLARE
    enum_values TEXT;
    has_observations BOOLEAN;
BEGIN
    -- Obtener todos los valores del enum
    SELECT string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder)
    INTO enum_values
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ticket_status';
    
    -- Verificar si existe la columna
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Tickets' 
        AND column_name = 'technicalObservations'
    ) INTO has_observations;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ VERIFICACIÓN COMPLETADA';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Estados disponibles en ticket_status:';
    RAISE NOTICE '   %', enum_values;
    RAISE NOTICE '';
    RAISE NOTICE '📝 Columna technicalObservations: %', 
        CASE WHEN has_observations THEN '✅ Existe' ELSE '❌ No existe' END;
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

-- 4. Mostrar estructura actual de la tabla Tickets
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Tickets'
ORDER BY ordinal_position;

