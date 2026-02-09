-- =====================================================
-- COLUMNAS PARA TICKETS PÚBLICOS (formulario sin login)
-- =====================================================
-- Ejecutar en Supabase SQL Editor para soportar el formulario
-- público de creación de tickets con los campos adicionales.
-- =====================================================

-- Nuevas columnas en "Tickets" (todas opcionales para no romper tickets existentes)
ALTER TABLE "Tickets" ADD COLUMN IF NOT EXISTS "nit" VARCHAR(100);
ALTER TABLE "Tickets" ADD COLUMN IF NOT EXISTS "asesorRepuestos" VARCHAR(255);
ALTER TABLE "Tickets" ADD COLUMN IF NOT EXISTS "tipoMaquina" VARCHAR(100);
ALTER TABLE "Tickets" ADD COLUMN IF NOT EXISTS "marca" VARCHAR(100);
ALTER TABLE "Tickets" ADD COLUMN IF NOT EXISTS "modeloEquipo" VARCHAR(255);

-- Índices opcionales para filtrar por tipo/marca en el futuro
CREATE INDEX IF NOT EXISTS idx_tickets_tipo_maquina ON "Tickets"("tipoMaquina");
CREATE INDEX IF NOT EXISTS idx_tickets_marca ON "Tickets"("marca");

-- La tabla "Users" ya tiene la columna "phone" (teléfono del cliente).
-- No es necesario agregar nada en Users para este flujo.
