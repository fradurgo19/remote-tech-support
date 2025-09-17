# Backend - Sistema de Soporte Técnico Remoto

## 📋 Descripción

Backend completo para el sistema de soporte técnico remoto con funcionalidades de:
- Gestión de usuarios y autenticación
- Sistema de tickets con categorías
- Chat en tiempo real
- Video llamadas con WebRTC
- Reportes técnicos
- Notificaciones
- Historial de cambios
- Gestión de archivos adjuntos

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### **Users** - Usuarios del sistema
- `id` (UUID) - Identificador único
- `name` (STRING) - Nombre completo
- `email` (STRING) - Email único
- `password` (STRING) - Contraseña hasheada
- `role` (ENUM) - admin, technician, customer
- `avatar` (STRING) - URL del avatar
- `status` (ENUM) - online, away, busy, offline
- `emailVerified` (BOOLEAN) - Email verificado
- `passwordResetToken` (STRING) - Token para reset de contraseña
- `lastLoginAt` (DATE) - Último login
- `phone` (STRING) - Teléfono
- `department` (STRING) - Departamento
- `timezone` (STRING) - Zona horaria
- `language` (STRING) - Idioma preferido

#### **Categories** - Categorías de tickets
- `id` (UUID) - Identificador único
- `name` (STRING) - Nombre de la categoría
- `description` (TEXT) - Descripción
- `icon` (STRING) - Icono
- `color` (STRING) - Color de la categoría
- `isActive` (BOOLEAN) - Activa
- `sortOrder` (INTEGER) - Orden de visualización

#### **Tickets** - Tickets de soporte
- `id` (UUID) - Identificador único
- `title` (STRING) - Título del ticket
- `description` (TEXT) - Descripción detallada
- `status` (ENUM) - open, in_progress, resolved, closed, cancelled
- `priority` (ENUM) - low, medium, high, urgent
- `categoryId` (UUID) - Referencia a Category
- `customerId` (UUID) - Referencia a User (cliente)
- `technicianId` (UUID) - Referencia a User (técnico)
- `assignedAt` (DATE) - Fecha de asignación
- `resolvedAt` (DATE) - Fecha de resolución
- `closedAt` (DATE) - Fecha de cierre
- `estimatedTime` (INTEGER) - Tiempo estimado en minutos
- `actualTime` (INTEGER) - Tiempo real en minutos
- `tags` (ARRAY) - Etiquetas
- `metadata` (JSONB) - Metadatos adicionales

#### **Messages** - Mensajes del chat
- `id` (UUID) - Identificador único
- `content` (TEXT) - Contenido del mensaje
- `type` (ENUM) - text, image, file, system, call_start, call_end
- `ticketId` (UUID) - Referencia a Ticket
- `senderId` (UUID) - Referencia a User
- `replyToId` (UUID) - Referencia a Message (respuesta)
- `isRead` (BOOLEAN) - Leído
- `readAt` (DATE) - Fecha de lectura
- `metadata` (JSONB) - Metadatos adicionales

#### **CallSessions** - Sesiones de video llamada
- `id` (UUID) - Identificador único
- `ticketId` (UUID) - Referencia a Ticket
- `initiatorId` (UUID) - Referencia a User (iniciador)
- `participantIds` (ARRAY) - IDs de participantes
- `status` (ENUM) - initiated, ringing, active, ended, missed, declined
- `startedAt` (DATE) - Inicio de la llamada
- `endedAt` (DATE) - Fin de la llamada
- `duration` (INTEGER) - Duración en segundos
- `recordingUrl` (STRING) - URL de grabación
- `screenShareEnabled` (BOOLEAN) - Compartir pantalla habilitado
- `metadata` (JSONB) - Metadatos adicionales

#### **Reports** - Reportes técnicos
- `id` (UUID) - Identificador único
- `title` (STRING) - Título del reporte
- `description` (TEXT) - Descripción
- `type` (ENUM) - technical, incident, maintenance, performance, security
- `status` (ENUM) - draft, pending, approved, rejected
- `priority` (ENUM) - low, medium, high, urgent
- `ticketId` (UUID) - Referencia a Ticket
- `authorId` (UUID) - Referencia a User (autor)
- `reviewedById` (UUID) - Referencia a User (revisor)
- `reviewedAt` (DATE) - Fecha de revisión
- `tags` (ARRAY) - Etiquetas
- `metadata` (JSONB) - Metadatos adicionales

#### **Notifications** - Notificaciones del sistema
- `id` (UUID) - Identificador único
- `title` (STRING) - Título
- `message` (TEXT) - Mensaje
- `type` (ENUM) - info, warning, error, success, ticket_assigned, ticket_updated, call_incoming
- `userId` (UUID) - Referencia a User
- `ticketId` (UUID) - Referencia a Ticket
- `isRead` (BOOLEAN) - Leída
- `readAt` (DATE) - Fecha de lectura
- `metadata` (JSONB) - Metadatos adicionales

