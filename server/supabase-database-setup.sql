-- =====================================================
-- SUPABASE DATABASE SETUP - PARTEQUIPOS SOPORTE TÉCNICO
-- =====================================================
-- Este script configura la base de datos PostgreSQL en Supabase
-- Incluye: Tablas, Relaciones, Índices, Políticas RLS y Datos Iniciales
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. ENUMS (Tipos de datos personalizados)
-- =====================================================

-- Enum para roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'technician', 'customer');

-- Enum para estados de ticket
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Enum para prioridades de ticket
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Enum para tipos de mensaje
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system');

-- Enum para estados de llamada
CREATE TYPE call_status AS ENUM ('ringing', 'active', 'ended', 'missed', 'rejected');

-- Enum para tipos de acción en historial
CREATE TYPE history_action AS ENUM ('created', 'updated', 'status_changed', 'assigned', 'resolved', 'closed', 'reopened', 'commented');

-- Enum para estados de notificación
CREATE TYPE notification_status AS ENUM ('unread', 'read');

-- Enum para tipos de notificación
CREATE TYPE notification_type AS ENUM ('ticket_created', 'ticket_assigned', 'ticket_updated', 'message_received', 'call_incoming', 'call_missed');

-- =====================================================
-- 2. TABLAS
-- =====================================================

-- Tabla: Users (Usuarios del sistema)
CREATE TABLE "Users" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    avatar TEXT,
    phone VARCHAR(50),
    company VARCHAR(255),
    "isActive" BOOLEAN DEFAULT true,
    "lastLogin" TIMESTAMP WITH TIME ZONE,
    "resetPasswordToken" VARCHAR(255),
    "resetPasswordExpires" TIMESTAMP WITH TIME ZONE,
    "emailVerified" BOOLEAN DEFAULT false,
    "emailVerificationToken" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Categories (Categorías de tickets)
CREATE TABLE "Categories" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Tickets (Tickets de soporte)
CREATE TABLE "Tickets" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ticket_status DEFAULT 'open',
    priority ticket_priority DEFAULT 'medium',
    "customerId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "technicianId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    "categoryId" UUID REFERENCES "Categories"(id) ON DELETE SET NULL,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Messages (Mensajes de chat en tickets)
CREATE TABLE "Messages" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    type message_type DEFAULT 'text',
    "ticketId" UUID NOT NULL REFERENCES "Tickets"(id) ON DELETE CASCADE,
    "senderId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Attachments (Adjuntos de mensajes y tickets)
CREATE TABLE "Attachments" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    "messageId" UUID REFERENCES "Messages"(id) ON DELETE CASCADE,
    "ticketId" UUID REFERENCES "Tickets"(id) ON DELETE CASCADE,
    "uploadedBy" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: CallSessions (Sesiones de videollamada)
CREATE TABLE "CallSessions" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" UUID REFERENCES "Tickets"(id) ON DELETE CASCADE,
    "callerId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "receiverId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    status call_status DEFAULT 'ringing',
    "startTime" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: TicketHistory (Historial de cambios en tickets)
CREATE TABLE "TicketHistory" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" UUID NOT NULL REFERENCES "Tickets"(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    action history_action NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Notifications (Notificaciones del sistema)
CREATE TABLE "Notifications" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    status notification_status DEFAULT 'unread',
    "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "ticketId" UUID REFERENCES "Tickets"(id) ON DELETE CASCADE,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Reports (Reportes de soporte)
CREATE TABLE "Reports" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "issueType" VARCHAR(100) NOT NULL,
    severity VARCHAR(50),
    "contactName" VARCHAR(255) NOT NULL,
    "contactEmail" VARCHAR(255) NOT NULL,
    "contactPhone" VARCHAR(50),
    attachments TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    "customerId" UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. ÍNDICES (para optimización de consultas)
-- =====================================================

-- Índices para Users
CREATE INDEX idx_users_email ON "Users"(email);
CREATE INDEX idx_users_role ON "Users"(role);
CREATE INDEX idx_users_is_active ON "Users"("isActive");

