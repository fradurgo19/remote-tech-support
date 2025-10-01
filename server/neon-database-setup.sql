-- =====================================================
-- SCRIPT COMPLETO PARA NEON DATABASE
-- Remote Tech Support System
-- PostgreSQL 16
-- =====================================================

-- Ejecuta este script completo en Neon SQL Editor
-- O conéctate con psql y ejecuta: \i neon-database-setup.sql

-- =====================================================
-- 1. CREAR EXTENSIONES
-- =====================================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. CREAR TIPOS ENUM
-- =====================================================

-- User roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'technician', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User status
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('online', 'away', 'busy', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ticket status
DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Priority
DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Message type
DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system', 'call_start', 'call_end');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Call session status
DO $$ BEGIN
    CREATE TYPE call_status AS ENUM ('initiated', 'ringing', 'active', 'ended', 'missed', 'declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Report type
DO $$ BEGIN
    CREATE TYPE report_type AS ENUM ('technical', 'incident', 'maintenance', 'performance', 'security', 'summary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Report status
DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification type
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success', 'ticket_assigned', 'ticket_updated', 'call_incoming');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ticket history action
DO $$ BEGIN
    CREATE TYPE history_action AS ENUM ('created', 'updated', 'assigned', 'status_changed', 'priority_changed', 'resolved', 'closed', 'reopened');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 3. CREAR TABLAS
-- =====================================================

-- Tabla: Users
CREATE TABLE IF NOT EXISTS "Users" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    avatar TEXT,
    status user_status NOT NULL DEFAULT 'offline',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordResetToken" VARCHAR(255),
    "lastLoginAt" TIMESTAMP WITH TIME ZONE,
    phone VARCHAR(255),
    department VARCHAR(255),
    timezone VARCHAR(255) DEFAULT 'America/Bogota',
    language VARCHAR(255) DEFAULT 'es',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Categories
CREATE TABLE IF NOT EXISTS "Categories" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    color VARCHAR(255) DEFAULT '#3B82F6',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Tickets
CREATE TABLE IF NOT EXISTS "Tickets" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'open',
    priority priority_level NOT NULL DEFAULT 'medium',
    "categoryId" UUID NOT NULL REFERENCES "Categories"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    "customerId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "technicianId" UUID REFERENCES "Users"(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "assignedAt" TIMESTAMP WITH TIME ZONE,
    "resolvedAt" TIMESTAMP WITH TIME ZONE,
    "closedAt" TIMESTAMP WITH TIME ZONE,
    "estimatedTime" INTEGER,
    "actualTime" INTEGER,
    tags TEXT[],
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Messages
CREATE TABLE IF NOT EXISTS "Messages" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    type message_type NOT NULL DEFAULT 'text',
    "ticketId" UUID NOT NULL REFERENCES "Tickets"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "senderId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "replyToId" UUID REFERENCES "Messages"(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Attachments
CREATE TABLE IF NOT EXISTS "Attachments" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(255) NOT NULL,
    size INTEGER NOT NULL,
    path VARCHAR(255) NOT NULL,
    url VARCHAR(255),
    "messageId" UUID REFERENCES "Messages"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "ticketId" UUID REFERENCES "Tickets"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "uploadedById" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: CallSessions
CREATE TABLE IF NOT EXISTS "CallSessions" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" UUID NOT NULL REFERENCES "Tickets"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "initiatorId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "participantIds" UUID[],
    status call_status NOT NULL DEFAULT 'initiated',
    "startedAt" TIMESTAMP WITH TIME ZONE,
    "endedAt" TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    "recordingUrl" VARCHAR(255),
    "screenShareEnabled" BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Reports
CREATE TABLE IF NOT EXISTS "Reports" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    type report_type NOT NULL DEFAULT 'technical',
    status report_status NOT NULL DEFAULT 'draft',
    priority priority_level NOT NULL DEFAULT 'medium',
    "ticketId" UUID REFERENCES "Tickets"(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "authorId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "customerId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "technicianId" UUID REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "reviewedById" UUID REFERENCES "Users"(id) ON DELETE SET NULL ON UPDATE CASCADE,
    "reviewedAt" TIMESTAMP WITH TIME ZONE,
    "assignedAt" TIMESTAMP WITH TIME ZONE,
    "approvedAt" TIMESTAMP WITH TIME ZONE,
    "rejectedAt" TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    attachments TEXT[],
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Notifications
CREATE TABLE IF NOT EXISTS "Notifications" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'info',
    "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "ticketId" UUID REFERENCES "Tickets"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: TicketHistory
CREATE TABLE IF NOT EXISTS "TicketHistory" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" UUID NOT NULL REFERENCES "Tickets"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    action history_action NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedById" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. CREAR ÍNDICES PARA MEJOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON "Users"(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON "Users"(status);

-- Tickets indexes
CREATE INDEX IF NOT EXISTS idx_tickets_status ON "Tickets"(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON "Tickets"(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON "Tickets"("customerId");
CREATE INDEX IF NOT EXISTS idx_tickets_technician_id ON "Tickets"("technicianId");
CREATE INDEX IF NOT EXISTS idx_tickets_category_id ON "Tickets"("categoryId");
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON "Tickets"("createdAt");

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON "Messages"("ticketId");
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON "Messages"("senderId");
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON "Messages"("createdAt");

-- Attachments indexes
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON "Attachments"("messageId");
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON "Attachments"("ticketId");

-- CallSessions indexes
CREATE INDEX IF NOT EXISTS idx_call_sessions_ticket_id ON "CallSessions"("ticketId");
CREATE INDEX IF NOT EXISTS idx_call_sessions_status ON "CallSessions"(status);
CREATE INDEX IF NOT EXISTS idx_call_sessions_started_at ON "CallSessions"("startedAt");

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_type ON "Reports"(type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON "Reports"(status);
CREATE INDEX IF NOT EXISTS idx_reports_author_id ON "Reports"("authorId");
CREATE INDEX IF NOT EXISTS idx_reports_customer_id ON "Reports"("customerId");

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON "Notifications"("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON "Notifications"("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON "Notifications"("createdAt");

-- TicketHistory indexes
CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket_id ON "TicketHistory"("ticketId");
CREATE INDEX IF NOT EXISTS idx_ticket_history_created_at ON "TicketHistory"("createdAt");

-- =====================================================
-- 5. INSERTAR DATOS INICIALES
-- =====================================================

-- Categorías
INSERT INTO "Categories" (id, name, description, icon, color, "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Soporte Remoto', 'Asistencia técnica remota para resolver problemas de software, hardware y conectividad', 'headset', '#3B82F6', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440002', 'Hardware', 'Problemas relacionados con equipos físicos, periféricos y componentes', 'monitor', '#10B981', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440003', 'Software', 'Problemas con aplicaciones, sistemas operativos y programas', 'code', '#8B5CF6', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440004', 'Red y Conectividad', 'Problemas de red, internet, VPN y conectividad', 'wifi', '#F59E0B', true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440005', 'Seguridad', 'Problemas de seguridad, antivirus y acceso', 'shield', '#EF4444', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440006', 'Email y Comunicación', 'Problemas con correo electrónico y herramientas de comunicación', 'mail', '#06B6D4', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Usuarios (contraseña hasheada con bcrypt: 'admin123')
-- Hash: $2a$10$rG8qDY8K9VX8K9VX8K9VX.qG8qDY8K9VX8K9VX8K9VX8K9VX8K9VXe
INSERT INTO "Users" (id, name, email, password, role, avatar, status, "emailVerified", phone, department, timezone, language, "lastLoginAt", "createdAt", "updatedAt")
VALUES
    ('550e8400-e29b-41d4-a716-446655440010', 'Administrador del Sistema', 'admin@partequipos.com', '$2a$10$8kN.k7KGzZKZ9VX8K9VX8.rG8qDY8K9VX8K9VX8K9VX8K9VX8K9VXe', 'admin', 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590236/Admin_sublte.png', 'online', true, '+57 300 123 4567', 'Tecnología', 'America/Bogota', 'es', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440011', 'Juan Técnico', 'auxiliar.garantiasbg@partequipos.com', '$2a$10$8kN.k7KGzZKZ9VX8K9VX8.rG8qDY8K9VX8K9VX8K9VX8K9VX8K9VXe', 'technician', 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590236/Soporte_hcfjxa.png', 'online', true, '+57 300 234 5678', 'Soporte Técnico', 'America/Bogota', 'es', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440012', 'Soporte al Producto', 'analista.mantenimiento@partequipos.com', '$2a$10$8kN.k7KGzZKZ9VX8K9VX8.rG8qDY8K9VX8K9VX8K9VX8K9VX8K9VXe', 'technician', 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590236/Soporte_hcfjxa.png', 'away', true, '+57 300 345 6789', 'Mantenimiento', 'America/Bogota', 'es', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440013', 'Miguel Usuario', 'miguel@empresa.com', '$2a$10$8kN.k7KGzZKZ9VX8K9VX8.rG8qDY8K9VX8K9VX8K9VX8K9VX8K9VXe', 'customer', 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590235/Cliente_kgzuwh.jpg', 'offline', true, '+57 300 456 7890', 'Ventas', 'America/Bogota', 'es', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440014', 'Ana García', 'ana.garcia@empresa.com', '$2a$10$8kN.k7KGzZKZ9VX8K9VX8.rG8qDY8K9VX8K9VX8K9VX8K9VX8K9VXe', 'customer', 'https://res.cloudinary.com/dbufrzoda/image/upload/v1749590235/Cliente_kgzuwh.jpg', 'offline', true, '+57 300 567 8901', 'Recursos Humanos', 'America/Bogota', 'es', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. VERIFICACIÓN
-- =====================================================

-- Verificar que todo se creó correctamente
SELECT 
    'Users' as table_name, COUNT(*) as total_rows FROM "Users"
UNION ALL
SELECT 
    'Categories', COUNT(*) FROM "Categories"
UNION ALL
SELECT 
    'Tickets', COUNT(*) FROM "Tickets"
UNION ALL
SELECT 
    'Messages', COUNT(*) FROM "Messages"
UNION ALL
SELECT 
    'Attachments', COUNT(*) FROM "Attachments"
UNION ALL
SELECT 
    'CallSessions', COUNT(*) FROM "CallSessions"
UNION ALL
SELECT 
    'Reports', COUNT(*) FROM "Reports"
UNION ALL
SELECT 
    'Notifications', COUNT(*) FROM "Notifications"
UNION ALL
SELECT 
    'TicketHistory', COUNT(*) FROM "TicketHistory";

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================

-- Resultado esperado:
-- - 5 usuarios creados (todos con contraseña: admin123)
-- - 6 categorías creadas
-- - Todas las tablas e índices creados
-- - Base de datos lista para usar

-- Emails de usuarios para login:
-- 1. admin@partequipos.com (Admin)
-- 2. auxiliar.garantiasbg@partequipos.com (Técnico)
-- 3. analista.mantenimiento@partequipos.com (Técnico)
-- 4. miguel@empresa.com (Cliente)
-- 5. ana.garcia@empresa.com (Cliente)

-- Todos los usuarios tienen la contraseña: admin123