#### **Attachments** - Archivos adjuntos
- `id` (UUID) - Identificador único
- `filename` (STRING) - Nombre del archivo
- `originalName` (STRING) - Nombre original
- `mimeType` (STRING) - Tipo MIME
- `size` (INTEGER) - Tamaño en bytes
- `path` (STRING) - Ruta del archivo
- `url` (STRING) - URL de acceso
- `messageId` (UUID) - Referencia a Message
- `ticketId` (UUID) - Referencia a Ticket
- `uploadedById` (UUID) - Referencia a User

#### **TicketHistory** - Historial de cambios
- `id` (UUID) - Identificador único
- `ticketId` (UUID) - Referencia a Ticket
- `action` (ENUM) - created, updated, assigned, status_changed, priority_changed, resolved, closed, reopened
- `oldValue` (TEXT) - Valor anterior
- `newValue` (TEXT) - Valor nuevo
- `changedById` (UUID) - Referencia a User
- `metadata` (JSONB) - Metadatos adicionales

## 🚀 Configuración e Instalación

### Prerrequisitos
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crear archivo `.env` en la raíz del servidor:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=remote_support
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# Servidor
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

### 3. Configurar PostgreSQL
```sql
-- Crear base de datos
CREATE DATABASE remote_support;

-- Crear usuario (opcional)
CREATE USER remote_support_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE remote_support TO remote_support_user;
```

### 4. Ejecutar migraciones
```bash
# Ejecutar migraciones para crear tablas
npx sequelize-cli db:migrate

# Poblar con datos iniciales
npx sequelize-cli db:seed:all
```

### 5. Iniciar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📊 Datos de Prueba

El sistema incluye datos de prueba con:

### Usuarios por defecto:
- **Admin:** admin@partequipos.com / admin123
- **Técnico:** auxiliar.garantiasbg@partequipos.com / tech123
- **Cliente:** miguel@empresa.com / customer123

### Categorías:
- Soporte Remoto
- Hardware
- Software
- Red y Conectividad
- Seguridad
- Email y Comunicación

### Tickets de ejemplo:
- Problema con VPN
- Outlook se cierra
- Impresora de red

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Iniciar en producción
npm start

# Ejecutar migraciones
npm run migrate

# Revertir migraciones
npm run migrate:undo

# Poblar datos
npm run seed

# Crear reporte de prueba
npm run create-test-report

# Reset de contraseña
npm run reset-password
```

## 📁 Estructura del Proyecto

```
server/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuración de base de datos
│   ├── controllers/             # Controladores de rutas
│   ├── middleware/              # Middleware personalizado
│   ├── models/                  # Modelos de Sequelize
│   ├── routes/                  # Definición de rutas
│   ├── scripts/                 # Scripts utilitarios
│   ├── utils/                   # Utilidades
│   ├── socket.ts               # Configuración de Socket.IO
│   └── index.ts                # Punto de entrada
├── migrations/                  # Migraciones de base de datos
├── uploads/                     # Archivos subidos
└── logs/                        # Logs del sistema
```

## 🔐 Autenticación

El sistema usa JWT para autenticación. Los tokens incluyen:
- `id` - ID del usuario
- `email` - Email del usuario
- `role` - Rol del usuario

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Resetear contraseña

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Tickets
- `GET /api/tickets` - Listar tickets
- `GET /api/tickets/:id` - Obtener ticket
- `POST /api/tickets` - Crear ticket
- `PUT /api/tickets/:id` - Actualizar ticket
- `DELETE /api/tickets/:id` - Eliminar ticket

### Mensajes
- `GET /api/messages/ticket/:ticketId` - Mensajes de un ticket
- `POST /api/messages` - Enviar mensaje
- `PUT /api/messages/:id/read` - Marcar como leído

### Reportes
- `GET /api/reports` - Listar reportes
- `GET /api/reports/:id` - Obtener reporte
- `POST /api/reports` - Crear reporte
- `PUT /api/reports/:id` - Actualizar reporte

## 🐛 Solución de Problemas

### Error de conexión a base de datos
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar credenciales en `.env`
3. Verificar que la base de datos exista

### Error de migraciones
```bash
# Ver estado de migraciones
npx sequelize-cli db:migrate:status

# Revertir última migración
npx sequelize-cli db:migrate:undo

# Revertir todas las migraciones
npx sequelize-cli db:migrate:undo:all
```

### Error de permisos
```bash
# Verificar permisos de la carpeta uploads
chmod 755 uploads/
chmod 755 uploads/reports/
```

## 📝 Logs

Los logs se guardan en:
- `logs/combined.log` - Todos los logs
- `logs/error.log` - Solo errores

## 🔄 Próximos Pasos

1. Configurar el archivo `.env`
2. Ejecutar las migraciones
3. Poblar con datos de prueba
4. Iniciar el servidor
5. Probar la conectividad con el frontend