-- Índices para Tickets
CREATE INDEX idx_tickets_status ON "Tickets"(status);
CREATE INDEX idx_tickets_priority ON "Tickets"(priority);
CREATE INDEX idx_tickets_customer ON "Tickets"("customerId");
CREATE INDEX idx_tickets_technician ON "Tickets"("technicianId");
CREATE INDEX idx_tickets_category ON "Tickets"("categoryId");
CREATE INDEX idx_tickets_created_at ON "Tickets"("createdAt");

-- Índices para Messages
CREATE INDEX idx_messages_ticket ON "Messages"("ticketId");
CREATE INDEX idx_messages_sender ON "Messages"("senderId");
CREATE INDEX idx_messages_created_at ON "Messages"("createdAt");

-- Índices para Attachments
CREATE INDEX idx_attachments_message ON "Attachments"("messageId");
CREATE INDEX idx_attachments_ticket ON "Attachments"("ticketId");

-- Índices para CallSessions
CREATE INDEX idx_call_sessions_ticket ON "CallSessions"("ticketId");
CREATE INDEX idx_call_sessions_caller ON "CallSessions"("callerId");
CREATE INDEX idx_call_sessions_receiver ON "CallSessions"("receiverId");
CREATE INDEX idx_call_sessions_status ON "CallSessions"(status);

-- Índices para TicketHistory
CREATE INDEX idx_ticket_history_ticket ON "TicketHistory"("ticketId");
CREATE INDEX idx_ticket_history_user ON "TicketHistory"("userId");
CREATE INDEX idx_ticket_history_created_at ON "TicketHistory"("createdAt");

-- Índices para Notifications
CREATE INDEX idx_notifications_user ON "Notifications"("userId");
CREATE INDEX idx_notifications_status ON "Notifications"(status);
CREATE INDEX idx_notifications_ticket ON "Notifications"("ticketId");
CREATE INDEX idx_notifications_created_at ON "Notifications"("createdAt");

-- Índices para Reports
CREATE INDEX idx_reports_customer ON "Reports"("customerId");
CREATE INDEX idx_reports_status ON "Reports"(status);
CREATE INDEX idx_reports_created_at ON "Reports"("createdAt");

-- =====================================================
-- 4. TRIGGERS (para actualización automática)
-- =====================================================

-- Función para actualizar updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "Categories"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON "Tickets"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON "Messages"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_sessions_updated_at BEFORE UPDATE ON "CallSessions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON "Notifications"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON "Reports"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) - Políticas de Seguridad
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attachments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CallSessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TicketHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reports" ENABLE ROW LEVEL SECURITY;

-- Nota: Las políticas específicas se configurarán desde el backend usando el service_role key
-- Para desarrollo, puedes deshabilitarlas temporalmente o configurar políticas permisivas

-- =====================================================
-- 6. DATOS INICIALES (SEED DATA)
-- =====================================================

-- Hash de contraseña: admin123
-- Generado con: bcrypt.hash('admin123', 10)
-- NOTA: Actualiza este hash ejecutando: node server/generate-password-hash.js admin123

-- Insertar usuario administrador
INSERT INTO "Users" (id, name, email, password, role, "isActive", "emailVerified", "createdAt", "updatedAt")
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Administrador del Sistema',
    'admin@partequipos.com',
    '$2b$10$mQHGy7JQGxKBx6hKLX8zR.YzJx3BF5tPz8LF.GKOxvZXQfx8mKZKi',
    'admin',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insertar técnico de ejemplo
INSERT INTO "Users" (id, name, email, password, role, phone, "isActive", "emailVerified", "createdAt", "updatedAt")
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440011',
    'Juan Técnico',
    'auxiliar.garantiasbg@partequipos.com',
    '$2b$10$mQHGy7JQGxKBx6hKLX8zR.YzJx3BF5tPz8LF.GKOxvZXQfx8mKZKi',
    'technician',
    '+57 300 123 4567',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insertar cliente de ejemplo
