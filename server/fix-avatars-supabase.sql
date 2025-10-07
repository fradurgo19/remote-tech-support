-- Actualizar avatares de usuarios en Supabase con URLs públicas de Cloudinary

-- Admin
UPDATE "Users" 
SET avatar = 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590236/Admin_sublte.png'
WHERE email = 'admin@partequipos.com';

-- Técnico
UPDATE "Users" 
SET avatar = 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590236/Soporte_hcfjxa.png'
WHERE email = 'auxiliar.garantiasbg@partequipos.com';

-- Cliente
UPDATE "Users" 
SET avatar = 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590235/Cliente_kgzuwh.jpg'
WHERE email = 'ana.garcia@empresa.com';

-- Verificar
SELECT id, name, email, role, avatar 
FROM "Users" 
ORDER BY role;

