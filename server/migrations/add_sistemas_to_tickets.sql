-- =====================================================
-- Campo SISTEMA en Tickets (sistemas que comprometen la falla)
-- Permite selección múltiple; se almacena como TEXT (JSON array).
-- Ejemplo: '["Motor (Pistones...)","Frenos"]'
-- =====================================================
-- Ejecutar en PostgreSQL o Supabase SQL Editor.
-- =====================================================

-- Añadir columna sistemas como TEXT (la app serializa array a JSON)
ALTER TABLE "Tickets"
  ADD COLUMN IF NOT EXISTS "sistemas" TEXT;

-- Si la columna existe como TEXT[] y quieres pasarla a TEXT (opcional):
-- ALTER TABLE "Tickets" ALTER COLUMN "sistemas" TYPE TEXT USING (
--   CASE WHEN "sistemas" IS NULL THEN NULL
--   WHEN array_length("sistemas", 1) IS NULL THEN NULL
--   ELSE (SELECT array_to_string("sistemas", ',')) END
-- );
-- (Ajustar según necesidad; si ya es TEXT, no ejecutar lo anterior.)

COMMENT ON COLUMN "Tickets"."sistemas" IS 'Sistemas del equipo que comprometen la falla (JSON array de strings)';
