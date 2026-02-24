-- =====================================================
-- Campo SISTEMA en Tickets (sistemas que comprometen la falla)
-- Permite selección múltiple; se almacena como ARRAY de TEXT.
-- =====================================================
-- Ejecutar en PostgreSQL o Supabase SQL Editor.
-- =====================================================

-- Añadir columna sistemas (array de texto, nullable, default vacío)
ALTER TABLE "Tickets"
  ADD COLUMN IF NOT EXISTS "sistemas" TEXT[] DEFAULT '{}';

-- Comentario para documentación
COMMENT ON COLUMN "Tickets"."sistemas" IS 'Sistemas del equipo que comprometen la falla (selección múltiple por el técnico)';
