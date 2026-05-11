-- Número de serie del equipo (texto libre).
-- Ejecutar en Supabase SQL Editor (producción) antes o después del deploy del backend.
ALTER TABLE "Tickets"
  ADD COLUMN IF NOT EXISTS "serial" VARCHAR(120);

COMMENT ON COLUMN "Tickets"."serial" IS 'Número de serie del equipo (S/N)';
