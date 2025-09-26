# 📧 Sistema de Notificaciones por Correo Electrónico

## 🎯 Funcionalidad Implementada

El sistema ahora envía automáticamente correos electrónicos cuando se crea un ticket de soporte:

### ✅ Características Implementadas

1. **Notificación Automática**: Al crear un ticket, se envía un correo al cliente
2. **Copia al Equipo de Soporte**: Siempre se copia `soportemq@partequipos.com`
3. **Asunto Profesional**: Formato específico con ID, estado y prioridad
4. **Contenido Completo**: Incluye título, descripción y detalles del ticket
5. **Diseño Profesional**: Email HTML con estilos corporativos
6. **Manejo de Errores**: No falla la creación del ticket si el email falla

### 📋 Formato del Email

**Asunto:**

```
SE CREO TICKET DE SOPORTE REMOTO PARTEQUIPOS CON ID No.ABC12345, Estado: Abierto, Prioridad: Urgente
```

**Contenido:**

- ID del ticket (formato corto)
- Estado del ticket
- Prioridad del ticket
- Información del cliente
- Técnico asignado (si aplica)
- Título del ticket
- Descripción completa
- Fecha de creación
- Información de contacto del equipo de soporte

## ⚙️ Configuración Requerida

### 1. Variables de Entorno

Agregar al archivo `.env` en el directorio `server/`:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=soportemq@partequipos.com
SMTP_PASS=tu_contraseña_de_aplicacion_gmail_aqui

# Support Email
SUPPORT_EMAIL=soportemq@partequipos.com
```

### 2. Configuración para Gmail

1. **Habilitar autenticación de 2 factores** en la cuenta `soportemq@partequipos.com`
2. **Generar contraseña de aplicación**:
   - Ir a [Configuración de Google Account](https://myaccount.google.com/)
   - Seguridad → Verificación en 2 pasos
   - Contraseñas de aplicaciones
   - Generar nueva contraseña para "Mail"
3. **Usar la contraseña de aplicación** en `SMTP_PASS`

### 3. Configuración para Otros Proveedores

#### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### Yahoo

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### Servidor SMTP Empresarial

```env
SMTP_HOST=mail.partequipos.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=soportemq@partequipos.com
SMTP_PASS=contraseña_corporativa
```

## 🧪 Pruebas

### 1. Probar Configuración

Ejecutar el script de prueba:

```bash
cd server
node test-email.js
```

### 2. Probar desde la API

Endpoint para administradores:

```bash
POST /api/tickets/test-email
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### 3. Probar Creación de Ticket

Crear un ticket desde la aplicación web y verificar que llegue el correo.

## 📁 Archivos Modificados

- `server/src/services/email.service.ts` - Servicio de correo electrónico
- `server/src/controllers/ticket.controller.ts` - Integración con creación de tickets
- `server/src/routes/ticket.routes.ts` - Ruta de prueba
- `server/test-email.js` - Script de prueba
- `server/EMAIL_CONFIG.md` - Documentación de configuración

## 🔧 Funcionalidades del Servicio de Email

### Métodos Principales

1. **`sendTicketCreatedNotification(data)`**

   - Envía notificación al cliente
   - Copia al equipo de soporte
   - Maneja errores graciosamente

2. **`sendTestEmail(email)`**

   - Envía email de prueba
   - Verifica configuración SMTP

3. **`verifyConnection()`**
   - Verifica conexión SMTP
   - Valida credenciales

### Características Técnicas

- **Formato Dual**: HTML y texto plano
- **Compresión de Imágenes**: Optimización automática
- **Manejo de Errores**: Logging detallado
- **Configuración Flexible**: Soporte múltiples proveedores SMTP
- **Seguridad**: Contraseñas de aplicación recomendadas

## 🚀 Uso en Producción

1. **Configurar variables de entorno** en el servidor
2. **Verificar conectividad SMTP** desde el servidor
3. **Probar envío de emails** con datos reales
4. **Monitorear logs** para detectar problemas
5. **Configurar backup SMTP** si es necesario

## 📊 Monitoreo

Los logs incluyen:

- ✅ Emails enviados exitosamente
- ⚠️ Fallos en envío (no críticos)
- ❌ Errores de configuración SMTP
- 📧 Detalles de tickets procesados

## 🔒 Seguridad

- Contraseñas de aplicación en lugar de contraseñas normales
- Conexiones SMTP seguras (TLS/SSL)
- Validación de emails antes del envío
- Manejo seguro de errores sin exponer credenciales