INSERT INTO "Users" (id, name, email, password, role, company, phone, "isActive", "emailVerified", "createdAt", "updatedAt")
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440012',
    'Ana García',
    'ana.garcia@empresa.com',
    '$2b$10$mQHGy7JQGxKBx6hKLX8zR.YzJx3BF5tPz8LF.GKOxvZXQfx8mKZKi',
    'customer',
    'Empresa Ejemplo S.A.S',
    '+57 300 987 6543',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insertar categorías de soporte
INSERT INTO "Categories" (id, name, description, icon, "createdAt", "updatedAt")
VALUES 
(
    '650e8400-e29b-41d4-a716-446655440001',
    'Soporte Técnico',
    'Problemas técnicos generales y asistencia',
    'wrench',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '650e8400-e29b-41d4-a716-446655440002',
    'Garantía',
    'Gestión de garantías y reclamos',
    'shield',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '650e8400-e29b-41d4-a716-446655440003',
    'Repuestos',
    'Consultas sobre repuestos y disponibilidad',
    'package',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '650e8400-e29b-41d4-a716-446655440004',
    'Instalación',
    'Asistencia con instalación de equipos',
    'settings',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '650e8400-e29b-41d4-a716-446655440005',
    'Mantenimiento',
    'Programación y seguimiento de mantenimientos',
    'calendar',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. FUNCIONES ÚTILES
-- =====================================================

-- Función para obtener estadísticas de tickets
CREATE OR REPLACE FUNCTION get_ticket_stats()
RETURNS TABLE (
    total_tickets BIGINT,
    open_tickets BIGINT,
    in_progress_tickets BIGINT,
    resolved_tickets BIGINT,
    closed_tickets BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_tickets,
        COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tickets,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_tickets,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_tickets
    FROM "Tickets";
END;
$$ LANGUAGE plpgsql;

-- Función para obtener tickets sin asignar
CREATE OR REPLACE FUNCTION get_unassigned_tickets()
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    priority ticket_priority,
    "createdAt" TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.title,
        t.priority,
        t."createdAt"
    FROM "Tickets" t
    WHERE t."technicianId" IS NULL
    AND t.status != 'closed'
    ORDER BY 
        CASE t.priority
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
        END,
        t."createdAt" ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. VISTAS ÚTILES
-- =====================================================

-- Vista: Tickets con información del cliente y técnico
CREATE OR REPLACE VIEW ticket_details AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t."createdAt",
    t."updatedAt",
    c.name as customer_name,
    c.email as customer_email,
    c.company as customer_company,
    tech.name as technician_name,
    tech.email as technician_email,
    cat.name as category_name,
    cat.icon as category_icon,
    (SELECT COUNT(*) FROM "Messages" WHERE "ticketId" = t.id) as message_count
FROM "Tickets" t
LEFT JOIN "Users" c ON t."customerId" = c.id
LEFT JOIN "Users" tech ON t."technicianId" = tech.id
LEFT JOIN "Categories" cat ON t."categoryId" = cat.id;

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

-- Comentarios para documentación
COMMENT ON TABLE "Users" IS 'Usuarios del sistema (admin, técnicos, clientes)';
COMMENT ON TABLE "Categories" IS 'Categorías de tickets de soporte';
COMMENT ON TABLE "Tickets" IS 'Tickets de soporte técnico';
COMMENT ON TABLE "Messages" IS 'Mensajes de chat en tickets';
COMMENT ON TABLE "Attachments" IS 'Archivos adjuntos (almacenados en Supabase Storage)';
COMMENT ON TABLE "CallSessions" IS 'Sesiones de videollamada';
COMMENT ON TABLE "TicketHistory" IS 'Historial de cambios en tickets';
COMMENT ON TABLE "Notifications" IS 'Notificaciones para usuarios';
COMMENT ON TABLE "Reports" IS 'Reportes de soporte';

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos configurada exitosamente para Supabase';
    RAISE NOTICE '📧 Usuario admin: admin@partequipos.com';
    RAISE NOTICE '🔑 Contraseña: admin123';
    RAISE NOTICE '⚠️  IMPORTANTE: Cambia la contraseña del admin en producción';
END $$;

